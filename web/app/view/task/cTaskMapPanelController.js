Ext.define('MaxiMary.view.task.cTaskMapPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.cTaskMapPanelController',
    
    onAfterRender: function(){
        var view = this.getView();
        var HeaderInfo = this.lookup('HeaderInfo');
        HeaderInfo.setValue(view.Task);

        this.onBoot();
    },
    onBoot: function(){
        var me = this;
        var view = this.getView();
        const ice_id = this.getIceId();
        const dt = this.getIceDt();

        view.setLoading(true);
        Ext.Ajax.request({
            url: 'api/front/nsr_get_statgraph.php',
            method: 'POST',
            params: {
                ice_id: ice_id,
                dt: dt
            },            
            success: function(response, opts) {
                me.statgraphData = Ext.decode(response.responseText);
                //Ext.showMsg(obj.message,obj.success);
                Ext.defer(function(){
                    me.initMap();
                    view.setLoading(false);
                }, 500, this);

            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });

    },

    getMap: function(){
        var Task = this.getTask();
        return Task.map;
    },
    getIceId: function(){
        var view = this.getView();
        return parseInt(view.taskData.ice_id);
    },
    getTaskId: function(){
        var view = this.getView();
        return parseInt(view.taskData.task_id);
    },
    getTask: function(){
        var view = this.getView();
        return view.Task;
    },
    getIceDt: function(){
        var view = this.getView();
        return view.Task.getCurrentIceDt();
    },

    unsetIce: function(){
        const map = this.getMap();
        if (map.getLayer('ice')){
            map.removeLayer('ice');
        }
    },
    setIce: function(dt){
        const map = this.getMap();
        const source = map.getSource(`ice-${dt}`);

        if (!source) {
            this.loadIce(dt);
            return;
        }

        const iceBtn = this.lookup('iceBtn');
        iceBtn.setText(`Лёд | ${dt}`);

        this.unsetIce();

        // Определите ID слоя, перед которым вы хотите добавить новый слой
        const beforeLayerId = 'empty-layer';
        map.addLayer({
            'id': 'ice',
            'type': 'circle',
            'source': `ice-${dt}`,
            'paint': {
                'circle-radius': 4,
                'circle-color': ['get', 'color']
            },
            //'filter': ['==', '$type', 'Point']
        }, beforeLayerId); // Указываем beforeLayerId, чтобы вставить новый слой перед ним         

    },
    /**
     * Метод загрузки льда с сервера в формате GeoJSON внутри
     * @param {*} dt 
     */
    loadIce: function(dt){
        var me = this;
        const view = this.getView();
        //const iceBtn = this.lookup('iceBtn');
        const ice_id = this.getIceId();
        const map = this.getMap();
        const source = map.getSource(`ice-${dt}`);

        if (source) {
            me.setIce(dt);
            return;
        } 
        view.setLoading(true);
        Ext.Ajax.request({
            url: `api/front/nsr_get_ice_geojson.php`,
            method: 'POST',
            params: {
                ice_id: ice_id,
                dt: dt
            },            
            success: function(response, opts) {
                view.setLoading(false);
                map.addSource(`ice-${dt}`, Ext.decode(response.responseText));
                me.setIce(dt);
                me.loadGraphEdges(dt);
            },
            failure: function(response, opts) {
                view.setLoading(false);
                Ext.showMsg(`Ошибка загрузки льда от <b>${dt}</b>`, false);
            }
        });
    },

    setRouteLoader: function(set, text){
        const nextBtn = this.lookup('nextBtn');
        const prevBtn = this.lookup('prevBtn');
        const restartBtn = this.lookup('restartBtn');
        const routeLoader = this.lookup('routeLoader');

        if (set) {
            nextBtn.disable();
            prevBtn.disable();
            restartBtn.disable();
            routeLoader.setVisible(true);
            if (text) routeLoader.setText(text);
        } else {
            nextBtn.enable();
            prevBtn.enable();
            restartBtn.enable();
            routeLoader.setVisible(false);
            if (text) if (typeof(text) != 'object') Ext.showMsg(`<b>${text}</b>`, true);
        }
    },

    loadGraphEdges: function(dt){
        var me = this;
        const view = this.getView();
        const Task = this.getTask();
        const ice_id = this.getIceId();
        
        view.fireEvent('routeloader', true, 'Идёт построение маршрутов...');
        view.setLoading(true);

        Ext.Ajax.request({
            url: `api/front/nsr_get_ice_graph_edge.php`,
            method: 'POST',
            params: {
                ice_id: ice_id,
                dt: dt
            },            
            success: function(response, opts) {
                view.setLoading(false);
                const edgesData = Ext.decode(response.responseText);
                
                const ice_class_id = Task.applyEdges(dt, edgesData);
                if (ice_class_id){
                    me.loadGraph(dt, ice_class_id);
                } else {
                    view.fireEvent('routeloader', false, 'Расчёт маршрутов завершён!');
                    me.calcPlan(dt); // Запускаем расчёт планов переходов
                }
                
            },
            failure: function(response, opts) {
                view.setLoading(false);
                Ext.showMsg(`Ошибка загрузки рёбер от <b>${dt}</b>`, false);
            }
        });

    },
    calcPlan: function(dt){
        var me = this;
        const view = this.getView();
        const Task = this.getTask();
        const ice_id = this.getIceId();

        view.fireEvent('routeloader', true, 'Идёт расчёт плана переходов...');
        
        view.setLoading(true);
        this.setRouteLoader(true);
        Ext.Ajax.request({
            url: `api/front/nsr_get_ice_graph_plan.php`,
            method: 'POST',
            params: {
                ice_id: ice_id,
                dt: dt
            },            
            success: function(response, opts) {
                view.setLoading(false);
                const graphData = Ext.decode(response.responseText);
                let out = { graph: {}}
                graphData.graph.forEach(item => {
                    const edge_id = `${item.s}_${item.e}`;
                    out.graph[edge_id] = item;
                });
                Task.calcPlan(dt, out);
            },
            failure: function(response, opts) {
                view.setLoading(false);
                Ext.showMsg(`Ошибка загрузки граф от <b>${dt}</b>`, false);
            }
        });
    },
    /**
     * dt это дата ледовой обстановки на которую строится план
     * @param {*} dt 
     */
    printPlan: function(dt){
        console.log('printPlan :: start', dt);

        var me = this;
        const view = this.getView();
        const Task = this.getTask();
        const ice_id = this.getIceId();
        const grid = this.lookup('ScheduleGrid');
        const store = grid.store;

        // Если ледовая обстановка не поменялась то просто рефрешим грид
        if (grid.iceDt == dt) {
            grid.getView().refresh();
            return;
        }

        grid.iceDt = dt;
        let out = [];

        if (1 == 1) {
            // Берём все планы и выбираем их них все от начала до dt
            const plans = Task.getPlansUntil(dt);

            const { first_dt, plan_days_count } = Task;
            const ships = Object.assign(Task.ships[first_dt], Task.icebreakers[first_dt]);
            // const icebreakers = Task.icebreakers;
            const dtArr = getDatesForward(first_dt, plan_days_count); // Строим план на 60 дней вперёд

            for (let ship_code in ships) {
                const ship = ships[ship_code];
                // Подготавливаем шапку записи для store
                let record = {
                    ship_code: ship.ship_code,
                    ship_name: ship.ship_name,
                    start_date: ship.start_date,
                    arc_class_id: ship.arc_class_id,
                    arc_class_name: ship.arc_class_name,
                    is_icebreaker: ship.is_icebreaker,
                    is_disabled: ship.is_disabled
                }
                let curr_plan = null
                dtArr.forEach(arr_dt => {
                    if (plans[arr_dt]) { // Найден план ледовой обстановки
                        curr_plan = plans[arr_dt];
                        record[`plan_${arr_dt}`] = true;
                    }
                    if (ship.is_disabled) {
                        record[`stat_${arr_dt}`] = 'ban';
                        return // Корабль запрещён
                    }

                    const sched = curr_plan.schedule[ship_code];
                    if (sched) {
                        record[`stat_${arr_dt}`] = sched.type;
                        const ib = sched.icebreaker;
                        if (ib) {
                            record[`ib_${arr_dt}`] = ib.ship_code;
                        }
                        const route = sched.schedule[arr_dt];
                        if (!route) {
                            record[`await_${arr_dt}`] = true;
                        } else {
                            record[`wait_${arr_dt}`] = !!route.isWait;
                        }
                    }
                });

                out.push(record);
            }
        }

        store.removeAll();
        store.add(out);

        //console.log('printPlan :: plans', dt, plans);
        //console.log('printPlan :: out', dt, plans, out);

    },
    loadGraph: function(dt, ice_class_id){
        var me = this;
        const view = this.getView();
        const Task = this.getTask();
        const ice_id = this.getIceId();
        
        view.fireEvent('routeloader', true, 'Идёт построение маршрутов...');
        view.setLoading(true);

        Ext.Ajax.request({
            url: `api/front/nsr_get_ice_graph.php`,
            method: 'POST',
            params: {
                ice_id: ice_id,
                ice_class_id: ice_class_id,
                dt: dt
            },            
            success: function(response, opts) {
                view.setLoading(false);
                const graphData = Ext.decode(response.responseText);

                Task.applyGraph(dt, ice_class_id, graphData);
            },
            failure: function(response, opts) {
                view.setLoading(false);
                Ext.showMsg(`Ошибка загрузки граф от <b>${dt}</b>`, false);
            }
        });

    },

    initMap: function(){
        var me = this;
        var view = this.getView();
        const Task = this.getTask();
        const iceBtn = this.lookup('iceBtn');

        Task.map = new maplibregl.Map({
            container: view.mapId ,
            //style: 'https://api.maptiler.com/maps/openstreetmap/style.json?key=7MxsyPJxiQCvmGoerMex',
            style: 'https://api.maptiler.com/maps/basic-v2/style.json?key=7MxsyPJxiQCvmGoerMex',
            //style: 'https://demotiles.maplibre.org/style.json',
            //cooperativeGestures: true,
            center: [ 110.5, 69.9 ],
            zoom: 2.8
        });

        const map = Task.map;

        map.on('load', async () => {
            //console.log(map, me.statgraphData.data);
            // Add an image to use as a custom marker
            const img_point = await map.loadImage('img/control-record.png');
            // https://www.flaticon.com/free-icon/boat-with-containers_75931?term=ship&page=1&position=6&origin=search&related_id=75931
            const img_arc0 = await map.loadImage('img/arc0.png');
            const img_arc4 = await map.loadImage('img/arc4.png');
            // https://www.flaticon.com/free-icon/shipping_2769474?related_id=2769487&origin=search
            const img_arc7 = await map.loadImage('img/arc7.png');
            const img_arc9 = await map.loadImage('img/arc9.png');
            
            map.addImage('point-marker', img_point.data);
            map.addImage('arc0-marker', img_arc0.data);
            map.addImage('arc4-marker', img_arc4.data);
            map.addImage('arc7-marker', img_arc7.data);
            map.addImage('arc9-marker', img_arc9.data);

            // ----------------------------------------------
            // Добавление пустого источника данных
            // Он нужен чтобы за ним устанавливать Лёд
            map.addSource('empty-source', {
                'type': 'geojson',
                'data': {
                    "type": "FeatureCollection",
                    "features": []
                }
            });
            // Добавление слоя, использующего пустой источник
            map.addLayer({
                'id': 'empty-layer',
                'type': 'circle',
                'source': 'empty-source',
                'paint': {
                    'circle-radius': 4,
                    'circle-color': '#000000'
                }
            });
            // ----------------------------------------------
            map.addSource('points', me.statgraphData.data.points);
            map.addLayer({
                'id': 'points',
                'type': 'symbol',
                'source': 'points',
                'layout': {
                    'icon-image': 'point-marker',
                    'text-field': ['get', 'point_name'],
                    'text-size': 11,
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                }
            });

            // Включаем подгрузку Льда на карту
            iceBtn.enable();
            iceBtn.toggle(true);
        });
    },

    onIceToggle: function(){
        const iceBtn = this.lookup('iceBtn');
        const iceDt = this.getIceDt();
        if (iceBtn.pressed) {
            this.setIce(iceDt);
        } else {
            this.unsetIce();
        }
    },

    onNextStep: function(){
        const Task = this.getTask();
        Task.nextStep();
        this.onTaskApply();
    },
    onPrevStep: function(){
        const Task = this.getTask();
        Task.prevStep();
        this.onTaskApply();
    },

    onRestart: function(){
        const Task = this.getTask();
        Task.restart();
        this.onTaskApply();
    },

    onTaskApply: function(){
        const Task = this.getTask();

        var HeaderInfo = this.lookup('HeaderInfo');
        HeaderInfo.setValue(Task);

        const iceDt = this.getIceDt();
        this.setIce(iceDt);
        Task.printEdges(iceDt);
    }


});

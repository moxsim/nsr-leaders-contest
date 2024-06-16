Ext.define('MaxiMary.nsr.TaskClass', {

    requires: [
        'MaxiMary.nsr.GraphClass',
        'MaxiMary.nsr.PlanClass',
        'MaxiMary.nsr.IceBreakerClass',
        'MaxiMary.nsr.ShipClass'
    ],

    task_id: 0,
    ice_id: 0,
    plan_days_count: 120, // Количество дней вперёд на которые мы будем строить план

    first_dt: null, // Первая дата -> Дата в формате 2022-12-31
    current_dt: null, // Текущая дата -> Дата в формате 2022-12-31
    map: null, // Экземпляр MapLibreGL для печати на карту

    steps: [], // Массив из дат в формате 2022-12-31

    ices: [], // Массив из дат в формате 2022-12-31
    ice_class: {}, // Классы льда

    current_ice_key: null, // Текущий лёд -> Дата в формате 2022-12-31

    points: {}, // Список точек p_x_y, lon, lat
    edges: {}, //
    nodes: {}, //
    graphs: {}, // Ключ -> Дата в формате 2022-12-31
    plans: {}, // Ключ -> Дата в формате 2022-12-31
    ships: {}, // Ключ -> Дата в формате 2022-12-31
    icebreakers: {}, // Ключ -> Дата в формате 2022-12-31

    constructor: function(record, view){
        this.record = record;
        this.view = view;
        this.points = this.record.points || {};
        this.edges = this.record.edges || {};
        this.nodes = this.record.nodes || {};

        this.task_id = parseInt(this.record.task_id);
        this.ice_id = parseInt(this.record.ice_id);
        this.ices = this.record.ices || [];
        this.ice_class =  this.record.ice_class || {}
        this.first_dt = this.ices[0];
        this.current_dt = this.first_dt;
        this.current_ice_key = this.ices.indexOf(this.first_dt);
        this.ices.forEach(dt => {
            this.graphs[dt] = {};
            this.ships[dt] = {};
            this.icebreakers[dt] = {};
        });
        
        this.steps.push(this.first_dt);
        this.initShips(this.first_dt, this.record.ships, this.record.icebreakers); // Добавляем Суда и Ледоколы
        this.setPlan(this.first_dt); // Добавляем План

        console.log( 'TaskClass :: constructor', this);
    },

    restart: function(){
        this.current_dt = this.first_dt;
        this.current_ice_key = this.ices.indexOf(this.first_dt);
        this.printPlan();
    },

    nextStep: function(){
        this.current_dt = this.getNextDate(this.current_dt);

        // Проверяем нужно ли переключить Лёд
        const newice = this.ices.indexOf(this.current_dt);
        if (newice != -1) {
            this.current_ice_key = newice;
            // Тут нужно подготовить данные судов и ледоколов для нового плана
            this.buildNewShips();
        } else {
            this.printPlan();
        }
    },

    prevStep: function(){
        if (this.current_dt == this.first_dt) return;
        this.current_dt = this.getNextDate(this.current_dt, true);
        // Проверяем нужно ли переключить Лёд
        const newice = this.ices.indexOf(this.current_dt);
        if (newice != -1) {
            this.current_ice_key = newice;
        } else {
            this.printPlan();
        }
    },
    buildNewShips: function(){
        const dt = this.getCurrentIceDt();
        const last_ice_key = this.current_ice_key - 1;
        const ices = this.ices;
        const last_dt = ices[last_ice_key];

        // Тут нужно проверить есть ли корабли с ледоколами для даты dt
        // Если у же есть то выходим
        if (Object.keys(this.ships[dt]).length){
            return;
        }

        // Находим предыдущие корабли и ледоколы
        const ships = Object.assign(this.ships[last_dt], this.icebreakers[last_dt]);
        const last_plan = this.getPlan(last_dt);
        
        //console.log('buildNewShips', last_plan);

        let new_ships = {};
        let new_icebreakers = {};
        
        // Пробегаем по всем судам и ледоколам
        for ( let ship_code in ships ){
            const original = ships[ship_code];
            // Клонируем экземпляр
            const ship = Object.create(
                Object.getPrototypeOf(original),
                Object.getOwnPropertyDescriptors(original)
            );
            // Если судно или ледокол не запрещены, то находим его стартовую точку из пердыдущего плана
            // TODO: Запрещённых вообще не буду пока включать в новый план, но наверно это не правильно, возможно они смогут разблокироваться
            if (!ship.is_disabled){ 
                const plan = last_plan.schedule[ship_code];
                if (plan) {
                    // Пытаемся найди дату в плане чтобы достать из неё первый сегмент и его стартовую точку
                    const sergment_dt = plan.schedule[dt]; 
                    //console.log('sergment_dt', dt, ship, plan, sergment_dt);
                    if (sergment_dt ) {
                        const start_p_id = sergment_dt.segments[0].start_p_id;
                        ship.start_p_id = start_p_id;
                        // Добавляем судно в список, заменяя ему стартовую точку
                        if (ship.is_icebreaker){
                            new_icebreakers[ship_code] = ship;
                        } else {
                            new_ships[ship_code] = ship;
                        }
                    } else if (sergment_dt == null || plan.type == 'none'){
                        // Добавляем судно в список, не меняя ему стартовую точку
                        if (ship.is_icebreaker){
                            new_icebreakers[ship_code] = ship;
                        } else {
                            new_ships[ship_code] = ship;
                        }
                    } else {
                        // Если дата не найдена значит судно уже доплыло куда ему нужно
                    }
                }
            }
        }
        this.ships[dt] = new_ships;
        this.icebreakers[dt] = new_icebreakers;

        this.addShipsEdges(dt);
        // console.log('buildNewShips', this);
    },
    setPlan: function(dt){
        const plan = this.getPlan(dt);
        if (plan) return plan;

        this.plans[dt] = new MaxiMary.nsr.PlanClass(this, dt);
        return this.getPlan(dt);
    },
    getPlan: function(dt){
        const plan = this.plans[dt];
        if (plan) return plan;
        this.plans[dt] = new MaxiMary.nsr.PlanClass(this, dt);
        return this.plans[dt];
    },
    addShipsEdges: function(dt){
        const ships = this.ships[dt];
        const icebreakers = this.icebreakers[dt];

        // Пробегаем по всем судам из расписания
        for ( let ship_code in ships ) {
            const ship = ships[ship_code];

            // Добавляем пути судов в общий список путей
            // Если это судно не отменено
            const { start_p_id, end_p_id, is_disabled } = ship;
            if (!is_disabled) {
                const edge_id = `${start_p_id}_${end_p_id}`;
                this.addEdge({ edge_id, start_p_id, end_p_id });

                // Добавляем пути ледокола до всех точек судов
                // Если ледокол не отменён

                for ( let iship_code in icebreakers ) {
                    const icebreaker = icebreakers[iship_code];
                    const i_start_p_id = icebreaker.start_p_id;
                    const i_is_disabled = icebreaker.is_disabled;

                    if (!i_is_disabled) {
                        let edge_id = `${i_start_p_id}_${end_p_id}`;
                        this.addEdge({ 
                            edge_id: edge_id, 
                            start_p_id: i_start_p_id, 
                            end_p_id: end_p_id 
                        });
                        edge_id = `${i_start_p_id}_${start_p_id}`;
                        this.addEdge({ 
                            edge_id: edge_id, 
                            start_p_id: i_start_p_id, 
                            end_p_id: start_p_id 
                        });
                    }
                }
            }
        }
    },
    initShips: function(dt, ships, icebreakers){
       // Пробегаем по всем ледоклоам из расписания и создаём их
       for ( let ship_code in icebreakers ) {
            const ship = icebreakers[ship_code];
            // Создаём экземпляр ледокола
            this.icebreakers[dt][ship_code] = new MaxiMary.nsr.IceBreakerClass(ship);
        }
       // Пробегаем по всем судам из расписания
        for ( let ship_code in ships ) {
            const ship = ships[ship_code];
            // Создаём экземпляр судна
            this.ships[dt][ship_code] = new MaxiMary.nsr.ShipClass(ship);
        }

        this.addShipsEdges(dt);
    },
    addEdge(edge){
        const { edge_id } = edge;
        if (!edge_id) return;
        if (!this.edges[edge_id]) {
            this.edges[edge_id] = edge;
        }
    },
    getCurrentIceDt: function(){
        return this.ices[this.current_ice_key];
    },
    getNextDate: function(dt, negative) {
        // Преобразуем строку в объект Date
        let date = new Date(dt);
        
        // Увеличиваем дату на один день
        const offset = (negative) ? -1 : 1;
        date.setDate(date.getDate() + (1 * offset));
        
        // Получаем компоненты новой даты
        let year = date.getFullYear();
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let day = date.getDate().toString().padStart(2, '0');
        
        // Формируем строку в формате 'YYYY-MM-DD'
        return `${year}-${month}-${day}`;
    },
    /**
     * Возвращает все доступные планы до даты dt включительно
     * @param {*} dt 
     * @returns 
     */
    getPlansUntil: function(dt){
        let out = {};
        for (let plan_dt in this.plans){
            const diff = getDaysDifference(dt, plan_dt);
            if (diff <=0 ) {
                out[plan_dt] = this.plans[plan_dt];
            }
        }
        return out;
    },
    setGraph: function(dt, data){
        const { ice_class_id } = data;
        const graph = this.getGraph(dt, ice_class_id);
        if (graph) {
            graph.setGraph(data);
            return graph;
        }
        this.graphs[dt][ice_class_id] = new MaxiMary.nsr.GraphClass(data);
        return this.getGraph(dt, ice_class_id);
    },
    getGraph: function(dt, ice_class_id){
        return this.graphs[dt][ice_class_id];
    },
    applyEdges: function(dt, resp){
        for (let ice_class_id in this.ice_class) {
            let out = { graph: {}, edges: {}, ice_class_id: ice_class_id };
            // Обработка закешированных рёбер
            resp.edges.forEach(data => {
                if (ice_class_id == data.ic) {
                    const { edge_id, edge_json } = data;
                    out.edges[edge_id] = JSON.parse(edge_json);
                }
            });
            this.setGraph(dt, out);            
        }
        this.printEdges(dt);

        const ice_class_id = this.checkEdges(dt);
        return ice_class_id; // Если не 0 то будет произведена подгрузка graph и по соответствующему ice_class_id будут считаться необходимые рёбра
    },
    // Проврека что все edges загружены
    checkEdges: function(dt){
        for (let edge_id in this.edges) {
            const edge = this.edges[edge_id];
            const { start_p_id, end_p_id } = edge;
            const reverse_edge_id = `${end_p_id}_${start_p_id}`; // Переворачиваем id

            for (let ice_class_id in this.ice_class) {
                if (ice_class_id == 0) continue;
                const graph = this.getGraph(dt, ice_class_id);
                if (!graph) return parseInt(ice_class_id);
                if (!graph.getEdge(edge_id)) return parseInt(ice_class_id);
                if (!graph.getEdge(reverse_edge_id)) return parseInt(ice_class_id);
            }
        }
        return 0;
    },
    applyGraph: function(dt, ice_class_id, resp){
        if (ice_class_id <= 0 ) return;

        // ----------------------------------------------------------
        /// Сначала соберём полный граф с типом ice_type_id = 3
        // ----------------------------------------------------------
        var out = { graph: {}, edges: {}, ice_class_id: ice_class_id };
        // Обработка Граф
        resp.graph.forEach(input => {
            const data = {
                weight: input.w,
                start_p_id: input.s,
                end_p_id: input.e,
                ice_class_id: input.ic
            }
            let weight = Infinity;
            if (data.ice_class_id <= ice_class_id) {
                weight = (data.weight == 0) ? Infinity : parseInt(data.weight, 10);
            }
            let id_start = data.start_p_id;
            let id_end = data.end_p_id;
            
            if (!out.graph[id_start]) {
                out.graph[id_start] = {};
            }
            out.graph[id_start][id_end] = weight;
        });
        this.setGraph(dt, out); 

        const graph = this.setGraph(dt, out);
        this.calcGraphs(dt, ice_class_id, graph, this.edges);
    },
    /**
     * Метод запуска расчёта плана переходов
     * @param {*} dt 
     */
    calcPlan: function(dt, data) {
        const plan = this.getPlan(dt);
        plan.calculate(data);
    },
    calcGraphs: function(dt, ice_class_id, graph, edges) {
        if (ice_class_id == 0) return;

        const me = this;
        const { ice_id } = this;

        let numWorkers = 0; // Количество воркеров, которые будут использоваться
        var i = 0;
        var delay = 0;
        const workerPromises = [];

        for (let edge_id in edges) {
            if (graph.getEdge(edge_id)) continue;

            i++; 
            delay = Math.round(i / 10) * 5000;

            if (numWorkers) {
                if (i > numWorkers) break;
            }

            const workerPromise = new Promise((resolve, reject) => {
                const worker = new Worker(`workers/dijkstra.js?timestamp=${Date.now()}`);
                worker.postMessage({ 
                    graph: graph.graph,
                    dt: dt,
                    ice_id: ice_id,
                    ice_class_id: ice_class_id,
                    delay: delay,
                    edge_id: edge_id,
                    startId: edges[edge_id].start_p_id,
                    endId: edges[edge_id].end_p_id
                });

                worker.onmessage = event => {
                    const result = event.data;
                    const dt = result.dt;

                    graph.setEdge(result);
                    me.printEdges(dt);
                    resolve(result);
                };

                worker.onerror = error => {
                    reject(error);
                };
            });

            workerPromises.push(workerPromise);
        }

        // Обработка результатов
        if (workerPromises.length) {
            return Promise.all(workerPromises).then((results) => {
                //console.log(results);
                this.prepareRoutes(results);
    
            }).catch(error => {
                console.error("Error processing graph with workers:", error);
            });
        } else {
           /*
           // Вот это в бесконечный цикл падает
            const ice_class_id = this.checkEdges(dt);
            if (ice_class_id) {
                this.view.fireEvent('loadgraph', dt, ice_class_id);
            } else {
                this.view.fireEvent('routeloader', false, 'calcGraphs - 302');
                this.view.fireEvent('calcplan', dt);
            }
            */
            this.printEdges(dt);
            this.view.fireEvent('calcplan', dt);
        }
    },

    prepareRoutes(dijkstras){
        console.log('prepareRoutes');
        var dt = null;
        dijkstras.forEach(item => {
            dt = item.dt;
            const { ice_class_id, edge_id } = item;
            const graph = this.getGraph(dt, ice_class_id);
            graph.setEdge(item);
        });
        for (let ice_class_id in this.ice_class) {
            const graph = this.getGraph(dt, ice_class_id);
            if (graph) {
                graph.destroyGraph();
            }
        }

        this.printEdges(dt);
        const ice_class_id = this.checkEdges(dt);
        if (ice_class_id) {
            this.view.fireEvent('loadgraph', dt, ice_class_id);
        } else {
            this.view.fireEvent('routeloader', false, 'Расчёт маршрутов завершён!');
            this.view.fireEvent('calcplan', dt);
        }
    },

    printEdges: function(dt){
        const map = this.map;
        if (!map) {
            Ext.showMsg('Карта не найдена!', false);
            return;
        }
        var features = [];

        for (let ice_class_id in this.ice_class) {
            const graph = this.getGraph(dt, ice_class_id);
            if (!graph) continue;
            const edges = graph.edges;
            for (let key in edges) {
                const items = this.getEdgeFeatures(edges[key]);
                features.push(...items);
            }
        }

        const geojson = {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: features
            }
        }

        if (map.getLayer('edges')){
            map.removeLayer('edges');
        }
        if (map.getSource('edges')){
            map.removeSource('edges');
        }

        // Add a line layer
        map.addSource('edges', geojson);
        map.addLayer({
            'id': 'edges',
            'type': 'line',
            'source': 'edges',
            'paint': {
                'line-color': '#F00000',
                'line-width': 3
            }
        }, 'points');   

    },

    getEdgeFeatures: function(edge){
        const points = this.points;
        const lines = [];
        const features = [];
        edge.result.path.forEach((item, i) => {
            const next = edge.result.path[i+1];
            if (next) {
                lines.push({
                    start_p_id: points[item],
                    end_p_id: points[next]
                });
                features.push({
                    geometry: {
                        coordinates: [
                            [parseFloat(points[item].lon), parseFloat(points[item].lat)],
                            [parseFloat(points[next].lon), parseFloat(points[next].lat)],
                        ],
                        type: "LineString"
                    },
                    type: 'Feature',
                });
            }
        });
        return features;
    },
    getScheduleFeatures: function(dt, schedule){
        const points = this.points;
        const lines = [];
        const features = [];

        for (let ship_code in schedule){
            const item = schedule[ship_code];
            const segment = item.schedule[dt];
            let lon, lat, opacity;
            const { start_p_id, img_marker, ship_name } = item.ship;

            if (segment === null) {
                lon = parseFloat(points[start_p_id].lon);
                lat = parseFloat(points[start_p_id].lat);
                opacity = 0.5;
            } else if (!segment){
                continue;
            } else {
                const segments = segment.segments;
                const last = segments[segments.length-1];
                if (!last) continue;
                lon = parseFloat(last.end_coord.lon);
                lat = parseFloat(last.end_coord.lat);
                opacity = 1;
            }

            features.push({
                type: 'Feature',
                geometry: {
                    coordinates: [lon, lat],
                    type: "Point"
                },
                properties: {
                    text: ship_name,
                    image: img_marker,
                    opacity: opacity
                }
            });

        }
        return features;
    },

    printPlan: function(){
        const dt = this.getCurrentIceDt();
        const { map, current_dt } = this;
        if (!map) {
            Ext.showMsg('Карта не найдена!', false);
            return;
        }

        const plan = this.getPlan(dt);
        const schedule = plan.schedule;
        // console.log('printPlan', schedule, map);
        
        this.view.fireEvent('printplan', dt);

        let features = this.getScheduleFeatures(current_dt, schedule);
        let geojson = {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features: features
            }
        }

        if (map.getLayer('plan')){
            map.removeLayer('plan');
        }
        if (map.getSource('plan')){
            map.removeSource('plan');
        }

        map.addSource('plan', geojson);

        if (!map.getLayer('plan')){
            map.addLayer({
                'id': 'plan',
                'type': 'symbol',
                'source': 'plan',
                'layout': {
                    'icon-image': ['get', 'image'],
                    'text-field': ['get', 'text'],
                    'text-size': 11,
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 1.25],
                    'text-anchor': 'top'
                },
                'paint': {
                    //'text-opacity': 0.5, // Прозрачность текста (0 - полностью прозрачный, 1 - полностью непрозрачный)
                    'icon-opacity': ['get', 'opacity']  // Прозрачность иконки (0 - полностью прозрачный, 1 - полностью непрозрачный)
                }
            });
        }

    }

});
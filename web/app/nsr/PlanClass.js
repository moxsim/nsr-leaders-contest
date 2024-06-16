Ext.define('MaxiMary.nsr.PlanClass', {
    constructor: function(task, dt){
        this.task = task;
        this.dt = dt;
        this.schedule = {};
        this.icebreaker_edges = {};
        this.icebreaker_trucks = {};
        this.icebreaker_cargos = {};

    },
    calculate: function(data){
        const task = this.task;
        const view = task.view;
        view.fireEvent('routeloader', true, 'Идёт расчёт плана переходов...');
        
        this.calc_icebreakers_edges(data.graph);

        this.schedule = this.calc_strategy_1(data);
        this.calc_icebreakers_plan(data);

        //view.fireEvent('routeloader', false, 'Расчёт плана переходов завершён!');
    },
    calc_icebreakers_plan: function(data){
        const dt = this.dt;
        const task = this.task;
        const view = task.view;
        const icebreakers = this.getEnabledShips(task.icebreakers[dt]); // Находим разрешённые Ледоколы

        // Подготовка this.icebreaker_trucks для планирования переходов
        for (let ib_code in icebreakers){
            const ib = icebreakers[ib_code];
            const { ship_code } = ib;
            this.icebreaker_trucks[ship_code] = {
                ship_code: ship_code,
                dt_id: 1, // TODO: Тут костыть, ледокол может быть не доступен, а планироваться на дату попозже
                start_p_id: ib.start_p_id
            }
        }

        const worker = new Worker(`workers/plan.js?timestamp=${Date.now()}`);
        worker.postMessage({ 
            edges: this.icebreaker_edges,
            trucks: this.icebreaker_trucks,
            cargos: this.icebreaker_cargos
        });
        worker.onmessage = event => {
            const result = event.data;
            this.calc_icebreakers_finale(result, data);
            //resolve(result);
        };
        worker.onerror = error => {
            //reject(error);
        };
    },
    calc_icebreakers_finale: function(plan, data){
        const dt = this.dt;
        const task = this.task;
        const view = task.view;
        const icebreakers = this.getEnabledShips(task.icebreakers[dt]); // Находим разрешённые Ледоколы

        let out = {};
        for (let ib_code in plan.result){
            let items = plan.result[ib_code];
            const ib = icebreakers[ib_code];
            const { ice_class_id } = ib;
            let prev_last_dt = null;
            let master_schedule = {};
            items.forEach((item, i) => {
                const { edge_id, cargo } = item;
                const route_self = this.findRoute(ice_class_id, edge_id);
                if (route_self) {
                    // Расчёт графика переходов
                    const start_dt = (prev_last_dt) ? this.getNextDate(prev_last_dt) : null;
                    const schedule = this.calculate_self_schedule(ib, route_self, data.graph, start_dt ); // Пробегаемся и находим графики
                    plan.result[ib_code][i].schedule = schedule;
                    master_schedule = Object.assign(master_schedule, schedule);
                    prev_last_dt = this.getScheduleLastDate(schedule); // Определяем последний день текущего schedule в prev_last_dt для следующего schedule

                    // Если у ледокола есть ведомые то добавляем их в общее расписание
                    if (cargo) if (cargo[0]) {
                        cargo.forEach(ship_code => {
                            const ship = this.getShipByCode(ship_code);
                            if (ship) {
                                out[ship_code] = {
                                    schedule: this.buildShipSchedule( ship, schedule),
                                    //edge: route_self,
                                    ship: ship, 
                                    icebreaker: ib,
                                    type: 'escort'
                                }
                            }
                        });
                    }
                } else {
                    // Вхождения сюда допускать нельзя, это будет означать, что граф не двунаправленный
                    // По идее нужно заранее подготовить рёбра чтобы они имели одинаковый маршрут в оба направления
                    console.log('calc_icebreakers_finale :: ПРОБЛЕМА!', schedule, edge_id, ice_class_id, route_self, this.icebreaker_edges);
                }
            });
            
            out[ib_code] = {
                schedule: master_schedule,
                //edge: route_self,
                ship: ib, 
                type: 'self'
            }
        }
        
        this.schedule = Object.assign(this.schedule, out); // Добавляем новые расписания в список расписаний

        // console.log('calc_icebreakers_finale', plan, this.schedule);

        task.printPlan();
        view.fireEvent('routeloader', false, 'Расчёт плана переходов завершён!');
        view.fireEvent('printplan', dt, this.schedule);
    },
    /**
     * В определённый момент ледокол берёт судно ship в проводку schedule
     * Это функция опредляет что судно ship делает до этого начиная от начала действия текущего плана ледовой обстановки
     * 
     * @param {*} ship 
     * @param {*} schedule 
     * @returns 
     */
    buildShipSchedule: function(ship, schedule){
        const dt = this.dt; // Дата ледовой обстановки
        const { start_date, ship_code, start_p_id } = ship; // Дата готовности судна
        const schedule_first_dt = this.getScheduleFirstDate(schedule);

        // Если начало плана и начало расписания судна совпадают, то возвращаем расписание движения как есть
        if (dt == schedule_first_dt) {
            return schedule;
        }

        let master_schedule = {};

        const waiting_point = this.getScheduleWaitingPoint(start_p_id); // Точка ожидания
        const dtDiff = this.getDaysDifference(dt, schedule_first_dt); // Разница между началом плана и датой начала расписания движения

        if (dtDiff > 0) {
            const dtArr = this.getDatesForward(dt, dtDiff); // Массив с количеством дней вперёд начиная от начала плана
            dtArr.forEach(arr_dt => {
                if (this.getDaysDifference(arr_dt, start_date) > 0) { // Проверка на дату доступности судна 
                    master_schedule[arr_dt] = null;
                } else {
                    master_schedule[arr_dt] = waiting_point;
                }
            });
        }
        master_schedule = Object.assign(master_schedule, schedule);
        // console.log('buildShipSchedule :: dt, start_date, ship_code, ship, schedule, master_schedule', dt, start_date, ship_code, ship, schedule, master_schedule)

        return master_schedule;
    },
    getShipByCode: function(ship_code){
        const dt = this.dt;
        const task = this.task;
        const ships = this.getEnabledShips(task.ships[dt]); // Находим разрешённые Суда
        return ships[ship_code];
    },
    getScheduleLastDate: function(schedule){
        let dates = Object.keys(schedule);
        dates.sort();
        const last_dt = dates.pop();
        return last_dt;
    },
    getScheduleFirstDate: function(schedule){
        let dates = Object.keys(schedule);
        dates.sort();
        const last_dt = dates.shift();
        return last_dt;
    },    
    calc_icebreakers_edges: function(graph){
        const dt = this.dt;
        const task = this.task;
        const ice_class_id = "3"; // TODO: тут пока закостылено
        const icebreakers = this.getEnabledShips(task.icebreakers[dt]); // Находим разрешённые Ледоколы
        const edges = task.getGraph(dt, ice_class_id).edges;

        for ( let iship_code in icebreakers) {
            const ib = icebreakers[iship_code];
            for ( let edge_id in edges) {
                const route = edges[edge_id];

                if (!route.result.distance) continue;

                const schedule = this.calculate_self_schedule(ib, route, graph);
                this.icebreaker_edges[edge_id] = {
                    start_p_id: route.start_p_id,
                    end_p_id: route.end_p_id,
                    weight: Object.keys(schedule).length
                }
            }
        }
    },
    calc_strategy_1: function(data){
        const dt = this.dt;
        const task = this.task;

        const ships = this.getEnabledShips(task.ships[dt]); // Находим разрешённые Суда
        const icebreakers = this.getEnabledShips(task.icebreakers[dt]); // Находим разрешённые Ледоколы
        const graphs = task.graphs[dt]; // Находим Маршруты
        const edges = task.edges;

        // console.log('PlanClass :: calc_strategy_1', dt, data, ships, icebreakers, graphs, edges);

        let out = {};
        // Пробегаем по всем судам и проверяем могут ли они добплыть до нужной точки сами
        for (let ship_code in ships) {
            const ship = ships[ship_code];
            const { edge_id, ice_class_id, escort_ice_class_id, start_p_id } = ship;
            const route_self = this.findRoute(ice_class_id, edge_id);
            const route_escort = this.findRoute(escort_ice_class_id, edge_id);
            if (route_self) { // Есть савмомстоятельный маршрут
                //console.log('self', ship, ice_class_id, edge_id, route_self);
                out[ship_code] = {
                    schedule: this.calculate_self_schedule(ship, route_self, data.graph ),
                    //edge: route_self, // Это пока не используется, но планировал, чтобы можно было на карте подстветить путь судна от старта до цели
                    ship: ship,
                    type: 'self'
                }
            } else { // Нет самостоятельного маршрута
                if (route_escort) { // Есть маршрут проводки

                    // Наполняем this.icebreaker_cargos для расчёта плана
                    let dtDiff = this.getDaysDifference(dt, ship.start_date);
                    const dt_id = (dtDiff <= 0) ? 1 : dtDiff + 1;
                    this.icebreaker_cargos[ship_code] = {
                        start_p_id: ship.start_p_id,
                        end_p_id: ship.end_p_id,
                        ship_code: ship.ship_code,
                        dt_id: dt_id // TODO: вот тут нужно будет протестировать, не пойми как это посчитал
                    }

                } else { // Нет маршрута проводки
                    out[ship_code] = {
                        schedule: {},
                        //edge: null,
                        ship: ship,
                        type: 'none'
                    }
                }
            }
        }

        return out;
    },

    getEnabledShips(ships){
        let out = {};
        for (let ship_code in ships) {
            if (!ships[ship_code].is_disabled){
                out[ship_code] = ships[ship_code];
            }
        }
        return out;
    },
    findRoute: function(ice_class_id, edge_id){
        const dt = this.dt;
        const task = this.task;
        const graphs = task.graphs[dt];
        if (!graphs) return null;
        if (!graphs[ice_class_id]) return null;
        if (!graphs[ice_class_id].edges) return null;
        if (!graphs[ice_class_id].edges[edge_id]) return null;

        const route = graphs[ice_class_id].edges[edge_id];
        if (!route.result.distance) return null;
        return route;
    },
    /**
     * Эта функция высчитывает расписание по дням для судна ship
     * @param {*} ship 
     * @param {*} route 
     * @param {*} graph 
     * @returns 
     */
    calculate_self_schedule: function(ship, route, graph, start_dt){
        const dt = (start_dt) ? start_dt : this.dt;
        const task = this.task;
        const points = task.points;
        const escort = 0;
        const journey = this.calculate_journey(ship, route, graph, escort);
        const { start_date, start_p_id } = ship;
        let splitDt = []
        // Создаём стартовую точку если start_dt не был передан
        if (!start_dt) {
            splitDt.push(this.getScheduleWaitingPoint(start_p_id));
        }
        // Далее добавляем точки переходов
        splitDt = splitDt.concat(this.splitInto24HourIntervals(journey));

        const dtDiff = (start_dt) ? 0 : this.getDaysDifference(dt, start_date);
        const dtCount = (dtDiff > 0) ? splitDt.length + dtDiff : splitDt.length;
        const dtArr = this.getDatesForward(dt, dtCount);

        let out = {}

        dtArr.forEach((pdt, i) => {
            if (i - dtDiff >= 0) {
                out[pdt] = splitDt[i-dtDiff];
            } else {
                out[pdt] = null;
            }
        });

        return out;
    },
    getScheduleWaitingPoint: function(start_p_id){
        const task = this.task;
        const points = task.points;
        return {
            segments: [{
                start_p_id: start_p_id,
                end_p_id: start_p_id,
                time: 0,
                distance: 0,
                value: 0,
                speed: 0,
                start_coord: points[start_p_id],
                end_coord: points[start_p_id]
            }],
            totalDistance: 0,
            isWait: true
        }
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
    getPrevDate: function(dt){
        return this.getNextDate(dt, true);
    },

    /**
     * Функция возвращает массив отрезков маршрута route
     * для судна ship по отрезкам graph
     * @param {*} ship 
     * @param {*} route 
     * @param {*} graph 
     * @returns array
     */
    calculate_journey: function(ship, route, graph, escort){
        const dt = this.dt;
        const task = this.task;
        const points = task.points;

        const lines = [];
        route.result.path.forEach((item, i) => {

            const next = route.result.path[i+1];
            if (next) {
                const edge_id = `${item}_${next}`;
                const val = graph[edge_id];

                const distance = parseFloat(val.d); // Дистанция в морских милях
                const value = parseFloat(val.v); // velocity льда
                const speed = ship.getSpeed(value, escort); // скорость судна по участку
                const time = round(distance / speed); // время затраченное на прохождение участка
                //if ( time < 0 ) console.log('buildSelfSchedule :: ship, edge_id, val, distance, value, speed, time', ship, edge_id, val, distance, value, speed, time  );

                lines.push({
                    start_p_id: item,
                    end_p_id: next,
                    time: time,
                    distance: distance,
                    value: value,
                    speed: speed,
                    start_coord: points[item],
                    end_coord: points[next]
                });
            }
        });
        return lines;
    },
    /**
     * Этот код корректно обрабатывает каждый сегмент, 
     * проверяя, можно ли его добавить в текущий интервал времени, 
     * не превышая лимит в 24 часа с возможностью превышения до 3 часов. 
     * 
     * Если лимит превышен, оставшееся время добавляется к следующему интервалу, 
     * обеспечивая корректное разбиение и учет оставшегося времени.
     * @param {*} data 
     * @returns 
     */
    splitInto24HourIntervals: function(data) {
        const result = [];
        let currentInterval = [];
        let currentTime = 0;
        let currentDistance = 0;
        let excessTime = 0;
    
        for (let segment of data) {
            let adjustedTime = segment.time - excessTime;
    
            if (currentTime + adjustedTime <= 24 || (currentTime + adjustedTime <= 27 && currentInterval.length === 0)) {
                currentInterval.push(segment);
                currentTime += adjustedTime;
                currentDistance += segment.distance;
                excessTime = 0;
            } else {
                if (currentTime < 24) {
                    let remainingTime = 24 - currentTime;
                    currentDistance += segment.distance * (remainingTime / adjustedTime);
                    excessTime = adjustedTime - remainingTime;
                } else {
                    excessTime = adjustedTime;
                }
    
                result.push({ segments: currentInterval, totalDistance: currentDistance });
    
                currentInterval = [segment];
                currentTime = excessTime;
                currentDistance = segment.distance * (excessTime / adjustedTime);
                excessTime = 0;
            }
        }
    
        if (currentInterval.length > 0) {
            result.push({ segments: currentInterval, totalDistance: currentDistance });
        }
    
        return result;
    },
    /**
     * Эта функция делает следующее:

        Преобразует входную строку даты в объект Date.
        Инициализирует пустой массив для хранения дат.
        В цикле на заданное количество дней добавляет к массиву строки дат в формате 'YYYY-MM-DD'.
        Увеличивает дату на один день в каждом цикле.

    После выполнения функции getDatesForward будет возвращён массив строк с датами, начиная с начальной даты и вперёд на указанное количество дней.
    * @param {*} startDate 
    * @param {*} days 
    * @returns 
    */
    getDatesForward: function(startDate, days) {
        // Преобразуем входную дату в объект Date
        let date = new Date(startDate);
        
        // Массив для хранения дат
        let datesArray = [];
        
        // Заполняем массив датами
        for (let i = 0; i < days; i++) {
            // Преобразуем объект Date обратно в строку в формате YYYY-MM-DD
            let year = date.getFullYear();
            let month = String(date.getMonth() + 1).padStart(2, '0');
            let day = String(date.getDate()).padStart(2, '0');
            
            datesArray.push(`${year}-${month}-${day}`);
            
            // Увеличиваем дату на один день
            date.setDate(date.getDate() + 1);
        }
        
        return datesArray;
    },
    /**
     * Эта функция делает следующее:

        Преобразует входные строки дат в объекты Date.
        Вычисляет разницу во времени между двумя датами в миллисекундах.
        Преобразует разницу во времени из миллисекунд в дни (разделяя на количество миллисекунд в одном дне: 1000 * 60 * 60 * 24).
        Возвращает разницу в днях.
     * @param {*} date1 
     * @param {*} date2 
     * @returns 
     */
    getDaysDifference: function(date1, date2) {
        // Преобразуем строки дат в объекты Date
        let startDate = new Date(date1);
        let endDate = new Date(date2);
    
        // Рассчитываем разницу во времени в миллисекундах
        let timeDifference = endDate - startDate;
    
        // Преобразуем разницу во времени в дни
        let dayDifference = timeDifference / (1000 * 60 * 60 * 24);
    
        return dayDifference;
    }
    

});
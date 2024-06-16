onmessage = event => {
    const { edges, trucks, cargos } = event.data;
    //console.log('plan.js onmessage - старт', edges);

    // Подготавливаем маршруты
    const graph = new Graph();
    for (let key in edges){
        const edge = edges[key];
        const { start_p_id, end_p_id, weight } = edge;
        graph.addEdge(start_p_id, end_p_id, weight);
    }

    // Тут будет собираться результирующий план
    var log = new Log();

    // Подготавливаем перевозчиков
    let _trucks = [];
    const waiting = 5;

    for (let key in trucks){
        const truck = trucks[key];
        const { start_p_id, dt_id, ship_code } = truck;
        _trucks.push(new Truck(start_p_id, dt_id, ship_code, waiting, log));
    }

    // Подготавливаем грузы
    let _cargos = [];
    for (let key in cargos){
        const cargo = cargos[key];
        const { start_p_id, end_p_id, dt_id, ship_code } = cargo;
        _cargos.push(new Cargo(start_p_id, end_p_id, dt_id, ship_code));
    }

    //console.log('graph',graph);
    //console.log('_trucks',_trucks);
    //console.log('_cargos',_cargos);

    // Запускаем расчёт
    scheduleDeliveries(_trucks, _cargos, graph);

    let result = {};
    log.out.forEach(itemlog => {
        if (itemlog.type == 'move'){
            const { truck, cargo, edge_id, start_dt_id, end_dt_id } = itemlog;
            if (!result[truck]) result[truck] = [];
            result[truck].push({
                edge_id: edge_id,
                cargo: cargo,
                start_dt_id: start_dt_id,
                end_dt_id: end_dt_id,
            });
        }
    });
    //console.log('log', log.out);
    //console.log('result', result);

    let output = {
        result: result
    }

    //console.log('plan.js onmessage - конец');
    postMessage(output);

};

class Graph {
    constructor() {
        this.edges = new Map();
    }

    addEdge(from, to, weight) {
        if (!this.edges.has(from)) {
            this.edges.set(from, []);
        }
        if (!this.edges.has(to)) {
            this.edges.set(to, []);
        }
        this.edges.get(from).push({ to, weight });
        this.edges.get(to).push({ to: from, weight });
    }

    getNeighbors(node) {
        return this.edges.get(node) || [];
    }

    findShortestPath(start, end) {
        const distances = new Map();
        const previous = new Map();
        const priorityQueue = [];
        
        distances.set(start, 0);
        priorityQueue.push({ node: start, priority: 0 });
        
        while (priorityQueue.length > 0) {
            priorityQueue.sort((a, b) => a.priority - b.priority);
            const { node } = priorityQueue.shift();
            
            if (node === end) {
                let path = [];
                let currentNode = end;
                while (currentNode !== start) {
                    path.push(currentNode);
                    currentNode = previous.get(currentNode);
                }
                path.push(start);
                return path.reverse();
            }
            
            this.getNeighbors(node).forEach(neighbor => {
                const newDist = distances.get(node) + neighbor.weight;
                if (newDist < (distances.get(neighbor.to) || Infinity)) {
                    distances.set(neighbor.to, newDist);
                    previous.set(neighbor.to, node);
                    priorityQueue.push({ node: neighbor.to, priority: newDist });
                }
            });
        }
        return [];
    }
}

class Log {
    constructor(debug) {
        this.out = [];
        this.debug = (!!debug);
    }
    add(data, text){
        if(this.debug) console.log(text);
        this.out.push(data);
    }
}

class Truck {
    constructor(startLocation, startDate, id, waiting, log) {
        this.id = id;
        this.location = startLocation;
        this.availableDate = startDate;
        this.cargo = [];
        this._cargo = []; 
        this.cargoLength = 0;
        this.waiting = waiting || 0; // время ожидания, по умолчанию 0
        this.log = log;
    }

    canTakeCargo(cargo) {
        let canTakeDay = 0;
        if (this.availableDate + this.waiting >= cargo.availableDate) {
            canTakeDay = this.availableDate + this.waiting;
        }
        return canTakeDay;
    }

    addCargo(cargo) {
        this.cargo.push(cargo);
        this._cargo.push(cargo.id);
        this.cargoLength = this.cargo.length;

        let temp = []
        const info = {
            type: 'add',
            start_dt_id: this.availableDate,
            end_dt_id: this.availableDate,
            truck: this.id,
            cargoLength: this.cargoLength,
            cargoId: cargo.id,
            cargo: temp.concat(this._cargo),
            start: cargo.start,
            end: cargo.end,
            edge_id: `${cargo.start}_${cargo.end}`
        }
        this.log.add(info, `Truck [${this.id}] added cargo [${cargo.id}]: ${cargo.start} -> ${cargo.end} at time ${this.availableDate}`);
    }

    deliverCargo(graph) {
        while (this.cargo.length > 0) {
            this.cargoLength = this.cargo.length;
            let nextCargo = this.cargo.shift();

            let path = graph.findShortestPath(this.location, nextCargo.end);
            if (path.length > 0) {
                path.shift(); // Remove the current location from the path
                path.forEach(step => {
                    // Find the edge weight between current location and next step
                    let edgeWeight = graph.getNeighbors(this.location).find(neighbor => neighbor.to === step).weight;
                    this.moveTo(step, edgeWeight);
                    this.checkAndTakeAdditionalCargo(step);
                });
            }

            let temp = []
            const idx = this._cargo.indexOf(nextCargo.id);
            if (idx != -1) this._cargo.shift();
            const info = {
                type: 'drop',
                start_dt_id: this.availableDate,
                end_dt_id: this.availableDate,
                truck: this.id,
                cargoLength: this.cargoLength,
                cargoId: nextCargo.id,
                cargo: temp.concat(this._cargo),
                start: nextCargo.start,
                end: nextCargo.end,
                edge_id: `${nextCargo.start}_${nextCargo.end}`
            }

            this.log.add(info, `Truck [${this.id}] delivered cargo [${nextCargo.id}]: ${nextCargo.start} -> ${nextCargo.end} At time ${this.availableDate}`);
            this.cargoLength = this.cargo.length;
        }
    }

    moveTo(location, edgeWeight) {
        const start_location = this.location;
        const start_dt_id = this.availableDate;
        this.location = location;
        this.availableDate += edgeWeight; // Увеличиваем время на стоимость ребра
        
        let temp = []
        const info = {
            type: 'move',
            start_dt_id: start_dt_id,
            end_dt_id: this.availableDate,
            truck: this.id,
            cargoLength: this.cargoLength,
            cargo: temp.concat(this._cargo),
            start: start_location,
            end: location,
            edge_id: `${start_location}_${location}`
        }
        this.log.add(info, `Truck [${this.id}] moving with ${this.cargoLength} to ${location} at time ${this.availableDate}`);
    }

    waitingCargo(cargo) {
        let waitTime = cargo.availableDate - this.availableDate;
        if (waitTime > 0) {
            const start_dt_id = this.availableDate;
            this.availableDate += waitTime;


            let temp = []
            const info = {
                type: 'wait',
                start_dt_id: start_dt_id,
                end_dt_id: this.availableDate,
                truck: this.id,
                cargoLength: this.cargoLength,
                cargoId: cargo.id,
                cargo: temp.concat(this._cargo),
                start: this.location,
                end: this.location,
                edge_id: null
            }
            this.log.add(info, `Truck [${this.id}] is waiting ${waitTime} days until cargo [${cargo.id}] is available at time ${start_dt_id}`);
        }
    }

    getRouteVertices() {
        let routeVertices = new Set();
        if (this.cargo.length > 0) {
            let cargo = this.cargo[0];
            let path = graph.findShortestPath(this.location, cargo.start);
            if (path.length > 0) {
                path.shift(); // Remove the current location from the path
                path.forEach(step => routeVertices.add(step));
            }
            routeVertices.add(cargo.start);
            routeVertices.add(cargo.end);
        }
        return routeVertices;
    }

    canTakeMoreCargo() {
        return this.cargo.length < 3; // Грузовик может взять еще груз, если у него меньше 3 уже взятых груза
    }

    checkAndTakeAdditionalCargo(location) {
        if (this.cargo.length > 0) {
            let routeVertices = this.getRouteVertices();
            let additionalCargo = cargos.find(cargo => {
                return routeVertices.has(cargo.start) || routeVertices.has(cargo.end);
            });

            if (additionalCargo && this.canTakeMoreCargo()) {
                let canTakeDay = this.canTakeCargo(additionalCargo);
                if (canTakeDay > 0) {
                    this.waitingCargo(additionalCargo);
                    if (this.canTakeCargo(additionalCargo) > 0) {
                        this.addCargo(additionalCargo);
                    }
                }
            }
        }
    }
}

class Cargo {
    constructor(start, end, availableDate, id) {
        this.id = id;
        this.start = start;
        this.end = end;
        this.availableDate = availableDate;
    }
}

function scheduleDeliveries(trucks, cargos, graph) {
    cargos.sort((a, b) => a.availableDate - b.availableDate);

    for (const cargo of cargos) {
        let availableTrucks = trucks.filter(t => t.cargo.length === 0); // Выбираем грузовики без грузов

        if (availableTrucks.length === 0) {
            // Если нет доступных грузовиков, ждем самого раннего
            let minAvailableDate = Math.min(...trucks.map(t => t.availableDate + t.waiting));
            availableTrucks = trucks.filter(t => t.availableDate + t.waiting === minAvailableDate && t.cargo.length === 0);
        }

        let truck = availableTrucks.reduce((minTruck, currentTruck) => {
            if (currentTruck.canTakeCargo(cargo) < minTruck.canTakeCargo(cargo)) {
                return currentTruck;
            } else {
                return minTruck;
            }
        });
/*
        if (truck) {
            if (truck.canTakeCargo(cargo)) {
                truck.waitingCargo(cargo); // Р“СЂСѓР·РѕРІРёРє Р¶РґС‘С‚, РєРѕРіРґР° РґРѕСЂРѕРіР° СЃС‚Р°РЅРµС‚ РґРѕСЃС‚СѓРїРЅРѕР№
                //truck.checkAndTakeAdditionalCargo(step);
            }
        }     
        */   
        if (!truck) {
            // Если нет доступного грузовика, найдем того, кто первым освободится
            let minAvailableDate = Math.min(...trucks.map(t => t.availableDate + t.waiting));
            truck = trucks.find(t => t.availableDate + t.waiting === minAvailableDate);
            truck.waitingCargo(cargo); // Грузовик ждет, пока груз станет доступным
        }

        const pathToStart = graph.findShortestPath(truck.location, cargo.start);
        if (pathToStart.length > 0) {
            pathToStart.shift(); // Удалим текущее местоположение из пути
            pathToStart.forEach(step => {
                // Find the edge weight between current location and next step
                let edgeWeight = graph.getNeighbors(truck.location).find(neighbor => neighbor.to === step).weight;
                truck.moveTo(step, edgeWeight);
                //console.log('step',step);
                truck.checkAndTakeAdditionalCargo(step);
            });
            truck.addCargo(cargo);
            truck.deliverCargo(graph);
        }
    }
}

/*
// Пример использования
const graph = new Graph();
graph.addEdge('A', 'B', 1);
graph.addEdge('B', 'C', 2);
graph.addEdge('A', 'C', 4);
graph.addEdge('D', 'C', 3);
graph.addEdge('E', 'B', 5);
graph.addEdge('D', 'E', 2);

const log = new Log();

const trucks = [
    new Truck('A', 1, 'Truck1', 2, log), 
    new Truck('D', 1, 'Truck2', 1, log)
]; 

const cargos = [
    new Cargo('A', 'C', 7, 'Cargo1'), 
    new Cargo('A', 'B', 8, 'Cargo2'), 
    new Cargo('B', 'D', 9, 'Cargo3'), 
    new Cargo('A', 'D', 10, 'Cargo4'), 
    new Cargo('D', 'C', 12, 'Cargo5'), 
];

scheduleDeliveries(trucks, cargos, graph);

console.log(log.out);
*/
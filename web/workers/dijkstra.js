onmessage = event => {
    const { graph, ice_id, dt, ice_class_id, edge_id, startId, endId, delay } = event.data;
    console.log('onmessage - старт', edge_id);

    let output = {
        dt: dt,
        ice_id: ice_id,
        ice_class_id: ice_class_id,
        edge_id, edge_id,
        start_p_id: startId,
        end_p_id: endId
    }

    // Пример использования функции delay
    delayFnc(delay, () => {
        output.result = dijkstra(graph, startId, endId);
        console.log('onmessage - конец', edge_id);
        postMessage(output);
    });
};

function delayFnc(ms, callback) {
    setTimeout(callback, ms);
}

function dijkstra(graph, startId, endId) {

    // Создаем объект для хранения расстояний от стартовой точки до остальных точек
    const distances = {};
    // Создаем объект для хранения предыдущих вершин на пути к каждой вершине
    const prevNodes = {};
    // Инициализируем расстояние до стартовой точки как 0, а до всех остальных - как бесконечность
    for (const nodeId in graph) {
        distances[nodeId] = nodeId === startId ? 0 : Infinity;
        prevNodes[nodeId] = null;
    }

    // Создаем объект для хранения посещенных вершин
    const visited = {};

    // Главный цикл алгоритма
    while (true) {
        let minDistance = Infinity;
        let closestNodeId = null;

        // Находим ближайшую вершину, которую еще не посетили
        for (const nodeId in distances) {
            const distance = distances[nodeId];
            if (!visited[nodeId] && distance < minDistance) {
                minDistance = distance;
                closestNodeId = nodeId;
            }
        }

        // Если не нашли ближайшую вершину, выходим из цикла
        if (closestNodeId === null) {
            break;
        }

        // Если достигли конечной точки, выходим из цикла
        if (closestNodeId === endId) {
            break;
        }

        // Помечаем вершину как посещенную
        visited[closestNodeId] = true;

        // Обновляем расстояния до соседних вершин
        for (const neighborNodeId in graph[closestNodeId]) {
            const distanceToNeighbor = graph[closestNodeId][neighborNodeId];
            const totalDistance = distances[closestNodeId] + distanceToNeighbor;
            if (totalDistance < distances[neighborNodeId]) {
                distances[neighborNodeId] = totalDistance;
                prevNodes[neighborNodeId] = closestNodeId; // Запоминаем предыдущую вершину на пути к соседу
            }
        }
    }

    // Функция для восстановления пути от стартовой точки до целевой точки
    function reconstructPath(targetId) {
        const path = [];
        let currentId = targetId;
        while (currentId !== null) {
            path.unshift(currentId);
            currentId = prevNodes[currentId];
        }
        return path;
    }

    // Возвращаем результат для конечной точки
    return {
        distance: distances[endId],
        path: reconstructPath(endId)
    };
}

// -----------------------------------------------------------------------
// Эта функция находит кратчайшие растояния до всех точек
function dijkstraAll(graph, startId) {
    // Создаем объект для хранения расстояний от стартовой точки до остальных точек
    const distances = {};
    // Создаем объект для хранения предыдущих вершин на пути к каждой вершине
    const prevNodes = {};
    // Инициализируем расстояние до стартовой точки как 0, а до всех остальных - как бесконечность
    for (const nodeId in graph) {
        distances[nodeId] = nodeId === startId ? 0 : Infinity;
        prevNodes[nodeId] = null;
    }

    // Создаем объект для хранения посещенных вершин
    const visited = {};

    // Главный цикл алгоритма
    while (true) {
        let minDistance = Infinity;
        let closestNodeId = null;

        // Находим ближайшую вершину, которую еще не посетили
        for (const nodeId in distances) {
            const distance = distances[nodeId];
            if (!visited[nodeId] && distance < minDistance) {
                minDistance = distance;
                closestNodeId = nodeId;
            }
        }

        // Если не нашли ближайшую вершину, выходим из цикла
        if (closestNodeId === null) {
            break;
        }

        // Помечаем вершину как посещенную
        visited[closestNodeId] = true;

        // Обновляем расстояния до соседних вершин
        for (const neighborNodeId in graph[closestNodeId]) {
            const distanceToNeighbor = graph[closestNodeId][neighborNodeId];
            const totalDistance = distances[closestNodeId] + distanceToNeighbor;
            if (totalDistance < distances[neighborNodeId]) {
                distances[neighborNodeId] = totalDistance;
                prevNodes[neighborNodeId] = closestNodeId; // Запоминаем предыдущую вершину на пути к соседу
            }
        }
    }

    // Функция для восстановления пути от стартовой точки до целевой точки
    function reconstructPath(targetId) {
        const path = [];
        let currentId = targetId;
        while (currentId !== null) {
            path.unshift(currentId);
            currentId = prevNodes[currentId];
        }
        return path;
    }

    // Создаем объект для хранения результатов
    const result = {};

    // Заполняем результаты расстояний и маршрутов
    for (const nodeId in distances) {
        result[nodeId] = {
            distance: distances[nodeId],
            path: reconstructPath(nodeId)
        };
    }

    return result;
}



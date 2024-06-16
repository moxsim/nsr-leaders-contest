Ext.define('MaxiMary.nsr.GraphClass', {
    graph: {},
    edges: {},
    ice_class_id: null,

    constructor: function(data){
        this.ice_class_id = data.ice_class_id;
        this.graph = data.graph;
        this.edges = data.edges || {};
        this.applyReverse();
    },
    setGraph: function(data){
        this.graph = data.graph;
    },
    destroyGraph: function(){
        delete this.graph;
        this.graph = {};
    },
    setEdge: function(edge){
        const { edge_id } = edge;
        const distance = edge.result.distance;
        if (this.getEdge(edge_id) && distance) {
            return this.getEdge(edge_id);
        }
        this.edges[edge_id] = edge;
        this.cacheEdge(edge_id);
        this.setReverse(edge);
        return this.getEdge(edge_id);
    },
    applyReverse: function(){
        for ( let edge_id in this.edges ) {
            this.setReverse(this.edges[edge_id]);
        }
    },
    setReverse: function(edge){
        const distance = edge.result.distance;
        if (!distance) return;

        const { start_p_id, end_p_id } = edge;
        const edge_id = `${end_p_id}_${start_p_id}`; // Переворачиваем id
        if (!this.getEdge(edge_id)){ // Если такого элемента нет, то создаём его
            let clone = Object.assign({}, edge);
            clone.edge_id = edge_id;
            clone.end_p_id = start_p_id;
            clone.start_p_id = end_p_id;
            clone.result.path.reverse();

            this.setEdge(clone);
        }
    },
    getEdge: function(edge_id){
        return this.edges[edge_id];
    },
    cacheEdge: function(edge_id){
        const edge = this.getEdge(edge_id);
        const { ice_class_id } = this;
        const { ice_id, dt } = edge;

        Ext.Ajax.request({
            url: 'api/front/nsr_cache_ice_graph_edge.php',
            method: 'POST',
            params: {
                ice_id: ice_id,
                ice_class_id: ice_class_id,
                dt: dt,
                edge_id: edge_id,
                edge_json: JSON.stringify(edge)
            },            
            success: function(response, opts) {
                // console.log('nsr_cache_ice_graph_edge', response);
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });


    }
});
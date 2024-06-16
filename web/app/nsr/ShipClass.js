Ext.define('MaxiMary.nsr.ShipClass', {
    ship_code: null,
    is_icebreaker: false,
    is_disabled: false, // Флаг указывает что либо конечная, либо начальная точка находятся в недоступной или запрещённой зоне
    messages: [],

    // ------------------------------------------
    arc_class_id: null,
    speed_knot: null,
    speed_kmph: null,
    ice_class_id: null,
    escort_ice_class_id: null,
    // ------------------------------------------
    start_p_id: null,
    end_p_id: null, // Конечная точка всегда неизменна
    edge_id: null,

    constructor: function(data, parent){
        this.initData = data;

        this.ship_code = this.initData.ship_code;
        this.arc_class_name = this.initData.arc_class_name;
        this.ship_name = this.initData.ship_name;
        this.start_date = this.initData.start_date;
        this.is_disabled = false;
        this.arc_class_id = parseInt(this.initData.arc_class_id);
        this.ice_class_id = parseInt(this.initData.ice_class_id);
        this.escort_ice_class_id = parseInt(this.initData.escort_ice_class_id);
        this.speed_knot = parseFloat(this.initData.speed_knot);
        this.speed_kmph = parseFloat(this.initData.speed_kmph);
        this.img_marker = this.getImgMarker();
        
        // Определяем ледокол это или нет
        const icebreaker_id = this.initData.icebreaker_id;
        this.is_icebreaker = (!!icebreaker_id) || (this.arc_class_id == 9);

        // Определяем начальные и конечны точки и сам маршрут
        const { start_p_id, end_p_id } = this.initData;
        this.end_p_id = (end_p_id) ? end_p_id : null;
        this.start_p_id = (start_p_id) ? start_p_id : null;
        if (start_p_id && end_p_id) {
            this.edge_id = `${start_p_id}_${end_p_id}`;
        }
        // Определяем тип льда начальной и конечной точки
        const { start_ice_class_id, end_ice_class_id } = this.initData;
        this.start_ice_class_id = (start_ice_class_id) ? parseInt(start_ice_class_id) : null;
        this.end_ice_class_id = (end_ice_class_id) ? parseInt(end_ice_class_id) : null;
        // Проверяем точки на доступность
        this.checkPoints();
    },
    getImgMarker: function(){
        let img_marker;
        switch(this.arc_class_id){
            case 9:
                img_marker = 'arc9-marker';
                break;
            case 7:
                img_marker = 'arc7-marker';
                break;
            case 6:
            case 5:
            case 4:
                img_marker = 'arc4-marker';
                break;
            default:
                img_marker = 'arc0-marker';
        }
        return img_marker;
    },
    setDisabled: function(is_disabled, messages){
        this.is_disabled = is_disabled;
        if (typeof(messages) == 'object') {
            this.messages = [...messages];
        }
    },
    checkPoints: function(){
        const { start_p_id, end_p_id, start_ice_class_id, end_ice_class_id } = this;
        const { start_point_name, end_point_name } = this.initData;
        let is_disabled = false;
        let messages = [];
        if (start_p_id) if (end_ice_class_id == 0) {
            messages.push(`Начальная точка <b>${start_point_name}</b> находится вне зоны доступа!`);
            is_disabled = true;
        }
        if (end_p_id) if (end_ice_class_id == 0) {
            messages.push(`Конечная точка <b>${end_point_name}</b> находится вне зоны доступа!`);
            is_disabled = true;
        }
        if (is_disabled){
            this.setDisabled(is_disabled, messages);
        }
    },

    // ----------------------------------------------
    // Ледовый класс  21-20    19-15          14-10
    // ----------------------------------------------
    // No ice class   k=1     k=0.7           k=0
    // Arc4-Arc6      k=1     k=0.8(+провод)  k=0.7 (+проводка)
    // Arc7           k=1     k=0.6(своим х)  k=0.15(своим ходом)
    // Arc7           k=1     k=0.9(+провод)  k=0.8 (+проводка)
    // --------------------------------------------
    // Arc9-ямал 50   22      19-15       14-10
    // лет победы     21      19-15       14-10
    // Arc9-вайгач    18.5   17.1-13.5  10.5-7.5
    // таймыр         18.5   17.1-13.5  10.5-7.5
    // --------------------------------------------
    
    // расчёт скорости судна в ледовых условиях
    // -- входные данные
    // arc_class_id - класс судна - число 0,4,5,6,7
    // velocity - ледовые условиЯ 22.0-10.0
    // speed_knot - скорость судна в узлах на чистой воде
    // escort - 0, 1 отсутствие или наличие проводки
    // для ледоколов escort может принимать любое значение
    // -- выходные данные
    // nn.nnn - скорость судна в узлах в заданных ледовых условиях
    // 0 - если судно не может плыть без проводки, когда escort=0
    // -1 - плавать судну в заданных условиях запрещено, в том числе
    // для всех судов, если ледовые условия меньше 10.0
    // EXSAMPLE: V=speed_n(5, 18.750, 16.7, 1)    
    getSpeed: function(velocity, escort) {
        const { arc_class_id, speed_knot } = this;

        let i, j;
        const kk = [
            [1.0, 0.7, 0.0],
            [1.0, 0.8, 0.7],
            [1.0, 0.9, 0.8]
        ];
        const mm = [
            [1.0, 0.0, 0.0],
            [1.0, 0.0, 0.0],
            [1.0, 0.6, 0.15]
        ];
        let v;
    
        if (arc_class_id === 9) {
            if (speed_knot === 22 || speed_knot === 21) {
                if (velocity >= 19.5) return speed_knot;
                if (velocity >= 10.0 && velocity < 19.5) return velocity;
                return -1.0;
            }
            if (speed_knot === 18.5) {
                if (velocity >= 19.5) return 18.5;
                if (velocity >= 14.5 && velocity < 19.5) return velocity * 0.9;
                if (velocity >= 10.0 && velocity < 14.5) return velocity * 0.75;
                return -1.0;
            }
            return -1.0;
        }
    
        if (velocity >= 19.5) j = 0;
        else if (velocity >= 14.5 && velocity < 19.5) j = 1;
        else if (velocity >= 10.0 && velocity < 14.5) j = 2;
        else return -1.0;
    
        if (arc_class_id === 4 || arc_class_id === 5 || arc_class_id === 6) i = 1;
        else if (arc_class_id === 7) i = 2;
        else if (arc_class_id >= 0 && arc_class_id < 4) i = 0;
        else return -1.0;
    
        if (escort === 0) v = speed_knot * mm[i][j];
        else v = speed_knot * kk[i][j];
    
        return v;
    }
    

});
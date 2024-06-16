/**
 * The main application class. An instance of this class is created by app.js when it
 * calls Ext.application(). This is the ideal place to handle application launch and
 * initialization details.
 */
Ext.define('MaxiMary.Application', {
    extend: 'Ext.app.Application',
    
    name: 'MaxiMary',

    stores: [
        // TODO: add global / shared stores here
    ],
    
    launch: function () {
        // Создаем контейнер под всплывающие сообщения
        Ext.DomHelper.insertFirst(document.body, {id: "msg-div"},true);

        // ---------------------------------------------------
        // Всплывающее сообщение (использует jQuery)
        // ---------------------------------------------------
        Ext.showMsg = function(msg,result,notClose) {
            if (!msg) return false;
            var el = $('#msg-div'),
                msgId = Ext.id(),
                body = Ext.getBody();
            el.css('left',((Ext.getBody().dom.clientWidth - 300) / 2) + 'px');
                
            Ext.msgId = msgId;
            el.html(Ext.String.format(
                        '<span id="msg-div-{1}">{0}</span>'
                        ,msg,(result) ? ((!notClose) ? 'info' : 'loading' ): 'error')).show(200);
            if (!notClose) Ext.defer(Ext.clearMsg, 3000, Ext, [msgId]);
            return msgId;
        }
        Ext.clearMsg = function(msgId) {
                if (msgId === Ext.msgId) {
                    $('#msg-div').hide(200);
                    Ext.msgId = null;
                }
        }
        Ext.isMsg = function(){
            return !!Ext.msgId;
        }

        /* Функции для Кольца */
        
        // Форматирование числа
        formatValue = function(value, config) {
            // 0. Тирешечка
            if (value == '-') {
                return '-';
            }
            // 1. Формат даты
            var regexp = /[0-9]{4}-(0[1-9]|1[012])-(0[1-9]|1[0-9]|2[0-9]|3[01])/;
            if (regexp.test(value)) {
                return dateToStr(value,1);
            }
            // 2. Формат числа
            value = parseFloat(value);
            if (value == null || isNaN(value)) return '&nbsp;';
            
            var m = '',
                round = 2,
                round_type = 'round',
                multiplier = (multiplier) ? multiplier : 1,
                str_before = '',
                str_after = '',
                delimeter = ' ';
                
            if (config) {
                if (config.round != undefined) round = config.round;
                if (config.round_type != undefined) round_type = config.round_type;
                if (config.multiplier != undefined) multiplier = (config.multiplier) ? config.multiplier : 1;
                if (config.delimeter != undefined) delimeter = config.delimeter;
                if (config.str_before != undefined) str_before = config.str_before;
                if (config.str_after != undefined) str_after = config.str_after;
            }
            if (multiplier) m = value * multiplier;
            if (round || round===0) {
                // Округление
                m = m * Math.pow(10, round);
                switch(round_type){
                    case 'ceil': m = Math.ceil(m); break;
                    case 'floor': m = Math.floor(m); break;
                    default: m = Math.round(m); break;
                }
                m = m / Math.pow(10, round);
                m = m.toFixed(round);
            }
            
            var str = ''+m,
                spl = str.split('.'),
                m1 = spl[0],
                m2 = (spl[1] ? spl[1] : '');
            
            return Ext.String.format(
                '{3}{0}{1}{2}{4}'
                , m1.replace(/(\d)(?=(\d\d\d)+([^\d]|$))/g, '$1'+delimeter)  // целочисленная часть числа, разделитель по тысячам
                , (m2) ? '.' : ''    // разделитель десятичных знаков
                , (m2) ? m2 : ''     // десятичные знаки
                , str_before         // строка до числа
                , str_after          // строка после числа
            );
        }

        getStateColor = function(status) {
            switch(status) {
                case -3: return '#CC0000'; /* красный */
                case -2: return '#EA7783'; /* светло красный */
                case -1: return '#ff8888'; /* светло светло красный */
                case 3: return '#1AA260'; /* зеленый */
                case 2: return '#7ed39a'; /* светло зеленый */
                case 1: return '#8bedbe'; /* светло светло зеленый */
                case 0: return '#c8c8c8'; /* серый 1 */
                
                case 10: return '#D2D2D2'; /* серый 2 */
                case 11: return '#EA7783'; /* светло красный */
                case 12: return '#FFCE44'; /* желтый */ 
                case 13: return '#1AA260'; /* зеленый */
                
                case 100: return '#a5a5a5'; /* серый 3 */
                default: return 'rgba(245, 245, 245, 1.0)';  /* светло светло серый */
            }
            
        }

        getParam = function( value, dyn, negative, round ) {
            var config = {
                round: 2,
                round_type: 'round',
                multiplier: 1,
                delimeter: ' ',
                str_before: '',
                str_after: '%'
            }
            config = null;
            
            if (round) config = { round: round }
            
            value = this.formatValue(value, config);
            dyn = this.formatValue(dyn, config);
            
            var color, dyn_result, arrow;
            if (dyn < 0) {
                color = (!negative) ? '#900000' : '#009000';
                dyn_result = '' + dyn;
                arrow = '▼';
            }
            if (dyn == 0) {
                color = '#666';
                dyn_result = '+' + dyn;
                arrow = '';
            }
            if (dyn > 0) {
                color = (!negative) ? '#009000' : '#900000';
                dyn_result = dyn;
                arrow = '▲';
            }
            return Ext.String.format('<font color="#333333"><b>{0}</b></font> | <font color="{1}">{2}% {3}</font>', value, color, dyn_result, arrow);
        }
        
    },

    onAppUpdate: function () {
        Ext.Msg.confirm('Application Update', 'This application has an update, reload?',
            function (choice) {
                if (choice === 'yes') {
                    window.location.reload();
                }
            }
        );
    }
});

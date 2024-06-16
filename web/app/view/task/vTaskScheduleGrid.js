Ext.define('MaxiMary.view.task.vTaskScheduleGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.vTaskScheduleGrid',
    xtype: 'vTaskScheduleGrid',

    bbar: [{
        xtype: 'displayfield',
        width: 600,
        tpl: new Ext.XTemplate(`
            <div>
                <span class="x-fa fa-anchor"> Стоит на якоре</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                <span class="x-fa fa-shield"> Сопровождается ледоколом</span>&nbsp;&nbsp;|&nbsp;&nbsp;
                <span class="x-fa fa-chevron-right"> Двигается своим ходом</span>
            </div>
        `),
        value: { test: 123}
    }],
    initComponent: function(){
        const Task = this.Task;
        const { first_dt, plan_days_count } = Task;
        const arrDates = getDatesForward(first_dt, plan_days_count); // Формируем массив с датами плана
        const grid = this;

        let dateColumns = []
        arrDates.forEach(dt => {
            const a = dt.split('-');
            dateColumns.push({
                text: `${a[2]}<br/>${a[1]}`,
                dataIndex: dt,
                width: 40,
                //locked: false,
                //locakable: false,
                sortable: false,
                align: 'center',
                renderer: function (value, meta, record, rowIndex, colIndex, store, view ) {

                    const columns = grid.getColumns();
                    const column = columns[colIndex];
                    const dt = column.dataIndex;
                    meta.tdStyle = '';
                    const is_disabled = record.data.is_disabled;
                    const is_plan = record.data[`plan_${dt}`]; // Является ли датой плана ледовой обстановки
                    if (Task.current_dt == dt) meta.tdStyle += "background:#FFB323;";
                    if (is_plan) {
                        meta.tdStyle += "border-left: 2px solid #000; border-right: 2px solid #000;";
                    } else {
                        meta.tdStyle += "border-left: 1px solid #e2e2e2;";
                    }
                    //if (is_disabled) meta.tdStyle += "opacity:.5;";

                    const is_await = record.data[`await_${dt}`]; // Ожидается, ещё не готов к отправке
                    const is_wait = record.data[`wait_${dt}`]; // Ждёт и никуда не идёт
                    const ib_code = record.data[`ib_${dt}`]; // Код ледокола
                    const status = record.data[`stat_${dt}`]; // ban | none | escort | self 

                    let iconCls = '';

                    if (is_disabled) {
                        // iconCls = 'fa-ban';
                    } else if (is_await) {
                        //iconCls = 'fa-clock-o';
                    } else {
                        switch(status){
                            case 'ban':
                                // iconCls = 'fa-ban';
                                break;
                            case 'none':
                                iconCls = 'fa-remove';
                                break;
                            case 'self':
                                iconCls = 'fa-chevron-right';
                                break;
                            case 'escort':
                                if (is_wait) {
                                    iconCls = 'fa-anchor';
                                } else {
                                    iconCls = 'fa-shield';
                                }
                                break;
                            default:
                                iconCls = 'fa-question-circle';
                        }
                    }
                    
                    return `
                        <span class="x-fa ${iconCls}"></span>
                    `;
                }
            });
        });

        let columns = this.getMainColumns();
        columns = columns.concat(dateColumns);

        console.log('vTaskScheduleGrid', arrDates, dateColumns, columns);

        Ext.apply(this,{
            store: Ext.create('Ext.data.Store',{
                autoLoad: true,
                idProperty: 'ship_code',
                fields: [
                     { name: 'ship_code', type: 'string'}
                     ,{ name: 'ship_name', type: 'string'}
                     ,{ name: 'start_date', type: 'string'}
                     ,{ name: 'arc_class_id', type: 'int'}
                     ,{ name: 'arc_class_name', type: 'string'}
                     ,{ name: 'is_icebreaker', type: 'bool'}
                ],
                sorters: [{
                    property: 'task_id',
                    direction: 'DESC'
                }],   
                data: []
            }),
            columns: columns,
            autoScroll: true,
            viewConfig: {
                loadMask: false,
                listeners: {
                    scope: this
                }
            },
            listeners: {
                // itemdblclick: "onTaskDoubleClick",
            }
        });

        this.callParent(arguments);
    },
    getMainColumns: function(){
        return [{
            text: '#',
            dataIndex: 'arc_class_id',
            width: 80,
            //lockable: true,
            //locked: true,
            align: 'center',
            renderer: function (value, meta, record) {
                const { arc_class_id, arc_class_name } = record.data;
                let img;

                switch(arc_class_id){
                    case 9:
                        img = 'img/arc9.png';
                        break;
                    case 7:
                        img = 'img/arc7.png';
                        break;
                    case 6:
                    case 5:
                    case 4:
                        img = 'img/arc4.png';
                        break;
                    default:
                        img = 'img/arc0.png';
                }

                return `<img src="${img}" style="height:50%!important"/>`;
            }
        },{
            text: 'Класс',
            dataIndex: 'arc_class_id',
            width: 80,
            //lockable: true,
            //locked: true,
            align: 'center',
            xtype: 'templatecolumn',
            tpl: [`
                <span style="font-weight:500">{arc_class_name}</span>
            `]
        },{
            text: 'Название',
            dataIndex: 'ship_name',
            width: 200,
            //lockable: true,
            //locked: true,
            align: 'left',
            xtype: 'templatecolumn',
            cellWrap: true,
            tpl: [`
                <div style="font-weight:500">{ship_name}</div>
                <tpl if="is_disabled">
                    <div>запрет</div>
                <tpl else>
                    <div>{start_date}</div>
                </tpl>
            `]
        }];
    }



});
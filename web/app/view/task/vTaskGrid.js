Ext.define('MaxiMary.view.task.vTaskGrid', {
    extend: 'Ext.grid.Panel',
    alias: 'widget.vTaskGrid',
    xtype: 'vTaskGrid',
    reference: 'TaskGrid',

    lbar: [{
        iconCls: 'x-fa fa-refresh',
        style: 'border-radius: 10px',
        ui: 'blue',
        handler: "onTaskGridRefresh"
    }],

    initComponent: function(){
        
        Ext.apply(this,{
            store: Ext.create('Ext.data.Store',{
                autoLoad: true,
                idProperty: 'task_id',
                fields: [
                     { name: 'task_id', type: 'int'}
                    ,{ name: 'ice_id', type: 'int'}
                    ,{ name: 'filename', type: 'string'}
                    ,{ name: 'filesize', type: 'int'}
                    ,{ name: 'load_dtm', type: 'string'}
                ],
                sorters: [{
                    property: 'task_id',
                    direction: 'DESC'
                }],   
                proxy: {
                    type: 'ajax',
                    url: 'api/front/task_grid.php',
                    reader: {
                        type: 'json',
                        rootProperty: 'data'
                    }        
                }
            }),
            columns: [{
                text: '№ п/п',
                dataIndex: 'task_id',
                width: 80,
                align: 'right'
            },{
                text: 'Название',
                dataIndex: 'filename',
                flex: 2,
                align: 'left',
                xtype: 'templatecolumn',
                tpl: [`
                    <span style="font-weight:500">{filename}</span>
                `]
            },{
                text: 'Размер файла, байт',
                dataIndex: 'filesize',
                flex: 1,
                align: 'right'
            },{
                text: 'Дата подачи',
                dataIndex: 'load_dtm',
                flex: 1,
                align: 'left'
            }],
            autoScroll: true,
            viewConfig: {
                loadMask: false,
                listeners: {
                    scope: this
                }
            },
            listeners: {
                itemdblclick: "onTaskDoubleClick",
            }
        });
        this.callParent(arguments);
    },

});
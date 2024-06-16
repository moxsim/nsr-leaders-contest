Ext.define('MaxiMary.view.task.vTaskPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.vTaskPanel',
    xtype: 'vTaskPanel',
    controller: 'cTaskPanelController',
    layout: 'fit',
    height: '100%',
    bodyPadding: 3,
    style: 'border-left: 1px solid #999;',

    requires: [
        'MaxiMary.view.task.cTaskPanelController',
        'MaxiMary.view.task.vTaskWindow',
        'MaxiMary.view.task.vTaskGrid',
        'MaxiMary.view.task.vTaskMapPanel',
    ],
    items: [{
        xtype: 'panel',
        layout: 'border',
        height: '100%',
        tbar: [{
            text: 'Обработать новую заявку',
            style: 'border-radius: 12px',
            iconCls: 'x-fa fa-plus',
            reference: 'AddTaskButton',
            scale: 'medium',
            ui: 'blue',
            handler: "onNewTaskWindow"
        },'->',{
            xtype: 'displayfield',
            width: 420,
            tpl: new Ext.XTemplate(`
                <div style="margin-bottom:5px">
                    <b>
                    <img src="img/arc0.png" align="absmiddle" /> Ice 1-3, No ice&nbsp;&nbsp;|&nbsp;&nbsp;  
                    <img src="img/arc4.png" align="absmiddle" /> Arc 4-6&nbsp;&nbsp;|&nbsp;&nbsp;  
                    <img src="img/arc7.png" align="absmiddle" /> Arc 7&nbsp;&nbsp;|&nbsp;&nbsp;  
                    <img src="img/arc9.png" align="absmiddle" /> Arc 9
                    </b> 
                </div>
            `),
            value: { test: 123}
        },{
            text: 'Закрыть все открытые вкладки',
            iconCls: 'x-fa fa-remove',
            style: 'border-radius: 10px',
            //ui: 'red',
            handler: "onCloseTasks"
        }],
        items: [{
            xtype: 'tabpanel',
            reference: 'TaskTabPanel',
            region: 'center',
            plugins: 'tabreorderer',
            items: [{
                title: 'Журнал',
                iconCls: 'x-fa fa-th-list',
                xtype: 'vTaskGrid',
                reorderable: false
            }]
        }]
    }]

});
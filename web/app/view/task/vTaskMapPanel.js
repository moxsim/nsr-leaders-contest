Ext.define('MaxiMary.view.task.vTaskMapPanel', {
    extend: 'Ext.panel.Panel',
    alias: 'widget.vTaskMapPanel',
    xtype: 'vTaskMapPanel',
    controller: 'cTaskMapPanelController',
    layout: 'border',

    requires: [
        'MaxiMary.view.task.cTaskMapPanelController',
        'MaxiMary.view.task.vTaskScheduleGrid',
        // --------------------------------------------
        'MaxiMary.nsr.TaskClass',
    ],
    tbar: [{
        xtype: 'displayfield',
        reference: 'HeaderInfo',
        tpl: new Ext.XTemplate(
            '<h1>{current_dt}</h1>'
        )
    },'-',{
        iconCls: 'x-fa fa-mail-reply',
        reference: 'restartBtn',
        disabled: true,
        handler: 'onRestart'
    },{
        iconCls: 'x-fa fa-arrow-left',
        reference: 'prevBtn',
        disabled: true,
        handler: 'onPrevStep'
    },{
        iconCls: 'x-fa fa-arrow-right',
        reference: 'nextBtn',
        ui: 'blue',
        text: 'Далее',
        disabled: true,
        handler: 'onNextStep'
    },{
        text: 'Идёт построение маршрутов...',
        icon: 'img/bouncing-circles.svg',
        // https://www.svgbackgrounds.com/elements/animated-svg-preloaders/
        reference: 'routeLoader',
        ui: 'red',
        hidden: true
    },'->',{
        iconCls: 'x-fa fa-bullseye',
        text: 'Лёд | ????-??-??',
        reference: 'iceBtn',
        enableToggle: true,
        pressed: false,
        disabled: true,
        cls: 'segbtn',
        listeners: {
            toggle: 'onIceToggle'
        }
    }],
    listeners: {
        routeloader: 'setRouteLoader',
        loadgraph: 'loadGraph',
        calcplan: 'calcPlan',
        printplan: 'printPlan'
    },

    initComponent: function(){
        this.Task = new MaxiMary.nsr.TaskClass (this.taskData, this);

        this.mapId = 'map-' + newGuid();
        this.items = [{
            xtype: 'tabpanel',
            region: 'center',
            split: true,
            tabRotation: 0,
            tabPosition: 'left',
            ui: 'lightgray',
            items: [{
                xtype: 'panel',
                iconCls: 'x-fa fa-map',
                html: `<div id="${this.mapId}" style="height:100%"></div>`,
                listeners: {
                    afterrender: "onAfterRender"
                },
            },{
                xtype: 'vTaskScheduleGrid',
                iconCls: 'x-fa fa-calendar',
                reference: 'ScheduleGrid',
                Task: this.Task
            }]
        }];

        this.callParent(arguments);
    }

});
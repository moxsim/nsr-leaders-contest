/**
 * This class is the main view for the application. It is specified in app.js as the
 * "mainView" property. That setting automatically applies the "viewport"
 * plugin causing this view to become the body element (i.e., the viewport).
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('MaxiMary.view.main.Main', {
    extend: 'Ext.tab.Panel',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Ext.ux.TabReorderer',
        //'Ext.chart.*',
        'MaxiMary.view.main.rowexpander',

        'MaxiMary.view.main.MainController',
        'MaxiMary.view.main.MainModel',
        'MaxiMary.view.main.pFa',
        'MaxiMary.view.task.vTaskPanel',
    ],
    controller: 'main',
    viewModel: 'main',

    ui: 'navigation',

    tabBarHeaderPosition: 1,
    titleRotation: 0,
    tabRotation: 0,

    header: {
        layout: {
            align: 'stretchmax'
        },
        title: {
            bind: {
                text: '{name}'
            },
            flex: 0
        },
        iconCls: 'fa-ship'
    },

    tabBar: {
        flex: 1,
        layout: {
            align: 'stretch',
            overflowHandler: 'none'
        }
    },

    responsiveConfig: {
        tall: {
            headerPosition: 'top'
        },
        wide: {
            headerPosition: 'left'
        }
    },

    defaults: {
        layout: 'fit',
        tabConfig: {
            plugins: 'responsive',
            responsiveConfig: {
                wide: {
                    iconAlign: 'left',
                    textAlign: 'left'
                },
                tall: {
                    iconAlign: 'top',
                    textAlign: 'center',
                    width: 120
                }
            }
        }
    },

    items: [{
        title: 'Заявки',
        iconCls: 'fa-file-excel-o',
        items: [{
            xtype: 'vTaskPanel',
        }]
    }, {
        title: 'Описание',
        iconCls: 'fa-info-circle',
        bodyPadding: 20,
        bind: {
            html: '{description}'
        }
    }, {
        title: 'FA',
        hidden: true,
        iconCls: 'fa-cog',
        xtype: 'pFa'
    }]
});

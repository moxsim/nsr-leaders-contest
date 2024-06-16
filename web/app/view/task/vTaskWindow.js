Ext.define('MaxiMary.view.task.vTaskWindow', {
    extend: 'Ext.window.Window',
    alias: 'widget.vTaskWindow',
    iconCls: 'x-fa fa-book',
    layout: 'fit',
    width: 1000,
    height: 500,
    autoScroll: true,
    maximizable: true,
    autoDestroy: false,
    floatable: true,
    title: 'Отправка новой заявки на обработку',
    reference: 'TaskWindow',
    ui: 'light',
    modal: true,
    closable: true,

    items: [{
        xtype: 'panel',
        layout: 'border',
        items: [{
            region: 'center',
            bodyPadding: 10,
            dockedItems: [{
                xtype: 'form',
                bodyPadding: 10,
                reference: 'TaskFormWindow',
                url: 'api/front/xlsx_upload.php',
                items:[{
                    xtype: 'filefield',
                    width: '100%',
                    name: 'attachment',
                    buttonConfig: {
                        text: 'Выбор файла',
                    },
                    listeners: {
                        "change": "onAttachmentChange"
                    }
                }],
            }],
            items: [{
                xtype: 'displayfield',
                reference: 'AddTaskFeedback',
                tpl: new Ext.XTemplate(
                    '<tpl if="message">',
                        '<tpl if="success">',
                            '<div class="feedback-success">{message}</div>',
                        '<tpl else>',
                            '<div class="feedback-error">{message}</div>',
                        '</tpl>',                    
                    '<tpl else>',
                        //'<div class="feedback-error">Произошёл непредвиденный сбой!</div>',
                    '</tpl>',                    
                    )
            }]
        },{
            xtype: 'panel',
            region: 'east',
            width: 500,
            bodyPadding: 20,
            html: `
            <p><b>Требования к формату файла:</b></p>
            <ul>
                <li>Допускается прикрепление только одного файла за один раз</li>
                <li>Допускается прикрепление только файлов в формате XLSX</li>
                <li>Размер прикреплённого файла не должен превышать 5 МБ</li>
            </ul>
            <p><b>Требования к формату шапки первого листа с расписанием:</b></p>
            <ul>
                <li>A - Название судна</li>
                <li>B - Ледовый класс</li>
                <li>C - Скорость, узлы (по чистой воде)</li>
                <li>D - Пункт начала плавания</li>
                <li>E - Пункт окончания плавания</li>
                <li>F - Дата начала плавания</li>
            </ul>
            <p><b>Требования к формату шапки второго листа с ледоколами:</b></p>
            <ul>
                <li>A - Название судна</li>
                <li>B - Ледовый класс</li>
                <li>C - Скорость, узлы (по чистой воде)</li>
                <li>D - Пункт начала плавания</li>
                <li>E - Дата начала плавания</li>
            </ul>
            `,
            bodyStyle: 'background:#F2F2F2'
        }]
    }]

});
Ext.define('MaxiMary.view.task.cTaskPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.cTaskPanelController',
    
    onNewTaskWindow: function(){
        var AddTaskButton = this.lookup('AddTaskButton');

        Ext.widget('vTaskWindow',{
            ownerCt: this.getView(),
            animateTarget: AddTaskButton
        }).show();
    },
    onSubmitTask: function(){
        var me = this;
        var TaskFormWindow = this.lookup('TaskFormWindow');
        var AddTaskFeedback = this.lookup('AddTaskFeedback');
        var TaskWindow = this.lookup('TaskWindow');

        AddTaskFeedback.setValue({loading: true});
        TaskFormWindow.setLoading(true);
        TaskFormWindow.submit({
            success: function(form, action){
                console.log('success', action.result)
                TaskFormWindow.setLoading(false);
                AddTaskFeedback.setValue(action.result); // Оставляем обратную связь
                TaskWindow.close(); // Закрываем окно загрузки файла
                me.onTaskGridRefresh(); // обновляем грид с заявками

                const record = action.result.task_record;
                if (record){
                    me.openTaskId(record.task_id); // Открываем вновь созданный Task по Record
                } else if (action.result.task_id){
                    me.openTaskId(action.result.task_id); // Открываем вновь созданный Task по Id
                }
            },
            failure: function(form, action){
                console.log('failure', action.result);
                TaskFormWindow.setLoading(false);
                AddTaskFeedback.setValue(action.result);
            }
        });
    },
    onAttachmentChange: function(){
        this.onSubmitTask();
    },
    onTaskGridRefresh: function(){
        var TaskGrid = this.lookup('TaskGrid');
        Ext.showMsg('Обновление журнала заявок...', true, true);
        TaskGrid.store.load({
            callback: function(){
                Ext.showMsg('Обновление журнала выполнено', true);
            }
        });
    },
    onTaskDoubleClick: function( view, record, item, index, e, eOpts ) {
        this.openTaskId(record.data.task_id);
    },
    openTaskId: function(task_id){
        var me = this;
        Ext.Ajax.request({
            url: 'api/front/task_item.php?task_id='+task_id,
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                console.log('success ' , obj);
                if (obj.data) me.openTaskRecord(obj.data);
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },
    openTaskRecord: function(data){
        var TaskTabPanel = this.lookup('TaskTabPanel');
        var tab = TaskTabPanel.insert(1, Ext.widget('vTaskMapPanel',{
            title: `#${data.task_id} | ${data.filename} `,
            closable: true,
            iconCls: 'x-fa fa-calendar',
            taskData: data
        }));
        TaskTabPanel.setActiveItem(tab);
    },
    onCloseTasks: function(){
        var TaskTabPanel = this.lookup('TaskTabPanel');
        var tasks = TaskTabPanel.query('vTaskMapPanel');

        Ext.each(tasks, function(item){
            TaskTabPanel.remove(item);
        });
    }

});

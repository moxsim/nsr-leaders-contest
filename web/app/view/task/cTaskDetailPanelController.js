Ext.define('MaxiMary.view.task.cTaskDetailPanelController', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.cTaskDetailPanelController',
    
    onAfterRender: function(){
        var view = this.getView();
        var HeaderInfo = this.lookup('HeaderInfo');
        HeaderInfo.setValue(view.taskData);
        this.onChangeFilter();
    },

    onTaskValidationRefresh: function(){
        var ValidationGrid = this.lookup('ValidationGrid');
        ValidationGrid.store.load();
    },

    getFilterValues: function(){
        var FilterForm = this.lookup('FilterForm');
        var values = FilterForm.getForm().getValues();

        Ext.each(FilterForm.query('segmentedbutton'), function(item){
            values[item.name] = item.getValue(); 
        });

        return values;
    },
    onChangeFilter: function(){
        let ValidationGrid = this.lookup('ValidationGrid');
        let filterValues = this.getFilterValues();
        let store = ValidationGrid.store;
        var filters = store.getFilters();

        while (filters.items[0]){
            store.removeFilter(filters.items[0]);
        }

        Ext.Object.each(filterValues, function(key, val){
            if (key == 'sex'){
                if (val) {
                    let sexFilter = new Ext.util.Filter({
                        property: 'sex',
                        value: val
                    });
                    store.addFilter(sexFilter);
                }
            }
            if (key == 'post'){
                if (val != '') {
                    let postFilter = new Ext.util.Filter({
                        property: 'post',
                        value: val
                    });
                    store.addFilter(postFilter);
                }
            }
            if (key == 'is_in_standard'){
                if (val != -1) {
                    let standardFilter = new Ext.util.Filter({
                        property: 'is_in_standard',
                        value: !!val
                    });
                    store.addFilter(standardFilter);

                }
            }

            if (key == 'has_relation'){
                if (val != -1) {
                    let relFilter = new Ext.util.Filter({
                        property: 'has_relation',
                        value: !!val
                    });
                    store.addFilter(relFilter);
                }
            }

            if (key == 'status' && val){
                let statusFilter = new Ext.util.Filter({
                    filterFn: function(item) {
                        return !!item.data[val];
                    }
                });
                store.addFilter(statusFilter);
            } 

        });

    },

    onValidationItemSelect( view, record, index, eOpts ) {
        let CheckPanel = this.lookup('CheckPanel');
        let printBtn = this.lookup('printBtn');
        if (printBtn) printBtn.setVisible(true);

        CheckPanel.applyData(record.data);
    } ,

    onPrint: function(){
        var CheckPanel = this.lookup('CheckPanel');
        this.printHtml(CheckPanel.getPrintHtml());
    },
 
    printHtml: function(html){
        Ext.Ajax.request({
            url: 'api/front/task_item_print.php',
            method: 'POST',
            params: {
                html: html
            },
            success: function(response, opts) {
                var obj = Ext.decode(response.responseText);
                console.log('success ' , obj);
                if (obj.link) {
                    window.open(obj.link, '_blank');
                } else {
                    // window.open(obj.link, '_blank');
                }
            },
            failure: function(response, opts) {
                console.log('server-side failure with status code ' + response.status);
            }
        });
    },

    onStoreLoad: function(grid, store){
        this.setAbsructPieChart(store, this.lookup('PostPieChart'), 'post');
        this.setAbsructPieChart(store, this.lookup('SexPieChart'), 'sex');
        this.setAbsructPieChart(store, this.lookup('OverdoChart'), 'is_overdo',{'true': 'Есть проблема', 'false': 'Нет проблем'});
        this.setAbsructPieChart(store, this.lookup('UnderdonePieChart'), 'is_underdone',{'true': 'Есть проблема', 'false': 'Нет проблем'});
        this.setAbsructPieChart(store, this.lookup('StandardPieChart'), 'is_in_standard',{'true': 'Есть стандарт', 'false': 'Нет стандарта'});
    },

    setAbsructPieChart: function(store, chart, entity, names){
        if (!names) names = {};
        var obj = {};
        var arr = [];

        Ext.each(store.data.autoSource.items, function(item){
            if (!obj[item.data[entity]]){
                obj[item.data[entity]] = {name: item.data[entity], cnt: 1};
            } else {
                obj[item.data[entity]].cnt++;
            }
        });
        Ext.Object.each(obj, function(key, item){
            obj[key]['perc'] = Math.round(item.cnt * 10000 / store.data.autoSource.length) / 100;
            if (names[key]) obj[key]['name'] = names[key];
            arr.push(obj[key]);
        });

        chart.store.removeAll();
        chart.store.add(arr);
    },

    onSeriesTooltipRender: function(tooltip, record, item) {
        tooltip.setHtml(record.get('name') + ': ' + record.get('perc') + '%');
    },

    onPrintSelected: function(){
        console.log('onPrintSelected');
        let ValidationGrid = this.lookup('ValidationGrid');
        let store = ValidationGrid.store;
        let HeaderInfo = this.lookup('HeaderInfo').getValue();
        
        var vTaskCheckPanel = Ext.widget('vTaskCheckPanel');
        var content = {
            title: 'MaxiMary: #' + HeaderInfo.task_id + ' | ' + HeaderInfo.filename + ' - Выгрузка нескольких диагнозов',
            body: ''
        }
        var isFirst = true;
        store.each(function(item){
            if (isFirst) {
                isFirst = false;
            } else {
                content.body += '<br/><br/><hr/><br/>';
            }
            content.body += vTaskCheckPanel.getItemHtml(item.data);
        })

        let html = vTaskCheckPanel.getPrintHtml(content);
        this.printHtml(html);

    }

});

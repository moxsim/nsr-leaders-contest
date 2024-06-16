Ext.define('MaxiMary.view.main.rowexpander', {
    extend: 'Ext.grid.plugin.RowExpander',
    alias : 'plugin.rowexpander-my',

    getHeaderConfig: function() {
        var me = this;
  
        return {
            width: 33,
            lockable: false,
            sortable: false,
            resizable: false,
            draggable: false,
            hideable: false,
            menuDisabled: true,
            tdCls: Ext.baseCSSPrefix + 'grid-cell-special',
            innerCls: Ext.baseCSSPrefix + 'grid-cell-inner-row-expander',
            renderer: function(value, metadata, record) {
                if (!record.get('expandable')) return '';
                // Only has to span 2 rows if it is not in a lockable grid.
                if (!me.grid.ownerLockable) {
                    metadata.tdAttr += ' rowspan="2"';
                }
                return '<div class="' + Ext.baseCSSPrefix + 'grid-row-expander" role="presentation"></div>';
            },
            processEvent: function(type, view, cell, rowIndex, cellIndex, e, record) {
                if (type == "mousedown" && e.getTarget('.' + Ext.baseCSSPrefix + 'grid-row-expander')) {
                    me.toggleRow(rowIndex, record);
                    return me.selectRowOnExpand;
                }
            }
        };
    }  

});
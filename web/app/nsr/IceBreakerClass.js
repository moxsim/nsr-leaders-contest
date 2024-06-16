Ext.define('MaxiMary.nsr.IceBreakerClass', {
    extend: 'MaxiMary.nsr.ShipClass',
    requires: [
        'MaxiMary.nsr.ShipClass'
    ],

    constructor: function(data){

        this.callParent(arguments);

        this.speed_knot = 22; // Тут пока закостылено

    },  
});
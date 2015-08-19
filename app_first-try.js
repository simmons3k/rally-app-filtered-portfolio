Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Write app code here
		console.log ("Launching")
        Ext.create('Rally.data.wsapi.TreeStoreBuilder').build({
            models: ['portfolioitem/feature'],
            autoLoad: true,
            enableHierarchy: true
        }).then({
            success: this._onStoreBuilt,
            scope: this
        });

    },
	
    _onStoreBuilt: function(store) {
        this.add({
            xtype: 'rallytreegrid',
            store: store,
            context: this.getContext(),
            enableEditing: true,
            shouldShowRowActionsColumn: true,
            enableBulkEdit: true,
            enableRanking: false,
            columnCfgs: [
                'Name',
                'Owner',
                'PreliminaryEstimate',
                'State'
            ]
        });
    }
});

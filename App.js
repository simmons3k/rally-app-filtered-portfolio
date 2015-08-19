
// Portfolio Item Grid App that filters on owner or project
// BASED ON..
// Custom Rally App that displays Defects in a grid and filter by Iteration and/or Severity.
//
// Note: various console debugging messages intentionally kept in the code for learning purposes

Ext.define('CustomApp', {
    extend: 'Rally.app.App',      // The parent class manages the app 'lifecycle' and calls launch() when ready
    componentCls: 'app',          // CSS styles found in app.css

    items: [      // pre-define the general layout of the app; the skeleton (ie. header, content, footer)
      {
        xtype: 'container', // this container lets us control the layout of the pulldowns; they'll be added below
        itemId: 'pulldown-container',
        layout: {
                type: 'hbox',           // 'horizontal' layout
                align: 'stretch'
            }
      }
    ],
    portfolioStore: undefined,       // app level references to the store and grid for easy access in various methods
    portfolioGrid: undefined,

    // Entry Point to App
    launch: function() {
      var me = this;                     
      console.log('Launching');     // see console api: https://developers.google.com/chrome-developer-tools/docs/console-api
      me._loadOwners();
    },

    // create and load iteration pulldown 
    _loadOwners: function() {
        var me = this;

        var ownerComboBox = Ext.create('Rally.ui.combobox.UserSearchComboBox', {
          itemId: 'owner-combobox',     // we'll use this item ID later to get the users' selection
          fieldLabel: 'Owner',
          labelAlign: 'right',
          width: 300,
          listeners: {
            ready: me._loadProjects,      // initialization flow: next, load severities
            select: me._loadData,           // user interactivity: when they choose a value, (re)load the data
            scope: me
         }
        });

        this.down('#pulldown-container').add(ownerComboBox);  // add the iteration list to the pulldown container so it lays out horiz, not the app!
     },

    // create defect severity pulldown then load data
    _loadProjects: function() {
		console.log ("In _loadProject");
        var me = this;
        var projectPicker = Ext.create('Rally.ui.picker.project.ProjectPicker', {
          itemId: 'project-picker',
          fieldLabel: 'Project',
          labelAlign: 'right',
          listeners: {
            ready: me._loadData,        // initialization flow: when this is ready, we're done and can load all data
            select: me._loadData,       // user interactivity: when they choose a value, (re)load the data
			  scope: me                 // <--- don't for get to pass the 'app' level scope into the combo box so the async event functions can call app-level func's!
		  }

        });

        this.down('#pulldown-container').add(projectPicker); 
		console.log ("Finished _loadProjects")
     },

    // construct filters for defects with given iteration (ref) /severity values
    _getFilters: function(ownerValue, projectValue) {

      var ownerFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'Owner.Name',
              operation: '=',
              value: ownerValue
      });

      var projectFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'Project.Name',
              operation: '=',
              value: projectValue
      });

      return ownerFilter.and(projectFilter);

      // EXTRA EXAMPLE showing AND + OR combination; (commented code only)
      /*
      var blockedFilter = Ext.create('Rally.data.wsapi.Filter', {
              property: 'Blocked',
              operation: '=',
              value: true
      });
 
      var iterationSeverityFilter = iterationFilter.and(severityFilter);
      var myFilters = blockedFilter.or(iterationSeverityFilter);

      return myFilters;
      */ 

    },

    // Get data from Rally
    _loadData: function() {

      var me = this;

      // lookup what the user chose from each pulldown
      var selectedOwnerRef = this.down('#owner-combobox').getRecord().get('_ref');    
      var selectedProjectValue = this.down('#project-picker').getValue();   
      // filters to send to Rally during the store load
      var myFilters = this._getFilters(selectedOwnerRef, selectedProjectValue);
      console.log('my filter', myFilters.toString());

      // if store exists, just load new data
      if (me.portolioStore) {
        console.log('store exists');
        me.portolioStore.setFilter(myFilters);
        me.portolioStore.load();

      // create store
      } else {
        console.log('creating store');
        me.portfolioStore = Ext.create('Rally.data.wsapi.Store', {
          model: 'portfolioitem/feature',
          autoLoad: true,
          filters: myFilters,
          listeners: {
              load: function(myStore, myData, success) {
                  console.log('got data!', success, myStore, myData);
                  if (!me.portfolioGrid) {           // only create a grid if it does NOT already exist
                    me._createGrid(myStore);
                  }
              },
              scope: me                         // This tells the wsapi data store to forward pass along the app-level context into ALL listener functions
          },
          fetch: ['FormattedID', 'Name']  
        });
      }
    },

    // Create and Show a Grid of given defect
    _createGrid: function(myPortfolioStore) {
		var me = this;
		console.log('in _createGrid');
//		me.portfolioGrid = Ext.create('Rally.ui.grid.TreeGrid', {
		me.portfolioGrid = Ext.create('Rally.ui.grid.Grid', {    // Not working with TreeGrid so using Grid for now
			store: myPortfolioStore,
			columnCfgs: [         // Columns to display; must be the same names specified in the fetch: above in the wsapi data store
				'FormattedID', 'Name'
			]
		});

		console.log('ready to add');
		me.add(me.portfolioGrid);       // add the grid Component to the app-level Container (by doing this.add, it uses the app container)

	}

});
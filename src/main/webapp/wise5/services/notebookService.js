define(['configService'], function(configService) {
    
    var service = ['$http', '$q', '$rootScope', 'ConfigService',
        function($http, $q, $rootScope, ConfigService) {

        var serviceObject = {};

        // filtering options for notebook displays
        // TODO: make dynamic based on project settings
        serviceObject.filters = [
            {'name': 'all', 'label': 'All'},
            {'name': 'work', 'label': 'Work'},
            {'name': 'files', 'label': 'Files'},
            {'name': 'ideas', 'label': 'Ideas'} // TODO: Add when Idea Manager is active
        ];

        serviceObject.getFilters = function(){
            return this.filters;
        };
        
        serviceObject.notebook = {};
        serviceObject.notebook.items = [];
        serviceObject.notebook.deletedItems = [];
        
        serviceObject.addItem = function(notebookItem) {
          this.notebook.items.push(notebookItem);
          
          // the current node is about to change
          $rootScope.$broadcast('notebookChanged', {notebook: this.notebook});
        };
        
        serviceObject.deleteItem = function(itemToDelete) {
            var items = this.notebook.items;
            var deletedItems = this.notebook.deletedItems;
            for (var i = 0; i < items.length; i++) {
                var item = items[i];
                if (item === itemToDelete) {
                    items.splice(i,1);
                    deletedItems.push(itemToDelete);
                }
            }
        };
        
        return serviceObject;
    }];
    
    return service;
});
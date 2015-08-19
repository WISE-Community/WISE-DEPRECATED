define(['configService'], function(configService) {
    
    var service = ['$http', '$q', '$rootScope', 'ConfigService',
        function($http, $q, $rootScope, ConfigService) {

        var serviceObject = {};

        // filtering options for noteBook displays
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
        
        serviceObject.noteBook = {};
        serviceObject.noteBook.items = [];
        serviceObject.noteBook.deletedItems = [];
        
        serviceObject.addItem = function(noteBookItem) {
          this.noteBook.items.push(noteBookItem);
          
          // the current node is about to change
          $rootScope.$broadcast('noteBookChanged', {noteBook: this.noteBook});
        };
        
        serviceObject.deleteItem = function(itemToDelete) {
            var items = this.noteBook.items;
            var deletedItems = this.noteBook.deletedItems;
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
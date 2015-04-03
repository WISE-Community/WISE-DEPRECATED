define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, 
                $rootScope,
                $state, 
                $stateParams, 
                NodeApplicationService, 
                NodeService, 
                ProjectService, 
                StudentDataService) {
            
            this.loadNode = function(node, mode) {
                if (node != null) {
                    var nodeType = ProjectService.getNodeTypeByNode(node);
                    if (nodeType != null) {
                        this.nodeType = nodeType;
                    }
                    
                    if (this.nodeType === 'OpenResponse') {
                        this.nodeHTMLPath = 'vle5/nodes/openResponse/index.html';
                    } else if (this.nodeType === 'HTML') {
                        this.nodeHTMLPath = 'vle5/nodes/html/index.html';
                    } else if (this.nodeType === 'Planning') {
                        this.nodeHTMLPath = 'vle5/nodes/planning/index.html';
                    }
                }
            };
            
            this.nodeLoaded = function(nodeId) {
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
            };
            
            this.nodeUnloaded = function(nodeId) {
                StudentDataService.endNodeVisitByNodeId(nodeId);
            };
            
            this.setCurrentNodeByNodeId = function(nodeId) {
                var node = ProjectService.getNodeById(nodeId);
                StudentDataService.setCurrentNode(node);
            };
            
            this.closeNode = function() {
                var currentNode = StudentDataService.getCurrentNode();
                if (currentNode != null) {
                    var currentNodeId = currentNode.id;
                    var parentNode = ProjectService.getParentGroup(currentNodeId);
                    StudentDataService.setCurrentNode(parentNode);
                }
            };
            
            var node = StudentDataService.getCurrentNode();
            var mode = $scope.vleController.mode;
            this.loadNode(node, mode);
        });
});
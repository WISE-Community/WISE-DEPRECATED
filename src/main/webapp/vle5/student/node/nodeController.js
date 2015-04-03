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
        console.log('nodeController, stateParams.nodeId=' + $stateParams.nodeId);
            //this.nodeId = null;
            //this.nodeType = null;
            //this.nodeContent = null;

            /*
            $scope.$on('currentNodeChanged', angular.bind(this, function() {
                var node = StudentDataService.getCurrentNode();
                var mode = $scope.vleController.mode;
                this.loadNode(node, mode);
            }));
            */
            
            this.loadNode = function(node, mode) {
                console.log('loadNode: '+ JSON.stringify(node, null, 4));
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
                
                //var nodeVisits = StudentDataService.getNodeVisits();
                //console.log("nodeVisits=" + JSON.stringify(nodeVisits, null, 4));
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
define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, 
                $rootScope,
                $state, 
                $stateParams, 
                NodeService, 
                PortfolioService,
                ProjectService, 
                StudentDataService) {
            
            this.loadNode = function(node, mode) {
                if (node != null) {
                    var nodeType = ProjectService.getNodeTypeByNode(node);
                    if (nodeType != null) {
                        this.nodeType = nodeType;
                    }
                    
                    if (this.nodeType === 'OpenResponse') {
                        this.nodeHTMLPath = 'wise5/nodes/openResponse/index.html';
                    } else if (this.nodeType === 'HTML') {
                        this.nodeHTMLPath = 'wise5/nodes/html/index.html';
                    } else if (this.nodeType === 'Planning') {
                        this.nodeHTMLPath = 'wise5/nodes/planning/index.html';
                    } else if (this.nodeType === 'MultipleChoice') {
                        this.nodeHTMLPath = 'wise5/nodes/multipleChoice/index.html';
                    }
                }
            };
            
            this.nodeLoaded = function(nodeId) {
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
            };
            
            this.nodeUnloaded = function(nodeId) {
            };
            
            this.setCurrentNodeByNodeId = function(nodeId) {
                var node = ProjectService.getNodeById(nodeId);
                StudentDataService.setCurrentNode(node);
            };
            
            this.addNodeVisitItemToPortfolio = function() {
                var currentNode = StudentDataService.getCurrentNode();
                if (currentNode != null) {
                    var currentNodeId = currentNode.id;
                    var currentNodeVisit = StudentDataService.getLatestNodeVisitByNodeId(currentNodeId)
                    if (currentNodeVisit != null) {
                        var portfolioItem = {};
                        portfolioItem.type = 'nodeVisit';
                        portfolioItem.nodeId = currentNode.id;
                        portfolioItem.nodeVisitId = currentNodeVisit.id;
                        portfolioItem.nodeVisit = currentNodeVisit;
                        PortfolioService.addItem(portfolioItem);
                    }
                }
            };
            
            this.closeNode = function() {
                var currentNode = StudentDataService.getCurrentNode();
                if (currentNode != null) {
                    var currentNodeId = currentNode.id;
                    var parentNode = ProjectService.getParentGroup(currentNodeId);
                    StudentDataService.setCurrentNode(parentNode);
                }
            };
            
            this.buttonClicked = function(nodeNumber) {
                
                var nodeId = null;
                
                if (nodeNumber === '1.1') {
                    nodeId = 'node1';
                } else if (nodeNumber === '1.4') {
                    nodeId = 'node4';
                }
                
                if (nodeId != null) {
                    StudentDataService.setCurrentNodeByNodeId(nodeId);
                }
            };
            
            var node = StudentDataService.getCurrentNode();
            var mode = $scope.vleController.mode;
            this.loadNode(node, mode);
        });
});
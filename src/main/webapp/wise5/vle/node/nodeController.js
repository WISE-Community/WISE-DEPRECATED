define(['app'], function(app) {
    app.$controllerProvider.register('NodeController', 
        function($scope, 
                $rootScope,
                $state, 
                $stateParams, 
                CurrentNodeService, 
                NodeService, 
                PortfolioService,
                ProjectService, 
                StudentDataService) {
            
            // the auto save interval in milliseconds
            this.autoSaveInterval = 10000;
            
            /**
             * Set the html path to load the appropriate node type html 
             * when we load a node
             * @param node the node to load
             * @param mode
             */
            this.loadNode = function(node, mode) {
                if (node != null) {
                    
                    // get the node type for the node
                    var nodeType = ProjectService.getNodeTypeByNode(node);
                    if (nodeType != null) {
                        this.nodeType = nodeType;
                    }
                    
                    if (nodeType != 'group') {
                        
                        if (this.isStringUpperCase(nodeType)) {
                            // the node type is all uppercase e.g. HTML
                            
                            // get the node type in lower case e.g. html
                            var nodeTypeLowerCased = nodeType.toLowerCase();
                            
                            // set the node html path e.g. wise5/nodes/html/index.html
                            this.nodeHTMLPath = 'wise5/nodes/' + nodeTypeLowerCased + '/index.html';
                        } else {
                            /*
                             * the node type is not all uppercase so it is 
                             * likely to be camel or pascal cased
                             * e.g.
                             * openResponse
                             * or
                             * OpenResponse
                             */
                            
                            // get the node type in camel case e.g. openResponse
                            var nodeTypeCamelCased = this.toCamelCase(nodeType);
                            
                            if (nodeTypeCamelCased != null) {
                                // set the node html path e.g. wise5/nodes/openResponse/index.html
                                this.nodeHTMLPath = 'wise5/nodes/' + nodeTypeCamelCased + '/index.html';
                            }
                        }
                    }
                }
            };
            
            /**
             * Get the node type in camel case
             * @param nodeType the node type e.g. OpenResponse
             * @return the node type in camel case
             * e.g.
             * openResponse
             */
            this.toCamelCase = function(nodeType) {
                var nodeTypeCamelCased = null;
                
                if (nodeType != null && nodeType.length > 0) {
                    
                    // get the first character
                    var firstChar = nodeType.charAt(0);
                    
                    if(firstChar != null) {
                        
                        // make the first character lower case
                        var firstCharLowerCase = firstChar.toLowerCase();
                        
                        if (firstCharLowerCase != null) {
                            
                            /*
                             * replace the first character with the lower case 
                             * character
                             */
                            nodeTypeCamelCased = firstCharLowerCase + nodeType.substr(1);
                        }
                    }
                }
                
                return nodeTypeCamelCased;
            };
            
            /**
             * Check if the string is in all uppercase
             * @param str the string to check
             * @return whether the string is in all uppercase
             */
            this.isStringUpperCase = function(str) {
                var result = false;
                
                if (str != null) {
                    if (str === str.toUpperCase()) {
                        // the string is in all uppercase
                        result = true;
                    }
                }
                
                return result;
            };
            
            this.nodeLoaded = function(nodeId) {
                var newNodeVisit = StudentDataService.createNodeVisit(nodeId);
            };
            
            this.nodeUnloaded = function(nodeId) {
                StudentDataService.endNodeVisitByNodeId(nodeId);
                
                // TODO: check if we need to save node visit
                this.saveNodeVisitToServer(nodeId);
            };
            
            this.setCurrentNodeByNodeId = function(nodeId) {
                var node = ProjectService.getNodeById(nodeId);
                CurrentNodeService.setCurrentNode(node);
            };
            
            this.addNodeVisitItemToPortfolio = function() {
                var currentNode = CurrentNodeService.getCurrentNode();
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
                var currentNode = CurrentNodeService.getCurrentNode();
                if (currentNode != null) {
                    var currentNodeId = currentNode.id;
                    var parentNode = ProjectService.getParentGroup(currentNodeId);
                    CurrentNodeService.setCurrentNode(parentNode);
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
                    CurrentNodeService.setCurrentNodeByNodeId(nodeId);
                }
            };
            
            this.save = function(nodeId) {
                var nodeVisit = StudentDataService.getLatestNodeVisitByNodeId(nodeId);
                return StudentDataService.saveNodeVisitToServer(nodeVisit);
            };
            
            this.addNodeStateToLatestNodeVisit = function(nodeId, nodeState) {
                StudentDataService.addNodeStateToLatestNodeVisit(nodeId, nodeState);
            };
            
            this.saveNodeVisitToServer = function(nodeId) {
                var nodeVisit = StudentDataService.getLatestNodeVisitByNodeId(nodeId);
                
                return StudentDataService.saveNodeVisitToServer(nodeVisit);
            };
            
            var node = CurrentNodeService.getCurrentNode();
            var mode = $scope.vleController.mode;
            this.loadNode(node, mode);
        });
});
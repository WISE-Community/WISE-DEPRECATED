define(['angular', 'configService'], function(angular, configService) {

    angular.module('ProjectService', [])

    .service('ProjectService', ['$http', 'ConfigService', function($http, ConfigService) {
        this.project = null;
        this.applicationNodes = [];
        this.groupNodes = [];
        this.idToNode = {};
        
        this.getProject = function() {
            return this.project;
        };
        
        this.setProject = function(project) {
            this.project = project;
            this.parseProject();
        };
        
        this.getNodes = function() {
            var nodes = null;
            var project = this.project;
            
            if (project != null) {
                nodes = project.nodes;
            }
            
            return nodes;
        };
        
        this.isNode = function(id) {
            var result = false;
            var nodes = this.getNodes();
            
            if (nodes != null) {
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    if (node != null) {
                        var nodeId = node.id;
                        
                        if (nodeId === id) {
                            result = true;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        this.addApplicationNode = function(node) {
            
            var applicationNodes = this.applicationNodes;
            
            if (node != null && applicationNodes != null) {
                applicationNodes.push(node);
            }
        };
        
        this.addGroupNode = function(node) {
            
            var groupNodes = this.groupNodes;
            
            if (node != null && groupNodes != null) {
                groupNodes.push(node);
            }
        };
        
        this.isGroup = function(id) {
            var result = false;
            
            var group = this.getNodeById(id);
            
            if (group != null) {
                var type = group.type;
                
                if (type === 'group') {
                    result = true;
                }
            }
            
            return result;
        };
        
        this.getGroups = function() {
            return this.groupNodes;
        };
        
        this.parseProject = function() {
            var project = this.project;
            if (project != null) {
                var nodes = project.nodes;
                
                if (nodes != null) {
                    for (var n = 0 ; n < nodes.length; n++) {
                        var node = nodes[n];
                        
                        if (node != null) {
                            var nodeId = node.id;
                            var nodeType = node.type;
                            
                            this.setIdToNode(nodeId, node);
                            
                            if (nodeType === 'application') {
                                this.addApplicationNode(node);
                            } else if (nodeType === 'group') {
                                this.addGroupNode(node);
                            }
                        }
                    }
                }
            }
        };
        
        this.setIdToNode = function(id, element) {
            if (id != null) {
                this.idToNode[id] = element;
            }
        };
        
        this.getNodeById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToNode[id];
            }
            
            return element;
        };
        
        this.getProjectStartId = function() {
            var projectStartId = null;
            var project = this.getProject();
            
            if (project != null) {
                var startId = project.startId;
                
                if (startId != null) {
                    projectStartId = startId;
                }
            }
            
            return projectStartId;
        };
        
        this.isNodeDescendentOfGroup = function(node, group) {
            var result = false;
            
            if (node != null && group != null) {
                var descendents = this.getDescendentsOfGroup(group);
                var nodeId = node.id;
                
                if (descendents.indexOf(nodeId) != -1) {
                    result = true;
                }
            }
            
            return result;
        };
        
        this.getDescendentsOfGroup = function(group) {
            var descendents = [];
            
            if (group != null) {
                var childIds = group.ids;
                
                if (childIds != null) {
                    descendents = childIds;
                    
                    for (var c = 0; c < childIds.length; c++) {
                        var childId = childIds[c];
                        
                        var node = this.getNodeById(childId);
                        
                        if (node != null) {
                            var childDescendents = this.getDescendentsOfGroup(node);
                            
                            descendents = descendents.concat(childDescendents);
                        }
                    }
                }
            }
            
            return descendents;
        };
        
        this.isStartNode = function(node) {
            var result = false;
            
            if (node != null) {
                var nodeId = node.id;
                
                var projectStartId = this.getProjectStartId();
                
                if (nodeId === projectStartId) {
                    result = true;
                }
                
                var groups = this.getGroups();
                
                for (var g = 0; g < groups.length; g++) {
                    var group = groups[g];
                    
                    if (group != null) {
                        var groupStartId = group.startId;
                        
                        if (nodeId === groupStartId) {
                            result = true;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        this.getStartNodeId = function() {
            var startNodeId = null;
            var project = this.getProject();
            if (project != null) {
                startNodeId = project.startNodeId;
            }
            return startNodeId;
        };
        
        this.getConstraints = function() {
            var constraints = null;
            var project = this.getProject();
            
            if (project != null) {
                constraints = project.constraints;
            }
            
            return constraints;
        };
        
        this.getConstraintsForNode = function(node) {
            var constraints = [];
            
            var allConstraints = this.getConstraints();
            
            for (var c = 0; c < allConstraints.length; c++) {
                var constraint = allConstraints[c];
                
                if (this.isNodeAffectedByConstraint(node, constraint)) {
                    constraints.push(constraint);
                }
            }
            
            return constraints;
        };
        
        this.isNodeAffectedByConstraint = function(node, constraint) {
            var result = false;
            
            if (node != null && constraint != null) {
                var nodeId = node.id;
                var targetId = constraint.targetId;
                
                var targetNode = this.getNodeById(targetId);
                
                if (targetNode != null) {
                    var nodeType = targetNode.type;
                    
                    if (nodeType === 'application') {
                        // the target is an application
                        
                        if (nodeId === targetId) {
                            result = true;
                        }
                    } else if (nodeType === 'group') {
                        // the target is a group
                        
                        if (this.isNodeDescendentOfGroup(node, targetNode)) {
                            result = true;
                        }
                    }
                }
            }
            
            return result;
        };
        
        this.getNavigationMode = function() {
            var navigationMode = null;
            var project = this.getProject();
            if (project != null) {
                navigationMode = project.navigationMode; 
            }
            return navigationMode;
        };
        
        this.getNavigationApplications = function() {
            var navigationApplications = null;
            var project = this.getProject();
            if (project != null) {
                navigationApplications = project.navigationApplications;
            }
            return navigationApplications;
        };
        
        this.getTransitions = function() {
            var transitions = null;
            var project = this.getProject();
            if (project != null) {
                transitions = project.transitions;
            }
            return transitions;
        };

        this.getTransitionsByFromNodeId = function(fromNodeId) {
            var transitionsResults = [];
            if (fromNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.from === fromNodeId) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };
        
        this.getTransitionsByToNodeId = function(toNodeId) {
            var transitionsResults = [];
            if (toNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.to === toNodeId) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };
        
        this.getTransitionsByFromAndToNodeId = function(fromNodeId, toNodeId) {
            var transitionsResults = [];
            if (toNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.from === fromNodeId && transition.to === toNodeId) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };

        this.getLayoutLogic = function() {
            var layoutLogic = null;
            var project = this.getProject();
            if (project != null) {
                layoutLogic = project.layoutLogic;
            }
            return layoutLogic;
        };
        
        this.retrieveProject = function() {
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.setProject(projectJSON);
                return projectJSON;
            }));
        };
        
        this.getNodeSrcByNodeId = function(nodeId) {
            var nodeSrc = null;
            
            var node = this.getNodeById(nodeId);
            
            if (node != null) {
                nodeSrc = node.src;
            }
            
            if(nodeSrc != null) {
                var projectBaseURL = ConfigService.getConfigParam('projectBaseURL');
                nodeSrc = projectBaseURL + nodeSrc;
            }
            
            return nodeSrc;
        };
        
        this.getNodeTitleFromNodeId = function(nodeId) {
            var title = null;
            
            var node = this.getNodeById(nodeId);
            
            if (node != null) {
                title = node.title;
            }
            
            return title;
        };
    }]);
    
});
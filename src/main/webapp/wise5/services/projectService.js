define(['configService'], function(configService) {

    var service = ['$http', '$rootScope', 'ConfigService', function($http, $rootScope, ConfigService) {
        var serviceObject = {};
        
        serviceObject.project = null;
        serviceObject.transitions = [];
        serviceObject.applicationNodes = [];
        serviceObject.groupNodes = [];
        serviceObject.idToNode = {};
        serviceObject.idToElement = {};
        
        serviceObject.getProject = function() {
            return this.project;
        };
        
        serviceObject.setProject = function(project) {
            this.project = project;
            this.parseProject();
        };
        
        serviceObject.getProjectStyle = function() {
            var style = '';
            var project = this.project;
            if (project != null) {
                style = project.style;
            }
            return style;
        };
        
        serviceObject.getNodes = function() {
            var nodes = null;
            var project = this.project;
            
            if (project != null) {
                nodes = project.nodes;
            }
            
            return nodes;
        };
        
        serviceObject.getApplicationNodes = function() {
            return this.applicationNodes;
        };
        
        serviceObject.getGroupNodes = function() {
            return this.groupNodes;
        };
        
        serviceObject.getIdToNode = function() {
            return this.idToNode;
        };
        
        serviceObject.isNode = function(id) {
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
        
        // adds or update transition if exists
        serviceObject.addTransition = function(transition) {
        
            var existingTransitions = this.getTransitions();
            var replaced = false;
            for (var t = 0; t < existingTransitions.length; t++) {
                var existingTransition = existingTransitions[t];
                if (existingTransition.id === transition.id) {
                    existingTransitions.splice(t, 1, transition);
                    replaced = true;
                }
            }
            if (!replaced) {
                existingTransitions.push(transition);
            }
        };
        
        serviceObject.addNode = function(node) {
            var existingNodes = this.project.nodes;
            
            var replaced = false;
            if (node != null && existingNodes != null) {
                for (var n = 0; n < existingNodes.length; n++) {
                    var existingNode = existingNodes[n];
                    var existingNodeId = existingNode.id;
                    if (existingNodeId === node.id) {
                        existingNodes.splice(n, 1, node);
                        replaced = true;
                    }
                }
            }
            if (!replaced) {
                existingNodes.push(node);
            }
        };
        
        serviceObject.addApplicationNode = function(node) {
            
            var applicationNodes = this.applicationNodes;
            
            if (node != null && applicationNodes != null) {
                applicationNodes.push(node);
            }
        };
        
        serviceObject.addGroupNode = function(node) {
            
            var groupNodes = this.groupNodes;
            
            if (node != null && groupNodes != null) {
                groupNodes.push(node);
            }
            
            $rootScope.$broadcast('groupsChanged');
        };
        
        serviceObject.addNodeToGroupNode = function(groupId, nodeId) {
            if (groupId != null && nodeId != null) {
                var group = this.getNodeById(groupId);
                if (group != null) {
                    var groupChildNodeIds = group.ids;
                    if (groupChildNodeIds != null) {
                        if (groupChildNodeIds.indexOf(nodeId) === -1) {
                            groupChildNodeIds.push(nodeId);
                        }
                    }
                }
            }
        };
        
        serviceObject.isGroupNode = function(id) {
            var result = false;
            
            var groupNode = this.getNodeById(id);
            
            if (groupNode != null) {
                var type = groupNode.type;
                
                if (type === 'group') {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.isApplicationNode = function(id) {
            var result = false;
            
            var applicationNode = this.getNodeById(id);
            
            if (applicationNode != null) {
                var type = applicationNode.type;
                
                if (type !== 'group') {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.getGroups = function() {
            return this.groupNodes;
        };
        
        serviceObject.loadNodes = function(nodes) {
            if (nodes != null) {
                for (var n = 0 ; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    if (node != null) {
                        var nodeId = node.id;
                        var nodeType = node.type;
                        
                        this.setIdToNode(nodeId, node);
                        this.setIdToElement(nodeId, node);
                        
                        this.addNode(node);

                        if (nodeType === 'group') {
                            this.addGroupNode(node);
                        } else {
                            this.addApplicationNode(node);
                        }
                        
                        var groupId = node.groupId;
                        
                        if (groupId != null) {
                            this.addNodeToGroupNode(groupId, nodeId);
                        }
                    }
                }
            }
        };
        
        serviceObject.loadTransitions = function(transitions) {
            if (transitions != null) {
                for (var t = 0; t < transitions.length; t++) {
                    var transition = transitions[t];
                    
                    if (transition != null) {
                        var transitionId = transition.id;
                        
                        this.setIdToElement(transitionId, transition);
                        
                        this.addTransition(transition);
                    }
                }
            }
        };
        
        serviceObject.parseProject = function() {
            var project = this.project;
            if (project != null) {
                var nodes = project.nodes;
                this.loadNodes(nodes);
                
                var transitions = project.transitions;
                this.loadTransitions(transitions);
                
                var constraints = project.constraints;
                
                if (constraints != null) {
                    for (var c = 0; c < constraints.length; c++) {
                        var constraint = constraints[c];
                        
                        if (constraint != null) {
                            var constraintId = constraint.id;
                            
                            this.setIdToElement(constraintId, constraint);
                        }
                    }
                }
            }
        };
        
        serviceObject.setIdToNode = function(id, element) {
            if (id != null) {
                this.idToNode[id] = element;
            }
        };
        
        serviceObject.setIdToElement = function(id, element) {
            if (id != null) {
                this.idToElement[id] = element;
            }
        };
        
        serviceObject.getElementById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        }
        
        serviceObject.getNodeById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToNode[id];
            }
            
            return element;
        };
        
        serviceObject.getTransitionById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        };
        
        serviceObject.getConstraintById = function(id) {
            var element = null;
            
            if (id != null) {
                element = this.idToElement[id];
            }
            
            return element;
        };
        
        serviceObject.getParentGroup = function(nodeId) {
            var result = null;
            
            if (nodeId != null) {
                var node = this.getNodeById(nodeId);
                
                if (node != null) {
                    var groupNodes = this.getGroupNodes();
                    
                    for (var g = 0; g < groupNodes.length; g++) {
                        var groupNode = groupNodes[g];
                        
                        if (this.isNodeDirectChildOfGroup(node, groupNode)) {
                            result = groupNode;
                            break;
                        }
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getRootNode = function(nodeId) {
            var result = null;
            
            var parentGroup = this.getParentGroup(nodeId);
            
            if (parentGroup == null) {
                result = this.getNodeById(nodeId);
            } else {
                result = this.getRootNode(parentGroup.id);
            }
            
            return result;
        };
        
        serviceObject.isNodeDirectChildOfGroup = function(node, group) {
            var result = false;
            
            if (node != null && group != null) {
                var nodeId = node.id;
                var groupIds = group.ids;
                
                if (groupIds != null && groupIds.indexOf(nodeId) != -1) {
                    result = true;
                }
            }
            
            return result;
        };
        
        serviceObject.isNodeDescendentOfGroup = function(node, group) {
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
        
        serviceObject.getDescendentsOfGroup = function(group) {
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
        
        serviceObject.isStartNode = function(node) {
            var result = false;
            
            if (node != null) {
                var nodeId = node.id;
                
                var projectStartId = this.getStartNodeId();
                
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
        
        serviceObject.getStartNodeId = function() {
            var startNodeId = null;
            var project = this.getProject();
            if (project != null) {
                startNodeId = project.startNodeId;
            }
            return startNodeId;
        };
        
        serviceObject.getConstraints = function() {
            var constraints = null;
            var project = this.getProject();
            
            if (project != null) {
                constraints = project.constraints;
            }
            
            return constraints;
        };
        
        serviceObject.getConstraintsForNode = function(node) {
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
        
        serviceObject.isNodeAffectedByConstraint = function(node, constraint) {
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
                
                var targetTransition = this.getTransitionById(targetId);
                
                if (targetTransition != null) {
                    var from = targetTransition.from;
                    var to = targetTransition.to;
                    
                    if (nodeId === to) {
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        serviceObject.getNavigationMode = function() {
            var navigationMode = null;
            var project = this.getProject();
            if (project != null) {
                navigationMode = project.navigationMode; 
            }
            return navigationMode;
        };
        
        serviceObject.getNavigationApplications = function() {
            var navigationApplications = null;
            var project = this.getProject();
            if (project != null) {
                navigationApplications = project.navigationApplications;
            }
            return navigationApplications;
        };
        
        serviceObject.getTransitions = function() {
            var transitions = null;
            var project = this.getProject();
            if (project != null) {
                transitions = project.transitions;
            }
            return transitions;
        };
        
        serviceObject.getTransitionsByGroupId = function(groupId) {
            var transitionsInGroup = [];
            
            if (groupId != null) {
                var group = this.getNodeById(groupId);
                
                if (group != null) {
                    var childIds = group.ids;
                    
                    if (childIds != null) {
                        var allTransitions = this.getTransitions();
                        
                        // loop through all the transitions
                        
                        for (var t = 0; t < allTransitions.length; t++) {
                            var tempTransition = allTransitions[t];
                            
                            if (tempTransition != null) {
                                var from = tempTransition.from;
                                var to = tempTransition.to;
                                
                                if (childIds.indexOf(from) != -1 || childIds.indexOf(to) != -1) {
                                    transitionsInGroup.push(tempTransition);
                                }
                            }
                        }
                    }
                }
            }
            var project = this.getProject();
            if (project != null) {
                
                
                transitions = project.transitions;
            }
            return transitionsInGroup;
        };
        
        serviceObject.getTransitionsByFromNodeId = function(fromNodeId) {
            var transitionsResults = [];
            if (fromNodeId != null) {
                var transitions = this.getTransitions();
                
                if (transitions != null) {
                    for (var i = 0; i < transitions.length; i++) {
                        var transition = transitions[i];
                        if (transition.from === fromNodeId && !transition.disabled) {
                            transitionsResults.push(transition);
                        }
                    }
                }                
            }
            
            return transitionsResults;
        };
        
        serviceObject.getTransitionsByToNodeId = function(toNodeId) {
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
        
        serviceObject.getTransitionsByFromAndToNodeId = function(fromNodeId, toNodeId) {
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

        serviceObject.getLayoutLogic = function() {
            var layoutLogic = null;
            var project = this.getProject();
            if (project != null) {
                layoutLogic = project.layoutLogic;
            }
            return layoutLogic;
        };
        
        serviceObject.retrieveProject = function() {
            var projectFileUrl = ConfigService.getConfigParam('projectURL');
            
            return $http.get(projectFileUrl).then(angular.bind(this, function(result) {
                var projectJSON = result.data;
                this.setProject(projectJSON);
                return projectJSON;
            }));
        };
        
        serviceObject.getNodeTypeByNode = function(node) {
            var nodeType = null;
            
            if (node != null) {
                nodeType = node.type;
            }
            
            return nodeType;
        };
        
        serviceObject.getApplicationTypeByNode = function(node) {
            var applicationType = null;
            
            if (node != null) {
                applicationType = node.applicationType;
            }
            
            return applicationType;
        };
        
        serviceObject.getNodeSrcByNodeId = function(nodeId) {
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
        
        serviceObject.getNodeTitleFromNodeId = function(nodeId) {
            var title = null;
            
            var node = this.getNodeById(nodeId);
            
            if (node != null) {
                title = node.title;
            }
            
            return title;
        };
        
        serviceObject.getStudentIsOnGroupNodeClass = function() {
            var studentIsOnGroupNodeClass = null;
            var project = this.getProject();
            
            if (project != null) {
                var layout = project.layout
                
                if (layout != null) {
                    studentIsOnGroupNodeClass = layout.studentIsOnGroupNode;
                }
            }
            
            return studentIsOnGroupNodeClass;
        };
        
        serviceObject.getStudentIsOnApplicationNodeClass = function() {
            var studentIsOnApplicationNodeClass = null;
            var project = this.getProject();
            
            if (project != null) {
                var layout = project.layout
                
                if (layout != null) {
                    studentIsOnApplicationNodeClass = layout.studentIsOnApplicationNode;
                }
            }
            
            return studentIsOnApplicationNodeClass;
        };
        
        return serviceObject;
    }];
    
    return service;
});
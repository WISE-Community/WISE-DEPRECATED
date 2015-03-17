define(['angular', 'configService'], function(angular, configService) {

    angular.module('ProjectService', [])

    .service('ProjectService', ['$http', 'ConfigService', function($http, ConfigService) {
        this.project = null;
        
        this.getProject = function() {
            return this.project;
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
        
        this.getGroups = function() {
            var groups = null;
            var project = this.getProject();
            
            if (project != null) {
                groups = project.groups;
            }
            
            return groups;
        };
        
        this.getGroupById = function(id) {
            var group = null;
            var project = this.getProject();
            
            if (project != null) {
                var groups = project.groups;
                
                for (var g = 0; g < groups.length; g++) {
                    var tempGroup = groups[g];
                    
                    if (tempGroup != null) {
                        var tempGroupId = tempGroup.id;
                        
                        if (tempGroupId == id) {
                            group = tempGroup;
                            break;
                        }
                    }
                }
            }
            
            
            return group;
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
            var descendents = null;
            
            if (group != null) {
                var childIds = group.ids;
                
                descendents = childIds;
                
                for (var c = 0; c < childIds.length; c++) {
                    var childId = childIds[c];
                    
                    var group = this.getGroupById(childId);
                    
                    if (group != null) {
                        var childDescendents = this.getDescendentsOfGroup(group);
                        
                        descendents = descendents.concat(childDescendents);
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
                    // the target is a node
                    
                    if (nodeId === targetId) {
                        result = true;
                    }
                } else {
                    // the target is a group
                    var targetGroup = this.getGroupById(targetId);
                    
                    if (targetGroup != null) {
                        
                        if (this.isNodeDescendentOfGroup(node, targetGroup)) {
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
                this.project = projectJSON;
                return projectJSON;
            }));
        };

        this.getNodeById = function(nodeId) {
            var project = this.project;
            
            if(project !== null) {
                var nodes = project.nodes;
                
                if(nodes !== null) {
                    for(var x = 0; x < nodes.length; x++) {
                        var node = nodes[x];
                        
                        if(node !== null) {
                            var tempNodeId = node.id;
                            
                            if(nodeId === tempNodeId) {
                                return node;
                            }
                        }
                    }
                }
            }
            
            return null;
        };
        
        this.getNodeSrcByNodeId = function(nodeId) {
            var nodeSrc = null;
            var project = this.project;
            
            if(project !== null) {
                var nodes = project.nodes;
                
                if(nodes !== null) {
                    for(var x = 0; x < nodes.length; x++) {
                        var node = nodes[x];
                        
                        if(node !== null) {
                            var tempNodeId = node.id;
                            
                            if(nodeId === tempNodeId) {
                                nodeSrc = node.src;
                                break;
                            }
                        }
                    }
                }
            }
            
            if(nodeSrc != null) {
                var projectBaseURL = ConfigService.getConfigParam('projectBaseURL');
                nodeSrc = projectBaseURL + nodeSrc;
            }
            
            return nodeSrc;
        };
        
        this.getNodeTitleFromNodeId = function(nodeId) {
            var title = null;
            
            //see if the node id is for a step and get the title if it is
            title = this.getStepTitleFromNodeId(nodeId);
            
            if(title === null) {
                /*
                 * we couldn't find a step with the node id so we will now
                 * search the sequences
                 */
                title = this.getSequenceTitleFromNodeId(nodeId);
            }
            
            return title;
        };
        
        this.getProjectNodes = function() {
            return this.project.nodes;
        };
        
        this.getNodeTypeByNodeId = function(nodeId) {
            var nodeType = null;
            var project = this.project;
            
            if(project !== null) {
                var nodes = project.nodes;
                
                if(nodes !== null) {
                    for(var x = 0; x < nodes.length; x++) {
                        var node = nodes[x];
                        
                        if(node !== null) {
                            var tempNodeId = node.id;
                            
                            if(nodeId === tempNodeId) {
                                nodeType = node.type;
                                break;
                            }
                        }
                    }
                }
            }
            
            return nodeType;            
        };
        
        this.getStepTitleFromNodeId = function(nodeId) {
            var title = null;
            var project = this.project;
            
            if(project !== null) {
                var nodes = project.nodes;
                
                if(nodes !== null) {
                    for(var x=0; x<nodes.length; x++) {
                        var node = nodes[x];
                        
                        if(node !== null) {
                            var tempNodeId = node.id;
                            
                            if(nodeId === tempNodeId) {
                                title = node.title;
                                break;
                            }
                        }
                    }
                }
            }
            
            return title;
        };
        
        this.getSequenceTitleFromNodeId = function(nodeId) {
            var title = null;
            
            var project = this.project;
            
            if(project !== null) {
                var sequences = project.sequences;
                
                if(sequences !== null) {
                    for(var x=0; x<sequences.length; x++) {
                        var sequence = sequences[x];
                        
                        if(sequence !== null) {
                            var tempNodeId = sequence.identifier;
                            
                            if(nodeId === tempNodeId) {
                                title = sequence.title;
                                break;
                            }
                        }
                    }
                }
            }
            
            return title;
        };
        
        this.getNodeFromNodeId = function(nodeId) {
            var project = this.project;
            
            if(project !== null) {
                //loop through step nodes
                var nodes = project.nodes;
                
                if(nodes !== null) {
                    for(var x=0; x<nodes.length; x++) {
                        var tempNode = nodes[x];
                        
                        if(tempNode !== null) {
                            var tempNodeId = tempNode.identifier;
                            
                            if(nodeId === tempNodeId) {
                                return tempNode;
                            }
                        }
                    }                
                }
                
                //loop through activity nodes
                var sequences = project.sequences;
                
                if(sequences !== null) {
                    for(var y=0; y<sequences.length; y++) {
                        var tempSequence = sequences[y];
                        
                        if(tempSequence !== null) {
                            var tempNodeId = tempSequence.identifier;
                            
                            if(nodeId === tempNodeId) {
                                return tempSequence;
                            }
                        }
                    }                
                }
            }
            
            return null;
        };
        
        this.getStepFromNodeId = function(nodeId) {
            
        };
        
        this.getSequenceFromNodeId = function(nodeId) {
            
        };
        
        this.getStepNodesInTraversalOrder = function() {
            var includeSteps = true;
            var includeSequences = false;
            return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
        };
        
        this.getSequenceNodesInTraversalOrder = function() {
            var includeSteps = false;
            var includeSequences = true;
            return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
        };
        
        this.getSequenceAndStepNodesInTraversalOrder = function() {
            var includeSteps = true;
            var includeSequences = true;
            return this.getProjectNodesInTraversalOrder(includeSequences, includeSteps);
        };
        
        this.getProjectNodesInTraversalOrder = function(includeSequences, includeSteps) {
            var nodes = [];
            
            var project = this.project;
            
            if(project !== null) {
                var startPointNodeId = project.startPoint;
                
                nodes = this.getProjectNodesInTraversalOrderHelper(startPointNodeId, includeSequences, includeSteps);
            }
            
            return nodes;
        };
        
        this.getProjectNodesInTraversalOrderHelper = function(nodeId, includeSequences, includeSteps) {
            var nodes = [];
            
            var node = this.getNodeFromNodeId(nodeId);
            
            if(node != null) {
                var type = node.type;
                
                if(type === null || type === '') {
                    
                } else if(type === 'sequence') {
                    //node is a sequence
                    
                    //do not add the master sequence node
                    if(nodeId !== 'master') {
                        if(includeSequences) {
                            //add the sequence node
                            nodes.push(node);                        
                        }
                    }
    
                    //get the node ids of the children
                    var refs = node.refs;
    
                    //loop through all the children in the sequence
                    for(var x=0; x<refs.length; x++) {
                        var childeNodeId = refs[x];
                        
                        var childNodes = this.getProjectNodesInTraversalOrderHelper(childeNodeId, includeSequences, includeSteps);
                        
                        nodes = nodes.concat(childNodes);
                    }
                } else {
                    //node is a step
                    
                    if(includeSteps) {
                        nodes.push(node);                    
                    }
                }
            }
            
            return nodes;
        };
        
        this.getStepNodeIdsInTraversalOrder = function() {
            var stepNodeIds = [];
            
            var stepNodes = this.getStepNodesInTraversalOrder();
            
            if(stepNodes != null) {
                for(var x=0; x<stepNodes.length; x++) {
                    var stepNode = stepNodes[x];
                    
                    if(stepNode != null) {
                        var nodeId = stepNode.nodeId;
                        
                        if(nodeId != null) {
                            stepNodeIds.push(nodeId);
                        }
                    }
                }
            }
            
            return stepNodeIds;
        };
        
        this.getNodeNumberAndTitle = function(nodeId) {
            var nodeNumberAndTitle = null;
            
            var project = this.project;
            
            if(project != null) {
                var startPointNodeId = project.startPoint;
                
                nodeNumberAndTitle = this.getNodeNumberAndTitleHelper(startPointNodeId, nodeId);
            }
            
            var node = this.getNodeFromNodeId(nodeId);
            
            if(node != null) {
                var type = node.type;
                
                if(type === null || type === '') {
                    
                } else if (type === 'sequence') {
                    nodeNumberAndTitle = 'Activity ' + nodeNumberAndTitle;
                } else {
                    nodeNumberAndTitle = 'Step ' + nodeNumberAndTitle;
                }
                
                var title = this.getNodeTitleFromNodeId(nodeId);
                
                if(title != null) {
                    nodeNumberAndTitle += ': ' + title;
                }
            }
            
            return nodeNumberAndTitle;
        };
        
        this.getNodeNumberAndTitleHelper = function(nodeIdToSearch, nodeIdSearchingFor) {
            var nodeNumberAndTitle = null;
            
            var nodeToSearch = this.getNodeFromNodeId(nodeIdToSearch);
            
            if(nodeToSearch != null) {
                var type = nodeToSearch.type;
                
                if(type === null || type === '') {
                    /*
                     * node to search is a step. since steps don't have children,
                     * we will not be able to find the node id we want in this node.
                     */
                } else if(type === 'sequence') {
                    //node to search is a sequence
                    
                    var refs = nodeToSearch.refs;
                    
                    if(refs != null) {
                        //loop through all the children
                        for(var x=0; x<refs.length; x++) {
                            //get the node id of the child
                            var ref = refs[x];
                            
                            //get the current node number
                            var currentNodeNumber = x + 1;
                            
                            if(ref != null) {
                                
                                if(nodeIdSearchingFor === ref) {
                                    /*
                                     * the current child has the node id we are searching for
                                     * so we will return the node number within the sequence 
                                     */ 
                                    var tempNodeNumber = currentNodeNumber;
    
                                    return tempNodeNumber;
                                } else {
                                    /*
                                     * search the children of the current child
                                     */
                                    var childNodeNumber = this.getNodeNumberAndTitleHelper(ref, nodeIdSearchingFor);
                                    
                                    /*
                                     * if we have found the node id in this child sequence, the childNodeNumber
                                     * will not be null
                                     */
                                    if(childNodeNumber != null) {
                                        /*
                                         * we have found the node id within the child so we will concatenate
                                         * the current node number with the child node number
                                         */
                                        return currentNodeNumber + '.' + childNodeNumber;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            
            return nodeNumberAndTitle;
        };
        
    }]);
    
});
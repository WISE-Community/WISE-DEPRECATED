define(['app'], function(app) {
    app.$controllerProvider.register('MultipleChoiceController', 
            function($scope, 
                    $state, 
                    $stateParams, 
                    ConfigService,
                    CurrentNodeService,
                    NodeService,
                    ProjectService, 
                    StudentDataService) {
        
        this.nodeId = null;
        this.studentChoices = [];
        
        var currentNode = CurrentNodeService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        }
        
        var nodeSrc = ProjectService.getNodeSrcByNodeId(this.nodeId);
        
        NodeService.getNodeContentByNodeSrc(nodeSrc).then(angular.bind(this, function(nodeContent) {
            this.nodeContent = nodeContent;
            var nodeState = StudentDataService.getLatestNodeStateByNodeId(this.nodeId);
            
            this.setStudentWork(nodeState);
            //this.importWork();
            
            $scope.$parent.nodeController.nodeLoaded(this.nodeId);
        }));
        
        this.setStudentWork = function(nodeState) {
            
            if (nodeState != null) {
                var response = nodeState.response;
                var choiceIds = this.getChoiceIdsFromResponse(response);
                
                if (this.isRadio()) {
                    this.studentChoices = choiceIds[0];
                } else if (this.isCheckbox()) {
                    this.studentChoices = choiceIds;
                }
            }
        };
        
        this.isChecked = function(choiceId) {
            var result = false;
            var studentChoices = this.studentChoices;
            
            if (studentChoices != null) {
                if (this.isRadio()) {
                    if (choiceId === studentChoices) {
                        result = true;
                    }
                } else if(this.isCheckbox()) {
                    if (studentChoices.indexOf(choiceId) != -1) {
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        this.getChoiceIdsFromResponse = function(response) {
            var choiceIds = [];
            
            if (response != null) {
                for (var x = 0; x < response.length; x++) {
                    var responseChoice = response[x];
                    
                    if (responseChoice != null) {
                        var responseChoiceId = responseChoice.id;
                        
                        choiceIds.push(responseChoiceId);
                    }
                }
            }
            
            return choiceIds;
        };
        
        this.toggleSelection = function(choiceId) {
            
            if (choiceId != null) {
                var studentChoices = this.studentChoices;
                
                if (studentChoices != null) {
                    var index = studentChoices.indexOf(choiceId);
                    if (index == -1) {
                        studentChoices.push(choiceId);
                    } else {
                        studentChoices.splice(index, 1);
                    }
                }
            }
        };
        
        this.isRadio = function() {
            return this.isChoiceType('radio');
        };
        
        this.isCheckbox = function() {
            return this.isChoiceType('checkbox');
        };
        
        this.isChoiceType = function(choiceType) {
            var result = false;
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                var nodeContentChoiceType = nodeContent.choiceType;
                
                if (choiceType === nodeContentChoiceType) {
                    result = true;
                }
            }
            
            return result;
        }
        
        this.saveButtonClicked = function() {
            
            var hasCorrect = this.hasCorrectChoices();
            
            var studentChoices = this.getStudentChoiceObjects();
            
            var nodeState = this.createNewNodeState();
            nodeState.response = studentChoices;
            
            StudentDataService.addNodeStateToLatestNodeVisit(this.nodeId, nodeState);
            
            var nodeVisit = StudentDataService.getLatestNodeVisitByNodeId(this.nodeId);
            return StudentDataService.saveNodeVisitToServer(nodeVisit).then(angular.bind(this, function() {
                        //this.calculateDisabled();
                        //this.isDirty = false;
                    }));
        };
        
        this.getStudentChoiceObjects = function() {
            var studentChoiceObjects = [];
            
            var studentChoices = this.studentChoices;
            
            if (studentChoices != null) {
                
                if (this.isRadio()) {
                    var choiceObject = this.getChoiceById(studentChoices);
                    
                    var studentChoiceObject = {};
                    studentChoiceObject.id = choiceObject.id;
                    studentChoiceObject.text = choiceObject.text;
                    
                    studentChoiceObjects.push(studentChoiceObject)
                } else if (this.isCheckbox()) {
                    for (var x = 0; x < studentChoices.length; x++) {
                        var studentChoiceId = studentChoices[x];
                        
                        var choiceObject = this.getChoiceById(studentChoiceId);
                        
                        var studentChoiceObject = {};
                        studentChoiceObject.id = choiceObject.id;
                        studentChoiceObject.text = choiceObject.text;
                        
                        studentChoiceObjects.push(studentChoiceObject)
                    }
                }
            }
            
            return studentChoiceObjects;
        };
        
        this.hasCorrectChoices = function() {
            var result = false;
            var nodeContent = this.nodeContent;
            
            if (nodeContent != null) {
                var choiceType = nodeContent.choiceType;
                
                if (choiceType === 'radio') {
                    var correctChoice = nodeContent.correctChoice;
                    
                    if (correctChoice != null) {
                        result = true;
                    }
                } else if (choiceType === 'checkbox') {
                    var correctChoices = nodeContent.correctChoices;
                    
                    if (correctChoices != null && correctChoices.length > 0) {
                        result = true;
                    }
                }
            }
            
            return result;
        };
        
        this.getChoiceById = function(choiceId) {
            var choice = null;
            
            if (choiceId != null) {
                var nodeContent = this.nodeContent;
                
                if (nodeContent != null) {
                    var choices = this.nodeContent.choices;
                    
                    for (var c = 0; c < choices.length; c++) {
                        var tempChoice = choices[c];
                        
                        if (tempChoice != null) {
                            var tempChoiceId = tempChoice.id;
                            
                            if (choiceId === tempChoiceId) {
                                choice = tempChoice;
                                break;
                            }
                        }
                    }
                }
            }
            
            return choice;
        };

        
        this.createNewNodeState = function() {
            var nodeState = {};
            
            nodeState.timestamp = Date.parse(new Date());
            
            return nodeState;
        };
    });
});
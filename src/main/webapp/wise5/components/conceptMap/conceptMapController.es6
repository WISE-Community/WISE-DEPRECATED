'use strict';

import 'svg.js';
import 'svg.draggable.js';

class ConceptMapController {

    constructor($injector,
                $mdDialog,
                $q,
                $rootScope,
                $scope,
                $timeout,
                AnnotationService,
                ConceptMapService,
                ConfigService,
                CRaterService,
                NodeService,
                ProjectService,
                StudentAssetService,
                StudentDataService) {

        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConceptMapService = ConceptMapService;
        this.ConfigService = ConfigService;
        this.CRaterService = CRaterService;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;
        this.idToOrder = this.ProjectService.idToOrder;

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // holds the text that the student has typed
        this.studentResponse = '';

        // holds student attachments like assets
        this.attachments = [];

        // whether the step should be disabled
        this.isDisabled = false;

        // whether the student work is dirty and needs saving
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // whether this component is showing previous work
        this.isShowPreviousWork = false;

        // whether the student work is for a submit
        this.isSubmit = false;

        // whether rich text editing is enabled
        this.isRichTextEnabled = false;

        // whether students can attach files to their work
        this.isStudentAttachmentEnabled = false;

        // whether the prompt is shown or not
        this.isPromptVisible = true;

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // the latest annotations
        this.latestAnnotations = null;
        
        // used to hold a message dialog if we need to use one
        this.messageDialog = null;
        
        // default width and height for the svg
        this.width = 800;
        this.height = 600;
        
        // the available nodes the students can choose
        this.availableNodes = [];
        
        // the available links the students can choose
        this.availableLinks = [];
        
        // the node instances the students create
        this.nodes = [];
        
        // the link instances the students create
        this.links = [];
        
        // flag to display the link type chooser
        this.displayLinkTypeChooser = false;
        
        // flag to display the modal overlay for the link type chooser
        this.displayLinkTypeChooserModalOverlay = false;
        
        // the selected link type
        this.selectedLinkType = null;
        
        // flag for whether we have initialized the link type modal overlay
        this.initializedDisplayLinkTypeChooserModalOverlay = false;
        
        // default values for the modal width and height
        this.modalWidth = 800;
        this.modalHeight = 600;
        
        /*
         * used to remember the node the student has started dragging to create
         * so that we know what node to create once they let go off the mouse
         * on the svg element
         */
        this.selectedNode = null;
        
        /*
         * used to remember the offset of the mouse relative to the upper left
         * of the node image the student started dragging to create a new node 
         * instance
         */
        this.tempOffsetX = 0;
        this.tempOffsetY = 0;

        let themePath = this.ProjectService.getThemePath();

        // get the current node and node id
        var currentNode = this.StudentDataService.getCurrentNode();
        if (currentNode != null) {
            this.nodeId = currentNode.id;
        } else {
            this.nodeId = this.$scope.nodeId;
        }

        // get the component content from the scope
        this.componentContent = this.$scope.componentContent;

        // get the authoring component content
        this.authoringComponentContent = this.$scope.authoringComponentContent;

        /*
         * get the original component content. this is used when showing
         * previous work from another component.
         */
        this.originalComponentContent = this.$scope.originalComponentContent;

        // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
        this.mode = this.$scope.mode;

        this.workgroupId = this.$scope.workgroupId;
        this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;
        
        
        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.componentContent.width != null) {
                this.width = this.componentContent.width;
            }
            
            if (this.componentContent.height != null) {
                this.height = this.componentContent.height;
            }
            
            // setup the svg
            this.setupSVG();

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
                this.availableNodes = this.componentContent.nodes;
                this.availableLinks = this.componentContent.links;
                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
            } else if (this.mode === 'grading') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'onlyShowWork') {
                this.isPromptVisible = false;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'showPreviousWork') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isDisabled = true;
            } else if (this.mode === 'authoring') {
                this.availableNodes = this.componentContent.nodes;
                this.availableLinks = this.componentContent.links;
                
                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.availableNodes = this.componentContent.nodes;
                    this.availableLinks = this.componentContent.links;
                    this.setupSVG();
                }.bind(this), true);
            }

            var componentState = null;

            // set whether rich text is enabled
            this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

            // set whether studentAttachment is enabled
            this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

            // get the component state from the scope
            componentState = this.$scope.componentState;

            if (componentState == null) {
                /*
                 * only import work if the student does not already have
                 * work for this component
                 */

                // check if we need to import work
                var importWorkNodeId = this.componentContent.importWorkNodeId;
                var importWorkComponentId = this.componentContent.importWorkComponentId;

                if (importWorkNodeId != null && importWorkComponentId != null) {
                    // import the work from the other component
                    this.importWork();
                } else if (this.componentContent.starterConceptMap != null) {
                    /*
                     * the student has not done any work and there is a starter 
                     * concept map so we will populate the concept map with
                     * the starter
                     */
                    
                    // get the starter concept map
                    var conceptMapData = this.componentContent.starterConceptMap;
                    
                    // populate the concept map data into the component
                    this.populateConceptMapData(conceptMapData);
                }
            } else {
                // the student has work for this component
                
                /*
                 * inject the asset path so that the file name is changed to
                 * a relative path
                 * e.g.
                 * "Sun.png"
                 * will be changed to
                 * "/wise/curriculum/108/assets/Sun.png"
                 */
                componentState = this.ProjectService.injectAssetPaths(componentState);
                
                // populate the student work into this component
                this.setStudentWork(componentState);
            }

            // check if we need to lock this component
            this.calculateDisabled();

            if (this.$scope.$parent.registerComponentController != null) {
                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function() {
            return this.$scope.conceptMapController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a promise of a component state containing the student data
         */
        this.$scope.getComponentState = function(isSubmit) {
            var deferred = this.$q.defer();
            let getState = false;
            let action = 'change';

            if (isSubmit) {
                if (this.$scope.conceptMapController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.conceptMapController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.conceptMapController.createComponentState(action).then((componentState) => {
                    deferred.resolve(componentState);
                });
            } else {
                /*
                 * the student does not have any unsaved changes in this component
                 * so we don't need to save a component state for this component.
                 * we will immediately resolve the promise here.
                 */
                deferred.resolve();
            }
            
            return deferred.promise;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', function(event, args) {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        }.bind(this));

        /**
         * Listen for the 'studentWorkSavedToServer' event which is fired when
         * we receive the response from saving a component state to the server
         */
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

            let componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId
                && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

                let isAutoSave = componentState.isAutoSave;
                let isSubmit = componentState.isSubmit;
                let clientSaveTime = componentState.clientSaveTime;

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }
            }
        }));
        
        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$scope.$on('annotationSavedToServer', (event, args) => {
            
            if (args != null ) {
                
                // get the annotation that was saved to the server
                var annotation = args.annotation;
                
                if (annotation != null) {
                    
                    // get the node id and component id of the annotation
                    var annotationNodeId = annotation.nodeId;
                    var annotationComponentId = annotation.componentId;
                    
                    // make sure the annotation was for this component
                    if (this.nodeId === annotationNodeId && 
                        this.componentId === annotationComponentId) {
                        
                        // get latest score and comment annotations for this component
                        this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
                    }
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', function(event, args) {

        }.bind(this));
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    setStudentWork(componentState) {

        if (componentState != null) {
            var studentData = componentState.studentData;

            if (studentData != null) {
                var conceptMapData = studentData.conceptMapData;

                if (conceptMapData != null) {
                    
                    // populate the concept map data into the component
                    this.populateConceptMapData(conceptMapData);
                }

                var attachments = studentData.attachments;

                if (attachments != null) {
                    this.attachments = attachments;
                }

                this.processLatestSubmit();
            }
        }
    };
    
    /**
     * Populate the concept map data into the component
     * @param conceptMapData the concept map data which contains an array
     * of nodes and an array of links
     */
    populateConceptMapData(conceptMapData) {
        
        if (conceptMapData != null) {
            var nodes = conceptMapData.nodes;
            
            if (nodes != null) {
                
                // loop through all the nodes
                for (var n = 0; n < nodes.length; n++) {
                    var node = nodes[n];
                    
                    var instanceId = node.instanceId;
                    var originalId = node.originalId;
                    var filePath = node.fileName;
                    var label = node.label;
                    var x = node.x;
                    var y = node.y;
                    var width = node.width;
                    var height = node.height
                    
                    // create a ConceptMapNode
                    var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, instanceId, originalId, filePath, label, x, y, width, height);
                    
                    // add the node to our array of nodes
                    this.addNode(conceptMapNode);
                    
                    // set the mouse events on the node
                    this.setNodeMouseEvents(conceptMapNode);
                }
            }
            
            var links = conceptMapData.links;
            
            if (links != null) {
                
                // loop through all the links
                for (var l = 0; l < links.length; l++) {
                    var link = links[l];
                    
                    var instanceId = link.instanceId;
                    var originalId = link.originalId;
                    var sourceNodeId = link.sourceNodeInstanceId;
                    var destinationNodeId = link.destinationNodeInstanceId;
                    var label = link.label;
                    var color = link.color;
                    var curvature = link.curvature;
                    var startCurveUp = link.startCurveUp;
                    var endCurveUp = link.endCurveUp;
                    var sourceNode = null;
                    var destinationNode = null;
                    
                    if (sourceNodeId != null) {
                        sourceNode = this.getNodeById(sourceNodeId);
                    }
                    
                    if (destinationNodeId != null) {
                        destinationNode = this.getNodeById(destinationNodeId);
                    }
                    
                    // create a ConceptMapLink
                    var conceptMapLink = this.ConceptMapService.newConceptMapLink(this.draw, instanceId, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp);
                    
                    // add the link to our array of links
                    this.addLink(conceptMapLink);
                    
                    // set the mouse events on the link
                    this.setLinkMouseEvents(conceptMapLink);
                }
            }
            
            // move the nodes to the front so that they are on top of links
            this.moveNodesToFront();
            
            /*
             * set a timeout to refresh the link labels so that the rectangles
             * around the labels are properly resized
             */
            this.$timeout(() => {
                this.refreshLinkLabels();
            });
        }
    }
    
    /**
     * Refresh the link labels so that the rectangles around the text
     * labels are resized to fit the text properly. This is required because
     * the rectangles are not properly sized when the ConceptMapLinks are
     * initialized. The rectangles need to be rendered first and then the
     * labels need to be set in order for the rectangles to be resized properly.
     * This is why this function is called in a $timeout.
     */
    refreshLinkLabels() {
        
        if (this.nodes != null) {
            
            // loop through all the nodes
            for (var n = 0; n < this.nodes.length; n++) {
                var node = this.nodes[n];
                
                if (node != null) {
                    // get the label from the node
                    var label = node.getLabel();
                    
                    /*
                     * set the label back into the node so that the rectangle
                     * around the text label is resized to the text
                     */
                    node.setLabel(label);
                }
            }
        }
        
        if (this.links != null) {
            
            // loop throgh all the links
            for (var l = 0; l < this.links.length; l++) {
                var link = this.links[l];
                
                if (link != null) {
                    // get the label from the link
                    var label = link.getLabel();
                    
                    /*
                     * set the label back into the link so that the rectangle
                     * around the text label is resized to the text
                     */
                    link.setLabel(label);
                }
            }
        }
    }

    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */
    processLatestSubmit() {
        let latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

        if (latestState) {
            if (latestState.isSubmit) {
                // latest state is a submission, so set isSubmitDirty to false and notify node
                this.isSubmitDirty = false;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                // set save message
                this.setSaveMessage('Last submitted', latestState.clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage('Last saved', latestState.clientSaveTime);
            }
        }
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {
        this.isSubmit = false;

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {
        this.isSubmit = true;
        
        // tell the parent node that this component wants to submit
        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
    };

    submit() {
        // check if we need to lock the component after the student submits
        if (this.isLockAfterSubmit()) {
            this.isDisabled = true;
        }
    };

    /**
     * Called when the student changes their work
     */
    studentDataChanged() {
        /*
         * set the dirty flags so we will know we need to save or submit the
         * student work later
         */
        this.isDirty = true;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});

        // clear out the save message
        this.setSaveMessage('', null);

        // get this part id
        var componentId = this.getComponentId();

        /*
         * the student work in this component has changed so we will tell
         * the parent node that the student data will need to be saved.
         * this will also notify connected parts that this component's student
         * data has changed.
         */
        var action = 'change';
        
        // create a component state populated with the student data
        this.createComponentState(action).then((componentState) => {
            this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
        });
    };

    /**
     * Get the student response
     */
    getStudentResponse() {
        return this.studentResponse;
    };

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    createComponentState(action) {
        
        var deferred = this.$q.defer();

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

        // get the text the student typed
        var response = this.getStudentResponse();

        // set the response into the component state
        var studentData = {};
        var conceptMapData = this.getConceptMapData();
        studentData.conceptMapData = conceptMapData;
        
        if (this.isSubmit) {
            // the student submitted this work
            componentState.isSubmit = this.isSubmit;

            /*
             * reset the isSubmit value so that the next component state
             * doesn't maintain the same value
             */
            this.isSubmit = false;
        }

        // set the student data into the component state
        componentState.studentData = studentData;
        
        /*
         * perform any additional processing that is required before returning
         * the component state
         */
        this.createComponentStateAdditionalProcessing(deferred, componentState, action);
        
        return deferred.promise;
    };
    
    /**
     * Get the concept map data
     * @returns an object containing a array of nodes and an array of links
     */
    getConceptMapData() {
        var studentData = {};
        studentData.nodes = [];
        studentData.links = [];
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            
            // get the JSON representation of the node
            var nodeJSON = node.toJSONObject();
            
            studentData.nodes.push(nodeJSON);
        }
        
        // loop through all the links
        for (var l = 0; l < this.links.length; l++) {
            var link = this.links[l];
            
            // get the JSON representation of the link
            var linkJSON = link.toJSONObject();
            
            studentData.links.push(linkJSON);
        }
        
        return studentData;
    }
    
    /**
     * Perform any additional processing that is required before returning the
     * component state
     * Note: this function must call deferred.resolve() otherwise student work
     * will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */
    createComponentStateAdditionalProcessing(deferred, componentState, action) {
        
        var performCRaterScoring = false;
        
        // determine if we need to perform CRater scoring
        if (action == 'submit') {
            if (this.isCRaterScoreOnSubmit(this.componentContent)) {
                performCRaterScoring = true;
            }
        } else if (action == 'save') {
            if (this.isCRaterScoreOnSave(this.componentContent)) {
                performCRaterScoring = true;
            }
        } else if (action == 'change' || action == null) {
            if (this.isCRaterScoreOnChange(this.componentContent)) {
                performCRaterScoring = true;
            }
        }
        
        if (performCRaterScoring) {
            // we need to perform CRater scoring
            
            var cRaterItemType = this.CRaterService.getCRaterItemType(this.componentContent);
            var cRaterItemId = this.CRaterService.getCRaterItemId(this.componentContent);
            var cRaterRequestType = 'scoring';
            var cRaterResponseId = new Date().getTime();
            var studentData = this.studentResponse;
            
            /*
             * display a dialog message while the student waits for their work 
             * to be scored by CRater
             */
            this.messageDialog = this.$mdDialog.show({
                template: '<md-dialog aria-label="Please Wait"><md-dialog-content><div class="md-dialog-content">Please wait, we are scoring your work.</div></md-dialog-content></md-dialog>',
                fullscreen: true,
                escapeToClose: false
            });
            
            // make the CRater request to score the student data
            this.CRaterService.makeCRaterRequest(cRaterItemType, cRaterItemId, cRaterRequestType, cRaterResponseId, studentData).then((result) => {
                
                if (result != null) {
                    
                    // get the CRater response
                    var data = result.data;
                    
                    if (data != null) {
                        
                        /*
                         * annotations we put in the component state will be 
                         * removed from the component state and saved separately
                         */
                        componentState.annotations = [];
                        
                        // get the CRater score
                        var score = data.score;
                        var concepts = data.concepts;
                        
                        if (score != null) {
                            // create the auto score annotation
                            var autoScoreAnnotationData = {};
                            autoScoreAnnotationData.value = score;
                            autoScoreAnnotationData.maxAutoScore = this.ProjectService.getMaxScoreForComponent(this.nodeId, this.componentId);
                            autoScoreAnnotationData.concepts = concepts;
                            autoScoreAnnotationData.autoGrader = 'cRater';
                            
                            var autoScoreAnnotation = this.createAutoScoreAnnotation(autoScoreAnnotationData);
                            componentState.annotations.push(autoScoreAnnotation);
                            
                            // get the feedback text
                            var autoComment = this.CRaterService.getCRaterFeedbackTextByScore(this.componentContent, score);
                            
                            if (autoComment != null) {
                                // create the auto comment annotation
                                var autoCommentAnnotationData = {};
                                autoCommentAnnotationData.value = autoComment;
                                autoCommentAnnotationData.concepts = concepts;
                                autoCommentAnnotationData.autoGrader = 'cRater';
                                
                                var autoCommentAnnotation = this.createAutoCommentAnnotation(autoCommentAnnotationData);
                                componentState.annotations.push(autoCommentAnnotation);
                            }
                        }
                    }
                }
                
                if (this.messageDialog != null) {
                    /*
                     * hide the dialog that tells the student to wait since 
                     * the work has been scored.
                     */
                    this.$mdDialog.hide(this.messageDialog);
                }
                
                // resolve the promise now that we are done performing additional processing
                deferred.resolve(componentState);
            });
        } else {
            /*
             * we don't need to perform any additional processing so we can resolve
             * the promise immediately
             */
            deferred.resolve(componentState);
        }
    }

    /**
     * Create an auto score annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto score annotation
     */
    createAutoScoreAnnotation(data) {
        
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var toWorkgroupId = this.ConfigService.getWorkgroupId();
        
        // create the auto score annotation
        var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
        
        return annotation;
    }
    
    /**
     * Create an auto comment annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto comment annotation
     */
    createAutoCommentAnnotation(data) {
        
        var runId = this.ConfigService.getRunId();
        var periodId = this.ConfigService.getPeriodId();
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var toWorkgroupId = this.ConfigService.getWorkgroupId();
        
        // create the auto comment annotation
        var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
        
        return annotation;
    }

    /**
     * Check if we need to lock the component
     */
    calculateDisabled() {

        // get the component content
        var componentContent = this.componentContent;

        if (componentContent != null) {

            // check if the parent has set this component to disabled
            if (componentContent.isDisabled) {
                this.isDisabled = true;
            } else if (componentContent.lockAfterSubmit) {
                // we need to lock the component after the student has submitted

                // get the component states for this component
                var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

                // check if any of the component states were submitted
                var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                if (isSubmitted) {
                    // the student has submitted work for this component
                    this.isDisabled = true;
                }
            }
        }
    };

    /**
     * Check whether we need to show the prompt
     * @return whether to show the prompt
     */
    showPrompt() {
        return this.isPromptVisible;
    };

    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    showSaveButton() {
        return this.isSaveButtonVisible;
    };

    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    showSubmitButton() {
        return this.isSubmitButtonVisible;
    };

    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    isLockAfterSubmit() {
        var result = false;

        if (this.componentContent != null) {

            // check the lockAfterSubmit field in the component content
            if (this.componentContent.lockAfterSubmit) {
                result = true;
            }
        }

        return result;
    };

    removeAttachment(attachment) {
        if (this.attachments.indexOf(attachment) != -1) {
            this.attachments.splice(this.attachments.indexOf(attachment), 1);
            this.studentDataChanged();
            // YOU ARE NOW FREEEEEEEEE!
        }
    };

    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
    attachStudentAsset(studentAsset) {
        if (studentAsset != null) {
            this.StudentAssetService.copyAssetForReference(studentAsset).then( (copiedAsset) => {
                if (copiedAsset != null) {
                    var attachment = {
                        studentAssetId: copiedAsset.id,
                        iconURL: copiedAsset.iconURL
                    };

                    this.attachments.push(attachment);
                    this.studentDataChanged();
                }
            });
        }
    };

    /**
     * Get the prompt to show to the student
     */
    getPrompt() {
        var prompt = null;

        if (this.originalComponentContent != null) {
            // this is a show previous work component
            
            if (this.originalComponentContent.showPreviousWorkPrompt) {
                // show the prompt from the previous work component
                prompt = this.componentContent.prompt;
            } else {
                // show the prompt from the original component
                prompt = this.originalComponentContent.prompt;
            }
        } else if (this.componentContent != null) {
            prompt = this.componentContent.prompt;
        }

        return prompt;
    };

    /**
     * Get the number of rows for the textarea
     */
    getNumRows() {
        var numRows = null;

        if (this.componentContent != null) {
            numRows = this.componentContent.numRows;
        }

        return numRows;
    };

    /**
     * Get the number of columns for the textarea
     */
    getNumColumns() {
        var numColumns = null;

        if (this.componentContent != null) {
            numColumns = this.componentContent.numColumns;
        }

        return numColumns;
    };

    /**
     * Get the text the student typed
     */
    getResponse() {
        var response = null;

        if (this.studentResponse != null) {
            response = this.studentResponse;
        }

        return response;
    };

    /**
     * Import work from another component
     */
    importWork() {

        // get the component content
        var componentContent = this.componentContent;

        if (componentContent != null) {

            var importWorkNodeId = componentContent.importWorkNodeId;
            var importWorkComponentId = componentContent.importWorkComponentId;

            if (importWorkNodeId != null && importWorkComponentId != null) {

                // get the latest component state for this component
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

                /*
                 * we will only import work into this component if the student
                 * has not done any work for this component
                 */
                if(componentState == null) {
                    // the student has not done any work for this component

                    // get the latest component state from the component we are importing from
                    var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                    if (importWorkComponentState != null) {
                        /*
                         * populate a new component state with the work from the
                         * imported component state
                         */
                        var populatedComponentState = this.ConceptMapService.populateComponentState(importWorkComponentState);

                        // populate the component state into this component
                        this.setStudentWork(populatedComponentState);
                    }
                }
            }
        }
    };

    /**
     * Get the component id
     * @return the component id
     */
    getComponentId() {
        return this.componentContent.id;
    };

    /**
     * The component has changed in the regular authoring view so we will save the project
     */
    authoringViewComponentChanged() {

        // update the JSON string in the advanced authoring view textarea
        this.updateAdvancedAuthoringView();
        
        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeController.authoringViewNodeChanged();
    };

    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    advancedAuthoringViewComponentChanged() {

        try {
            /*
             * create a new component by converting the JSON string in the advanced
             * authoring view into a JSON object
             */
            var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

            // replace the component in the project
            this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

            // set the new component into the controller
            this.componentContent = editedComponentContent;
            
            /*
             * notify the parent node that the content has changed which will save
             * the project to the server
             */
            this.$scope.$parent.nodeController.authoringViewNodeChanged();
        } catch(e) {

        }
    };
    
    /**
     * The show previous work node id has changed
     */
    authoringShowPreviousWorkNodeIdChanged() {
        
        if (this.authoringComponentContent.showPreviousWorkNodeId == null ||
            this.authoringComponentContent.showPreviousWorkNodeId == '') {

            /*
             * the show previous work node id is null so we will also set the 
             * show previous component id to null
             */
            this.authoringComponentContent.showPreviousWorkComponentId = '';
        }
        
        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }
    
    /**
     * A node up button was clicked in the authoring tool so we will move the 
     * node up
     * @param index the index of the node that we will move
     */
    authoringViewNodeUpButtonClicked(index) {
        
        // check if the node is at the top
        if (index != 0) {
            // the node is not at the top so we can move it up
            
            // get the nodes
            var nodes = this.authoringComponentContent.nodes;
            
            if (nodes != null) {
                
                // get the node at the given index
                var node = nodes[index];
                
                // remove the node
                nodes.splice(index, 1);
                
                // insert the node back in one index back
                nodes.splice(index - 1, 0, node);
                
                /*
                 * the author has made changes so we will save the component
                 * content
                 */
                this.authoringViewComponentChanged();
            }
        }
    }
    
    /**
     * A node down button was clicked in the authoring tool so we will move the
     * node down
     * @param index the index of the node that we will move
     */
    authoringViewNodeDownButtonClicked(index) {
        
        // check if the node is at the bottom
        if (index != nodes.length - 1) {
            // the node is not at the bottom so we can move it down
            
            // get the nodes
            var nodes = this.authoringComponentContent.nodes;
            
            if (nodes != null) {
                
                // get the node at the given index
                var node = nodes[index];
                
                // remove the node
                nodes.splice(index, 1);
                
                // insert the node back in one index ahead
                nodes.splice(index + 1, 0, node);
                
                /*
                 * the author has made changes so we will save the component
                 * content
                 */
                this.authoringViewComponentChanged();
            }
        }
    }
    
    /**
     * A node delete button was clicked in the authoring tool so we will remove
     * the node
     * @param index the index of the node that we will delete
     */
    authoringViewNodeDeleteButtonClicked(index) {
        
        // get the nodes
        var nodes = this.authoringComponentContent.nodes;
        
        if (nodes != null) {
            
            // get the node
            var node = nodes[index];
            
            if (node != null) {
                
                // get the file name and label
                var nodeFileName = node.fileName;
                var nodeLabel = node.label;
                
                // confirm with the author that they really want to delete the node
                var answer = confirm('Are you sure you want to delete this node?\n\nFile Name: ' + nodeFileName + '\nLabel: ' + nodeLabel);
                
                if (answer) {
                    /*
                     * the author is sure they want to delete the node so we
                     * will remove it from the array
                     */
                    nodes.splice(index, 1);
                    
                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }
    }
    
    /**
     * A link up button was clicked in the authoring tool so we will move the 
     * link up
     * @param index the index of the link
     */
    authoringViewLinkUpButtonClicked(index) {
        
        // check if the link is at the top
        if (index != 0) {
            
            // get the links
            var links = this.authoringComponentContent.links;
            
            if (links != null) {
                
                // get a link
                var link = links[index];
                
                if (link != null) {
                    
                    // remove the link
                    links.splice(index, 1);
                    
                    // add the link back in one index back
                    links.splice(index - 1, 0, link);
                    
                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }
    }
    
    /**
     * A link down button was clicked in the authoring tool so we will move the 
     * link down
     * @param index the index of the link
     */
    authoringViewLinkDownButtonClicked(index) {
        
        // check if the link is at the bottom
        if (index != links.length - 1) {
            // the node is not at the bottom so we can move it down
            
            // get the links
            var links = this.authoringComponentContent.links;
            
            if (links != null) {
                
                // get the link
                var link = links[index];
                
                if (link != null) {
                    
                    // remove the link
                    links.splice(index, 1);
                    
                    // add the link back in one index ahead
                    links.splice(index + 1, 0, link);
                    
                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }
    }
    
    /**
     * A link delete button was clicked in the authoring tool so we remove the
     * link
     * @param index the index of the link
     */
    authoringViewLinkDeleteButtonClicked(index) {
        
        // get the links
        var links = this.authoringComponentContent.links;
        
        if (links != null) {
            
            // get a link
            var link = links[index];
            
            if (link != null) {
                
                // get the link label
                var linkLabel = link.label;
                
                // confirm with the author that they really want to delete the link
                var answer = confirm('Are you sure you want to delete this link?\n\nLabel: ' + linkLabel);
                
                if (answer) {
                    /*
                     * the author is sure they want to delete the link so we
                     * will remove it from the array
                     */
                    links.splice(index, 1);
                    
                    /*
                     * the author has made changes so we will save the component
                     * content
                     */
                    this.authoringViewComponentChanged();
                }
            }
        }
    }
    
    /**
     * Add a node in the authoring tool
     */
    authoringViewAddNode() {
        
        // get a new node id
        var id = this.authoringGetNewConceptMapNodeId();
        
        // create the new node
        var newNode = {};
        newNode.id = id;
        newNode.label = '';
        newNode.fileName = '';
        newNode.width = 100;
        newNode.height = 100;
        
        // get the nodes
        var nodes = this.authoringComponentContent.nodes;
        
        // add the new node
        nodes.push(newNode);
        
        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
    }
    
    /**
     * Add a link in the authoring tool
     */
    authoringViewAddLink() {
        
        // get a new link id
        var id = this.authoringGetNewConceptMapLinkId();
        
        // create a new link
        var newLink = {};
        newLink.id = id;
        newLink.label = '';
        newLink.color = '';
        
        // get the links
        var links = this.authoringComponentContent.links;
        
        // add the new link
        links.push(newLink);
        
        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
    }
    
    /**
     * Get a new ConceptMapNode id that isn't being used
     * @returns a new ConceptMapNode id e.g. 'node3'
     */
    authoringGetNewConceptMapNodeId() {
        
        var nextAvailableNodeIdNumber = 1;
        
        // array to remember the numbers that have been used in node ids already
        var usedNumbers = [];
        
        // loop through all the nodes
        for (var x = 0; x < this.authoringComponentContent.nodes.length; x++) {
            var node = this.authoringComponentContent.nodes[x];
            
            if (node != null) {
                
                // get the node id
                var nodeId = node.id;
                
                if (nodeId != null) {
                    
                    // get the number from the node id
                    var nodeIdNumber = parseInt(nodeId.replace('node', ''));
                    
                    if (nodeIdNumber != null) {
                        // add the number to the array of used numbers
                        usedNumbers.push(nodeIdNumber);
                    }
                }
            }
        }
        
        if (usedNumbers.length > 0) {
            // get the max number used
            var maxNumberUsed = Math.max.apply(Math, usedNumbers);
            
            if (!isNaN(maxNumberUsed)) {
                // increment the number by 1 to get the next available number
                nextAvailableNodeIdNumber = maxNumberUsed + 1;
            }
        }
        
        var newId = 'node' + nextAvailableNodeIdNumber;
        
        return newId;
    }
    
    /**
     * Get a new ConceptMapLink id that isn't being used
     * @returns a new ConceptMapLink id e.g. 'link3'
     */
    authoringGetNewConceptMapLinkId() {
        
        var nextAvailableLinkIdNumber = 1;
        
        // array to remember the numbers that have been used in link ids already
        var usedNumbers = [];
        
        // loop through all the nodes
        for (var x = 0; x < this.authoringComponentContent.links.length; x++) {
            var link = this.authoringComponentContent.links[x];
            
            if (link != null) {
                
                // get the node id
                var nodeId = link.id;
                
                if (nodeId != null) {
                    
                    // get the number from the node id
                    var nodeIdNumber = parseInt(nodeId.replace('link', ''));
                    
                    if (nodeIdNumber != null) {
                        // add the number to the array of used numbers
                        usedNumbers.push(nodeIdNumber);
                    }
                }
            }
        }
        
        if (usedNumbers.length > 0) {
            // get the max number used
            var maxNumberUsed = Math.max.apply(Math, usedNumbers);
            
            if (!isNaN(maxNumberUsed)) {
                // increment the number by 1 to get the next available number
                nextAvailableLinkIdNumber = maxNumberUsed + 1;
            }
        }
        
        var newId = 'link' + nextAvailableLinkIdNumber;
        
        return newId;
    }
    
    /**
     * A "with link" checkbox was checked
     * @param ruleIndex the index of the rule
     */
    authoringRuleLinkCheckboxClicked(ruleIndex) {
        
        // get the rule that was checked
        var rule = this.authoringComponentContent.rules[ruleIndex];
        
        if (rule != null) {
            if (rule.type == 'node') {
                /* 
                 * the rule has been set to 'node' instead of 'link' so we
                 * will remove the link label and other node label
                 */
                
                delete rule.linkLabel;
                delete rule.otherNodeLabel;
            }
        }
        
        // perform updating and saving
        this.authoringViewComponentChanged();
    }
    
    /**
     * Add a new rule
     */
    authoringAddRule() {
        
        // create the new rule
        var newRule = {};
        newRule.name = "";
        newRule.type = "node";
        newRule.category = "";
        newRule.nodeLabel = "";
        newRule.comparison = "exactly";
        newRule.number = 1;
        
        // add the rule to the array of rules
        this.authoringComponentContent.rules.push(newRule);
        
        // perform updating and saving
        this.authoringViewComponentChanged();
    }
    
    /*
     * Delete a rule
     * @param index the index of the rule to delete
     */
    authoringDeleteRule(index) {
        
        // remove the rule at the given index
        this.authoringComponentContent.rules.splice(index, 1);
        
        // perform updating and saving
        this.authoringViewComponentChanged();
    }
    
    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */
    getStepNodeIds() {
        var stepNodeIds = this.ProjectService.getNodeIds();
        
        return stepNodeIds;
    }
    
    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */
    getNodePositionAndTitleByNodeId(nodeId) {
        var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        
        return nodePositionAndTitle;
    }
    
    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */
    getComponentsByNodeId(nodeId) {
        var components = this.ProjectService.getComponentsByNodeId(nodeId);
        
        return components;
    }
    
    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */
    isApplicationNode(nodeId) {
        var result = this.ProjectService.isApplicationNode(nodeId);
        
        return result;
    }

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };

    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    setSaveMessage(message, time) {
        this.saveMessage.text = message;
        this.saveMessage.time = time;
    };
    
    /**
     * Check if CRater is enabled for this component
     * @returns whether CRater is enabled for this component
     */
    isCRaterEnabled() {
        var result = false;
        
        if (this.CRaterService.isCRaterEnabled(this.componentContent)) {
            result = true;
        }
        
        return result;
    }
    
    /**
     * Check if CRater is set to score on save
     * @returns whether CRater is set to score on save
     */
    isCRaterScoreOnSave() {
        var result = false;
        
        if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
            result = true;
        }
        
        return result;
    }
    
    /**
     * Check if CRater is set to score on submit
     * @returns whether CRater is set to score on submit
     */
    isCRaterScoreOnSubmit() {
        var result = false;
        
        if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
            result = true;
        }
        
        return result;
    }
    
    /**
     * Check if CRater is set to score on change
     * @returns whether CRater is set to score on change
     */
    isCRaterScoreOnChange() {
        var result = false;
        
        if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
            result = true;
        }
        
        return result;
    }
    
    /**
     * Check if CRater is set to score when the student exits the step
     * @returns whether CRater is set to score when the student exits the step
     */
    isCRaterScoreOnExit() {
        var result = false;
        
        if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
            result = true;
        }
        
        return result;
    }

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {

        /*
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before the VLE exits.
         */
        exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

        }));
    };
    
    /**
     * A link type was selected in the link type chooser popup
     * @param linkType the authored link object that was selected
     */
    linkTypeSelected(selectedLink) {
        
        if (this.highlightedElement != null && 
            this.highlightedElement.constructor.name == 'ConceptMapLink') {
            
            /*
             * get the ConceptMapLink object that we are setting the link type
             * for
             */
            var link = this.highlightedElement;
            
            // get the label, color, and original id
            var label = selectedLink.label;
            var color = selectedLink.color;
            var originalId = selectedLink.id;
            
            // set the label, color, and original id into the link
            link.setLabel(label);
            link.setColor(color);
            link.setOriginalId(originalId);
        }
        
        // hide the link type chooser
        this.hideLinkTypeChooser();
    }
    
    /**
     * Get the links title
     * @returns the links title
     */
    getLinksTitle() {
        var linksTitle = "";
        
        if (this.componentContent != null) {
            linksTitle = this.componentContent.linksTitle;
        }
        
        return linksTitle;
    }
    
    /**
     * Show the link type chooser popup
     */
    showLinkTypeChooser() {
        
        // check if we have initialized the popup
        if (!this.initializedDisplayLinkTypeChooserModalOverlay) {
            // we have not initialized the popup so we will do so now
            this.setLinkTypeChooserOverlayStyle();
            this.initializedDisplayLinkTypeChooserModalOverlay = true;
        }
        
        /*
         * initialize the top left of the link chooser popup to show up on
         * the top right of the svg element
         */
        var leftNumber = 600;
        var topNumber = 20;
        
        var left = leftNumber + 'px';
        var top = topNumber + 'px';
        
        if (this.mode === 'authoring') {
            /*
             * if we are in authoring mode we need to include the offset of
             * the container for some reason.
             * TODO: figure out why the offset is required in authoring mode
             * but not in student mode.
             */
            
            // get the concept map container
            var conceptMapContainer = angular.element('#conceptMapContainer');
            
            // get the offset of the container relative to the whole page
            var offset = conceptMapContainer.offset();
            
            // get the left and top of the offset
            var offsetLeft = offset.left;
            var offsetTop = offset.top;
            
            // add the offset to the left and top values
            left = leftNumber + offsetLeft + 'px';
            top = topNumber + offsetTop + 'px';
        }
        
        this.linkTypeChooserStyle['top'] = top;
        this.linkTypeChooserStyle['left'] = left;
        
        this.displayLinkTypeChooser = true;
    }
    
    /**
     * Hide the link type chooser popup
     */
    hideLinkTypeChooser() {
        
        // hide the link type chooser
        this.displayLinkTypeChooser = false;
        this.displayLinkTypeChooserModalOverlay = false;
        this.newlyCreatedLink = null;
        
        if (!this.$scope.$$phase) {
            this.$scope.$apply();
        }
    }
    
    /**
     * Setup the svg
     */
    setupSVG() {
        // get the svg1 element in the svg.js world
        this.draw = SVG('svg1');
        this.draw.width(this.width);
        this.draw.height(this.height);
        
        this.highlightedElement = null;
        this.activeNode = null;
        this.activeLink = null;
        this.drawingLink = false;
        this.newlyCreatedLink = null;
        
        // set the mouse down listener
        this.draw.mousedown((event) => {
            this.svgMouseDown(event);
        });
        
        // set the mouse up listener
        this.draw.mouseup((event) => {
            this.svgMouseUp(event);
        });
        
        // set the mouse move listener
        this.draw.mousemove((event) => {
            this.svgMouseMove(event);
        });

        // get the svg1 element in the angular world
        var svg1 = angular.element('#svg1');
        
        /*
         * check if we have already added the dragover listener so we don't
         * add multiple listeners for the same event. adding multiple listeners
         * to the same event may occur in the authoring tool.
         */
        if (!this.addedDragOverListener) {
            /*
             * listen for the dragover event which occurs when the user is
             * dragging a node onto the svg
             */
            svg1[0].addEventListener('dragover', (event) => {
                /*
                 * prevent the default because if we don't, the user won't
                 * be able to drop a new node instance onto the svg in the
                 * authoring mode
                 */
                event.preventDefault();
            });
            
            this.addedDragOverListener = true;
        }
        
        /*
         * check if we have already added the dop listener so we don't
         * add multiple listeners for the same event. adding multiple listeners
         * to the same event may occur in the authoring tool.
         */
        if (!this.addedDropListener) {
            /*
             * listen for the drop event which occurs when the student drops
             * a new node onto the svg
             */
            svg1[0].addEventListener('drop', (event) => {
                
                /*
                 * the user has dropped a new node onto the svg to create a
                 * new instance of a node
                 */
                this.newNodeDropped(event);
            });
            
            this.addedDropListener = true;
        }
        
        // set the link type chooser style
        this.setLinkTypeChooserStyle();
        
        // check if there is a background specified
        if (this.componentContent.background != null) {
            
            if (this.componentContent.stretchBackground) {
                // stretch the background to fit the whole svg element
                this.backgroundSize = '100% 100%';
            } else {
                // use the original dimensions of the background image
                this.backgroundSize = '';
            }
        }
    }
    
    /**
     * Set the link type chooser popup style
     */
    setLinkTypeChooserStyle() {
        
        /*
         * set the link type chooser popup to show up in the upper right of
         * the svg element
         */
        var leftNumber = 600;
        var topNumber = 20;
        
        // get the bounding rectangle of the svg element
        var boundingClientRect = angular.element('#svg1')[0].getBoundingClientRect();
        var offsetLeft = boundingClientRect.left;
        var offsetTop = boundingClientRect.top;
        
        // add the values together to obtain the absolute left and top positions
        var left = leftNumber + offsetLeft + 'px';
        var top = topNumber + offsetTop + 'px';
        
        this.linkTypeChooserStyle = {
            'width': '300px',
            'position': 'absolute',
            'top': top,
            'left': left,
            'border': '1px solid black',
            'backgroundColor': 'white',
            'cursor': 'pointer',
            'z-index': 10000,
            'padding': '16px'
        }
    }
    
    /**
     * Set the link type chooser popup overlay style
     */
    setLinkTypeChooserOverlayStyle() {
        
        // calculate the modal overlay width and height
        this.modalWidth = this.getModalWidth();
        this.modalHeight = this.getModalHeight();
        
        //var overlayWidth = this.modalWidth + 'px';
        var overlayWidth = this.modalWidth;
        
        var conceptMapContainer = angular.element('#conceptMapContainer');
        var width = conceptMapContainer.width();
        var height = conceptMapContainer.height();
        var offset = conceptMapContainer.offset();
        
        var offsetLeft = offset.left;
        var offsetTop = offset.top;
        offsetLeft = 0;
        offsetTop = 0;
        
        this.linkTypeChooserModalOverlayStyle = {
            'position': 'absolute',
            'z-index': 9999,
            'width': overlayWidth,
            'height': height,
            'background-color': '#000000',
            'opacity': 0.4
        }
    }

    /**
     * Get the width that the modal overlay should be
     * @returns the width that the modal overlay should be
     */
    getModalWidth() {
        
        var selectNodeBarWidth = null;
        var svg1Width = null;
        
        // get the width of the left select node bar
        var selectNodeBarWidthString = angular.element(document.getElementById('selectNodeBar')).css('width');
        
        // get the width of the svg element
        var svg1WidthString = angular.element(document.getElementById('svg1')).css('width');
        
        if (selectNodeBarWidthString != null && svg1WidthString != null) {
            // get the integer values
            selectNodeBarWidth = parseInt(selectNodeBarWidthString.replace('px', ''));
            svg1Width = parseInt(svg1WidthString.replace('px', ''));
        }
        
        var overlayWidth = null;
        
        if (selectNodeBarWidth != null && svg1Width != null) {
            // calculate the sum of the widths
            overlayWidth = selectNodeBarWidth + svg1Width;
        }
        
        return overlayWidth;
    }
    
    /**
     * Get the height that the modal overlay should be
     * @returns the height that the modal overlay should be
     */
    getModalHeight() {
        
        var selectNodeBarHeight = null;
        var svg1Height = null;
        
        // get the height of the left select node bar
        var selectNodeBarHeightString = angular.element(document.getElementById('selectNodeBar')).css('height');
        
        // get the height of the svg element
        var svg1HeightString = angular.element(document.getElementById('svg1')).css('height');
        
        if (selectNodeBarHeightString != null && svg1HeightString != null) {
            // get the integer values
            selectNodeBarHeight = parseInt(selectNodeBarHeightString.replace('px', ''));
            svg1Height = parseInt(svg1HeightString.replace('px', ''));
        }
        
        var overlayHeight = null;
        
        if (selectNodeBarHeight != null && svg1Height != null) {
            // get the larger of the two heights
            overlayHeight = Math.max(selectNodeBarHeight, svg1Height);
        }
        
        return overlayHeight;
    }
    
    /**
     * The cancel button on the link type chooser was clicked
     */
    cancelLinkTypeChooser() {
        
        if (this.newlyCreatedLink != null) {
            /*
             * the student has just created this link and has not yet chosen
             * a link type so we will remove the link
             */
            this.newlyCreatedLink.remove();
            this.newlyCreatedLink = null;
        }
        
        // hide the link chooser
        this.hideLinkTypeChooser();
    }
    
    /**
     * Called when the mouse iss clicked down on a blank spot in the svg element
     * @param event the mouse down event
     */
    svgMouseDown(event) {
        if (event.target.tagName == 'svg') {
            // remove highlighting from any item that was previously highlighted
            this.clearHighlightedElement();
        }
    }
    
    /**
     * Called when the mouse is released
     * @param event the mouse up event
     */
    svgMouseUp(event) {
        
        if (this.activeLink != null && this.activeNode == null) {
            /*
             * the student was creating a link but did not connect the link
             * to a destination node so we will just remove the link
             */
            this.activeLink.remove();
        }
        
        // we are no longer drawing a link
        this.drawingLink = false;
        
        // there is no longer an active link
        this.activeLink = null;
        
        // enable node draggin
        this.enableNodeDragging();
        
        // move the nodes to the front so that they are on top of links
        this.moveNodesToFront();
    }
    
    /**
     * Called when the mouse is moved
     * @param event the mouse move event
     */
    svgMouseMove(event) {
        
        if (this.activeLink != null) {
            /*
             * there is an active link which means the student has created a
             * new link and is in the process of choosing the link's destination
             * node
             */
            
            // get the coordinates that the link should be updated to
            var coordinates = this.getRelativeCoordinatesByEvent(event);
            var x1 = null;
            var y1 = null;
            var x2 = coordinates.x;
            var y2 = coordinates.y;
            
            /*
             * get the location of the center of the connector that the link
             * originated from
             */
            var startX = this.activeLinkStartX;
            var startY = this.activeLinkStartY;
            
            /*
             * get the distance from the start to the current position of the
             * mouse
             */
            var distance = this.ConceptMapService.calculateDistance(startX, startY, x2, y2);
            
            /*
             * check if we have set the curvature yet and that the mouse
             * is more than 20 pixels away from the start.
             *
             * we will determine the curvature of the link based upon how
             * the user has dragged the mouse in relation to the center 
             * of the connector. if they start drawing the link horizontally
             * we will create a straight line with no curvature. if they
             * start drawing the link by moving the mouse up, we will create
             * a line that curves up. if they start drawing the link by 
             * moving the mouse down, we will create a line that curves down.
             */
            if (!this.linkCurvatureSet && distance > 20) {
                
                /*
                 * get the slope of the line from the start to the location
                 * of the mouse
                 */
                var slope = Math.abs(this.ConceptMapService.getSlope(startX, startY, x2, y2));
                
                if (y2 < startY) {
                    // the user has moved the mouse above the connector
                    
                    if (slope == null) {
                        /*
                         * the slope is infinite so we will default the 
                         * curvature to 0.5
                         */
                        this.activeLink.curvature = 0.5;
                    } else if (slope < 1.0) {
                        // make the link straight
                        this.activeLink.curvature = 0.0;
                    } else {
                        // make the link curved
                        this.activeLink.curvature = 0.5;
                    }
                    
                    // make the link curve up
                    this.activeLink.startCurveUp = true;
                    this.activeLink.endCurveUp = true;
                } else if (y2 > startY) {
                    // the user has moved the mouse below the connector
                    
                    if (slope == null) {
                        /*
                         * the slope is infinite so we will default the 
                         * curvature to 0.5
                         */
                        this.activeLink.curvature = 0.5;
                    } else if (slope < 1.0) {
                        // make the link straight
                        this.activeLink.curvature = 0.0;
                    } else {
                        // make the link curved
                        this.activeLink.curvature = 0.5;
                    }
                    
                    // make the link curve down
                    this.activeLink.startCurveUp = false;
                    this.activeLink.endCurveUp = false;
                }
                
                // remember that we have set the curvature
                this.linkCurvatureSet = true;
            }
            
            var isDragging = true;
            
            // redraw the link with the new coordinates
            this.activeLink.updateCoordinates(x1, y1, x2, y2, isDragging);
        }
    }
    
    /**
     * Set the active node. This is called when the student places the mouse
     * over a node. When a node becomes active, we show the delete button and
     * the border.
     * @param node the node to make active
     */
    setActiveNode(node) {
        if (node != null) {
            // show the delete button for the node
            node.showDeleteButton();
            
            // show the border for the node
            node.showBorder();
            
            // remember the active node
            this.activeNode = node;
        }
    }
    
    /**
     * Clear the active node
     */
    clearActiveNode() {
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var tempNode = this.nodes[n];
            
            if (tempNode == this.activeNode && tempNode != this.highlightedElement) {
                /*
                 * we have found the node and it is not highlighted so we will
                 * hide the delete button and hide the border
                 */
                tempNode.hideDeleteButton();
                tempNode.hideBorder();
            }
        }
        
        this.activeNode = null;
    }
    
    /**
     * Get the coordinates of the mouse relative to the svg element
     * @param event a mouse event
     * @returns an object containing x and y values
     */
    getRelativeCoordinatesByEvent(event) {
        
        // get the offset of the mouse from its parent
        var offsetX = event.offsetX;
        var offsetY = event.offsetY;
        
        var matrix = null;
        
        if (event.target.tagName == 'svg') {
            // the target is the svg element
            matrix = event.target.getCTM();
        } else if (event.target.tagName == 'circle') {
            /*
             * the target is a node connector circle so we will get the matrix
             * of the node group
             */
            matrix = event.target.parentElement.getCTM();
        } else if (event.target.tagName == 'image') {
            /*
             * the target is a node image so we will get the matrix of the node
             * group
             */
            matrix = event.target.parentElement.getCTM();
        } else {
            /*
             * the target is something else so we will get the matrix of its
             * parent
             */
            matrix = event.target.parentElement.getCTM();
        }
        
        // get the x and y coordinates of the matrix element
        var e = matrix.e;
        var f = matrix.f;
        
        /*
         * add the offset values to the coordinate to get the coordinate
         * relative to the svg element
         */
        var x = e + offsetX;
        var y = f + offsetY;
        
        var returnObject = {}
        returnObject.x = x;
        returnObject.y = y;
        
        return returnObject;
    }
    
    /**
     * Called when the student clicks down on a node in the left node bar
     * @param $event the mouse down event
     * @param node the node the student clicked down on
     */
    selectNode($event, node) {
        
        // remember the selected node
        this.selectedNode = node;
        
        /*
         * remember the offset of the mouse relative to the upper left of the
         * node's image so that we properly calculate the node position when
         * the student releases the mouse to put the node in the svg
         */
        this.tempOffsetX = $event.offsetX;
        this.tempOffsetY = $event.offsetY;
    }
    
    /**
     * The student has dropped a new node on the svg
     * @param event the drop event
     */
    newNodeDropped(event) {
        
        // get the selected node
        var selectedNode = this.selectedNode;
        
        if (selectedNode != null) {
            // get the file name
            var filePath = selectedNode.fileName;
            
            // get the node name
            var label = selectedNode.label;
            
            // get the width and height of the node
            var width = selectedNode.width;
            var height = selectedNode.height;
            
            // get the original authored id
            var originalId = selectedNode.id;
            
            // get the position we should drop the node at
            var x = event.offsetX - this.tempOffsetX;
            var y = event.offsetY - this.tempOffsetY;
            
            // get a new ConceptMapNodeId e.g. 'studentNode3'
            var newConceptMapNodeId = this.getNewConceptMapNodeId();
            
            // create a ConceptMapNode
            var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, newConceptMapNodeId, originalId, filePath, label, x, y, width, height);
            
            // add the node to our array of nodes
            this.addNode(conceptMapNode);
            
            // set the mouse events on the node
            this.setNodeMouseEvents(conceptMapNode);
            
            // make the node highlighted
            this.setHighlightedElement(conceptMapNode);
            
            // handle the student data changing
            this.studentDataChanged();
        }
        
        // enable node dragging
        this.enableNodeDragging();
    }
    
    /**
     * Get a new ConceptMapNode id that isn't being used
     * @returns a new ConceptMapNode id e.g. 'studentNode3'
     */
    getNewConceptMapNodeId() {
        
        var nextAvailableNodeIdNumber = 1;
        
        // array to remember the numbers that have been used in node ids already
        var usedNumbers = [];
        
        // loop through all the nodes
        for (var x = 0; x < this.nodes.length; x++) {
            var node = this.nodes[x];
            
            if (node != null) {
                
                // get the node id
                var nodeId = node.getId();
                
                if (nodeId != null) {
                    
                    // get the number from the node id
                    var nodeIdNumber = parseInt(nodeId.replace('studentNode', ''));
                    
                    if (nodeIdNumber != null) {
                        // add the number to the array of used numbers
                        usedNumbers.push(nodeIdNumber);
                    }
                }
            }
        }
        
        if (usedNumbers.length > 0) {
            // get the max number used
            var maxNumberUsed = Math.max.apply(Math, usedNumbers);
            
            if (!isNaN(maxNumberUsed)) {
                // increment the number by 1 to get the next available number
                nextAvailableNodeIdNumber = maxNumberUsed + 1;
            }
        }
        
        var newId = 'studentNode' + nextAvailableNodeIdNumber;
        
        return newId;
    }
    
    /**
     * Get a new ConceptMapLink id that isn't being used
     * @returns a new ConceptMapLink id e.g. 'studentLink3'
     */
    getNewConceptMapLinkId() {
        
        var nextAvailableLinkIdNumber = 1;
        
        // array to remember the numbers that have been used in link ids already
        var usedNumbers = [];
        
        // loop through all the nodes
        for (var x = 0; x < this.links.length; x++) {
            var link = this.links[x];
            
            if (link != null) {
                
                // get the node id
                var linkId = link.getId();
                
                if (linkId != null) {
                    
                    // get the number from the link id
                    var linkIdNumber = parseInt(linkId.replace('studentLink', ''));
                    
                    if (linkIdNumber != null) {
                        // add the number to the array of used numbers
                        usedNumbers.push(linkIdNumber);
                    }
                }
            }
        }
        
        if (usedNumbers.length > 0) {
            // get the max number used
            var maxNumberUsed = Math.max.apply(Math, usedNumbers);
            
            if (!isNaN(maxNumberUsed)) {
                // increment the number by 1 to get the next available number
                nextAvailableLinkIdNumber = maxNumberUsed + 1;
            }
        }
        
        var newId = 'studentLink' + nextAvailableLinkIdNumber;
        
        return newId;
    }
    
    /**
     * Set the mouse events on a newly created node
     * @param conceptMapNode the node
     */
    setNodeMouseEvents(conceptMapNode) {
        
        // set the node mouse over event
        conceptMapNode.setNodeMouseOver((event) => {
            this.nodeMouseOver(event);
        });
        
        // set the node mouse out event
        conceptMapNode.setNodeMouseOut((event) => {
            this.nodeMouseOut(event);
        });
        
        // set the connector mouse down event
        conceptMapNode.setConnectorMouseDown((event) => {
            this.disableNodeDragging();
            this.connectorMouseDown(event);
        });
        
        // set the node mouse down event
        conceptMapNode.setNodeMouseDown((event) => {
            this.nodeMouseDown(event);
        });
        
        // set the node mouse up event
        conceptMapNode.setNodeMouseUp((event) => {
            this.nodeMouseUp(event);
        });
        
        // set the delete button mouse down event
        conceptMapNode.setDeleteButtonMouseDown((event) => {
            this.nodeDeleteButtonMouseDown(event);
        });
        
        // set the delete button mouse over event
        conceptMapNode.setDeleteButtonMouseOver((event) => {
            this.nodeDeleteButtonMouseOver(event);
        });
        
        // set the delete button mouse out event
        conceptMapNode.setDeleteButtonMouseOut((event) => {
            this.nodeDeleteButtonMouseOut(event);
        });
        
        // set node drag move event
        conceptMapNode.setDragMove((event) => {
            this.nodeDragMove(event);
        });
    }
    
    /**
     * Set an element to be highlighted. The element can be a node or a link.
     * @param element a node or link
     */
    setHighlightedElement(element) {
        
        // remove highlighting from any existing element
        this.clearHighlightedElement();
        
        // hide the link type chooser
        this.hideLinkTypeChooser();
        
        if (element != null) {
            
            // remember the highlighted element
            this.highlightedElement = element;
            
            // set the higlighted value to true for the element
            element.isHighlighted(true);
            
            // show the delete button for the element
            element.showDeleteButton();
            
            if(element.constructor.name == 'ConceptMapNode') {
                // the element is a node
                
                // show the border
                element.showBorder();
            } else if (element.constructor.name == 'ConceptMapLink') {
                // the element is a link
                
                // show the link type chooser
                this.showLinkTypeChooser();
                
                // select the link type that was previously chosen for the link
                this.selectedLinkType = element.getOriginalId();
            }
        }
    }
    
    /**
     * If an element is highlighted, make it no longer highlighted.
     */
    clearHighlightedElement() {
        
        if (this.highlightedElement != null) {
            
            if(this.highlightedElement.constructor.name == 'ConceptMapNode') {
                // the highlighted element is a node
                
                // hide the border
                this.highlightedElement.hideBorder();
            } else if (this.highlightedElement.constructor.name == 'ConceptMapLink') {
                // the element is a link
                
                // hide the link type chooser
                this.hideLinkTypeChooser();
            }
            
            // set the higlighted value to false for the element
            this.highlightedElement.isHighlighted(false);
            
            // hide the delete button
            this.highlightedElement.hideDeleteButton();
            
            // clear the highlighted element reference
            this.highlightedElement = null;
        }
    }
    
    /**
     * Enable node dragging
     */
    enableNodeDragging() {
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            
            if (node != null) {
                
                // get the node group
                var group = node.getGroup();
                
                if (group != null) {
                    
                    /*
                     * get the bounds that we will allow the node group to
                     * dragged in
                     */
                    var options = {
                        minX: 0,
                        minY: 0,
                        maxX: this.width,
                        maxY: this.height
                    };
                    
                    // make the node group draggable
                    group.draggable(options);
                }
            }
        }
    }
    
    /**
     * Disable node dragging. This will be called when the student creates a
     * link so that they aren't dragging nodes around at the same time as 
     * creating a link.
     */
    disableNodeDragging() {
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            
            if (node != null) {
                
                // get a node group
                var group = node.getGroup();
                
                if (group != null) {
                    // make the group not draggable
                    group.draggable(false);
                }
            }
        }
    }
    
    /**
     * Move the nodes to the front so that they show up above links
     */
    moveNodesToFront() {
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var node = this.nodes[n];
            
            if (node != null) {
                
                // get a node group
                var group = node.getGroup();
                
                if (group != null) {
                    // move the node group to the front
                    group.front();
                }
            }
        }
    }
    
    /**
     * Add a node to our array of nodes
     * @param node the node to add
     */
    addNode(node) {
        if (node != null) {
            this.nodes.push(node);
        }
    }
    
    /**
     * Remove a node from the svg and our array of nodes
     * @param node the node to remove
     */
    removeNode(node) {
        
        if (node != null) {
            
            // get the outgoing links from the node
            var outgoingLinks = node.getOutgoingLinks();
            
            if (outgoingLinks != null) {
                
                // get the number of outgoing links
                var numOutgoingLinks = outgoingLinks.length;
                
                // loop until we have removed all the outgoing links
                while (numOutgoingLinks > 0) {
                    // get an outgoing link
                    var outgoingLink = outgoingLinks[0];
                    
                    // remove the link from the svg and from our array of links
                    this.removeLink(outgoingLink);
                    
                    // decrement the number of outgoing links counter
                    numOutgoingLinks--;
                }
            }
            
            // get the incoming links to the node
            var incomingLinks = node.getIncomingLinks();
            
            if (incomingLinks != null) {
                
                // get the number of incoming links
                var numIncomingLinks = incomingLinks.length;
                
                // loop until we have removed all the incoming links
                while (numIncomingLinks > 0) {
                    // get an incoming link
                    var incomingLink = incomingLinks[0];
                    
                    // remove the link from the svg and from our array of links
                    this.removeLink(incomingLink);
                    
                    // decrement the number of incoming links counter
                    numIncomingLinks--;
                }
            }
            
            // remove the node from the svg
            node.remove();
            
            // loop through all the nodes
            for (var n = 0; n < this.nodes.length; n++) {
                var tempNode = this.nodes[n];
                
                if (tempNode == node) {
                    // we have found the node we want to remove
                    this.nodes.splice(n, 1);
                    break;
                }
            }
        }
    }
    
    /**
     * Remove all nodes from the svg and our array of nodes
     */
    removeAllNodes() {
        
        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
            var tempNode = this.nodes[n];
            
            // remove the node from the svg
            tempNode.remove();
        }
        
        // clear the nodes array
        this.nodes = [];
    }
    
    /**
     * Get a node by id.
     * @param id the node id
     * @returns the node with the given id or null
     */
    getNodeById(id) {
        var node = null;
        
        if (id != null) {
            
            // loop through all the nodes
            for (var n = 0; n < this.nodes.length; n++) {
                var tempNode = this.nodes[n];
                var tempNodeId = tempNode.getId();
                
                if (id == tempNodeId) {
                    // we have found the node we want
                    node = tempNode;
                    break;
                }
            }
        }
        
        return node;
    }
    
    /**
     * Get a node by id.
     * @param groupId the svg group id
     * @returns the node with the given id or null
     */
    getNodeByGroupId(groupId) {
        var node = null;
        
        if (groupId != null) {
            
            // loop through all the nodes
            for (var n = 0; n < this.nodes.length; n++) {
                var tempNode = this.nodes[n];
                var tempNodeGroupId = tempNode.getGroupId();
                
                if (groupId == tempNodeGroupId) {
                    // we have found the node we want
                    node = tempNode;
                    break;
                }
            }
        }
        
        return node;
    }
    
    /**
     * Get a link by id.
     * @param id the link id
     * @returns the link with the given id or null
     */
    getLinkById(id) {
        var link = null;
        
        if (id != null) {
            
            // loop through all the links
            for (var l = 0; l < this.links.length; l++) {
                var tempLink = this.links[l];
                var tempLinkId = tempLink.getId();
                
                if (groupId == tempLinkId) {
                    // we have found the link we want
                    link = tempLink;
                    break;
                }
            }
        }
        
        return link;
    }
    
    /**
     * Get a link by group id.
     * @param groupId the svg group id
     * @returns the link with the given group id or null
     */
    getLinkByGroupId(groupId) {
        var link = null;
        
        if (groupId != null) {
            
            // loop through all the links
            for (var l = 0; l < this.links.length; l++) {
                var tempLink = this.links[l];
                var tempLinkGroupId = tempLink.getGroupId();
                
                if (groupId == tempLinkGroupId) {
                    // we have found the link we want
                    link = tempLink;
                    break;
                }
            }
        }
        
        return link;
    }
    
    /**
     * Get a node by its connector id.
     * @param connectorId the svg circle id of the connector
     * @returns the node with the associated connector or null
     */
    getNodeByConnectorId(connectorId) {
        var node = null;
        
        if (connectorId != null) {
            
            // loop through all the nodes
            for (var n = 0; n < this.nodes.length; n++) {
                var tempNode = this.nodes[n];
                
                // get the connector id
                var tempConnectorId = tempNode.getConnectorId();
                
                if (connectorId == tempConnectorId) {
                    // we have found the node we want
                    node = tempNode;
                    break;
                }
            }
        }
        
        return node;
    }
    
    /**
     * Remove a node by id. The id of a node is the same as its svg group id.
     * @param groupId 
     */
    removeNodeById(groupId) {
        if (groupId != null) {
            
            // loop through all the nodse
            for (var n = 0; n < this.nodes.length; n++) {
                var tempNode = this.nodes[n];
                var tempNodeId = tempNode.getId();
                
                if (groupId == tempNodeId) {
                    // we have found the node we want to remove
                    this.nodes.splice(n, 1);
                    break;
                }
            }
        }
    }
    
    /**
     * Add a link to our array of links
     * @param link the link to add
     */
    addLink(link) {
        if (link != null) {
            this.links.push(link);
        }
    }
    
    /**
     * Remove a link from the svg and our array of links
     * @param link the link to remove
     */
    removeLink(link) {
        
        if (link != null) {
            
            // remove the link from the svg
            link.remove();
            
            // loop through all the links
            for (var l = 0; l < this.links.length; l++) {
                var tempLink = this.links[l];
                
                if (link == tempLink) {
                    // we have found the link we want to remove
                    this.links.splice(l, 1);
                    break;
                }
            }
        }
    }
    
    /**
     * Remove all the links from the svg and from our array of links
     */
    removeAllLinks() {
        
        // loop through all the links
        for (var l = 0; l < this.links.length; l++) {
            var tempLink = this.links[l];
            
            // remove the link from the svg
            tempLink.remove();
        }
        
        // clear the links array
        this.links = [];
    }
    
    /**
     * Called when the mouse moves over a node
     * @param event the mouse over event
     */
    nodeMouseOver(event) {
        
        // get the node group id
        var groupId = event.target.parentElement.id;
        
        if (groupId != null) {
            
            // get the node
            var node = this.getNodeByGroupId(groupId);
            
            if (node != null) {
                /*
                 * make the node active so that the border and delete button
                 * shows
                 */
                this.setActiveNode(node);
            }
        }
    }
    
    /**
     * Called when the mouse moves out of a node
     * @param event the mouse out event
     */
    nodeMouseOut(event) {
        
        // get the group id of the node
        var groupId = event.target.parentElement.id;
        
        if (groupId != null) {
            
            // get the node
            var node = this.getNodeByGroupId(groupId);
            
            if (node != null) {
                // make the node inactive by clearing the active node
                this.clearActiveNode();
            }
        }
    }
    
    /**
     * Called when the mouse is clicked down on a node
     * @param event the mouse down event
     */
    nodeMouseDown(event) {
        
        if (event.target.parentElement != null) {
            
            // get the group id of the node
            var groupId = event.target.parentElement.id;
            
            if (groupId != null) {
                
                // get the node
                var node = this.getNodeByGroupId(groupId);
                
                if (node != null) {
                    // make the node highlighted
                    this.setHighlightedElement(node);
                }
            }
        }
    }
    
    /**
     * Called when the mouse is released on a node
     * @param event the mouse up event
     */
    nodeMouseUp(event) {
        
        if (this.drawingLink && this.activeLink != null) {
            /*
             * the student is creating a link and has just released the mouse
             * over a node to connect the destination node of the link
             */
            
            // get the group id of the node
            var groupId = event.target.parentElement.id;
            
            if (groupId != null) {
                
                // get the node
                var node = this.getNodeByGroupId(groupId);
                
                if (node != null) {
                    
                    // get the source node of the link
                    var sourceNode = this.activeLink.sourceNode;
                    var sourceNodeGroupId = sourceNode.getGroupId();
                    
                    if (sourceNodeGroupId == groupId) {
                        /* 
                         * if the source of the link is the same as the 
                         * destination node, we will not connect the link
                         */
                        this.activeLink.remove();
                        this.activeLink = null;
                    } else {
                        /*
                         * the source node is different than the destination
                         * node so we will connect the link
                         */
                        
                        // set the destination node of the link
                        this.activeLink.setDestination(node);
                        
                        // make the link the active link
                        this.addLink(this.activeLink);
                        
                        // highlight the link
                        this.setHighlightedElement(this.activeLink);
                        
                        /*
                         * set the link as a newly created link so that if the
                         * student clicks the cancel button, we will remove
                         * the link
                         */
                        this.newlyCreatedLink = this.activeLink;
                        
                        // display the modal overlay
                        this.displayLinkTypeChooserModalOverlay = true;
                        
                        // handle the student data changing
                        this.studentDataChanged();
                    }
                }
            }
        }
        
        // the link has been connected so we are no longer drawing the link
        this.drawingLink = false;
    }
    
    /**
     * Called when a link delete button is clicked
     * @param event the mouse click event
     * @param link the link to delete
     */
    linkDeleteButtonClicked(event, link) {
        
        if (link != null) {
            
            // remove the link from our array of links
            this.removeLink(link);
            
            // handle the student data changing
            this.studentDataChanged();
        }
        
        // hide the link type chooser
        this.hideLinkTypeChooser();
    }
    
    /**
     * Called when the mouse is clicked down on a connector. This will start
     * creating a link.
     * @param event the mouse down event
     */
    connectorMouseDown(event) {
        
        // set the flag that we are drawing a link
        this.drawingLink = true;
        
        // get the connector (the svg circle)
        var connector = event.target;
        
        /*
         * disable node dragging so that the node isn't dragged when the
         * link head is being dragged
         */
        this.disableNodeDragging();
        
        // get the node
        var node = this.getNodeByConnectorId(connector.id);
        
        // get the center of the image
        var x = node.cx();
        var y = node.cy();
        
        // get a new ConceptMapLinkId e.g. 'studentLink3'
        var newConceptMapLinkId = this.getNewConceptMapLinkId();
        
        /*
         * we will not know what the original id is until the student has
         * selected a link type
         */
        var originalId = null;
        
        // create a link that comes out of the node
        var link = this.ConceptMapService.newConceptMapLink(this.draw, newConceptMapLinkId, originalId, node);
        
        // set the link mouse events
        this.setLinkMouseEvents(link);
        
        // remember the active link
        this.activeLink = link;
        
        // flag for determining if we have set the link curvature
        this.linkCurvatureSet = false;
        
        // remember the location of the center of the connector
        this.activeLinkStartX = node.connectorCX();
        this.activeLinkStartY = node.connectorCY();
        
        // highlight the link
        this.setHighlightedElement(link);
        
        // clear the active node
        this.clearActiveNode();
        
        // make the source node the active node
        this.setActiveNode(node);
    }
    
    /**
     * Set the link mouse events for a link
     * @param link the ConceptMapLink
     */
    setLinkMouseEvents(link) {
        
        // set the link mouse down listener
        link.setLinkMouseDown((event) => {
            this.linkMouseDown(event);
        });
        
        // set the link mouse over listener
        link.setLinkMouseOver((event) => {
            this.linkMouseOver(event);
        });
        
        // set the link mouse out listener
        link.setLinkMouseOut((event) => {
            this.linkMouseOut(event);
        });
        
        // set the delete button clicked event for the link
        link.setDeleteButtonClicked((event) => {
            this.linkDeleteButtonClicked(event, link);
        });
    }
    
    /**
     * Called when the mouse is clicked down on a link
     * @param event the mouse down event
     */
    linkMouseDown(event) {
        
        // get the group id
        var groupId = this.getGroupId(event.target);
        
        // get the link
        var link = this.getLinkByGroupId(groupId);
        
        if (link != null) {
            // make the link highlighted
            this.setHighlightedElement(link);
        }
    }
    
    /**
     * Called when the mouse is over a link
     * @param event the mouse over event
     */
    linkMouseOver(event) {
        
        // get the group id
        var groupId = this.getGroupId(event.target);
        
        // get the link
        var link = this.getLinkByGroupId(groupId);
        
        if (link != null) {
            // show the delete button for the link
            link.showDeleteButton();
        }
    }
    
    /**
     * Called when the mouse moves out of a link
     * @param event the mouse out event
     */
    linkMouseOut(event) {
        
        // get the group id
        var groupId = this.getGroupId(event.target);
        
        // get the link
        var link = this.getLinkByGroupId(groupId);
        
        // hide the delete button if the link is not the highlighted link
        if (link != null && link != this.highlightedElement) {
            link.hideDeleteButton();
        }
    }
    
    /**
     * Called when the mouse is clicked down on the delete button of a node
     * @param event the mouse down event
     */
    nodeDeleteButtonMouseDown(event) {
        
        if (event.target.parentElement != null) {
            
            // get the group id
            var groupId = event.target.parentElement.parentElement.id;
            
            // get the node
            var node = this.getNodeByGroupId(groupId);
            
            if (node != null) {
                
                // remove the node from our array of nodes
                this.removeNode(node);
                
                // handle the student data changing
                this.studentDataChanged();
            }
        }
    }
    
    /**
     * Called when the mouse is over a node delete button
     * @param event the mouse over event
     */
    nodeDeleteButtonMouseOver(event) {
        
        // get the node group id
        var groupId = event.target.parentElement.parentElement.id;
        
        if (groupId != null) {
            
            // get the node
            var node = this.getNodeByGroupId(groupId);
            
            if (node != null) {
                /*
                 * make the node active so that the border and delete button
                 * shows
                 */
                this.setActiveNode(node);
            }
        }
    }
    
    /**
     * Called when the mouse moves out of a node delete button
     * @param event the mouse over event
     */
    nodeDeleteButtonMouseOut(event) {
        
        // get the group id
        var groupId = event.target.parentElement.parentElement.id;
        
        // get the node
        var node = this.getNodeByGroupId(groupId);
        
        if (node != null) {
            // make the node inactive by clearing the active node
            this.clearActiveNode(node);
        }
    }
    
    /**
     * Called when the node is dragged
     * @param event the drag event
     */
    nodeDragMove(event) {
        
        // get the group id
        var groupId = event.target.id;
        
        // get the node
        var node = this.getNodeByGroupId(groupId);
        
        if (node != null) {
            // handle the node being dragged
            node.dragMove(event);
        }
        
        // handle the student data changing
        this.studentDataChanged();
    }
    
    /**
     * Get the group id of an element. All elements of a node or link are
     * contained in a group. These groups are the children of the main svg
     * element.
     * for example a node's image element will be located here
     * svg > group > image
     * for example a link's path element will be located here
     * svg > group > path
     * 
     * @param element get the group id of this element
     * @returns the group id
     */
    getGroupId(element) {
        
        var groupId = null;
        var currentElement = element;
        var previousId = null;
        
        // loop until we have reached the svg element
        while (currentElement != null) {
            
            if (currentElement.tagName == 'svg') {
                // base case. we have found the svg element.
                
                // the group id will be the previous id we saw
                groupId = previousId;
                
                // set the current element to null so that the while loop ends
                currentElement = null;
            } else {
                // remember the element id
                previousId = currentElement.id;
                
                /*
                 * set the current element to the parent to continue searching
                 * up the hierarchy
                 */
                currentElement = currentElement.parentElement;
            }
        }
        
        return groupId;
    }
    
    /**
     * Save the starter concept map
     */
    saveStarterConceptMap() {
        
        // get the concept map data
        var conceptMapData = this.getConceptMapData();
        
        // set the starter concept map data
        this.authoringComponentContent.starterConceptMap = conceptMapData;
        
        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
    }
    
    /**
     * Delete the starter concept map
     */
    deleteStarterConceptMap() {
        
        // set the starter concept map data
        this.authoringComponentContent.starterConceptMap = null;
        
        // clear the concept map
        this.clearConceptMap();
        
        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
    }
    
    /**
     * Remove all the links and nodes
     */
    clearConceptMap() {
        
        // remove all the links from the svg and the array of links
        this.removeAllLinks();
        
        // remove all the nodes from the svg and the array of nodes
        this.removeAllNodes();
    }
    
    /**
     * Check the student concept map against the custom rule evaluator
     */
    checkAnswer() {
        
        // get the custom rule evaluator code that was authored
        var customRuleEvaluator = this.componentContent.customRuleEvaluator;
        
        // get the component content
        var componentContent = this.componentContent;
        
        // get the student concept map
        var conceptMapData = this.getConceptMapData();
        
        var thisConceptMapService = this.ConceptMapService;
        
        // the result will be stored in this variable
        var thisResult = {};
        
        /*
         * create the any function that can be called in the custom rule 
         * evaluator code. the arguments to the any function are rule names.
         * for example if we are looking for any of the links below 
         * Sun (Infrared Radiation) Space
         * Sun (Heat) Space
         * Sun (Solar Radiation) Space
         * we will call the any function like this
         * any("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
         * these dynamic arguments will be placed in the arguments variable
         */
        var any = function() {
            return thisConceptMapService.any(componentContent, conceptMapData, arguments);
        };

        /*
         * create the all function that can be called in the custom rule 
         * evaluator code. the arguments to the all function are rule names.
         * for example if we are looking for all of the links below
         * Sun (Infrared Radiation) Space
         * Sun (Heat) Space
         * Sun (Solar Radiation) Space
         * we will call the any function like this
         * all("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
         * these dynamic arguments will be placed in the arguments variable
         */
        var all = function() {
            return thisConceptMapService.all(componentContent, conceptMapData, arguments);
        }
        
        /*
         * create the setResult function that can be called in the custom rule 
         * evaluator code
         */
        var setResult = function(result) {
            thisResult = result;
        }
        
        // run the custom rule evaluator
        eval(customRuleEvaluator);
        
        //console.log("thisResult.score=" + thisResult.score);
        //console.log("thisResult.feedback=" + thisResult.feedback);
        var resultString = "";
        
        if (thisResult.score != null) {
            // display the score
            resultString += "Score: " + thisResult.score;
        }
        
        if (thisResult.feedback != null) {
            if (resultString != "") {
                // add a new line if the result string is not empty
                resultString += "\n";
            }
            
            // display the feedback
            resultString += "Feedback: " + thisResult.feedback;
        }
        
        // show the result to the student
        alert(resultString);
    }
};

ConceptMapController.$inject = [
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'ConceptMapService',
    'ConfigService',
    'CRaterService',
    'NodeService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService'
];

export default ConceptMapController;

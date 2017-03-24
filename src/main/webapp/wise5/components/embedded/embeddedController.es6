import iframeResizer from 'iframe-resizer';
import html2canvas from 'html2canvas';

class EmbeddedController {
    constructor($filter,
                $injector,
                $mdDialog,
                $q,
                $rootScope,
                $scope,
                $sce,
                $window,
                AnnotationService,
                ConfigService,
                NodeService,
                NotebookService,
                EmbeddedService,
                ProjectService,
                StudentDataService,
                UtilService) {

        this.$filter = $filter;
        this.$injector = $injector;
        this.$mdDialog = $mdDialog;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$sce = $sce;
        this.$window = $window;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.EmbeddedService = EmbeddedService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.idToOrder = this.ProjectService.idToOrder;

        this.$translate = this.$filter('translate');

        // the node id of the current node
        this.nodeId = null;

        // the component id
        this.componentId = null;

        // field that will hold the component content
        this.componentContent = null;

        // field that will hold the authoring component content
        this.authoringComponentContent = null;

        // field that will hold the component type
        this.componentType = null;

        // the url to the web page to display
        this.url = null;

        // the width of the iframe (optional)
        this.width = null;

        // the height of the iframe (optional)
        this.height = null;

        // the max width of the iframe
        this.maxWidth = null;

        // the max height of the iframe
        this.maxHeight = null;

        // whether we have data to save
        this.isDirty = false;

        // whether the student work has changed since last submit
        this.isSubmitDirty = false;

        // whether the snip model button is shown or not
        this.isSnipModelButtonVisible = true;

        // the label for the notebook in thos project
        this.notebookConfig = this.NotebookService.getNotebookConfig();

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // the latest annotations
        this.latestAnnotations = null;

        // variable to store component states (from application)
        this.componentState = null;

        // the id of the embedded application's iframe
        this.embeddedApplicationIFrameId = '';

        // whether the save button is shown or not
        this.isSaveButtonVisible = false;

        // whether the submit button is shown or not
        this.isSubmitButtonVisible = false;

        // flag for whether to show the advanced authoring
        this.showAdvancedAuthoring = false;

        // whether the JSON authoring is displayed
        this.showJSONAuthoring = false;

        this.messageEventListener = angular.bind(this, function(messageEvent) {
            // handle messages received from iframe
            var messageEventData = messageEvent.data;
            if (messageEventData.messageType === "event") {
                // save event to WISE
                var nodeId = this.nodeId;
                var componentId = this.componentId;
                var componentType = this.componentType;
                var category = messageEventData.eventCategory;
                var event = messageEventData.event;
                var eventData = messageEventData.eventData;

                // save notebook open/close event
                this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
            } else if (messageEventData.messageType === "studentWork") {
                // save student work to WISE
                // create a new component state
                this.componentState = this.NodeService.createNewComponentState();

                // set the student data into the component state
                this.componentState.studentData = messageEventData.studentData;

                this.componentState.isSubmit = false;
                if (messageEventData.isSubmit) {
                    this.componentState.isSubmit = messageEventData.isSubmit;
                }

                this.componentState.isAutoSave = false;
                if (messageEventData.isAutoSave) {
                    this.componentState.isAutoSave = messageEventData.isAutoSave;
                }

                this.isDirty = true;

                // the student data in the model has changed
                this.studentDataChanged(messageEventData.studentData);

                // tell the parent node that this component wants to save
                this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
            } else if (messageEventData.messageType === "applicationInitialized") {
                // application has finished loading, so send latest component state to application
                this.sendLatestWorkToApplication();
                this.processLatestSubmit();

                // activate iframe-resizer on the embedded app's iframe
                $('#' + this.embeddedApplicationIFrameId).iFrameResize({scrolling: true});
            } else if (messageEventData.messageType === "componentDirty") {
                let isDirty = messageEventData.isDirty;

                // set component dirty to true/false and notify node
                this.isDirty = isDirty;
                this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: isDirty});
            } else if (messageEventData.messageType === "componentSubmitDirty") {
                let isSubmitDirty = messageEventData.isDirty;

                // set component submit dirty to true/false and notify node
                this.isSubmitDirty = isSubmitDirty;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: isDirty});
            } else if (messageEventData.messageType === "studentDataChanged") {
                this.studentDataChanged(messageEventData.studentData);
            } else if (messageEventData.messageType === "getStudentWork") {
                // the embedded application is requesting the student work

                // the params for getting the student work
                var getStudentWorkParams = messageEventData.getStudentWorkParams;

                // get the student work
                var studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);

                var message = studentWork;
                message.messageType = 'studentWork';
                message.getStudentWorkParams = getStudentWorkParams;

                // send the student work to the embedded application
                this.sendMessageToApplication(message);
            } else if (messageEventData.messageType === "getLatestStudentWork") {
                // the embedded application is requesting the student work

                // get the latest student work
                var latestComponentState = this.getLatestStudentWork();

                var message = {};
                message.messageType = 'latestStudentWork';
                message.latestStudentWork = latestComponentState;

                // send the student work to the embedded application
                this.sendMessageToApplication(message);
            }
        });

        // listen for message events from embedded iframe application
        this.$window.addEventListener('message', this.messageEventListener);

        // the options for when to update this component from a connected component
        this.connectedComponentUpdateOnOptions = [
            {
                value: 'change',
                text: 'Change'
            },
            {
                value: 'submit',
                text: 'Submit'
            }
        ];

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

            // id of the iframe that embeds the application
            this.embeddedApplicationIFrameId = "componentApp_" + this.componentId;

            this.componentType = this.componentContent.type;

            if (this.mode === 'student') {
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                this.isSnipModelButtonVisible = true;
            } else if (this.mode === 'authoring') {
                // generate the summernote rubric element id
                this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

                // set the component rubric into the summernote rubric
                this.summernoteRubricHTML = this.componentContent.rubric;

                // the tooltip text for the insert WISE asset button
                var insertAssetString = this.$translate('INSERT_ASSET');

                /*
                 * create the custom button for inserting WISE assets into
                 * summernote
                 */
                var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

                /*
                 * the options that specifies the tools to display in the
                 * summernote prompt
                 */
                this.summernoteRubricOptions = {
                    toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['fontsize', ['fontsize']],
                        ['color', ['color']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['link', 'video']],
                        ['view', ['fullscreen', 'codeview', 'help']],
                        ['customButton', ['insertAssetButton']]
                    ],
                    height: 300,
                    disableDragAndDrop: true,
                    buttons: {
                        insertAssetButton: InsertAssetButton
                    }
                };

                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);

                    this.isSaveButtonVisible = this.componentContent.showSaveButton;
                    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

                    // get the width
                    this.width = this.componentContent.width ? this.componentContent.width : '100%';

                    // get the height
                    this.height = this.componentContent.height ? this.componentContent.height : '100%';
                    
                    this.setURL(this.componentContent.url);
                }.bind(this), true);
            } else if (this.mode === 'grading') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;

                // get the latest annotations
                this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
            } else if (this.mode === 'onlyShowWork') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;
            } else if (this.mode === 'showPreviousWork') {
                this.isSaveButtonVisible = false;
                this.isSubmitButtonVisible = false;
                this.isSnipModelButtonVisible = false;
            }

            if (this.componentContent != null) {
                // set the url
                this.setURL(this.componentContent.url);
            }

            // get the width
            this.width = this.componentContent.width ? this.componentContent.width : '100%';

            // get the height
            this.height = this.componentContent.height ? this.componentContent.height : '100%';

            if (this.$scope.$parent.nodeController != null) {
                // register this component with the parent node
                this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
            }
        }

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', (event, args) => {

            // get the node id of the node
            var nodeId = args.nodeId;

            // make sure the node id matches our parent node
            if (this.nodeId === nodeId) {
                this.isSubmit = true;
            }
        });

        this.$scope.$on('studentWorkSavedToServer', (event, args) => {

            var componentState = args.studentWork;

            if (componentState != null) {
                if (componentState.componentId === this.componentId) {
                    // a component state for this component was saved

                    // set isDirty to false because the component state was just saved and notify node
                    this.isDirty = false;
                    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

                    // clear out current componentState
                    this.$scope.embeddedController.componentState = null;

                    let isAutoSave = componentState.isAutoSave;
                    let isSubmit = componentState.isSubmit;
                    let serverSaveTime = componentState.serverSaveTime;
                    let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                    // set save message
                    if (isSubmit) {
                        this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

                        this.submit();

                        // set isSubmitDirty to false because the component state was just submitted and notify node
                        this.isSubmitDirty = false;
                        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                    } else if (isAutoSave) {
                        this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
                    } else {
                        this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
                    }

                    // clear out componentState
                    this.componentState = {};
                }
            }

            // the params for getting the student work to be sent to the model
            var getStudentWorkParams = {};
            getStudentWorkParams.getLatestStudentWorkFromThisComponent = true;
            getStudentWorkParams.getLatestStudentWorkFromThisNode = true;

            // get the student work
            var studentWork = this.getStudentWork(getStudentWorkParams);

            var message = studentWork;
            message.messageType = 'studentWork';

            // send the student work to the embedded application
            this.sendMessageToApplication(message);
        });

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
                if (this.$scope.embeddedController.isSubmitDirty) {
                    getState = true;
                    action = 'submit';
                }
            } else {
                if (this.$scope.embeddedController.isDirty) {
                    getState = true;
                    action = 'save';
                }
            }

            if (getState) {
                // create a component state populated with the student data
                this.$scope.embeddedController.createComponentState(action).then((componentState) => {
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
                        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
                    }
                }
            }
        });


        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
            // unregister messageEventListener
            this.$window.removeEventListener('message', this.messageEventListener);
        }));

        /*
         * Listen for the assetSelected event which occurs when the user
         * selects an asset from the choose asset popup
         */
        this.$scope.$on('assetSelected', (event, args) => {

            if (args != null) {

                // make sure the event was fired for this component
                if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
                    // the asset was selected for this component
                    var assetItem = args.assetItem;

                    if (assetItem != null) {
                        var fileName = assetItem.fileName;

                        if (fileName != null) {
                            /*
                             * get the assets directory path
                             * e.g.
                             * /wise/curriculum/3/
                             */
                            var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
                            var fullAssetPath = assetsDirectoryPath + '/' + fileName;

                            var summernoteId = '';

                            if (args.target == 'prompt') {
                                // the target is the summernote prompt element
                                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
                            } else if (args.target == 'rubric') {
                                // the target is the summernote rubric element
                                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
                            }

                            if (summernoteId != '') {
                                if (this.UtilService.isImage(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // add the image html
                                    $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                                } else if (this.UtilService.isVideo(fileName)) {
                                    /*
                                     * move the cursor back to its position when the asset chooser
                                     * popup was clicked
                                     */
                                    $('#' + summernoteId).summernote('editor.restoreRange');
                                    $('#' + summernoteId).summernote('editor.focus');

                                    // insert the video element
                                    var videoElement = document.createElement('video');
                                    videoElement.controls = 'true';
                                    videoElement.innerHTML = "<source ng-src='" + fullAssetPath + "' type='video/mp4'>";
                                    $('#' + summernoteId).summernote('insertNode', videoElement);
                                }
                            }
                        }
                    }
                }
            }

            // close the popup
            this.$mdDialog.hide();
        });
    }

    /**
     * Check if latest component state is a submission and if not, set isSubmitDirty to true
     */
    processLatestSubmit() {
        let latestState = this.$scope.componentState;

        if (latestState) {
            let serverSaveTime = latestState.serverSaveTime;
            let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
            if (latestState.isSubmit) {
                // latest state is a submission, so set isSubmitDirty to false and notify node
                this.isSubmitDirty = false;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
                // set save message
                this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
            }
        }
    };

    /**
     * Set the url
     * @param url the url
     */
    setURL(url) {
        if (url != null) {
            var trustedURL = this.$sce.trustAsResourceUrl(url);
            this.url = trustedURL;
        }
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
    studentDataChanged(data) {

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

        // remember the student data
        this.studentData = data;

        // create a component state populated with the student data
        this.createComponentState(action).then((componentState) => {
            this.$scope.$emit('componentStudentDataChanged', {componentId: componentId, componentState: componentState});
        });
    };

    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    createComponentState(action) {

        // create a new component state
        var componentState = this.NodeService.createNewComponentState();

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
        componentState.studentData = this.studentData;

        var deferred = this.$q.defer();

        /*
         * perform any additional processing that is required before returning
         * the component state
         */
        this.createComponentStateAdditionalProcessing(deferred, componentState, action);

        return deferred.promise;
    };

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
        /*
         * we don't need to perform any additional processing so we can resolve
         * the promise immediately
         */
        deferred.resolve(componentState);
    }

    sendLatestWorkToApplication() {
        // get the latest component state from the scope
        var message = {
            messageType: "componentState",
            componentState: this.$scope.componentState
        };

        // send the latest component state to embedded application
        this.sendMessageToApplication(message);
    };

    sendMessageToApplication(message) {
        // send the message to embedded application via postMessage
        window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.postMessage(message, "*")
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
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
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
            this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
        } catch(e) {
            this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
        }
    };

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    updateAdvancedAuthoringView() {
        this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    };

    /**
     * Snip the model by converting it to an image
     * @param $event the click event
     */
    snipModel($event) {

        // get the iframe
        var iframe = $('#componentApp_' + this.componentId);

        if (iframe != null && iframe.length > 0) {

            //get the html from the iframe
            var modelElement = iframe.contents().find('html');

            if (modelElement != null && modelElement.length > 0) {
                modelElement = modelElement[0];

                // convert the model element to a canvas element
                html2canvas(modelElement).then((canvas) => {

                    // get the canvas as a base64 string
                    var img_b64 = canvas.toDataURL('image/png');

                    // get the image object
                    var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

                    // create a notebook item with the image populated into it
                    this.NotebookService.addNewItem($event, imageObject);
                });
            }
        }
    }

    /**
     * Check whether we need to show the snip model button
     * @return whether to show the snip model button
     */
    showSnipModelButton() {
        if (this.NotebookService.isNotebookEnabled() && this.isSnipModelButtonVisible) {
            return true;
        } else {
            return false;
        }
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
        this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

        }));
    };

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
     * The show previous work checkbox was clicked
     */
    authoringShowPreviousWorkClicked() {

        if (!this.authoringComponentContent.showPreviousWork) {
            /*
             * show previous work has been turned off so we will clear the
             * show previous work node id, show previous work component id, and
             * show previous work prompt values
             */
            this.authoringComponentContent.showPreviousWorkNodeId = null;
            this.authoringComponentContent.showPreviousWorkComponentId = null;
            this.authoringComponentContent.showPreviousWorkPrompt = null;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }

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
     * The show previous work component id has changed
     */
    authoringShowPreviousWorkComponentIdChanged() {

        // get the show previous work node id
        var showPreviousWorkNodeId = this.authoringComponentContent.showPreviousWorkNodeId;

        // get the show previous work prompt boolean value
        var showPreviousWorkPrompt = this.authoringComponentContent.showPreviousWorkPrompt;

        // get the old show previous work component id
        var oldShowPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

        // get the new show previous work component id
        var newShowPreviousWorkComponentId = this.authoringComponentContent.showPreviousWorkComponentId;

        // get the new show previous work component
        var newShowPreviousWorkComponent = this.ProjectService.getComponentByNodeIdAndComponentId(showPreviousWorkNodeId, newShowPreviousWorkComponentId);

        if (newShowPreviousWorkComponent == null || newShowPreviousWorkComponent == '') {
            // the new show previous work component is empty

            // save the component
            this.authoringViewComponentChanged();
        } else if (newShowPreviousWorkComponent != null) {

            // get the current component type
            var currentComponentType = this.componentContent.type;

            // get the new component type
            var newComponentType = newShowPreviousWorkComponent.type;

            // check if the component types are different
            if (newComponentType != currentComponentType) {
                /*
                 * the component types are different so we will need to change
                 * the whole component
                 */

                // make sure the author really wants to change the component type
                var answer = confirm(this.$translate('ARE_YOU_SURE_YOU_WANT_TO_CHANGE_THIS_COMPONENT_TYPE'));

                if (answer) {
                    // the author wants to change the component type

                    /*
                     * get the component service so we can make a new instance
                     * of the component
                     */
                    var componentService = this.$injector.get(newComponentType + 'Service');

                    if (componentService != null) {

                        // create a new component
                        var newComponent = componentService.createComponent();

                        // set move over the values we need to keep
                        newComponent.id = this.authoringComponentContent.id;
                        newComponent.showPreviousWork = true;
                        newComponent.showPreviousWorkNodeId = showPreviousWorkNodeId;
                        newComponent.showPreviousWorkComponentId = newShowPreviousWorkComponentId;
                        newComponent.showPreviousWorkPrompt = showPreviousWorkPrompt;

                        /*
                         * update the authoring component content JSON string to
                         * change the component
                         */
                        this.authoringComponentContentJSONString = JSON.stringify(newComponent);

                        // update the component in the project and save the project
                        this.advancedAuthoringViewComponentChanged();
                    }
                } else {
                    /*
                     * the author does not want to change the component type so
                     * we will rollback the showPreviousWorkComponentId value
                     */
                    this.authoringComponentContent.showPreviousWorkComponentId = oldShowPreviousWorkComponentId;
                }
            } else {
                /*
                 * the component types are the same so we do not need to change
                 * the component type and can just save
                 */
                this.authoringViewComponentChanged();
            }
        }
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */
    componentHasWork(component) {
        var result = true;

        if (component != null) {
            result = this.ProjectService.componentHasWork(component);
        }

        return result;
    }

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
    }

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

    /**
     * Get the latest component state from this component
     * @return the latest component state
     */
    getLatestStudentWork() {

        // get the latest component state from this component
        var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

        return latestComponentState;
    }

    /**
     * Get the student work from the specified components/nodes
     * @param params the params for getting the student work
     * @return an object containing other objects that contain work from the
     * specified components/nodes
     */
    getStudentWork(params) {

        var studentWork = {};

        if (params != null && params.getLatestStudentWorkFromThisComponent) {
            // get the latest student work from this component
            studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        }

        if (params != null && params.getAllStudentWorkFromThisComponent) {
            // get all the student work from this component
            studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        }

        if (params != null && params.getLatestStudentWorkFromThisNode) {
            // get the latest student work from the components in this node
            studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
        }

        if (params != null && params.getAllStudentWorkFromThisNode) {
            // get all the student work from the components in this node
            studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(this.nodeId);
        }

        if (params != null && params.getLatestStudentWorkFromOtherComponents) {
            // get the latest student work from other specified components

            // an array of objects that contain a nodeId and component Id
            var otherComponents = params.otherComponents;

            var latestStudentWorkFromOtherComponents = [];

            if (otherComponents != null) {

                // loop through all the components we need to get work from
                for (var c = 0; c < otherComponents.length; c++) {
                    var otherComponent = otherComponents[c];

                    if (otherComponent != null) {

                        // get the node id and component id
                        var tempNodeId = otherComponent.nodeId;
                        var tempComponentId = otherComponent.componentId;

                        if (tempNodeId != null && tempComponentId != null) {

                            // get the latest component state for the given component
                            var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);

                            if (tempComponentState != null) {
                                // add the component state to the array
                                latestStudentWorkFromOtherComponents.push(tempComponentState);
                            }
                        }
                    }
                }
            }

            studentWork.latestStudentWorkFromOtherComponents = latestStudentWorkFromOtherComponents;
        }

        if (params != null && params.getAllStudentWorkFromOtherComponents) {
            // get all the student work from other specified components
            var otherComponents = params.otherComponents;

            var allStudentWorkFromOtherComponents = [];

            if (otherComponents != null) {

                // loop throuh all the components we need to get work from
                for (var c = 0; c < otherComponents.length; c++) {
                    var otherComponent = otherComponents[c];

                    if (otherComponent != null) {

                        // get the node id and component id
                        var tempNodeId = otherComponent.nodeId;
                        var tempComponentId = otherComponent.componentId;

                        if (tempNodeId != null && tempComponentId != null) {

                            // get the component states for the given component
                            var tempComponentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);

                            if (tempComponentStates != null && tempComponentStates.length > 0) {
                                // add the component states to the array
                                allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents.concat(tempComponentStates);
                            }
                        }
                    }
                }
            }

            studentWork.allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents;
        }

        return studentWork;
    }

    /**
     * The import previous work checkbox was clicked
     */
    authoringImportPreviousWorkClicked() {

        if (!this.authoringComponentContent.importPreviousWork) {
            /*
             * import previous work has been turned off so we will clear the
             * import previous work node id, and import previous work
             * component id
             */
            this.authoringComponentContent.importPreviousWorkNodeId = null;
            this.authoringComponentContent.importPreviousWorkComponentId = null;

            // the authoring component content has changed so we will save the project
            this.authoringViewComponentChanged();
        }
    }

    /**
     * The import previous work node id has changed
     */
    authoringImportPreviousWorkNodeIdChanged() {

        if (this.authoringComponentContent.importPreviousWorkNodeId == null ||
            this.authoringComponentContent.importPreviousWorkNodeId == '') {

            /*
             * the import previous work node id is null so we will also set the
             * import previous component id to null
             */
            this.authoringComponentContent.importPreviousWorkComponentId = '';
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * The import previous work component id has changed
     */
    authoringImportPreviousWorkComponentIdChanged() {

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * The author has changed the rubric
     */
    summernoteRubricHTMLChanged() {

        // get the summernote rubric html
        var html = this.summernoteRubricHTML;

        /*
         * remove the absolute asset paths
         * e.g.
         * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
         * will be changed to
         * <img src='sun.png'/>
         */
        html = this.ConfigService.removeAbsoluteAssetPaths(html);

        /*
         * replace <a> and <button> elements with <wiselink> elements when
         * applicable
         */
        html = this.UtilService.insertWISELinks(html);

        // update the component rubric
        this.authoringComponentContent.rubric = html;

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * Add a connected component
     */
    addConnectedComponent() {

        /*
         * create the new connected component object that will contain a
         * node id and component id
         */
        var newConnectedComponent = {};
        newConnectedComponent.nodeId = this.nodeId;
        newConnectedComponent.componentId = null;
        newConnectedComponent.updateOn = 'change';

        // initialize the array of connected components if it does not exist yet
        if (this.authoringComponentContent.connectedComponents == null) {
            this.authoringComponentContent.connectedComponents = [];
        }

        // add the connected component
        this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */
    deleteConnectedComponent(index) {

        if (this.authoringComponentContent.connectedComponents != null) {
            this.authoringComponentContent.connectedComponents.splice(index, 1);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
    }
}

EmbeddedController.$inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$sce',
    '$window',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'EmbeddedService',
    'ProjectService',
    'StudentDataService',
    'UtilService'
];

export default EmbeddedController;

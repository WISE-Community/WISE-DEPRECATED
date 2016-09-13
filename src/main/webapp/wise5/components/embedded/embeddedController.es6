import iframeResizer from 'iframe-resizer';
import html2canvas from 'html2canvas';

class EmbeddedController {
    constructor($q,
                $scope,
                $sce,
                $window,
                ConfigService,
                NodeService,
                NotebookService,
                EmbeddedService,
                ProjectService,
                StudentDataService,
                UtilService) {

        this.$q = $q;
        this.$scope = $scope;
        this.$sce = $sce;
        this.$window = $window;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.EmbeddedService = EmbeddedService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;

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
            }
        });

        // listen for message events from embedded iframe application
        this.$window.addEventListener('message', this.messageEventListener);

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
                // get the latest annotations
                // TODO: watch for new annotations and update accordingly
                this.latestAnnotations = this.$scope.$parent.nodeController.getLatestComponentAnnotations(this.componentId);
                this.isSnipModelButtonVisible = true;
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function() {
                    return this.authoringComponentContent;
                }.bind(this), function(newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                    this.setURL(this.componentContent.url);
                }.bind(this), true);
            } else if (this.mode === 'grading') {
                this.isSnipModelButtonVisible = false;
            } else if (this.mode === 'onlyShowWork') {
                this.isSnipModelButtonVisible = false;
            } else if (this.mode === 'showPreviousWork') {
                this.isSnipModelButtonVisible = false;
            }

            if (this.componentContent != null) {
                // set the url
                this.setURL(this.componentContent.url);
            }

            // get the width
            this.width = this.componentContent.width ? this.componentContent.width : "100%";

            // get the height
            this.height = this.componentContent.height ? this.componentContent.height : "100%";

            // get the max width
            this.maxWidth = this.componentContent.maxWidth ? this.componentContent.maxWidth : "none";

            // get the max height
            this.maxHeight = this.componentContent.maxHeight ? this.componentContent.maxHeight : "none";

            if (this.$scope.$parent.registerComponentController != null) {
                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            }
        }

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
         * Listen for saveComponentStateSuccess event from node controller, set dirty and save message accordingly
         */
        this.$scope.$on('saveComponentStateSuccess', angular.bind(this, function(event, args) {

            // get the component states that were saved
            let componentStates = args.componentStates;
            for (let i = 0, l = componentStates.length; i < l; i++) {
                let currentState = componentStates[i];
                if (currentState.componentId === this.componentId) {
                    // a component state for this component was saved

                    // set isDirty to false because the component state was just saved and notify node
                    this.isDirty = false;
                    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

                    // clear out current componentState
                    this.$scope.embeddedController.componentState = null;

                    let isAutoSave = currentState.isAutoSave;
                    let isSubmit = currentState.isSubmit;
                    let serverSaveTime = componentState.serverSaveTime;
                    let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

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

                    // Tell application that this componentState was successfully saved to server;
                    // include saved state and updated save message
                    var successMessage = {
                        messageType: "componentStateSaved",
                        componentState: currentState,
                        saveMessage: this.saveMessage
                    };
                    this.sendMessageToApplication(successMessage);

                    // clear out componentState
                    this.componentState = {};
                }
            }
        }));

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
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
            // unregister messageEventListener
            this.$window.removeEventListener('message', this.messageEventListener);
        }));
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
                this.setSaveMessage('Last submitted', clientSaveTime);
            } else {
                // latest state is not a submission, so set isSubmitDirty to true and notify node
                this.isSubmitDirty = true;
                this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
                // set save message
                this.setSaveMessage('Last saved', clientSaveTime);
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

}

EmbeddedController.$inject = [
    '$q',
    '$scope',
    '$sce',
    '$window',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'EmbeddedService',
    'ProjectService',
    'StudentDataService',
    'UtilService'
];

export default EmbeddedController;

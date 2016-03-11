'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var OpenResponseController = function () {
    function OpenResponseController($injector, $rootScope, $scope, NodeService, OpenResponseService, ProjectService, StudentAssetService, StudentDataService) {
        _classCallCheck(this, OpenResponseController);

        this.$injector = $injector;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.NodeService = NodeService;
        this.OpenResponseService = OpenResponseService;
        this.ProjectService = ProjectService;
        this.StudentAssetService = StudentAssetService;
        this.StudentDataService = StudentDataService;

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

        //var scope = this;
        var themePath = this.ProjectService.getThemePath();

        // TODO: make toolbar items and plugins customizable by authors
        // Rich text editor options
        this.tinymceOptions = {
            //onChange: function(e) {
            //scope.studentDataChanged();
            //},
            menubar: false,
            plugins: 'link image media autoresize', //imagetools
            toolbar: 'undo redo | bold italic | superscript subscript | bullist numlist | alignleft aligncenter alignright | link image media',
            autoresize_bottom_margin: "0",
            autoresize_min_height: "100",
            image_advtab: true,
            content_css: themePath + "/style/tinymce.css",
            setup: function setup(ed) {
                ed.on("focus", function (e) {
                    $(e.target.editorContainer).addClass('input--focused').parent().addClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').addClass('input-label--focused');
                });

                ed.on("blur", function (e) {
                    $(e.target.editorContainer).removeClass('input--focused').parent().removeClass('input-wrapper--focused');
                    $('label[for="' + e.target.id + '"]').removeClass('input-label--focused');
                });
            }
        };

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

        this.mode = this.$scope.mode;

        if (this.componentContent != null) {

            // get the component id
            this.componentId = this.componentContent.id;

            if (this.mode === 'student') {
                this.isPromptVisible = true;
                this.isSaveButtonVisible = this.componentContent.showSaveButton;
                this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
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
            } else if (this.mode === 'authoring') {
                this.updateAdvancedAuthoringView();

                $scope.$watch(function () {
                    return this.authoringComponentContent;
                }.bind(this), function (newValue, oldValue) {
                    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
                }.bind(this), true);
            }

            // get the show previous work node id if it is provided
            var showPreviousWorkNodeId = this.componentContent.showPreviousWorkNodeId;

            var componentState = null;

            if (false) {
                // this component is showing previous work
                this.isShowPreviousWork = true;

                // get the show previous work component id if it is provided
                var showPreviousWorkComponentId = this.componentContent.showPreviousWorkComponentId;

                // get the node content for the other node
                var showPreviousWorkNodeContent = this.ProjectService.getNodeContentByNodeId(showPreviousWorkNodeId);

                // get the component content for the component we are showing previous work for
                this.componentContent = this.NodeService.getComponentContentById(showPreviousWorkNodeContent, showPreviousWorkComponentId);

                // get the component state for the show previous work
                componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(showPreviousWorkNodeId, showPreviousWorkComponentId);

                // populate the student work into this component
                this.setStudentWork(componentState);

                // disable the component since we are just showing previous work
                this.isDisabled = true;

                // register this component with the parent node
                this.$scope.$parent.registerComponentController(this.$scope, this.componentContent);
            } else {
                // this is a regular component

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
                    } else if (this.componentContent.starterSentence != null) {
                        /*
                         * the student has not done any work and there is a starter sentence
                         * so we will populate the textarea with the starter sentence
                         */
                        this.studentResponse = this.componentContent.starterSentence;
                    }
                } else {
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
        }

        $('.openResponse').off('dragover').off('drop');

        /**
         * Returns true iff there is student work that hasn't been saved yet
         */
        this.$scope.isDirty = function () {
            return this.$scope.openResponseController.isDirty;
        }.bind(this);

        /**
         * Get the component state from this component. The parent node will
         * call this function to obtain the component state when it needs to
         * save student data.
         * @param isSubmit boolean whether the request is coming from a submit
         * action (optional; default is false)
         * @return a component state containing the student data
         */
        this.$scope.getComponentState = function (isSubmit) {
            var componentState = null;
            var getState = false;

            if (isSubmit) {
                if (this.$scope.openResponseController.isSubmitDirty) {
                    getState = true;
                }
            } else {
                if (this.$scope.openResponseController.isDirty) {
                    getState = true;
                }
            }

            if (getState) {
                // create a component state populated with the student data
                componentState = this.$scope.openResponseController.createComponentState();
            }

            return componentState;
        }.bind(this);

        /**
         * The parent node submit button was clicked
         */
        this.$scope.$on('nodeSubmitClicked', function (event, args) {

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
        this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function (event, args) {

            var componentState = args.studentWork;

            // check that the component state is for this component
            if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

                // set isDirty to false because the component state was just saved and notify node
                this.isDirty = false;
                this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

                var isAutoSave = componentState.isAutoSave;
                var isSubmit = componentState.isSubmit;
                var clientSaveTime = componentState.clientSaveTime;

                // set save message
                if (isSubmit) {
                    this.setSaveMessage('Submitted', clientSaveTime);

                    this.submit();

                    // set isSubmitDirty to false because the component state was just submitted and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                } else if (isAutoSave) {
                    this.setSaveMessage('Auto-saved', clientSaveTime);
                } else {
                    this.setSaveMessage('Saved', clientSaveTime);
                }
            }
        }));

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the parent node. This will perform any necessary cleanup
         * when the student exits the parent node.
         */
        this.$scope.$on('exitNode', function (event, args) {}.bind(this));
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */


    _createClass(OpenResponseController, [{
        key: 'setStudentWork',
        value: function setStudentWork(componentState) {

            if (componentState != null) {
                var studentData = componentState.studentData;

                if (studentData != null) {
                    var response = studentData.response;

                    if (response != null) {
                        // populate the text the student previously typed
                        this.studentResponse = response;
                    }

                    var attachments = studentData.attachments;

                    if (attachments != null) {
                        this.attachments = attachments;
                    }

                    this.processLatestSubmit();
                }
            }
        }
    }, {
        key: 'processLatestSubmit',


        /**
         * Check if latest component state is a submission and set isSubmitDirty accordingly
         */
        value: function processLatestSubmit() {
            var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

            if (latestState) {
                if (latestState.isSubmit) {
                    // latest state is a submission, so set isSubmitDirty to false and notify node
                    this.isSubmitDirty = false;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
                    // set save message
                    this.setSaveMessage('Last submitted', latestState.clientSaveTime);
                } else {
                    // latest state is not a submission, so set isSubmitDirty to true and notify node
                    this.isSubmitDirty = true;
                    this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
                    // set save message
                    this.setSaveMessage('Last saved', latestState.clientSaveTime);
                }
            }
        }
    }, {
        key: 'saveButtonClicked',


        /**
         * Called when the student clicks the save button
         */
        value: function saveButtonClicked() {
            this.isSubmit = false;

            // tell the parent node that this component wants to save
            this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submitButtonClicked',


        /**
         * Called when the student clicks the submit button
         */
        value: function submitButtonClicked() {
            this.isSubmit = true;

            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        }
    }, {
        key: 'submit',
        value: function submit() {
            // check if we need to lock the component after the student submits
            if (this.isLockAfterSubmit()) {
                this.isDisabled = true;
            }
        }
    }, {
        key: 'studentDataChanged',


        /**
         * Called when the student changes their work
         */
        value: function studentDataChanged() {
            /*
             * set the dirty flags so we will know we need to save or submit the
             * student work later
             */
            this.isDirty = true;
            this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

            this.isSubmitDirty = true;
            this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

            // clear out the save message
            this.setSaveMessage('', null);

            // get this part id
            var componentId = this.getComponentId();

            // create a component state populated with the student data
            var componentState = this.createComponentState();

            /*
             * the student work in this component has changed so we will tell
             * the parent node that the student data will need to be saved.
             * this will also notify connected parts that this component's student
             * data has changed.
             */
            this.$scope.$emit('componentStudentDataChanged', { componentId: componentId, componentState: componentState });
        }
    }, {
        key: 'getStudentResponse',


        /**
         * Get the student response
         */
        value: function getStudentResponse() {
            return this.studentResponse;
        }
    }, {
        key: 'createComponentState',


        /**
         * Create a new component state populated with the student data
         * @return the componentState after it has been populated
         */
        value: function createComponentState() {

            // create a new component state
            var componentState = this.NodeService.createNewComponentState();

            // get the text the student typed
            var response = this.getStudentResponse();

            // set the response into the component state
            var studentData = {};
            studentData.response = response;
            studentData.attachments = angular.copy(this.attachments); // create a copy without reference to original array

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

            return componentState;
        }
    }, {
        key: 'calculateDisabled',


        /**
         * Check if we need to lock the component
         */
        value: function calculateDisabled() {

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
        }
    }, {
        key: 'showPrompt',


        /**
         * Check whether we need to show the prompt
         * @return whether to show the prompt
         */
        value: function showPrompt() {
            return this.isPromptVisible;
        }
    }, {
        key: 'showSaveButton',


        /**
         * Check whether we need to show the save button
         * @return whether to show the save button
         */
        value: function showSaveButton() {
            return this.isSaveButtonVisible;
        }
    }, {
        key: 'showSubmitButton',


        /**
         * Check whether we need to show the submit button
         * @return whether to show the submit button
         */
        value: function showSubmitButton() {
            return this.isSubmitButtonVisible;
        }
    }, {
        key: 'isLockAfterSubmit',


        /**
         * Check whether we need to lock the component after the student
         * submits an answer.
         */
        value: function isLockAfterSubmit() {
            var result = false;

            if (this.componentContent != null) {

                // check the lockAfterSubmit field in the component content
                if (this.componentContent.lockAfterSubmit) {
                    result = true;
                }
            }

            return result;
        }
    }, {
        key: 'removeAttachment',
        value: function removeAttachment(attachment) {
            if (this.attachments.indexOf(attachment) != -1) {
                this.attachments.splice(this.attachments.indexOf(attachment), 1);
                this.studentDataChanged();
                // YOU ARE NOW FREEEEEEEEE!
            }
        }
    }, {
        key: 'attachStudentAsset',


        /**
         * Attach student asset to this Component's attachments
         * @param studentAsset
         */
        value: function attachStudentAsset(studentAsset) {
            var _this = this;

            if (studentAsset != null) {
                this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
                    if (copiedAsset != null) {
                        var attachment = {
                            studentAssetId: copiedAsset.id,
                            iconURL: copiedAsset.iconURL
                        };

                        _this.attachments.push(attachment);
                        _this.studentDataChanged();
                    }
                });
            }
        }
    }, {
        key: 'getPrompt',


        /**
         * Get the prompt to show to the student
         */
        value: function getPrompt() {
            var prompt = null;

            if (this.componentContent != null) {
                prompt = this.componentContent.prompt;
            }

            return prompt;
        }
    }, {
        key: 'getNumRows',


        /**
         * Get the number of rows for the textarea
         */
        value: function getNumRows() {
            var numRows = null;

            if (this.componentContent != null) {
                numRows = this.componentContent.numRows;
            }

            return numRows;
        }
    }, {
        key: 'getNumColumns',


        /**
         * Get the number of columns for the textarea
         */
        value: function getNumColumns() {
            var numColumns = null;

            if (this.componentContent != null) {
                numColumns = this.componentContent.numColumns;
            }

            return numColumns;
        }
    }, {
        key: 'getResponse',


        /**
         * Get the text the student typed
         */
        value: function getResponse() {
            var response = null;

            if (this.studentResponse != null) {
                response = this.studentResponse;
            }

            return response;
        }
    }, {
        key: 'importWork',


        /**
         * Import work from another component
         */
        value: function importWork() {

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
                    if (componentState == null) {
                        // the student has not done any work for this component

                        // get the latest component state from the component we are importing from
                        var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importWorkNodeId, importWorkComponentId);

                        if (importWorkComponentState != null) {
                            /*
                             * populate a new component state with the work from the
                             * imported component state
                             */
                            var populatedComponentState = this.OpenResponseService.populateComponentState(importWorkComponentState);

                            // populate the component state into this component
                            this.setStudentWork(populatedComponentState);
                        }
                    }
                }
            }
        }
    }, {
        key: 'getComponentId',


        /**
         * Get the component id
         * @return the component id
         */
        value: function getComponentId() {
            return this.componentContent.id;
        }
    }, {
        key: 'authoringViewComponentChanged',


        /**
         * The component has changed in the regular authoring view so we will save the project
         */
        value: function authoringViewComponentChanged() {

            // update the JSON string in the advanced authoring view textarea
            this.updateAdvancedAuthoringView();

            // save the project to the server
            this.ProjectService.saveProject();
        }
    }, {
        key: 'advancedAuthoringViewComponentChanged',


        /**
         * The component has changed in the advanced authoring view so we will update
         * the component and save the project.
         */
        value: function advancedAuthoringViewComponentChanged() {

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

                // save the project to the server
                this.ProjectService.saveProject();
            } catch (e) {}
        }
    }, {
        key: 'updateAdvancedAuthoringView',


        /**
         * Update the component JSON string that will be displayed in the advanced authoring view textarea
         */
        value: function updateAdvancedAuthoringView() {
            this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
        }
    }, {
        key: 'setSaveMessage',


        /**
         * Set the message next to the save button
         * @param message the message to display
         * @param time the time to display
         */
        value: function setSaveMessage(message, time) {
            this.saveMessage.text = message;
            this.saveMessage.time = time;
        }
    }, {
        key: 'registerExitListener',


        /**
         * Register the the listener that will listen for the exit event
         * so that we can perform saving before exiting.
         */
        value: function registerExitListener() {

            /*
             * Listen for the 'exit' event which is fired when the student exits
             * the VLE. This will perform saving before the VLE exits.
             */
            exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
        }
    }]);

    return OpenResponseController;
}();

;

OpenResponseController.$inject = ['$injector', '$rootScope', '$scope', 'NodeService', 'OpenResponseService', 'ProjectService', 'StudentAssetService', 'StudentDataService'];

exports.default = OpenResponseController;
//# sourceMappingURL=openResponseController.js.map
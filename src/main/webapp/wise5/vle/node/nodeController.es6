class NodeController {
    constructor($compile,
                $filter,
                $q,
                $rootScope,
                $scope,
                $state,
                $timeout,
                AnnotationService,
                ConfigService,
                NodeService,
                NotebookService,
                ProjectService,
                StudentDataService,
                UtilService) {

        this.$compile = $compile;
        this.$filter = $filter;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$state = $state;
        this.$timeout = $timeout;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
        this.UtilService = UtilService;
        this.$translate = this.$filter('translate');

        // the auto save interval in milliseconds
        this.autoSaveInterval = 60000;

        // the node id of the current node
        this.nodeId = null;
        this.nodeContent = null;
        this.nodeStatus = null;
        this.nodeTitle = null;

        // hold ids of dirty components
        this.dirtyComponentIds = [];

        // array to hold ids of components where student work has changed since last submission
        this.dirtySubmitComponentIds = [];

        // whether the student work has changed since last submit
        this.submit = false;
        this.workgroupId = this.ConfigService.getWorkgroupId();
        this.teacherWorkgroupId = this.ConfigService.getTeacherWorkgroupId();

        /*
         * an object that holds the mappings with the key being the component
         * and the value being the scope object from the child controller
         */
        this.componentToScope = {};

        // message to show next to save/submit buttons
        this.saveMessage = {
            text: '',
            time: ''
        };

        // the step rubric
        this.rubric = null;

        // get the mode e.g. 'preview', 'student', 'authoring', 'grading', etc.
        this.mode = this.ConfigService.getMode();

        // perform setup of this node only if the current node is not a group.
        if (this.StudentDataService.getCurrentNode() && this.ProjectService.isApplicationNode(this.StudentDataService.getCurrentNodeId())) {
            // get the current node and node id
            var currentNode = this.StudentDataService.getCurrentNode();
            if (currentNode != null) {
                this.nodeId = currentNode.id;
            }

            // get the node content
            this.nodeContent = this.ProjectService.getNodeById(this.nodeId);

            this.nodeTitle = this.ProjectService.getNodeTitleByNodeId(this.nodeId);

            this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];

            // populate the student work into this node
            //this.setStudentWork();

            // check if we need to lock this node
            this.calculateDisabled();

            //this.importWork();

            // start the auto save interval
            this.startAutoSaveInterval();

            // register this controller to listen for the exit event
            this.registerExitListener();

            if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('enterNode')) {
                this.NodeService.evaluateTransitionLogic();
            }

            // set save message with last save/submission
            // for now, we'll use the latest component state (since we don't currently keep track of node-level saves)
            // TODO: use node states once we implement node state saving
            let latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId);
            if (latestComponentState) {
                let latestClientSaveTime = latestComponentState.clientSaveTime;
                if (latestComponentState.isSubmit) {
                    this.setSaveMessage(this.$translate('LAST_SUBMITTED'), latestClientSaveTime);
                } else {
                    this.setSaveMessage(this.$translate('LAST_SAVED'), latestClientSaveTime);
                }
            }

            // save nodeEntered event
            var nodeId = this.nodeId;
            var componentId = null;
            var componentType = null;
            var category = "Navigation";
            var event = "nodeEntered";
            var eventData = {};
            eventData.nodeId = nodeId;
            this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);

            if (this.nodeContent != null) {
                // get the step rubric
                this.rubric = this.nodeContent.rubric;

                // create the rubric tour bubbles
                this.createRubricTour();
            }

            /*
             * Check if the component id was provided in the state params. If
             * it is provided, we will scroll to it and then briefly highlight
             * it.
             */
            if (this.$state != null &&
                this.$state.params != null &&
                this.$state.params.componentId != null) {

                // get the component id
                var componentId = this.$state.params.componentId;

                this.$timeout(() => {
                    // get the UI element of the component
                    let componentElement = $("#component_" + componentId);

                    if (componentElement != null) {
                        // save the original background color
                        let originalBackgroundColor = componentElement.css("backgroundColor");

                        // highlight the background briefly to draw attention to it
                        componentElement.css("background-color", "#FFFF9C");

                        // scroll to the first new component that we've added
                        $('#content').animate({
                            scrollTop: componentElement.prop("offsetTop")
                        }, 1000);

                        /*
                         * remove the background highlighting so that it returns
                         * to its original color
                         */
                        componentElement.css({
                            'transition': 'background-color 3s ease-in-out',
                            'background-color': originalBackgroundColor
                        });
                    }
                }, 1000);
            }
        }

        /**
         * Listen for the componentSaveTriggered event which occurs when a
         * component is requesting student data to be saved
         */
        this.$scope.$on('componentSaveTriggered', (event, args) => {
            var isAutoSave = false;

            if (args != null) {
                var nodeId = args.nodeId;
                var componentId = args.componentId;

                if (nodeId != null && componentId != null) {
                    if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
                        /*
                         * obtain the component states from the children and save them
                         * to the server
                         */
                        this.createAndSaveComponentData(isAutoSave, componentId);
                    }
                }
            }
        });

        /**
         * Listen for the componentSubmitTriggered event which occurs when a
         * component is requesting student data to be submitted
         */
        this.$scope.$on('componentSubmitTriggered', (event, args) => {
            var isAutoSave = false;
            var isSubmit = true;

            if (args != null) {
                var nodeId = args.nodeId;
                var componentId = args.componentId;

                if (nodeId != null && componentId != null) {
                    if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
                        /*
                         * obtain the component states from the children and save them
                         * to the server
                         */
                        this.createAndSaveComponentData(isAutoSave, componentId, isSubmit);
                    }
                }
            }
        });

        /**
         * Listen for the componentStudentDataChanged event that will come from
         * child component scopes
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentStudentDataChanged', (event, args) => {
            /*
             * the student data in one of our child scopes has changed so
             * we will need to save
             */
            if (args != null) {

                // get the part id
                var componentId = args.componentId;

                // get the new component state
                var componentState = args.componentState;

                if (componentId != null && componentState != null) {

                    if (componentState.nodeId == null) {

                        if (args.nodeId != null) {
                            /*
                             * set the node id into the component state because
                             * the component state hasn't had it set at this
                             * point.
                             */
                            componentState.nodeId = args.nodeId;
                        }
                    }

                    if (componentState.componentId == null) {

                        if (args.componentId != null) {
                            /*
                             * set the component id into the component state
                             * because the component state hasn't had it set at
                             * this point.
                             */
                            componentState.componentId = args.componentId;
                        }
                    }

                    /*
                     * notify the parts that are connected that the student
                     * data has changed
                     */
                    this.notifyConnectedParts(componentId, componentState);

                    this.$scope.$broadcast('siblingComponentStudentDataChanged', args);
                }
            }
        });

        /**
         * Listen for the componentDirty event that will come from child component
         * scopes; notifies node that component has/doesn't have unsaved work
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentDirty', (event, args) => {
            let componentId = args.componentId;

            if (componentId) {
                let isDirty = args.isDirty;
                let index = this.dirtyComponentIds.indexOf(componentId);

                if (isDirty && index === -1) {
                    // add component id to array of dirty components
                    this.dirtyComponentIds.push(componentId);
                } else if (!isDirty && index > -1){
                    // remove component id from array of dirty components
                    this.dirtyComponentIds.splice(index, 1);
                }
            }
        });

        /**
         * Listen for the componentSubmitDirty event that will come from child
         * component scopes; notifies node that work has/has not changed for a
         * component since last submission
         * @param event
         * @param args the arguments provided when the event is fired
         */
        this.$scope.$on('componentSubmitDirty', (event, args) => {
            let componentId = args.componentId;

            if (componentId) {
                let isDirty = args.isDirty;
                let index = this.dirtySubmitComponentIds.indexOf(componentId);

                if (isDirty && index === -1) {
                    // add component id to array of dirty submit components
                    this.dirtySubmitComponentIds.push(componentId);
                } else if (!isDirty && index > -1){
                    // remove component id from array of dirty submit components
                    this.dirtySubmitComponentIds.splice(index, 1);
                }
            }
        });

        /**
         * Listen for the 'exitNode' event which is fired when the student
         * exits the node. This will perform saving when the student exits
         * the node.
         */
        this.$scope.$on('exitNode', (event, args) => {
            // get the node that is exiting
            var nodeToExit = args.nodeToExit;

            /*
             * make sure the node id of the node that is exiting is
             * this node
             */
            if (nodeToExit.id === this.nodeId) {
                var saveTriggeredBy = 'exitNode';

                // stop the auto save interval for this node
                this.stopAutoSaveInterval();

                /*
                 * tell the parent that this node is done performing
                 * everything it needs to do before exiting
                 */
                this.nodeUnloaded(this.nodeId);

                // check if this node has transition logic that should be run when the student exits the node
                if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('exitNode')) {
                    // this node has transition logic
                    this.NodeService.evaluateTransitionLogic();
                }
            }
        });

        // load script for this node, if any
        let script = this.nodeContent.script;
        if (script != null) {
            this.ProjectService.retrieveScript(script).then((script) => {
                new Function(script).call(this);
            });
        }
    }

    /**
     * Create the tour bubbles for all of the rubrics for this node
     */
    createRubricTour() {
        this.rubricTour = {
            id: 'rubricTour',
            arrowWidth: 12,
            bubblePadding: 0,
            bubbleWidth: 800,
            container: '#content',
            steps: [],
            showPrevButton: true,
            showNextButton: true,
            scrollDuration: 400,
            customRenderer: this.getRubricTemplate,
            customData: {
                $ctrl: this
            },
            i18n: {
                nextBtn: this.$translate('NEXT'),
                prevBtn: this.$translate('PREVIOUS'),
                doneBtn: this.$translate('DONE'),
                closeTooltip: this.$translate('CLOSE')
            }
        };

        if (this.rubric) {
            let thisTarget = '#nodeRubric_' + this.nodeId;

            // add a tour bubble for the node rubric
            this.rubricTour.steps.push(
                {
                    target: thisTarget,
                    placement: 'bottom',
                    title: this.$translate('STEP_INFO'),
                    content: this.ProjectService.replaceAssetPaths(this.rubric),
                    xOffset: 'center',
                    arrowOffset: 'center',
                    onShow: this.onShowRubric,
                    viewed: false
                }
            );
        }

        // add tour bubbles for each of the component rubrics
        let components = this.getComponents();
        let l = components.length, i = 0;
        for (; i < l; i++) {
            let component = components[i];

            if (component.rubric) {
                let thisTarget = '#rubric_' + component.id;
                this.rubricTour.steps.push(
                    {
                        target: thisTarget,
                        arrowOffset: 21,
                        placement: 'right',
                        yOffset: 1,
                        title: this.$translate('ITEM_INFO'),
                        content: this.ProjectService.replaceAssetPaths(component.rubric),
                        onShow: this.onShowRubric,
                        viewed: false
                    }
                );
            }
        }
    }

    /**
     * Show the tour bubble for the rubric with the given componentId or nodeId
     * @param id componentId or nodeId of rubric to show
     */
    showRubric(id) {
        if (this.rubricTour) {
            let step = -1;
            let index = 0;

            let thisTarget = '#nodeRubric_' + this.nodeId;
            if (this.nodeId === id) {
                // the given id matches this nodeId
                step = index;
            }

            if (step < 0) {
                if (this.rubric) {
                    index++;
                }

                let components = this.getComponents();
                let l = components.length, i = 0;
                for (; i < l; i++) {
                    let component = components[i];
                    if (component.rubric) {
                        thisTarget = '#rubric_' + component.id;
                        if (component.id === id) {
                            // the given id matches the current componentId
                            step = index;
                            break;
                        }
                        index++;
                    }
                }
            }

            // end any currently running rubric tour
            hopscotch.endTour(this.rubricTour);
            // show the rubric tour starting with the step for the matched index
            hopscotch.startTour(this.rubricTour, step);
        }
    }

    /**
     * Create and return the custom template for the rubric tour bubbles
     * @param details Object with the tour details
     * @return HTML string
     */
    getRubricTemplate(details) {
        let i18n = details.i18n;
        let buttons = details.buttons;
        let step = details.step;
        let tour = details.tour;
        let $ctrl = tour.customData.$ctrl;
        let template =
            `<div class="hopscotch-bubble-container help-bubble md-whiteframe-4dp" style="width: ${ step.width }px; padding: ${ step.padding }px;">
                <md-toolbar class="md-subhead help-bubble__title md-toolbar--wise">
                    <div class="help-bubble___title__content" layout="row" layout-align="start center" flex>
                        <span>${ tour.isTour ? `${ i18n.stepNum } | ` : '' }${ step.title !== '' ? `${ step.title }` : '' }</span>
                        <span flex></span>
                        ${ buttons.showClose ? `<md-button class="md-icon-button hopscotch-close">
                            <md-icon aria-label="${ i18n.closeTooltip }"> close </md-icon>
                        </md-button>` : ''}
                    </div>
                </md-toolbar>
                <div class="help-bubble__content">
                    ${ step.content  !== '' ? `${ step.content }` : '' }
                    ${ buttons.showCTA ? `<md-button class="hopscotch-cta md-primary md-raised">${ i18n.ctaLabel }</md-button>` : ''}
                </div>
                <md-divider></md-divider>
                <div class="help-bubble__actions gray-lightest-bg" layout="row" layout-align="start center">
                    ${ buttons.showClose ? `<md-button class="button--small hopscotch-close">${ i18n.closeTooltip }</md-button>` : ''}
                    <span flex></span>
                    ${ buttons.showPrev ? `<md-button class="button--small info hopscotch-prev">${ i18n.prevBtn }</md-button>` : ''}
                    ${ buttons.showNext ? `<md-button class="button--small info hopscotch-next">${ i18n.nextBtn }</md-button>` : ''}
                </md-card-actions>
            </div>`;

        // need to compile the template here because Hopscotch inserts raw html
        let templateHTML = $ctrl.$compile(template)($ctrl.$scope)[0].outerHTML +
            `<div class="hopscotch-bubble-arrow-container hopscotch-arrow">
                <div class="hopscotch-bubble-arrow-border"></div>
                <div class="hopscotch-bubble-arrow"></div>
            </div>`;
        return templateHTML;
    }

    /**
     * Callback for when a rubric tour bubble is shown
     */
    onShowRubric() {
        // stop the pulsing animation on the info button for the rubric being shown
        let index = hopscotch.getCurrStepNum();
        hopscotch.getCurrTour().customData.$ctrl.rubricTour.steps[index].viewed = true;
    }

    /**
     * The function that child component controllers will call to register
     * themselves with this node
     * @param childScope the child scope object
     * @param component the component content for the component
     */
    registerComponentController(childScope, component) {
        if (childScope != null && component != null) {
            // get the component id
            var componentId = component.id;

            // add the component id to child scope mapping
            this.componentToScope[componentId] = childScope;
        }
    }

    /**
     * Populate the student work into the node
     */
    setStudentWork() {

    };

    /**
     * Import work from another node
     */
    importWork() {

    };

    /**
     * Returns all the revisions made by this user for the specified component
     */
    getRevisions(componentId) {
        var revisions = [];
        // get the component states for this component
        var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, componentId);
        return componentStates;
    };

    showRevisions($event, componentId, isComponentDisabled) {
        var revisions = this.getRevisions(componentId);
        var allowRevert = !isComponentDisabled;

        // get the scope for the component
        var childScope = this.componentToScope[componentId];

        // TODO: generalize for other controllers
        var componentController = null;

        if (childScope.openResponseController) {
            componentController = childScope.openResponseController;
        } else if (childScope.drawController) {
            componentController = childScope.drawController;
        }

        // broadcast showRevisions event
        this.$rootScope.$broadcast('showRevisions', {revisions: revisions, componentController: componentController, allowRevert: allowRevert, $event: $event});
    };

    /**
     * Show student assets
     * @param $event
     * @param componentId
     */
    showStudentAssets($event, componentId) {

        // get the scope for the component
        var childScope = this.componentToScope[componentId];

        // TODO: generalize for other controllers
        var componentController = null;

        if (childScope.openResponseController) {
            componentController = childScope.openResponseController;
        } else if (childScope.drawController) {
            componentController = childScope.drawController;
        } else if (childScope.discussionController) {
            componentController = childScope.discussionController;
        } else if (childScope.tableController) {
            componentController = childScope.tableController;
        } else if (childScope.graphController) {
            componentController = childScope.graphController;
        }

        this.$rootScope.$broadcast('showStudentAssets', {componentController: componentController, $event: $event});
    };

    /**
     * Called when the student clicks the save button
     */
    saveButtonClicked() {

        // notify the child components that the save button was clicked
        this.$rootScope.$broadcast('nodeSaveClicked', {nodeId: this.nodeId});

        var isAutoSave = false;

        /*
         * obtain the component states from the children and save them
         * to the server
         */
        this.createAndSaveComponentData(isAutoSave);
    };

    /**
     * Called when the student clicks the submit button
     */
    submitButtonClicked() {

        // notify the child components that the submit button was clicked
        this.$rootScope.$broadcast('nodeSubmitClicked', {nodeId: this.nodeId});

        var isAutoSave = false;
        var isSubmit = true;

        /*
         * obtain the component states from the children and save them
         * to the server
         */
        this.createAndSaveComponentData(isAutoSave, null, isSubmit);
    };

    /**
     * Check if we need to lock the node
     */
    calculateDisabled() {

        var nodeId = this.nodeId;

        // get the node content
        var nodeContent = this.nodeContent;

        if (nodeContent) {
            var lockAfterSubmit = nodeContent.lockAfterSubmit;

            if (lockAfterSubmit) {
                // we need to lock the step after the student has submitted

                // get the component states for the node
                var componentStates = this.StudentDataService.getComponentStatesByNodeId(nodeId);

                // check if any of the component states were submitted
                var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

                if (isSubmitted) {
                    // the student has submitted work for this node
                    this.isDisabled = true;
                }
            }
        }
    };

    /**
     * Get the components for this node.
     * @return an array that contains the content for the components.
     */
    getComponents() {
        var components = null;

        if (this.nodeContent != null) {
            components = this.nodeContent.components;
        }

        if (components != null && this.isDisabled) {
            for (var c = 0; c < components.length; c++) {
                var component = components[c];

                component.isDisabled = true;
            }
        }

        if (components != null && this.nodeContent.lockAfterSubmit) {
            for (c = 0; c < components.length; c++) {
                component = components[c];

                component.lockAfterSubmit = true;
            }
        }

        return components;
    };

    /**
     * Get the component given the component id
     * @param componentId the component id we want
     * @return the component object with the given component id
     */
    getComponentById(componentId) {

        var component = null;

        if (componentId != null) {

            // get all the components
            var components = this.getComponents();

            // loop through all the components
            for (var c = 0; c < components.length; c++) {

                // get a component
                var tempComponent = components[c];

                if (tempComponent != null) {
                    var tempComponentId = tempComponent.id;

                    // check if the component id matches the one we want
                    if (tempComponentId === componentId) {
                        // the component id matches
                        component = tempComponent;
                        break;
                    }
                }
            }
        }

        return component;
    };

    /**
     * Check if this node contains a given component id
     * @param componentId the component id
     * @returns whether this node contains the component
     */
    nodeContainsComponent(componentId) {
        var result = false;

        if (componentId != null) {

            // get all the components
            var components = this.getComponents();

            // loop through all the components
            for (var c = 0; c < components.length; c++) {

                // get a component
                var tempComponent = components[c];

                if (tempComponent != null) {
                    var tempComponentId = tempComponent.id;

                    // check if the component id matches the one we want
                    if (tempComponentId === componentId) {
                        // the component id matches
                        result = true;
                        break;
                    }
                }
            }
        }

        return result;
    };

    /**
     * Get the html template for the component
     * @param componentType the component type
     * @return the path to the html template for the component
     */
    getComponentTemplatePath(componentType) {
        return this.NodeService.getComponentTemplatePath(componentType);
    };

    /**
     * Check whether we need to show the save button
     * @return whether to show the save button
     */
    showSaveButton() {
        var result = false;

        if (this.nodeContent != null && this.nodeContent.showSaveButton) {
            result = true;
        }

        return result;
    };

    /**
     * Check whether we need to show the submit button
     * @return whether to show the submit button
     */
    showSubmitButton() {
        var result = false;

        if (this.nodeContent != null && this.nodeContent.showSubmitButton) {
            result = true;
        }

        return result;
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
     * Start the auto save interval for this node
     */
    startAutoSaveInterval() {
        this.autoSaveIntervalId = setInterval(() => {
            // check if the student work is dirty
            if (this.dirtyComponentIds.length) {
                // the student work is dirty so we will save

                var isAutoSave = true;

                /*
                 * obtain the component states from the children and save them
                 * to the server
                 */
                this.createAndSaveComponentData(isAutoSave);
            }
        }, this.autoSaveInterval);
    };

    /**
     * Stop the auto save interval for this node
     */
    stopAutoSaveInterval() {
        clearInterval(this.autoSaveIntervalId);
    };

    /**
     * Obtain the componentStates and annotations from the children and save them
     * to the server
     * @param isAutoSave whether the component states were auto saved
     * @param componentId (optional) the component id of the component
     * that triggered the save
     * @param isSubmit (optional) whether this is a sumission or not
     * @returns a promise that will save all the component states for the step
     * that need saving
     */
    createAndSaveComponentData(isAutoSave, componentId, isSubmit) {

        // obtain the component states from the children
        return this.createComponentStates(isAutoSave, componentId, isSubmit).then((componentStates) => {
            var componentAnnotations = [];
            var componentEvents = null;
            var nodeStates = null;

            if ((componentStates != null && this.UtilService.arrayHasNonNullElement(componentStates)) ||
                (componentAnnotations != null && componentAnnotations.length) ||
                (componentEvents != null && componentEvents.length)) {

                // get the annotations from the components
                for (var c = 0; c < componentStates.length; c++) {
                    var componentState = componentStates[c];

                    if (componentState != null) {
                        var annotations = componentState.annotations;

                        if (annotations != null) {
                            /*
                             * add the annotations to our array of annotations that will
                             * be saved to the server
                             */
                            componentAnnotations = componentAnnotations.concat(annotations);
                        }

                        // remove the annotations from the component state
                        delete componentState.annotations;
                    }
                }

                // save the component states to the server
                return this.StudentDataService.saveToServer(componentStates, nodeStates, componentEvents, componentAnnotations).then((savedStudentDataResponse) => {
                    if (savedStudentDataResponse) {
                        // check if this node has transition logic that should be run when the student data changes
                        if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('studentDataChanged')) {
                            // this node has transition logic
                            this.NodeService.evaluateTransitionLogic();
                        }

                        // check if this node has transition logic that should be run when the student score changes
                        if (this.NodeService.hasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('scoreChanged')) {

                            if (componentAnnotations != null && componentAnnotations.length > 0) {
                                var evaluateTransitionLogic = false;

                                // loop through all the annotations and check if any were score annotations
                                for (var c = 0; c < componentAnnotations.length; c++) {
                                    var componentAnnotation = componentAnnotations[c];

                                    if (componentAnnotation != null) {
                                        if (componentAnnotation.type === 'autoScore') {
                                            evaluateTransitionLogic = true;
                                        }
                                    }
                                }

                                if (evaluateTransitionLogic) {
                                    // the student score has changed so we will evaluate the transition logic
                                    this.NodeService.evaluateTransitionLogic();
                                }
                            }
                        }

                        let studentWorkList = savedStudentDataResponse.studentWorkList;
                        if (!componentId && studentWorkList && studentWorkList.length) {
                            // this was a step save or submission and student work was saved, so set save message
                            let latestStudentWork = studentWorkList[studentWorkList.length - 1];
                            let serverSaveTime = latestStudentWork.serverSaveTime;
                            let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

                            if (isAutoSave) {
                                this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
                            } else if (isSubmit) {
                                this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);
                            } else {
                                this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
                            }
                        } else {
                            this.setSaveMessage('', null);
                        }
                    }

                    return savedStudentDataResponse;
                });
            }
        });
    };

    /**
     * Loop through this node's components and get/create component states
     * @param isAutoSave whether the component states were auto saved
     * @param componentId (optional) the component id of the component
     * that triggered the save
     * @param isSubmit (optional) whether this is a submission or not
     * @returns an array of promises that will return component states
     */
    createComponentStates(isAutoSave, componentId, isSubmit) {
        var components = [];
        var componentStatePromises = [];

        // get the components for this node
        if (componentId) {
            var component = this.getComponentById(componentId);
            if (component) {
                components.push(component);
            }
        } else {
            components = this.getComponents();
        }

        if (components.length) {

            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var workgroupId = this.ConfigService.getWorkgroupId();
            var nodeId = this.nodeId;

            // loop through all the components
            for (var c = 0; c < components.length; c++) {

                // get a component
                var component = components[c];

                if (component != null) {
                    // get the component id
                    var tempComponentId = component.id;
                    var componentType = component.type;

                    // get the scope for the component
                    var childScope = this.componentToScope[tempComponentId];

                    if (childScope != null) {
                        if (childScope.getComponentState) {
                            // get the component state promise from the child scope
                            var componentStatePromise = this.getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit);
                            componentStatePromises.push(componentStatePromise);
                        }
                    }
                }
            }
        }

        return this.$q.all(componentStatePromises);
    };

    /**
     * Get the component state from the child scope
     * @param childScope the child scope
     * @param runId the run id
     * @param periodId the period id
     * @param workgroupId the workgroup id
     * @param nodeId the node id
     * @param componentId the component id that has triggered the save
     * @param tempComponentId the component id of the component we are obtaining
     * a component state for
     * @param componentType the component type
     * @param isAutoSave whether this save was triggered by an auto save
     * @param isSubmit whether this save was triggered by a submit
     */
    getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit) {
        return childScope.getComponentState(isSubmit).then((componentState) => {
            if (componentState != null) {

                componentState.runId = runId;
                componentState.periodId = periodId;
                componentState.workgroupId = workgroupId;
                componentState.nodeId = this.nodeId;

                // set the component id into the student work object
                componentState.componentId = tempComponentId;

                // set the component type
                componentState.componentType = componentType;

                if (componentId == null) {
                    /*
                     * the node has triggered the save so all the components will
                     * either have isAutoSave set to true or false; if this is a
                     * submission, all the components will have isSubmit set to true
                     */
                    componentState.isAutoSave = isAutoSave;

                    if (isSubmit) {
                        /*
                         * set the isSubmit value in the component state if
                         * it wasn't set by the component
                         */
                        if (componentState.isSubmit == null) {
                            componentState.isSubmit = true;
                        }
                    }
                } else {
                    /*
                     * a component has triggered the save so only that component will
                     * have isAutoSave set to false; if this is a submission,
                     * component will have isSubmit set to true
                     */

                    if (componentId === tempComponentId) {
                        // this component triggered the save
                        componentState.isAutoSave = false;

                        if (isSubmit) {
                            /*
                             * set the isSubmit value in the component state if
                             * it wasn't set by the component
                             */
                            if (componentState.isSubmit == null) {
                                componentState.isSubmit = true;
                            }
                        }
                    }
                }

                return componentState;
            }
        });
    }

    /**
     * Get the latest annotations for a given component
     * TODO: move to a parent component class in the future?
     * @param componentId the component's id
     * @return object containing the component's latest score and comment annotations
     */
    getLatestComponentAnnotations(componentId) {
        let latestScoreAnnotation = null;
        let latestCommentAnnotation = null;

        let nodeId = this.nodeId;
        let workgroupId = this.workgroupId;

        // get the latest score annotation for this component
        latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(nodeId, componentId, workgroupId, 'any');

        // get the latest comment annotation for this component
        latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(nodeId, componentId, workgroupId, 'any');

        return {
            'score': latestScoreAnnotation,
            'comment': latestCommentAnnotation
        };
    };

    /**
     * Notify any connected components that the student data has changed
     * @param componentId the component id that has changed
     * @param componentState the new component state
     */
    notifyConnectedParts(changedComponentId, componentState) {

        if (changedComponentId != null && componentState != null) {

            // get all the components
            var components = this.getComponents();

            if (components != null) {

                /*
                 * loop through all the components and look for components
                 * that are listening for the given component id to change.
                 * only notify components that are listening for changes
                 * from the specific component id.
                 */
                for (var c = 0; c < components.length; c++) {

                    // get a component
                    var tempComponent = components[c];

                    if (tempComponent != null) {

                        // get this component id
                        var tempComponentId = tempComponent.id;

                        /*
                         * get the connected components that this component is
                         * listening for
                         */
                        var connectedComponents = tempComponent.connectedComponents;

                        if (connectedComponents != null) {

                            // loop through all the connected components
                            for (var cc = 0; cc < connectedComponents.length; cc++) {

                                // get a connected component
                                var connectedComponentParams = connectedComponents[cc];

                                if (connectedComponentParams != null) {

                                    // get the node id
                                    var nodeId = connectedComponentParams.nodeId;

                                    // get the component id
                                    var componentId = connectedComponentParams.componentId;

                                    /*
                                     * get the id which is the old field that we used to store
                                     * the component id in. this is here to maintain backwards
                                     * compatibility.
                                     */
                                    var id = connectedComponentParams.id;

                                    if (nodeId != null && componentId != null) {
                                        // the node id and component id was provided
                                        var connectedComponentId = componentId;
                                        var connectedNodeId = nodeId;

                                        // check if the component id matches the one that has changed
                                        if (connectedNodeId == this.nodeId && connectedComponentId === changedComponentId) {

                                            var connectedComponent = this.getComponentById(connectedComponentId);

                                            // get the scope for the listening component
                                            var componentScope = this.componentToScope[tempComponentId];

                                            // check if the listening component has a handler function
                                            if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                // tell the listening part to handle the student data changing
                                                componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                            }
                                        }
                                    } else if (componentId != null) {
                                        /*
                                         * the node id was not provided but the component id was provided
                                         * so we will assume the component id is in the current node
                                         */
                                        var connectedComponentId = componentId;

                                        // check if the component id matches the one that has changed
                                        if (connectedComponentId === changedComponentId) {

                                            var connectedComponent = this.getComponentById(connectedComponentId);

                                            // get the scope for the listening component
                                            var componentScope = this.componentToScope[tempComponentId];

                                            // check if the listening component has a handler function
                                            if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                // tell the listening part to handle the student data changing
                                                componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                            }
                                        }
                                    } else if (id != null) {
                                        /*
                                         * the node id and component id were not provided but the
                                         * id was provided which is the old field we used to set
                                         * the component id in. this is here to maintain backwards
                                         * compatibility.
                                         */
                                        var connectedComponentId = id;

                                        // check if the component id matches the one that has changed
                                        if (connectedComponentId === changedComponentId) {

                                            var connectedComponent = this.getComponentById(connectedComponentId);

                                            // get the scope for the listening component
                                            var componentScope = this.componentToScope[tempComponentId];

                                            // check if the listening component has a handler function
                                            if (componentScope.handleConnectedComponentStudentDataChanged != null) {

                                                // tell the listening part to handle the student data changing
                                                componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    /**
     * Get the student data for a specific part
     * @param the componentId
     * @return the student data for the given component
     */
    getComponentStateByComponentId(componentId) {
        var componentState = null;

        if (componentId != null) {

            // get the latest component state for the component
            componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, componentId);
        }

        return componentState;
    };

    /**
     * Get the student data for a specific part
     * @param the nodeId
     * @param the componentId
     * @return the student data for the given component
     */
    getComponentStateByNodeIdAndComponentId(nodeId, componentId) {
        var componentState = null;

        if (nodeId != null && componentId != null) {

            // get the latest component state for the component
            componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
        }

        return componentState;
    };

    nodeUnloaded(nodeId) {
        hopscotch.endTour(this.rubricTour);

        var isAutoSave = true;

        this.createAndSaveComponentData(isAutoSave);

        // save nodeExited event
        var componentId = null;
        var componentType = null;
        var category = "Navigation";
        var event = "nodeExited";
        var eventData = {};
        eventData.nodeId = nodeId;
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    };

    /**
     * Checks whether any of the node's components have unsubmitted work
     * @return boolean whether or not there is unsubmitted work
     */
    getSubmitDirty() {
        let submitDirty = false;
        let components = this.getComponents();

        if (components != null) {
            for (let c = 0, l = components.length; c < l; c++) {
                let id = components[c].id;
                let latestState = this.getComponentStateByComponentId(id);

                if (latestState && !latestState.isSubmit) {
                    submitDirty = true;
                    break;
                }
            }
        }

        return submitDirty;
    };

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */
    registerExitListener() {
        /**
         * Listen for the 'exit' event which is fired when the student exits
         * the VLE. This will perform saving before exiting.
         */
        this.logOutListener = this.$scope.$on('exit', (event, args) => {

            // stop the auto save interval for this node
            this.stopAutoSaveInterval();

            /*
             * tell the parent that this node is done performing
             * everything it needs to do before exiting
             */
            this.nodeUnloaded(this.nodeId);

            // call this function to remove the listener
            this.logOutListener();

            /*
             * tell the session service that this listener is done
             * performing everything it needs to do before exiting
             */
            this.$rootScope.$broadcast('doneExiting');
        });
    };
}

NodeController.$inject = [
    '$compile',
    '$filter',
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$timeout',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'ProjectService',
    'StudentDataService',
    'UtilService'
];

export default NodeController;

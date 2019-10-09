class NodeController {
  constructor(
      $compile,
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

    this.nodeId = null;
    this.nodeContent = null;
    this.nodeStatus = null;
    this.nodeTitle = null;
    this.dirtyComponentIds = [];
    this.dirtySubmitComponentIds = [];
    this.submit = false;
    this.workgroupId = this.ConfigService.getWorkgroupId();
    this.teacherWorkgroupId = this.ConfigService.getTeacherWorkgroupId();
    this.isDisabled = !this.ConfigService.isRunActive();

    /*
     * an object that holds the mappings with the key being the component
     * and the value being the scope object from the child controller
     */
    this.componentToScope = {};

    this.saveMessage = {
      text: '',
      time: ''
    };

    this.rubric = null;
    this.mode = this.ConfigService.getMode();

    // perform setup of this node only if the current node is not a group.
    if (this.StudentDataService.getCurrentNode() &&
        this.ProjectService.isApplicationNode(
        this.StudentDataService.getCurrentNodeId())) {
      const currentNode = this.StudentDataService.getCurrentNode();
      if (currentNode != null) {
        this.nodeId = currentNode.id;
      }

      this.nodeContent = this.ProjectService.getNodeById(this.nodeId);
      this.nodeTitle = this.ProjectService.getNodeTitleByNodeId(this.nodeId);
      this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
      this.startAutoSaveInterval();
      this.registerExitListener();

      if (this.NodeService.currentNodeHasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('enterNode')) {
        this.NodeService.evaluateTransitionLogic();
      }

      // set save message with last save/submission
      // for now, we'll use the latest component state (since we don't currently keep track of node-level saves)
      // TODO: use node states once we implement node state saving
      const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId);
      if (latestComponentState) {
        const latestClientSaveTime = latestComponentState.clientSaveTime;
        if (latestComponentState.isSubmit) {
          this.setSubmittedMessage(latestClientSaveTime);
        } else {
          this.setSavedMessage(latestClientSaveTime);
        }
      }

      const nodeId = this.nodeId;
      const componentId = null;
      const componentType = null;
      const category = "Navigation";
      const event = "nodeEntered";
      const eventData = {};
      eventData.nodeId = nodeId;
      this.StudentDataService.saveVLEEvent(
          nodeId, componentId, componentType, category, event, eventData);

      if (this.nodeContent != null) {
        this.rubric = this.nodeContent.rubric;
        this.createRubricTour();
      }

      /*
       * If the component id was provided in the state params, scroll to it and
        * then briefly highlight it to bring attention to it.
       */
      if (this.$state != null &&
          this.$state.params != null &&
          this.$state.params.componentId != null) {
        const componentId = this.$state.params.componentId;
        this.scrollAndHighlightComponent(componentId);
      }
    }

    /**
     * Listen for the componentSaveTriggered event which occurs when a
     * component is requesting student data to be saved
     */
    this.$scope.$on('componentSaveTriggered', (event, args) => {
      if (args != null) {
        const nodeId = args.nodeId;
        const componentId = args.componentId;

        if (nodeId != null && componentId != null) {
          if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
            const isAutoSave = false;
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
      if (args != null) {
        const nodeId = args.nodeId;
        const componentId = args.componentId;

        if (nodeId != null && componentId != null) {
          if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
            const isAutoSave = false;
            const isSubmit = true;
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
        const componentId = args.componentId;
        const componentState = args.componentState;
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
      const componentId = args.componentId;
      if (componentId) {
        const isDirty = args.isDirty;
        const index = this.dirtyComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          this.dirtyComponentIds.push(componentId);
        } else if (!isDirty && index > -1){
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
      const componentId = args.componentId;
      if (componentId) {
        const isDirty = args.isDirty;
        const index = this.dirtySubmitComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          this.dirtySubmitComponentIds.push(componentId);
        } else if (!isDirty && index > -1){
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
      const nodeToExit = args.nodeToExit;
      /*
       * make sure the node id of the node that is exiting is
       * this node
       */
      if (nodeToExit.id === this.nodeId) {
        this.stopAutoSaveInterval();

        /*
         * tell the parent that this node is done performing
         * everything it needs to do before exiting
         */
        this.nodeUnloaded(this.nodeId);
        if (this.NodeService.currentNodeHasTransitionLogic() && this.NodeService.evaluateTransitionLogicOn('exitNode')) {
          this.NodeService.evaluateTransitionLogic();
        }
      }
    });

    // load script for this node, if any
    const script = this.nodeContent.script;
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
      const thisTarget = '#nodeRubric_' + this.nodeId;

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
    const components = this.getComponents();
    for (let component of components) {
      if (component.rubric) {
        const thisTarget = '#rubric_' + component.id;
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
        step = index;
      }

      if (step < 0) {
        if (this.rubric) {
          index++;
        }

        const components = this.getComponents();
        for (let component of components) {
          if (component.rubric) {
            thisTarget = '#rubric_' + component.id;
            if (component.id === id) {
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

  scrollAndHighlightComponent(componentId) {
    this.$timeout(() => {
      const componentElement = $("#component_" + componentId);
      if (componentElement != null) {
        const originalBackgroundColor = componentElement.css("backgroundColor");
        componentElement.css("background-color", "#FFFF9C");
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

  /**
   * Create and return the custom template for the rubric tour bubbles
   * @param details Object with the tour details
   * @return HTML string
   */
  getRubricTemplate(details) {
    const i18n = details.i18n;
    const buttons = details.buttons;
    const step = details.step;
    const tour = details.tour;
    const $ctrl = tour.customData.$ctrl;
    const template =
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
    const templateHTML = $ctrl.$compile(template)($ctrl.$scope)[0].outerHTML +
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
    const index = hopscotch.getCurrStepNum();
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
      const componentId = component.id;
      this.componentToScope[componentId] = childScope;
    }
  }

  isShowNodeRubric() {
    return this.rubric != null && this.rubric != "" && this.mode === 'preview';
  }

  isShowComponentRubric(component) {
    return component.rubric != null && component.rubric != "" && this.mode === 'preview';
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
    const revisions = [];
    const componentStates = this.StudentDataService
        .getComponentStatesByNodeIdAndComponentId(this.nodeId, componentId);
    return componentStates;
  };

  showRevisions($event, componentId, isComponentDisabled) {
    const revisions = this.getRevisions(componentId);
    const allowRevert = !isComponentDisabled;

    const childScope = this.componentToScope[componentId];

    // TODO: generalize for other controllers
    let componentController = null;

    if (childScope.openResponseController) {
      componentController = childScope.openResponseController;
    } else if (childScope.drawController) {
      componentController = childScope.drawController;
    }

    this.$rootScope.$broadcast('showRevisions', {revisions: revisions, componentController: componentController, allowRevert: allowRevert, $event: $event});
  };

  /**
   * Show student assets
   * @param $event
   * @param componentId
   */
  showStudentAssets($event, componentId) {
    const childScope = this.componentToScope[componentId];

    // TODO: generalize for other controllers
    let componentController = null;

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
  }

  /**
   * Called when the student clicks the save button
   */
  saveButtonClicked() {
    this.$rootScope.$broadcast('nodeSaveClicked', {nodeId: this.nodeId});
    const isAutoSave = false;
    this.createAndSaveComponentData(isAutoSave);
  };

  /**
   * Called when the student clicks the submit button
   */
  submitButtonClicked() {
    // notify the child components that the submit button was clicked
    this.$rootScope.$broadcast('nodeSubmitClicked', {nodeId: this.nodeId});

    const isAutoSave = false;
    const isSubmit = true;
    this.createAndSaveComponentData(isAutoSave, null, isSubmit);
  };

  /**
   * Get the components for this node.
   * @return an array that contains the content for the components.
   * TODO: can we not return null? This will simplify code a lot
   */
  getComponents() {
    let components = null;
    if (this.nodeContent != null) {
      components = this.nodeContent.components;
    }
    if (components != null && this.isDisabled) {
      for (const component of components) {
        component.isDisabled = true;
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
    if (componentId != null) {
      const components = this.getComponents();
      for (const tempComponent of components) {
        if (tempComponent != null) {
          const tempComponentId = tempComponent.id;
          if (tempComponentId === componentId) {
            return tempComponent;
          }
        }
      }
    }
    return null;
  };

  /**
   * Check if this node contains a given component id
   * @param componentId the component id
   * @returns whether this node contains the component
   */
  nodeContainsComponent(componentId) {
    if (componentId != null) {
      const components = this.getComponents();
      for (const tempComponent of components) {
        if (tempComponent != null) {
          const tempComponentId = tempComponent.id;
          if (tempComponentId === componentId) {
            return true;
          }
        }
      }
    }
    return false;
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
    return this.nodeContent != null && this.nodeContent.showSaveButton;
  };

  /**
   * Check whether we need to show the submit button
   * @return whether to show the submit button
   */
  showSubmitButton() {
    return this.nodeContent != null && this.nodeContent.showSubmitButton;
  };

  setSavedMessage(time) {
    this.setSaveText(this.$translate('SAVED'), time);
  }

  setAutoSavedMessage(time) {
    this.setSaveText(this.$translate('AUTO_SAVED'), time);
  }

  setSubmittedMessage(time) {
    this.setSaveText(this.$translate('SUBMITTED'), time);
  }

  /**
   * Set the message next to the save button
   * @param message the message to display
   * @param time the time to display
   */
  setSaveText(message, time) {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
  };

  clearSaveText() {
    this.setSaveText('', null);
  }

  /**
   * Start the auto save interval for this node
   */
  startAutoSaveInterval() {
    this.autoSaveIntervalId = setInterval(() => {
      if (this.dirtyComponentIds.length) {
        const isAutoSave = true;
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
   * @param isSubmit (optional) whether this is a submit or not
   * @returns a promise that will save all the component states for the step
   * that needs saving
   */
  createAndSaveComponentData(isAutoSave, componentId, isSubmit) {
    return this.createComponentStates(isAutoSave, componentId, isSubmit)
        .then((componentStates) => {
      let componentAnnotations = [];
      let componentEvents = [];
      let nodeStates = [];
      if (this.UtilService.arrayHasNonNullElement(componentStates)) {
        for (const componentState of componentStates) {
          if (componentState != null) {
            let annotations = componentState.annotations;
            if (annotations != null) {
              componentAnnotations = componentAnnotations.concat(annotations);
            }
            delete componentState.annotations;
          }
        }
        return this.StudentDataService.saveToServer(componentStates, nodeStates, componentEvents, componentAnnotations)
            .then((savedStudentDataResponse) => {
          if (savedStudentDataResponse) {
            if (this.NodeService.currentNodeHasTransitionLogic()) {
              if (this.NodeService.evaluateTransitionLogicOn('studentDataChanged')) {
                this.NodeService.evaluateTransitionLogic();
              }
              if (this.NodeService.evaluateTransitionLogicOn('scoreChanged')) {
                if (componentAnnotations != null && componentAnnotations.length > 0) {
                  let evaluateTransitionLogic = false;
                  for (const componentAnnotation of componentAnnotations) {
                    if (componentAnnotation != null) {
                      if (componentAnnotation.type === 'autoScore') {
                        evaluateTransitionLogic = true;
                      }
                    }
                  }
                  if (evaluateTransitionLogic) {
                    this.NodeService.evaluateTransitionLogic();
                  }
                }
              }
            }
            const studentWorkList = savedStudentDataResponse.studentWorkList;
            if (!componentId && studentWorkList && studentWorkList.length) {
              const latestStudentWork = studentWorkList[studentWorkList.length - 1];
              const serverSaveTime = latestStudentWork.serverSaveTime;
              const clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
              if (isAutoSave) {
                this.setAutoSavedMessage(clientSaveTime);
              } else if (isSubmit) {
                this.setSubmittedMessage(clientSaveTime);
              } else {
                this.setSavedMessage(clientSaveTime);
              }
            } else {
              this.clearSaveText();
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
    let components = [];
    let componentStatePromises = [];

    if (componentId) {
      let component = this.getComponentById(componentId);
      if (component) {
        components.push(component);
      }
    } else {
      components = this.getComponents();
    }

    if (components.length) {
      const runId = this.ConfigService.getRunId();
      const periodId = this.ConfigService.getPeriodId();
      const workgroupId = this.ConfigService.getWorkgroupId();
      const nodeId = this.nodeId;

      for (const component of components) {
        if (component != null) {
          const tempComponentId = component.id;
          const componentType = component.type;

          const childScope = this.componentToScope[tempComponentId];
          if (childScope != null) {
            if (childScope.getComponentState) {
              const componentStatePromise =
                  this.getComponentStateFromChildScope(childScope, runId, periodId, workgroupId, nodeId, componentId, tempComponentId, componentType, isAutoSave, isSubmit);
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
        componentState.componentId = tempComponentId;
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
    latestScoreAnnotation = this.AnnotationService
        .getLatestScoreAnnotation(nodeId, componentId, workgroupId, 'any');
    latestCommentAnnotation = this.AnnotationService
        .getLatestCommentAnnotation(nodeId, componentId, workgroupId, 'any');

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
      let components = this.getComponents();
      if (components != null) {

        /*
         * loop through all the components and look for components
         * that are listening for the given component id to change.
         * only notify components that are listening for changes
         * from the specific component id.
         */
        for (let tempComponent of components) {
          if (tempComponent != null) {
            let tempComponentId = tempComponent.id;
            /*
             * get the connected components that this component is
             * listening for
             */
            let connectedComponents = tempComponent.connectedComponents;
            if (connectedComponents != null) {
              for (let connectedComponentParams of connectedComponents) {
                if (connectedComponentParams != null) {
                  let nodeId = connectedComponentParams.nodeId;
                  let componentId = connectedComponentParams.componentId;

                  /*
                   * get the id which is the old field that we used to store
                   * the component id in. this is here to maintain backwards
                   * compatibility.
                   */
                  let id = connectedComponentParams.id;

                  if (nodeId != null && componentId != null) {
                    let connectedComponentId = componentId;
                    let connectedNodeId = nodeId;
                    if (connectedNodeId == this.nodeId && connectedComponentId === changedComponentId) {
                      let connectedComponent = this.getComponentById(connectedComponentId);
                      let componentScope = this.componentToScope[tempComponentId];
                      if (componentScope.handleConnectedComponentStudentDataChanged != null) {
                        componentScope.handleConnectedComponentStudentDataChanged(connectedComponent, connectedComponentParams, componentState);
                      }
                    }
                  } else if (componentId != null) {
                    /*
                     * the node id was not provided but the component id was provided
                     * so we will assume the component id is in the current node
                     */
                    let connectedComponentId = componentId;
                    if (connectedComponentId === changedComponentId) {
                      let connectedComponent = this.getComponentById(connectedComponentId);
                      let componentScope = this.componentToScope[tempComponentId];
                      if (componentScope.handleConnectedComponentStudentDataChanged != null) {
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
                    let connectedComponentId = id;
                    if (connectedComponentId === changedComponentId) {
                      let connectedComponent = this.getComponentById(connectedComponentId);
                      let componentScope = this.componentToScope[tempComponentId];
                      if (componentScope.handleConnectedComponentStudentDataChanged != null) {
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
    if (componentId != null) {
      return this.StudentDataService
          .getLatestComponentStateByNodeIdAndComponentId(this.nodeId, componentId);
    }
    return null;
  };

  /**
   * Get the student data for a specific part
   * @param the nodeId
   * @param the componentId
   * @return the student data for the given component
   */
  getComponentStateByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null && componentId != null) {
      return this.StudentDataService
          .getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
    }
    return null;
  };

  nodeUnloaded(nodeId) {
    hopscotch.endTour(this.rubricTour);
    const isAutoSave = true;
    this.createAndSaveComponentData(isAutoSave);
    const componentId = null;
    const componentType = null;
    const category = "Navigation";
    const event = "nodeExited";
    const eventData = {};
    eventData.nodeId = nodeId;
    this.StudentDataService.saveVLEEvent(
        nodeId, componentId, componentType, category, event, eventData);
  };

  /**
   * Checks whether any of the node's components have unsubmitted work
   * @return boolean whether or not there is unsubmitted work
   */
  getSubmitDirty() {
    const components = this.getComponents();
    if (components != null) {
      for (let component of components) {
        const componentId = component.id;
        const latestState = this.getComponentStateByComponentId(componentId);
        if (latestState && !latestState.isSubmit) {
          return true;
        }
      }
    }
    return false;
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

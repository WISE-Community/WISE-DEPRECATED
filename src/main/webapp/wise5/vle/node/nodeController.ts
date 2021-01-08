import { AnnotationService } from '../../services/annotationService';
import { ConfigService } from '../../services/configService';
import { NodeService } from '../../services/nodeService';
import { VLEProjectService } from '../vleProjectService';
import { StudentDataService } from '../../services/studentDataService';
import { UtilService } from '../../services/utilService';
import * as hopscotch from 'hopscotch';
window['hopscotch'] = hopscotch;
import * as $ from 'jquery';
import { Subscription } from 'rxjs';
import { SessionService } from '../../services/sessionService';
import { StudentAssetService } from '../../services/studentAssetService';
import { Directive } from '@angular/core';

@Directive()
class NodeController {
  $translate: any;
  autoSaveInterval: any;
  autoSaveIntervalId: any;
  componentDirtySubscription: Subscription;
  componentSaveTriggeredSubscription: Subscription;
  componentStudentDataSubscription: Subscription;
  componentSubmitDirtySubscription: Subscription;
  componentSubmitTriggeredSubscription: Subscription;
  componentToScope: any;
  dirtyComponentIds: any;
  dirtySubmitComponentIds: any;
  endedAndLockedMessage: string;
  exitSubscription: Subscription;
  isDisabled: boolean;
  isEndedAndLocked: boolean;
  mode: any;
  nodeContent: any;
  nodeId: string;
  nodeStatus: any;
  nodeTitle: string;
  rubric: any;
  rubricTour: any;
  saveMessage: any;
  showRubricSubscription: Subscription;
  submit: any;
  teacherWorkgroupId: number;
  workgroupId: number;

  static $inject = [
    '$compile',
    '$filter',
    '$q',
    '$scope',
    '$state',
    '$timeout',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'ProjectService',
    'SessionService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    private $compile: any,
    $filter: any,
    private $q: any,
    private $scope: any,
    private $state: any,
    private $timeout: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private NodeService: NodeService,
    private ProjectService: VLEProjectService,
    private SessionService: SessionService,
    private StudentAssetService: StudentAssetService,
    private StudentDataService: StudentDataService,
    private UtilService: UtilService
  ) {
    this.$translate = $filter('translate');
    this.autoSaveInterval = 60000; // in milliseconds
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

    this.isEndedAndLocked = this.ConfigService.isEndedAndLocked();
    if (this.isEndedAndLocked) {
      const endDate = this.ConfigService.getPrettyEndDate();
      this.endedAndLockedMessage = this.$translate('endedAndLockedMessage', { endDate: endDate });
    }

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

    if (
      this.StudentDataService.getCurrentNode() &&
      this.ProjectService.isApplicationNode(this.StudentDataService.getCurrentNodeId())
    ) {
      const currentNode = this.StudentDataService.getCurrentNode();
      if (currentNode != null) {
        this.nodeId = currentNode.id;
      }

      this.nodeContent = this.ProjectService.getNodeById(this.nodeId);
      this.nodeTitle = this.ProjectService.getNodeTitleByNodeId(this.nodeId);
      this.nodeStatus = this.StudentDataService.nodeStatuses[this.nodeId];
      this.startAutoSaveInterval();
      this.registerExitListener();

      if (
        this.NodeService.currentNodeHasTransitionLogic() &&
        this.NodeService.evaluateTransitionLogicOn('enterNode')
      ) {
        this.NodeService.evaluateTransitionLogic();
      }

      // set save message with last save/submission
      // for now, we'll use the latest component state (since we don't currently keep track of node-level saves)
      // TODO: use node states once we implement node state saving
      const latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId
      );
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
      const category = 'Navigation';
      const event = 'nodeEntered';
      const eventData = {
        nodeId: nodeId
      };
      this.StudentDataService.saveVLEEvent(
        nodeId,
        componentId,
        componentType,
        category,
        event,
        eventData
      );

      if (this.nodeContent != null) {
        this.rubric = this.nodeContent.rubric;
        this.createRubricTour();
      }

      if (
        this.$state != null &&
        this.$state.params != null &&
        this.$state.params.componentId != null
      ) {
        const componentId = this.$state.params.componentId;
        this.scrollAndHighlightComponent(componentId);
      }
    }

    this.componentSaveTriggeredSubscription = this.StudentDataService.componentSaveTriggered$.subscribe(
      ({ nodeId, componentId }) => {
        if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
          const isAutoSave = false;
          this.createAndSaveComponentData(isAutoSave, componentId);
        }
      }
    );

    this.componentSubmitTriggeredSubscription = this.StudentDataService.componentSubmitTriggered$.subscribe(
      ({ nodeId, componentId }) => {
        if (this.nodeId == nodeId && this.nodeContainsComponent(componentId)) {
          const isAutoSave = false;
          const isSubmit = true;
          this.createAndSaveComponentData(isAutoSave, componentId, isSubmit);
        }
      }
    );

    this.componentStudentDataSubscription = this.StudentDataService.componentStudentData$.subscribe(
      (componentStudentData: any) => {
        const componentId = componentStudentData.componentId;
        const componentState = componentStudentData.componentState;
        if (componentState.nodeId == null) {
          if (componentStudentData.nodeId != null) {
            componentState.nodeId = componentStudentData.nodeId;
          }
        }
        if (componentState.componentId == null) {
          if (componentStudentData.componentId != null) {
            componentState.componentId = componentStudentData.componentId;
          }
        }
        this.notifyConnectedParts(componentId, componentState);
        this.NodeService.broadcastSiblingComponentStudentDataChanged(componentStudentData);
      }
    );

    this.componentDirtySubscription = this.StudentDataService.componentDirty$.subscribe(
      ({ componentId, isDirty }) => {
        const index = this.dirtyComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          this.dirtyComponentIds.push(componentId);
        } else if (!isDirty && index > -1) {
          this.dirtyComponentIds.splice(index, 1);
        }
      }
    );

    this.componentSubmitDirtySubscription = this.StudentDataService.componentSubmitDirty$.subscribe(
      ({ componentId, isDirty }) => {
        const index = this.dirtySubmitComponentIds.indexOf(componentId);
        if (isDirty && index === -1) {
          this.dirtySubmitComponentIds.push(componentId);
        } else if (!isDirty && index > -1) {
          this.dirtySubmitComponentIds.splice(index, 1);
        }
      }
    );

    this.showRubricSubscription = this.NodeService.showRubric$.subscribe((id: string) => {
      this.showRubric(id);
    });

    const script = this.nodeContent.script;
    if (script != null) {
      this.ProjectService.retrieveScript(script).then((script: string) => {
        new Function(script).call(this);
      });
    }

    this.$scope.$on('$destroy', () => {
      this.ngOnDestroy();
    });
  }

  ngOnDestroy() {
    this.stopAutoSaveInterval();
    this.nodeUnloaded(this.nodeId);
    if (
      this.NodeService.currentNodeHasTransitionLogic() &&
      this.NodeService.evaluateTransitionLogicOn('exitNode')
    ) {
      this.NodeService.evaluateTransitionLogic();
    }
    this.unsubscribeAll();
  }

  unsubscribeAll() {
    this.componentDirtySubscription.unsubscribe();
    this.componentSaveTriggeredSubscription.unsubscribe();
    this.componentStudentDataSubscription.unsubscribe();
    this.componentSubmitDirtySubscription.unsubscribe();
    this.componentSubmitTriggeredSubscription.unsubscribe();
    this.exitSubscription.unsubscribe();
    this.showRubricSubscription.unsubscribe();
  }

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
      const content = this.UtilService.insertWISELinks(
        this.ProjectService.replaceAssetPaths(this.rubric)
      );
      // add a tour bubble for the node rubric
      this.rubricTour.steps.push({
        target: thisTarget,
        placement: 'bottom',
        title: this.$translate('STEP_INFO'),
        content: content,
        xOffset: 'center',
        arrowOffset: 'center',
        onShow: this.onShowRubric,
        viewed: false
      });
    }

    // add tour bubbles for each of the component rubrics
    const components = this.getComponents();
    for (let component of components) {
      if (component.rubric) {
        const thisTarget = '#rubric_' + component.id;
        const content = this.UtilService.insertWISELinks(
          this.ProjectService.replaceAssetPaths(component.rubric)
        );
        this.rubricTour.steps.push({
          target: thisTarget,
          arrowOffset: 21,
          placement: 'right',
          yOffset: 1,
          title: this.$translate('ITEM_INFO'),
          content: content,
          onShow: this.onShowRubric,
          viewed: false
        });
      }
    }
  }

  showRubric(id) {
    if (this.rubricTour) {
      let step = -1;
      let index = 0;
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
            if (component.id === id) {
              step = index;
              break;
            }
            index++;
          }
        }
      }
      hopscotch.endTour(this.rubricTour);
      hopscotch.startTour(this.rubricTour, step);
    }
  }

  scrollAndHighlightComponent(componentId) {
    this.$timeout(() => {
      const componentElement = $('#component_' + componentId);
      if (componentElement != null) {
        const originalBackgroundColor = componentElement.css('backgroundColor');
        componentElement.css('background-color', '#FFFF9C');
        $('#content').animate(
          {
            scrollTop: componentElement.prop('offsetTop')
          },
          1000
        );

        /*
         * remove the background highlighting so that it returns
         * to its original color
         */
        componentElement.css({
          transition: 'background-color 3s ease-in-out',
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
    const template = `<div class="hopscotch-bubble-container help-bubble md-whiteframe-4dp" style="width: ${
      step.width
    }px; padding: ${step.padding}px;">
                <md-toolbar class="md-subhead help-bubble__title md-toolbar--wise">
                    <div class="help-bubble___title__content" layout="row" layout-align="start center" flex>
                        <span>${tour.isTour ? `${i18n.stepNum} | ` : ''}${
      step.title !== '' ? `${step.title}` : ''
    }</span>
                        <span flex></span>
                        ${
                          buttons.showClose
                            ? `<md-button class="md-icon-button hopscotch-close">
                            <md-icon aria-label="${i18n.closeTooltip}"> close </md-icon>
                        </md-button>`
                            : ''
                        }
                    </div>
                </md-toolbar>
                <div class="help-bubble__content">
                    ${step.content !== '' ? `${step.content}` : ''}
                    ${
                      buttons.showCTA
                        ? `<md-button class="hopscotch-cta md-primary md-raised">${i18n.ctaLabel}</md-button>`
                        : ''
                    }
                </div>
                <md-divider></md-divider>
                <div class="help-bubble__actions gray-lightest-bg" layout="row" layout-align="start center">
                    ${
                      buttons.showClose
                        ? `<md-button class="button--small hopscotch-close">${i18n.closeTooltip}</md-button>`
                        : ''
                    }
                    <span flex></span>
                    ${
                      buttons.showPrev
                        ? `<md-button class="button--small info hopscotch-prev">${i18n.prevBtn}</md-button>`
                        : ''
                    }
                    ${
                      buttons.showNext
                        ? `<md-button class="button--small info hopscotch-next">${i18n.nextBtn}</md-button>`
                        : ''
                    }
                </md-card-actions>
            </div>`;

    // need to compile the template here because Hopscotch inserts raw html
    const templateHTML =
      $ctrl.$compile(template)($ctrl.$scope)[0].outerHTML +
      `<div class="hopscotch-bubble-arrow-container hopscotch-arrow">
                <div class="hopscotch-bubble-arrow-border"></div>
                <div class="hopscotch-bubble-arrow"></div>
            </div>`;
    return templateHTML;
  }

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
    return this.rubric != null && this.rubric != '' && this.mode === 'preview';
  }

  isShowComponentRubric(component) {
    return component.rubric != null && component.rubric != '' && this.mode === 'preview';
  }

  setStudentWork() {}

  importWork() {}

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

    this.StudentAssetService.broadcastShowStudentAssets({
      componentController: componentController,
      $event: $event
    });
  }

  saveButtonClicked() {
    const isAutoSave = false;
    this.createAndSaveComponentData(isAutoSave);
  }

  submitButtonClicked() {
    this.NodeService.broadcastNodeSubmitClicked({ nodeId: this.nodeId });
    const isAutoSave = false;
    const isSubmit = true;
    this.createAndSaveComponentData(isAutoSave, null, isSubmit);
  }

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
  }

  getComponentById(componentId) {
    for (const component of this.getComponents()) {
      if (component.id === componentId) {
        return component;
      }
    }
    return null;
  }

  nodeContainsComponent(componentId) {
    for (const component of this.getComponents()) {
      if (component.id === componentId) {
        return true;
      }
    }
    return false;
  }

  getComponentTemplatePath(componentType) {
    return this.NodeService.getComponentTemplatePath(componentType);
  }

  showSaveButton() {
    return this.nodeContent != null && this.nodeContent.showSaveButton;
  }

  showSubmitButton() {
    return this.nodeContent != null && this.nodeContent.showSubmitButton;
  }

  setSavedMessage(time) {
    this.setSaveText(this.$translate('SAVED'), time);
  }

  setAutoSavedMessage(time) {
    this.setSaveText(this.$translate('AUTO_SAVED'), time);
  }

  setSubmittedMessage(time) {
    this.setSaveText(this.$translate('SUBMITTED'), time);
  }

  setSaveText(message, time) {
    this.saveMessage.text = message;
    this.saveMessage.time = time;
  }

  clearSaveText() {
    this.setSaveText('', null);
  }

  startAutoSaveInterval() {
    this.autoSaveIntervalId = setInterval(() => {
      if (this.dirtyComponentIds.length) {
        const isAutoSave = true;
        this.createAndSaveComponentData(isAutoSave);
      }
    }, this.autoSaveInterval);
  }

  stopAutoSaveInterval() {
    clearInterval(this.autoSaveIntervalId);
  }

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
  createAndSaveComponentData(isAutoSave, componentId = null, isSubmit = null) {
    return this.createComponentStates(isAutoSave, componentId, isSubmit).then(
      (componentStatesFromComponents) => {
        if (this.UtilService.arrayHasNonNullElement(componentStatesFromComponents)) {
          const {
            componentStates,
            componentEvents,
            componentAnnotations
          } = this.getDataArraysToSaveFromComponentStates(componentStatesFromComponents);
          return this.StudentDataService.saveToServer(
            componentStates,
            componentEvents,
            componentAnnotations
          ).then((savedStudentDataResponse) => {
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
      }
    );
  }

  getDataArraysToSaveFromComponentStates(componentStates) {
    return {
      componentStates: componentStates,
      componentEvents: [],
      componentAnnotations: this.getAnnotationsFromComponentStates(componentStates)
    };
  }

  getAnnotationsFromComponentStates(componentStates) {
    const componentAnnotations = [];
    for (const componentState of componentStates) {
      const annotations = componentState.annotations;
      if (annotations != null) {
        componentAnnotations.push(...annotations);
      }
      delete componentState.annotations;
    }
    return componentAnnotations;
  }

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
      const component = this.getComponentById(componentId);
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
              const componentStatePromise = this.getComponentStateFromChildScope(
                childScope,
                runId,
                periodId,
                workgroupId,
                nodeId,
                componentId,
                tempComponentId,
                componentType,
                isAutoSave,
                isSubmit
              );
              componentStatePromises.push(componentStatePromise);
            }
          }
        }
      }
    }
    return this.$q.all(componentStatePromises).then((componentStatesFromComponents) => {
      return componentStatesFromComponents.filter((componentState) => componentState != null);
    });
  }

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
  getComponentStateFromChildScope(
    childScope,
    runId,
    periodId,
    workgroupId,
    nodeId,
    componentId,
    tempComponentId,
    componentType,
    isAutoSave,
    isSubmit
  ) {
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
    latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(
      nodeId,
      componentId,
      workgroupId,
      'any'
    );
    latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(
      nodeId,
      componentId,
      workgroupId,
      'any'
    );
    return {
      score: latestScoreAnnotation,
      comment: latestCommentAnnotation
    };
  }

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
                    if (
                      connectedNodeId == this.nodeId &&
                      connectedComponentId === changedComponentId
                    ) {
                      let connectedComponent = this.getComponentById(connectedComponentId);
                      let componentScope = this.componentToScope[tempComponentId];
                      if (componentScope.handleConnectedComponentStudentDataChanged != null) {
                        componentScope.handleConnectedComponentStudentDataChanged(
                          connectedComponent,
                          connectedComponentParams,
                          componentState
                        );
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
                        componentScope.handleConnectedComponentStudentDataChanged(
                          connectedComponent,
                          connectedComponentParams,
                          componentState
                        );
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
                        componentScope.handleConnectedComponentStudentDataChanged(
                          connectedComponent,
                          connectedComponentParams,
                          componentState
                        );
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
  }

  getComponentStateByComponentId(componentId) {
    if (componentId != null) {
      return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId,
        componentId
      );
    }
    return null;
  }

  getComponentStateByNodeIdAndComponentId(nodeId, componentId) {
    if (nodeId != null && componentId != null) {
      return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        nodeId,
        componentId
      );
    }
    return null;
  }

  nodeUnloaded(nodeId) {
    hopscotch.endTour(this.rubricTour);
    const isAutoSave = true;
    this.createAndSaveComponentData(isAutoSave);
    const componentId = null;
    const componentType = null;
    const category = 'Navigation';
    const event = 'nodeExited';
    const eventData = {
      nodeId: nodeId
    };
    this.StudentDataService.saveVLEEvent(
      nodeId,
      componentId,
      componentType,
      category,
      event,
      eventData
    );
  }

  getSubmitDirty() {
    const components = this.getComponents();
    if (components != null) {
      for (const component of components) {
        const latestState = this.getComponentStateByComponentId(component.id);
        if (latestState && !latestState.isSubmit) {
          return true;
        }
      }
    }
    return false;
  }

  registerExitListener() {
    this.exitSubscription = this.SessionService.exit$.subscribe(() => {
      this.stopAutoSaveInterval();
      this.nodeUnloaded(this.nodeId);
    });
  }
}

export default NodeController;

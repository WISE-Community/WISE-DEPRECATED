'use strict';

import 'svg.js';
import 'svg.draggable.js';
import * as angular from 'angular';
import ComponentController from '../componentController';
import { ConceptMapService } from './conceptMapService';

class ConceptMapController extends ComponentController {
  $anchorScroll: any;
  $injector: any;
  $location: any;
  $q: any;
  $timeout: any;
  ConceptMapService: ConceptMapService;
  width: number;
  height: number;
  availableNodes: any[];
  availableLinks: any[];
  nodes: any[];
  links: any[];
  displayLinkTypeChooser: boolean;
  displayLinkTypeChooserModalOverlay: boolean;
  selectedLinkType: string;
  initializedDisplayLinkTypeChooserModalOverlay: boolean;
  modalWidth: number;
  modalHeight: number;
  autoFeedbackString: string;
  selectedNode: any;
  tempOffsetX: number;
  tempOffsetY: number;
  componentStateId: number;
  svgId: string;
  conceptMapContainerId: string;
  selectNodeBarId: string;
  feedbackContainerId: string;
  draw: any;
  autoFeedbackResult: any;
  background: any;
  stretchBackground: any;
  highlightedElement: any;
  linkTypeChooserStyle: any;
  newlyCreatedLink: any;
  activeNode: any;
  activeLink: any;
  drawingLink: any;
  addedDragOverListener: any;
  addedDropListener: any;
  linkTypeChooserModalOverlayStyle: any;
  activeLinkStartX: number;
  activeLinkStartY: number;
  linkCurvatureSet: boolean;
  backgroundSize: string;

  static $inject = [
    '$anchorScroll',
    '$filter',
    '$injector',
    '$location',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'AudioRecorderService',
    'ConceptMapService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $anchorScroll,
    $filter,
    $injector,
    $location,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    $timeout,
    AnnotationService,
    AudioRecorderService,
    ConceptMapService,
    ConfigService,
    NodeService,
    NotebookService,
    NotificationService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      AudioRecorderService,
      ConfigService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.$q = $q;
    this.$timeout = $timeout;
    this.ConceptMapService = ConceptMapService;

    this.width = 800;
    this.height = 600;
    this.availableNodes = [];
    this.availableLinks = [];
    this.nodes = [];
    this.links = [];
    this.displayLinkTypeChooser = false;
    this.displayLinkTypeChooserModalOverlay = false;
    this.selectedLinkType = null;
    this.initializedDisplayLinkTypeChooserModalOverlay = false;
    this.modalWidth = 800;
    this.modalHeight = 600;
    this.autoFeedbackString = '';

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

    this.setBackgroundImage(
      this.componentContent.background,
      this.componentContent.stretchBackground
    );
    this.setIdsWithNodeIdComponentId();

    this.initialize();

    if (this.isGradingMode() || this.isGradingRevisionMode()) {
      const componentState = this.$scope.componentState;
      if (componentState) {
        if (this.mode === 'gradingRevision') {
          this.setIdsWithNodeIdComponentIdWorkgroupIdComponentStateIdPrefix(componentState);
        } else {
          this.setIdsWithNodeIdComponentIdWorkgroupIdComponentStateId(componentState);
        }
      } else {
        this.setIdsWithNodeIdComponentIdWorkgroupId();
      }
    } else {
      this.availableNodes = this.componentContent.nodes;
      this.availableLinks = this.componentContent.links;
    }

    /*
     * Call the initializeSVG() after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    this.$timeout(angular.bind(this, this.initializeSVG));

    this.initializeScopeGetComponentState(this.$scope, 'conceptMapController');
    this.broadcastDoneRenderingComponent();
  }

  initialize() {
    this.initializeWidth();
    this.initializeHeight();
    this.initializeShowNodeLabels();
  }

  initializeWidth() {
    if (this.componentContent.width != null) {
      this.width = this.componentContent.width;
    }
  }

  initializeHeight() {
    if (this.componentContent.height != null) {
      this.height = this.componentContent.height;
    }
  }

  initializeShowNodeLabels() {
    if (this.componentContent.showNodeLabels == null) {
      this.componentContent.showNodeLabels = true;
    }
  }

  setIdsWithNodeIdComponentId() {
    this.setSVGId(this.nodeId, this.componentId);
    this.setConceptMapContainerId(this.nodeId, this.componentId);
    this.setSelectNodeBarId(this.nodeId, this.componentId);
    this.setFeedbackContainerId(this.nodeId, this.componentId);
  }

  setIdsWithNodeIdComponentIdWorkgroupId() {
    this.setSVGId(this.nodeId, this.componentId, this.workgroupId);
    this.setConceptMapContainerId(this.nodeId, this.componentId, this.workgroupId);
    this.setSelectNodeBarId(this.nodeId, this.componentId, this.workgroupId);
    this.setFeedbackContainerId(this.nodeId, this.componentId, this.workgroupId);
  }

  setIdsWithNodeIdComponentIdWorkgroupIdComponentStateId(componentState) {
    this.setSVGId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
    this.setConceptMapContainerId(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      componentState.id
    );
    this.setSelectNodeBarId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
    this.setFeedbackContainerId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
  }

  setIdsWithNodeIdComponentIdWorkgroupIdComponentStateIdPrefix(componentState) {
    this.setSVGId(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      componentState.id,
      'gradingRevision_'
    );
    this.setConceptMapContainerId(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      componentState.id,
      'gradingRevision_'
    );
    this.setSelectNodeBarId(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      componentState.id,
      'gradingRevision_'
    );
    this.setFeedbackContainerId(
      this.nodeId,
      this.componentId,
      this.workgroupId,
      componentState.id,
      'gradingRevision_'
    );
  }

  setSVGId(nodeId, componentId, workgroupId = null, componentStateId = null, prefix = '') {
    if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
      this.svgId =
        'svg_' + prefix + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
    } else if (nodeId != null && componentId != null && workgroupId != null) {
      this.svgId = 'svg_' + nodeId + '_' + componentId + '_' + workgroupId;
    } else if (nodeId != null && componentId != null) {
      this.svgId = 'svg_' + nodeId + '_' + componentId;
    }
  }

  setConceptMapContainerId(
    nodeId,
    componentId,
    workgroupId = null,
    componentStateId = null,
    prefix = ''
  ) {
    if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
      this.conceptMapContainerId =
        'conceptMapContainer_' +
        nodeId +
        '_' +
        componentId +
        '_' +
        workgroupId +
        '_' +
        componentStateId;
    } else if (nodeId != null && componentId != null && workgroupId != null) {
      this.conceptMapContainerId =
        'conceptMapContainer_' + nodeId + '_' + componentId + '_' + workgroupId;
    } else if (nodeId != null && componentId != null) {
      this.conceptMapContainerId = 'conceptMapContainer_' + nodeId + '_' + componentId;
    }
  }

  setSelectNodeBarId(
    nodeId,
    componentId,
    workgroupId = null,
    componentStateId = null,
    prefix = ''
  ) {
    if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
      this.selectNodeBarId =
        'selectNodeBar_' + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
    } else if (nodeId != null && componentId != null && workgroupId != null) {
      this.selectNodeBarId = 'selectNodeBar_' + nodeId + '_' + componentId + '_' + workgroupId;
    } else if (nodeId != null && componentId != null) {
      this.selectNodeBarId = 'selectNodeBar_' + nodeId + '_' + componentId;
    }
  }

  setFeedbackContainerId(
    nodeId,
    componentId,
    workgroupId = null,
    componentStateId = null,
    prefix = ''
  ) {
    if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
      this.feedbackContainerId =
        'feedbackContainer_' +
        nodeId +
        '_' +
        componentId +
        '_' +
        workgroupId +
        '_' +
        componentStateId;
    } else if (nodeId != null && componentId != null && workgroupId != null) {
      this.feedbackContainerId =
        'feedbackContainer_' + nodeId + '_' + componentId + '_' + workgroupId;
    } else if (nodeId != null && componentId != null) {
      this.feedbackContainerId = 'feedbackContainer_' + nodeId + '_' + componentId;
    }
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  initializeSVG() {
    this.setupSVG();
    let componentState = this.$scope.componentState;

    if (this.isStudentMode()) {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        this.ConceptMapService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        componentState = this.ProjectService.injectAssetPaths(componentState);
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        !this.ConceptMapService.componentStateHasStudentWork(
          componentState,
          this.componentContent
        ) &&
        this.componentContentHasStarterConceptMap()
      ) {
        const conceptMapData = this.componentContent.starterConceptMap;
        this.populateConceptMapData(conceptMapData);
      }
    } else {
      if (componentState == null) {
        this.populateStarterConceptMap();
      } else {
        componentState = this.ProjectService.injectAssetPaths(componentState);
        this.setStudentWork(componentState);
      }
    }

    if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
      this.disableSubmitButton();
    }

    if (!this.isDisabled) {
      this.enableNodeDragging();
    }
    this.disableComponentIfNecessary();
    this.broadcastDoneRenderingComponent();
  }

  componentContentHasStarterConceptMap() {
    return this.componentContent.starterConceptMap != null;
  }

  setStudentWork(componentState) {
    const studentData = componentState.studentData;
    if (studentData != null) {
      const conceptMapData = studentData.conceptMapData;
      const submitCounter = studentData.submitCounter;
      if (submitCounter != null) {
        this.submitCounter = submitCounter;
      }
      if (conceptMapData != null) {
        this.populateConceptMapData(conceptMapData);
      }
      this.processLatestStudentWork();
    }
  }

  populateConceptMapData(conceptMapData) {
    this.populateNodes(conceptMapData);
    this.populateLinks(conceptMapData);

    if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath != '') {
      this.setBackgroundImage(conceptMapData.backgroundPath, conceptMapData.stretchBackground);
    }

    this.moveLinkTextToFront();
    this.moveNodesToFront();

    /*
     * set a timeout to refresh the link labels so that the rectangles
     * around the labels are properly resized
     */
    this.$timeout(() => {
      this.refreshLinkLabels();
    });
  }

  populateNodes(conceptMapData) {
    this.nodes = [];
    for (let node of conceptMapData.nodes) {
      const instanceId = node.instanceId;
      const originalId = node.originalId;
      const filePath = node.fileName;
      const label = node.label;
      const x = node.x;
      const y = node.y;
      const width = node.width;
      const height = node.height;
      const conceptMapNode = this.ConceptMapService.newConceptMapNode(
        this.draw,
        instanceId,
        originalId,
        filePath,
        label,
        x,
        y,
        width,
        height,
        this.componentContent.showNodeLabels
      );
      this.addNode(conceptMapNode);
      if (!this.isDisabled) {
        this.setNodeMouseEvents(conceptMapNode);
      }
    }
  }

  populateLinks(conceptMapData) {
    this.links = [];

    for (const link of conceptMapData.links) {
      const instanceId = link.instanceId;
      const originalId = link.originalId;
      const sourceNodeId = link.sourceNodeInstanceId;
      const destinationNodeId = link.destinationNodeInstanceId;
      const label = link.label;
      const color = link.color;
      const curvature = link.curvature;
      const startCurveUp = link.startCurveUp;
      const endCurveUp = link.endCurveUp;
      let sourceNode = null;
      let destinationNode = null;

      if (sourceNodeId != null) {
        sourceNode = this.getNodeById(sourceNodeId);
      }

      if (destinationNodeId != null) {
        destinationNode = this.getNodeById(destinationNodeId);
      }

      const conceptMapLink = this.ConceptMapService.newConceptMapLink(
        this.draw,
        instanceId,
        originalId,
        sourceNode,
        destinationNode,
        label,
        color,
        curvature,
        startCurveUp,
        endCurveUp
      );
      this.addLink(conceptMapLink);
      if (!this.isDisabled) {
        this.setLinkMouseEvents(conceptMapLink);
      }
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
    for (const node of this.nodes) {
      if (node.showLabel) {
        const label = node.getLabel();
        /*
         * set the label back into the node so that the rectangle
         * around the text label is resized to the text
         */
        node.setLabel(label);
      }
    }

    for (const link of this.links) {
      const label = link.getLabel();
      /*
       * set the label back into the link so that the rectangle
       * around the text label is resized to the text
       */
      link.setLabel(label);
    }
  }

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {
    if (this.isSubmitDirty) {
      let performSubmit = true;
      if (this.hasMaxSubmitCount()) {
        const numberOfSubmitsLeft = this.getNumberOfSubmitsLeft();
        let message = '';
        if (numberOfSubmitsLeft <= 0) {
          alert(this.$translate('conceptMap.youHaveNoMoreChances'));
          performSubmit = false;
        } else if (numberOfSubmitsLeft === 1) {
          message = this.$translate('conceptMap.youHaveOneChance', {
            numberOfSubmitsLeft: numberOfSubmitsLeft
          });
          performSubmit = confirm(message);
        } else if (numberOfSubmitsLeft > 1) {
          message = this.$translate('conceptMap.youHaveMultipleChances', {
            numberOfSubmitsLeft: numberOfSubmitsLeft
          });
          performSubmit = confirm(message);
        }
      }

      if (performSubmit) {
        this.incrementSubmitCounter();
        if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
          this.isSubmitButtonDisabled = true;
        }
        if (this.hasAutoGrading()) {
          this.performAutoGrading();
        }
        this.isSubmit = true;
        this.emitComponentSubmitTriggered();
      } else {
        this.isSubmit = false;
      }
    }
  }

  hasAutoGrading() {
    return (
      this.componentContent.customRuleEvaluator != null &&
      this.componentContent.customRuleEvaluator != ''
    );
  }

  performAutoGrading() {
    const customRuleEvaluator = this.componentContent.customRuleEvaluator;
    const componentContent = this.componentContent;
    const conceptMapData = this.getConceptMapData();
    const thisConceptMapService = this.ConceptMapService;
    let thisResult: any = {};

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
    const any = function () {
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
    const all = function () {
      return thisConceptMapService.all(componentContent, conceptMapData, arguments);
    };

    /*
     * create the setResult function that can be called in the custom rule
     * evaluator code
     */
    const setResult = function (result: any) {
      thisResult = result;
    };

    eval(customRuleEvaluator);

    this.autoFeedbackResult = thisResult;
    let resultString = '';

    if (this.componentContent.showAutoScore && thisResult.score != null) {
      resultString += this.$translate('SCORE') + ': ' + thisResult.score;
      if (this.hasMaxScore()) {
        resultString += '/' + this.getMaxScore();
      }
    }

    if (this.componentContent.showAutoFeedback && thisResult.feedback != null) {
      if (resultString !== '') {
        resultString += '<br/>';
      }
      resultString += this.$translate('FEEDBACK') + ': ' + thisResult.feedback;
    }

    if (resultString != '') {
      this.$mdDialog.show(
        this.$mdDialog
          .alert()
          .clickOutsideToClose(true)
          .title(this.$translate('FEEDBACK'))
          .htmlContent(resultString)
          .ariaLabel(this.$translate('FEEDBACK'))
          .ok(this.$translate('CLOSE'))
      );
    }

    this.autoFeedbackString = resultString;
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const deferred = this.$q.defer();
    const componentState: any = this.NodeService.createNewComponentState();
    const studentData: any = {};
    const conceptMapData = this.getConceptMapData();
    studentData.conceptMapData = conceptMapData;
    componentState.isSubmit = this.isSubmit;

    if (this.isSubmit) {
      this.isSubmit = false;
      if (this.hasAutoFeedbackScore() || this.hasAutoFeedbackText()) {
        const runId = this.ConfigService.getRunId();
        const periodId = this.ConfigService.getPeriodId();
        const nodeId = this.nodeId;
        const componentId = this.componentId;
        const toWorkgroupId = this.ConfigService.getWorkgroupId();
        componentState.annotations = [];

        if (this.hasAutoFeedbackScore()) {
          const data: any = {
            value: parseFloat(this.autoFeedbackResult.score),
            autoGrader: 'conceptMap'
          };

          if (this.hasMaxScore()) {
            data.maxAutoScore = parseFloat(this.getMaxScore());
          }

          const scoreAnnotation = this.AnnotationService.createAutoScoreAnnotation(
            runId,
            periodId,
            nodeId,
            componentId,
            toWorkgroupId,
            data
          );
          componentState.annotations.push(scoreAnnotation);
        }

        if (this.hasAutoFeedbackText()) {
          const data = {
            value: this.autoFeedbackResult.feedback,
            autoGrader: 'conceptMap'
          };
          const commentAnnotation = this.AnnotationService.createAutoCommentAnnotation(
            runId,
            periodId,
            nodeId,
            componentId,
            toWorkgroupId,
            data
          );
          componentState.annotations.push(commentAnnotation);
        }
      }
    }

    studentData.submitCounter = this.submitCounter;
    componentState.studentData = studentData;
    componentState.componentType = 'ConceptMap';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);

    return deferred.promise;
  }

  hasAutoFeedback() {
    return this.autoFeedbackResult != null;
  }

  hasAutoFeedbackScore() {
    return this.autoFeedbackResult != null && this.autoFeedbackResult.score != null;
  }

  hasAutoFeedbackText() {
    return this.autoFeedbackResult != null && this.autoFeedbackResult.feedback != null;
  }

  getConceptMapData() {
    const studentData: any = {
      nodes: [],
      links: []
    };

    for (const node of this.nodes) {
      const nodeJSON = node.toJSONObject();
      studentData.nodes.push(nodeJSON);
    }

    for (const link of this.links) {
      const linkJSON = link.toJSONObject();
      studentData.links.push(linkJSON);
    }

    if (this.background != null) {
      const background = this.background;
      studentData.background = this.getBackgroundFileName(background);

      // this is the background path e.g. /wise/curriculum/108/assets/background.png
      studentData.backgroundPath = background;

      studentData.stretchBackground = this.stretchBackground;
    }

    return studentData;
  }

  getBackgroundFileName(background) {
    return background.substring(background.lastIndexOf('/') + 1);
  }

  /**
   * Create an auto score annotation
   * @param data the annotation data
   * @returns the auto score annotation
   */
  createAutoScoreAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();
    const annotation = this.AnnotationService.createAutoScoreAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );
    return annotation;
  }

  /**
   * Create an auto comment annotation
   * @param data the annotation data
   * @returns the auto comment annotation
   */
  createAutoCommentAnnotation(data) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const toWorkgroupId = this.ConfigService.getWorkgroupId();
    const annotation = this.AnnotationService.createAutoCommentAnnotation(
      runId,
      periodId,
      nodeId,
      componentId,
      toWorkgroupId,
      data
    );
    return annotation;
  }

  linkTypeSelected(selectedLink) {
    if (this.highlightedElement != null && this.highlightedElement.type === 'ConceptMapLink') {
      const link = this.highlightedElement;
      const label = selectedLink.label;
      const color = selectedLink.color;
      const originalId = selectedLink.id;
      link.setLabel(label);
      link.setColor(color);
      link.setOriginalId(originalId);
    }
    this.clearHighlightedElement();
    this.studentDataChanged();
  }

  getLinksTitle() {
    return this.componentContent.linksTitle;
  }

  showLinkTypeChooser() {
    if (!this.initializedDisplayLinkTypeChooserModalOverlay) {
      this.setLinkTypeChooserOverlayStyle();
      this.initializedDisplayLinkTypeChooserModalOverlay = true;
    }
    this.linkTypeChooserStyle['top'] = '20px';
    this.linkTypeChooserStyle['left'] = '600px';
    this.displayLinkTypeChooser = true;
  }

  hideLinkTypeChooser() {
    this.displayLinkTypeChooser = false;
    this.displayLinkTypeChooserModalOverlay = false;
    this.newlyCreatedLink = null;
  }

  setupSVG() {
    this.draw = SVG(this.svgId);
    this.draw.width(this.width);
    this.draw.height(this.height);

    this.highlightedElement = null;
    this.activeNode = null;
    this.activeLink = null;
    this.drawingLink = false;
    this.newlyCreatedLink = null;

    if (!this.isDisabled) {
      this.draw.mousedown((event) => {
        this.svgMouseDown(event);
      });

      this.draw.mouseup((event) => {
        this.svgMouseUp(event);
      });

      this.draw.mousemove((event) => {
        this.svgMouseMove(event);
      });

      this.addDragOverListenerIfNecessary();
      this.addDropListenerIfNecessary();
      this.setLinkTypeChooserStyle();
    }
  }

  addDragOverListenerIfNecessary() {
    const svg = angular.element(document.querySelector('#' + this.svgId));
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
      svg[0].addEventListener('dragover', (event) => {
        /*
         * prevent the default because if we don't, the user won't
         * be able to drop a new node instance onto the svg in the
         * authoring mode
         */
        event.preventDefault();
      });

      this.addedDragOverListener = true;
    }
  }

  addDropListenerIfNecessary() {
    const svg = angular.element(document.querySelector('#' + this.svgId));
    /*
     * check if we have already added the drop listener so we don't
     * add multiple listeners for the same event. adding multiple listeners
     * to the same event may occur in the authoring tool.
     */
    if (!this.addedDropListener) {
      /*
       * listen for the drop event which occurs when the student drops
       * a new node onto the svg
       */
      svg[0].addEventListener('drop', (event) => {
        /*
         * the user has dropped a new node onto the svg to create a
         * new instance of a node
         */
        this.newNodeDropped(event);
      });

      this.addedDropListener = true;
    }
  }

  setLinkTypeChooserStyle() {
    this.linkTypeChooserStyle = {
      width: '300px',
      position: 'absolute',
      left: '600px',
      top: '20px',
      border: '1px solid black',
      backgroundColor: 'white',
      cursor: 'pointer',
      'z-index': 10000,
      padding: '16px'
    };
  }

  setLinkTypeChooserOverlayStyle() {
    this.modalWidth = this.getModalWidth();
    const overlayWidth = this.modalWidth;
    const conceptMapContainer = angular.element(
      document.querySelector('#' + this.conceptMapContainerId)
    );
    const height = conceptMapContainer[0].offsetHeight;
    this.linkTypeChooserModalOverlayStyle = {
      position: 'absolute',
      'z-index': 9999,
      width: overlayWidth,
      height: height,
      'background-color': '#000000',
      opacity: 0.4
    };
  }

  getModalWidth() {
    const selectNodeBarWidthString = angular
      .element(document.getElementById('#' + this.selectNodeBarId))
      .css('width');
    const svgWidthString = angular.element(document.getElementById(this.svgId)).css('width');
    if (selectNodeBarWidthString != null && svgWidthString != null) {
      const selectNodeBarWidth = parseInt(selectNodeBarWidthString.replace('px', ''));
      const svgWidth = parseInt(svgWidthString.replace('px', ''));
      if (selectNodeBarWidth != null && svgWidth != null) {
        return selectNodeBarWidth + svgWidth;
      }
    }
    return null;
  }

  getModalHeight() {
    const selectNodeBarHeightString = angular
      .element(document.getElementById('#' + this.selectNodeBarId))
      .css('height');
    const svgHeightString = angular.element(document.getElementById(this.svgId)).css('height');
    if (selectNodeBarHeightString != null && svgHeightString != null) {
      const selectNodeBarHeight = parseInt(selectNodeBarHeightString.replace('px', ''));
      const svgHeight = parseInt(svgHeightString.replace('px', ''));
      if (selectNodeBarHeight != null && svgHeight != null) {
        return Math.max(selectNodeBarHeight, svgHeight);
      }
    }
    return null;
  }

  cancelLinkTypeChooser() {
    if (this.newlyCreatedLink != null) {
      /*
       * the student has just created this link and has not yet chosen
       * a link type so we will remove the link
       */
      this.newlyCreatedLink.remove();
      this.newlyCreatedLink = null;
    }

    this.hideLinkTypeChooser();
    this.clearHighlightedElement();
  }

  svgMouseDown(event) {
    if (event.target.tagName === 'svg') {
      this.clearHighlightedElement();
    }
  }

  svgMouseUp(event) {
    if (this.activeLink != null && this.activeNode == null) {
      /*
       * the student was creating a link but did not connect the link
       * to a destination node so we will just remove the link
       */
      this.activeLink.remove();
    }

    this.drawingLink = false;
    this.activeLink = null;
    this.enableNodeDragging();
    this.moveLinkTextToFront();
    this.moveNodesToFront();
  }

  svgMouseMove(event) {
    if (this.activeLink != null) {
      /*
       * there is an active link which means the student has created a
       * new link and is in the process of choosing the link's destination
       * node
       */

      // get the coordinates that the link should be updated to
      const coordinates = this.getRelativeCoordinatesByEvent(event);
      const x1 = null;
      const y1 = null;
      const x2 = coordinates.x;
      const y2 = coordinates.y;

      /*
       * get the location of the center of the connector that the link
       * originated from
       */
      const startX = this.activeLinkStartX;
      const startY = this.activeLinkStartY;

      /*
       * get the distance from the start to the current position of the
       * mouse
       */
      const distance = this.ConceptMapService.calculateDistance(startX, startY, x2, y2);

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
        const slope = Math.abs(this.ConceptMapService.getSlope(startX, startY, x2, y2));

        if (y2 < startY) {
          // the user has moved the mouse above the connector
          this.setActiveLinkCurvature(slope);

          // make the link curve up
          this.activeLink.startCurveUp = true;
          this.activeLink.endCurveUp = true;
        } else if (y2 > startY) {
          // the user has moved the mouse below the connector
          this.setActiveLinkCurvature(slope);

          // make the link curve down
          this.activeLink.startCurveUp = false;
          this.activeLink.endCurveUp = false;
        }

        // remember that we have set the curvature
        this.linkCurvatureSet = true;
      }

      const isDragging = true;
      this.activeLink.updateCoordinates(x1, y1, x2, y2, isDragging);
    }
  }

  setActiveLinkCurvature(slope) {
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
  }

  /**
   * Set the active node. This is called when the student places the mouse
   * over a node. When a node becomes active, we show the delete button and
   * the border.
   * @param node the node to make active
   */
  setActiveNode(node) {
    node.showDeleteButton();
    node.showBorder();
    this.activeNode = node;
  }

  clearActiveNode() {
    for (let node of this.nodes) {
      if (node === this.activeNode && node !== this.highlightedElement) {
        node.hideDeleteButton();
        node.hideBorder();
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
    const offsetX = event.offsetX;
    const offsetY = event.offsetY;
    let parentOffsetX = 0;
    let parentOffsetY = 0;
    const userAgent = navigator.userAgent;
    if (event.target.tagName === 'svg') {
      if (this.isUserAgentChrome(userAgent)) {
        const matrix = event.target.getCTM();
        parentOffsetX = matrix.e;
        parentOffsetY = matrix.f;
      } else if (this.isUserAgentFirefox(userAgent)) {
        const matrix = event.target.createSVGMatrix();
        parentOffsetX = matrix.e;
        parentOffsetY = matrix.f;
      } else {
        const matrix = event.target.getCTM();
        parentOffsetX = matrix.e;
        parentOffsetY = matrix.f;
      }
    } else if (event.target.tagName === 'circle') {
      if (this.isUserAgentChrome(userAgent)) {
      } else if (this.isUserAgentFirefox(userAgent)) {
        const matrix = event.target.getCTM();
        const bbox = event.target.getBBox();
        parentOffsetX = matrix.e + bbox.x;
        parentOffsetY = matrix.f + bbox.y;
      }
    } else if (event.target.tagName === 'rect') {
      if (this.isUserAgentChrome(userAgent)) {
      } else if (this.isUserAgentFirefox(userAgent)) {
        const matrix = event.target.getCTM();
        const bbox = event.target.getBBox();
        const x = bbox.x;
        const y = bbox.y;
        parentOffsetX = matrix.e + x;
        parentOffsetY = matrix.f + y;
      }
    } else if (event.target.tagName === 'image') {
      if (this.isUserAgentChrome(userAgent)) {
      } else if (this.isUserAgentFirefox(userAgent)) {
        const matrix = event.target.parentElement.getCTM();
        parentOffsetX = matrix.e;
        parentOffsetY = matrix.f;
      }
    } else if (event.target.tagName === 'path') {
      if (this.isUserAgentChrome(userAgent)) {
      } else if (this.isUserAgentFirefox(userAgent)) {
        const x2 = event.target.attributes['x2'];
        const y2 = event.target.attributes['y2'];
        if (x2 != null && y2 != null) {
          parentOffsetX = parseInt(x2.value);
          parentOffsetY = parseInt(y2.value);
        }
      }
    } else {
      if (this.isUserAgentChrome(userAgent)) {
      } else if (this.isUserAgentFirefox(userAgent)) {
        const matrix = event.target.getCTM();
        parentOffsetX = matrix.e;
        parentOffsetY = matrix.f;
      }
    }

    /*
     * add the parent offset values to the relative offset values to obtain
     * the x and y values relative to the upper left corner of the svg
     */
    const x = parentOffsetX + offsetX;
    const y = parentOffsetY + offsetY;

    const returnObject = {
      x: x,
      y: y
    };

    return returnObject;
  }

  isUserAgentChrome(userAgent) {
    return userAgent.indexOf('Chrome') !== -1;
  }

  isUserAgentFirefox(userAgent) {
    return userAgent.indexOf('Firefox') !== -1;
  }

  /**
   * Called when the student clicks down on a node in the left node bar
   * @param $event the mouse down event
   * @param node the node the student clicked down on
   */
  selectNode($event, node) {
    this.selectedNode = node;

    /*
     * remember the offset of the mouse relative to the upper left of the
     * node's image so that we properly calculate the node position when
     * the student releases the mouse to put the node in the svg
     */
    this.tempOffsetX = $event.offsetX;
    this.tempOffsetY = $event.offsetY;
  }

  newNodeDropped(event) {
    const selectedNode = this.selectedNode;
    const filePath = selectedNode.fileName;
    const label = selectedNode.label;
    const width = selectedNode.width;
    const height = selectedNode.height;
    const originalId = selectedNode.id;
    const coordinates = this.getRelativeCoordinatesByEvent(event);
    const x = coordinates.x - this.tempOffsetX;
    const y = coordinates.y - this.tempOffsetY;
    const newConceptMapNodeId = this.getNewConceptMapNodeId();
    const conceptMapNode = this.ConceptMapService.newConceptMapNode(
      this.draw,
      newConceptMapNodeId,
      originalId,
      filePath,
      label,
      x,
      y,
      width,
      height,
      this.componentContent.showNodeLabels
    );
    this.addNode(conceptMapNode);
    this.setNodeMouseEvents(conceptMapNode);
    this.setHighlightedElement(conceptMapNode);
    this.studentDataChanged();
    this.enableNodeDragging();
  }

  getNewConceptMapNodeId() {
    return this.ConceptMapService.getNextAvailableId(this.nodes, 'studentNode');
  }

  getNewConceptMapLinkId() {
    return this.ConceptMapService.getNextAvailableId(this.links, 'studentLink');
  }

  setNodeMouseEvents(conceptMapNode) {
    conceptMapNode.setNodeMouseOver((event) => {
      this.nodeMouseOver(event);
    });

    conceptMapNode.setNodeMouseOut((event) => {
      this.nodeMouseOut(event);
    });

    conceptMapNode.setConnectorMouseDown((event) => {
      this.disableNodeDragging();
      this.connectorMouseDown(event);
    });

    conceptMapNode.setNodeMouseDown((event) => {
      this.nodeMouseDown(event);
    });

    conceptMapNode.setNodeMouseUp((event) => {
      this.nodeMouseUp(event);
    });

    conceptMapNode.setDeleteButtonMouseDown((event) => {
      this.nodeDeleteButtonMouseDown(event);
    });

    conceptMapNode.setDeleteButtonMouseOver((event) => {
      this.nodeDeleteButtonMouseOver(event);
    });

    conceptMapNode.setDeleteButtonMouseOut((event) => {
      this.nodeDeleteButtonMouseOut(event);
    });

    conceptMapNode.setDragMove((event) => {
      this.nodeDragMove(event);
    });
  }

  setHighlightedElement(element) {
    this.clearHighlightedElement();
    this.hideLinkTypeChooser();
    this.highlightedElement = element;
    element.isHighlighted(true);
    element.showDeleteButton();
    if (element.type === 'ConceptMapNode') {
      element.showBorder();
    } else if (element.type === 'ConceptMapLink') {
      this.showLinkTypeChooser();
      this.selectedLinkType = element.getOriginalId();
    }
  }

  clearHighlightedElement() {
    if (this.highlightedElement != null) {
      if (this.highlightedElement.type === 'ConceptMapNode') {
        this.highlightedElement.hideBorder();
      } else if (this.highlightedElement.type === 'ConceptMapLink') {
        this.hideLinkTypeChooser();
      }
      this.highlightedElement.isHighlighted(false);
      this.highlightedElement.hideDeleteButton();
      this.highlightedElement = null;
    }
  }

  enableNodeDragging() {
    for (let node of this.nodes) {
      const group = node.getGroup();
      // get the bounds that we will allow the node group to be dragged in dragged in
      const options = {
        minX: 0,
        minY: 0,
        maxX: this.width,
        maxY: this.height
      };
      group.draggable(options);
    }
  }

  disableNodeDragging() {
    for (let node of this.nodes) {
      const group = node.getGroup();
      group.draggable(false);
    }
  }

  moveLinkTextToFront() {
    for (let link of this.links) {
      link.moveTextGroupToFront();
    }
  }

  moveNodesToFront() {
    for (let node of this.nodes) {
      const group = node.getGroup();
      group.front();
    }
  }

  addNode(node) {
    this.nodes.push(node);
  }

  removeNode(node) {
    const outgoingLinks = node.getOutgoingLinks();
    let numOutgoingLinks = outgoingLinks.length;
    while (numOutgoingLinks > 0) {
      const outgoingLink = outgoingLinks[0];
      this.removeLink(outgoingLink);
      numOutgoingLinks--;
    }

    const incomingLinks = node.getIncomingLinks();
    let numIncomingLinks = incomingLinks.length;
    while (numIncomingLinks > 0) {
      const incomingLink = incomingLinks[0];
      this.removeLink(incomingLink);
      numIncomingLinks--;
    }

    node.remove();

    for (let n = 0; n < this.nodes.length; n++) {
      let tempNode = this.nodes[n];
      if (tempNode == node) {
        this.nodes.splice(n, 1);
        break;
      }
    }
  }

  removeAllNodes() {
    for (let node of this.nodes) {
      node.remove();
    }
    this.nodes = [];
  }

  getNodeById(id) {
    for (let node of this.nodes) {
      const nodeId = node.getId();
      if (id === nodeId) {
        return node;
      }
    }
    return null;
  }

  getNodeByGroupId(id) {
    for (let node of this.nodes) {
      const groupId = node.getGroupId();
      if (id === groupId) {
        return node;
      }
    }
    return null;
  }

  getLinkById(id) {
    for (let link of this.links) {
      const linkId = link.getId();
      if (id === linkId) {
        return link;
      }
    }
    return null;
  }

  getLinkByGroupId(id) {
    for (let link of this.links) {
      const groupId = link.getGroupId();
      if (id === groupId) {
        return link;
      }
    }
    return null;
  }

  getNodeByConnectorId(id) {
    for (let node of this.nodes) {
      const connectorId = node.getConnectorId();
      if (id === connectorId) {
        return node;
      }
    }
    return null;
  }

  removeNodeById(groupId) {
    for (let n = 0; n < this.nodes.length; n++) {
      const tempNode = this.nodes[n];
      const tempNodeId = tempNode.getId();
      if (groupId === tempNodeId) {
        this.nodes.splice(n, 1);
        break;
      }
    }
  }

  addLink(link) {
    this.links.push(link);
  }

  removeLink(link) {
    link.remove();
    for (let l = 0; l < this.links.length; l++) {
      const tempLink = this.links[l];
      if (link == tempLink) {
        this.links.splice(l, 1);
        break;
      }
    }
  }

  removeAllLinks() {
    for (let link of this.links) {
      link.remove();
    }
    this.links = [];
  }

  nodeMouseOver(event) {
    const groupId = event.target.parentElement.id;
    const node = this.getNodeByGroupId(groupId);
    if (node != null) {
      this.setActiveNode(node);
    }
  }

  nodeMouseOut(event) {
    const groupId = event.target.parentElement.id;
    const node = this.getNodeByGroupId(groupId);
    if (node != null) {
      this.clearActiveNode();
    }
  }

  nodeMouseDown(event) {
    if (event.target.parentElement != null) {
      const groupId = event.target.parentElement.id;
      const node = this.getNodeByGroupId(groupId);
      if (node != null) {
        this.setHighlightedElement(node);
      }
    }
  }

  nodeMouseUp(event) {
    if (this.drawingLink && this.activeLink != null) {
      /*
       * the student is creating a link and has just released the mouse
       * over a node to connect the destination node of the link
       */

      const groupId = event.target.parentElement.id;
      const node = this.getNodeByGroupId(groupId);
      const sourceNode = this.activeLink.sourceNode;
      const sourceNodeGroupId = sourceNode.getGroupId();

      if (sourceNodeGroupId === groupId) {
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
        this.activeLink.setDestination(node);
        this.addLink(this.activeLink);
        this.setHighlightedElement(this.activeLink);

        /*
         * set the link as a newly created link so that if the
         * student clicks the cancel button, we will remove
         * the link
         */
        this.newlyCreatedLink = this.activeLink;
        this.displayLinkTypeChooserModalOverlay = true;
        this.studentDataChanged();
      }
    }

    this.drawingLink = false;
  }

  linkDeleteButtonClicked(event, link) {
    this.removeLink(link);
    this.studentDataChanged();
    this.hideLinkTypeChooser();
  }

  connectorMouseDown(event) {
    this.drawingLink = true;
    const connector = event.target;

    /*
     * disable node dragging so that the node isn't dragged when the
     * link head is being dragged
     */
    this.disableNodeDragging();
    const node = this.getNodeByConnectorId(connector.id);
    const newConceptMapLinkId = this.getNewConceptMapLinkId();

    /*
     * we will not know what the original id is until the student has
     * selected a link type
     */
    const originalId = null;
    const link = this.ConceptMapService.newConceptMapLink(
      this.draw,
      newConceptMapLinkId,
      originalId,
      node
    );
    this.setLinkMouseEvents(link);
    this.activeLink = link;
    this.linkCurvatureSet = false;
    this.activeLinkStartX = node.connectorCX();
    this.activeLinkStartY = node.connectorCY();
    this.setHighlightedElement(link);
    this.clearActiveNode();
    this.setActiveNode(node);
  }

  setLinkMouseEvents(link) {
    link.setLinkMouseDown((event) => {
      this.linkMouseDown(event);
    });

    link.setLinkTextMouseDown((event) => {
      this.linkTextMouseDown(event);
    });

    link.setLinkMouseOver((event) => {
      this.linkMouseOver(event);
    });

    link.setLinkMouseOut((event) => {
      this.linkMouseOut(event);
    });

    link.setDeleteButtonClicked((event) => {
      this.linkDeleteButtonClicked(event, link);
    });
  }

  linkMouseDown(event) {
    const groupId = this.getGroupId(event.target);
    const link = this.getLinkByGroupId(groupId);
    this.setHighlightedElement(link);
  }

  linkTextMouseDown(event) {
    let linkGroupId = null;

    /*
     * the link group id is set into the text group in the linkGroupId
     * variable. the text group hierarchy looks like this
     * text group > text > tspan
     * text group > rect
     */
    if (event.target.nodeName === 'tspan') {
      linkGroupId = event.target.parentElement.parentElement.linkGroupId;
    } else if (event.target.nodeName === 'text') {
      linkGroupId = event.target.parentElement.linkGroupId;
    } else if (event.target.nodeName === 'rect') {
      linkGroupId = event.target.parentElement.linkGroupId;
    }

    if (linkGroupId != null) {
      const link = this.getLinkByGroupId(linkGroupId);
      this.setHighlightedElement(link);
    }
  }

  linkMouseOver(event) {
    const groupId = this.getGroupId(event.target);
    const link = this.getLinkByGroupId(groupId);
    link.showDeleteButton();
  }

  linkMouseOut(event) {
    const groupId = this.getGroupId(event.target);
    const link = this.getLinkByGroupId(groupId);
    if (link != null && link != this.highlightedElement) {
      link.hideDeleteButton();
    }
  }

  nodeDeleteButtonMouseDown(event) {
    if (event.target.parentElement != null) {
      const groupId = event.target.parentElement.parentElement.id;
      const node = this.getNodeByGroupId(groupId);
      this.removeNode(node);
      this.studentDataChanged();
    }
  }

  nodeDeleteButtonMouseOver(event) {
    const groupId = event.target.parentElement.parentElement.id;
    const node = this.getNodeByGroupId(groupId);
    this.setActiveNode(node);
  }

  nodeDeleteButtonMouseOut(event) {
    this.clearActiveNode();
  }

  nodeDragMove(event) {
    const groupId = event.target.id;
    const node = this.getNodeByGroupId(groupId);
    if (node != null) {
      node.dragMove(event);
    }
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
    let groupId = null;
    let currentElement = element;
    let previousId = null;

    // loop until we have reached the svg element
    while (currentElement != null) {
      if (currentElement.tagName === 'svg') {
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

  populateStarterConceptMap() {
    if (this.componentContent.starterConceptMap != null) {
      this.populateConceptMapData(this.componentContent.starterConceptMap);
    }
  }

  clearConceptMap() {
    this.removeAllLinks();
    this.removeAllNodes();
  }

  /**
   * Reset the concept map data. We will clear the concept map data and
   * if there is starter concept map data we will set it into the concept map.
   */
  resetConceptMap() {
    const message = this.$translate('conceptMap.areYouSureYouWantToResetYourWork');
    if (confirm(message)) {
      this.clearConceptMap();
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (this.componentContent.starterConceptMap != null) {
        const conceptMapData = this.componentContent.starterConceptMap;
        this.populateConceptMapData(conceptMapData);
      }
    }
  }

  /**
   * Show the auto feedback that was generated when the student previously
   * clicked "Check Answer".
   */
  showAutoFeedback() {
    this.$mdDialog.show(
      this.$mdDialog
        .alert()
        .parent(angular.element(document.querySelector('#' + this.feedbackContainerId)))
        .clickOutsideToClose(true)
        .title(this.$translate('FEEDBACK'))
        .htmlContent(this.autoFeedbackString)
        .ariaLabel(this.$translate('FEEDBACK'))
        .ok(this.$translate('CLOSE'))
    );
  }

  /**
   * Snip the concept map by converting it to an image
   * @param $event the click event
   */
  snip($event) {
    // get the svg element. this will obtain an array.
    let svgElement = angular.element(
      document.querySelector('#svg_' + this.nodeId + '_' + this.componentId)
    );
    if (svgElement != null && svgElement.length > 0) {
      svgElement = svgElement[0];

      // get the svg element as a string
      const serializer = new XMLSerializer();
      let svgString = serializer.serializeToString(svgElement);

      // find all the images in the svg and replace them with Base64 images
      this.ConceptMapService.getHrefToBase64ImageReplacements(svgString).then((images) => {
        /*
         * Loop through all the image objects. Each object contains
         * an image href and a Base64 image.
         */
        for (let imagePair of images) {
          // get the image href e.g. /wise/curriculum/25/assets/Sun.png
          const imageHref = imagePair.imageHref;
          const base64Image = imagePair.base64Image;
          const imageRegEx = new RegExp(imageHref, 'g');

          /*
           * replace all the instances of the image href with the
           * Base64 image
           */
          svgString = svgString.replace(imageRegEx, base64Image);
        }

        const myCanvas = document.createElement('canvas');
        const ctx = myCanvas.getContext('2d');
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const domURL: any = self.URL || (self as any).webkitURL || self;
        const url = domURL.createObjectURL(svg);
        const image = new Image();

        /*
         * set the UtilService in a local variable so we can access it
         * in the onload callback function
         */
        const thisUtilService = this.UtilService;
        image.onload = (event) => {
          const image: any = event.target;

          // set the dimensions of the canvas
          myCanvas.width = image.width;
          myCanvas.height = image.height;
          ctx.drawImage(image, 0, 0);
          const base64Image = myCanvas.toDataURL('image/png');

          // get the image object
          const imageObject = thisUtilService.getImageObjectFromBase64String(base64Image);
          this.NotebookService.addNote(imageObject);
        };

        // set the src of the image so that the image gets loaded
        image.src = url;
      });
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {
    let mergedNodes = [];
    let mergedLinks = [];
    let backgroundPath = null;
    let stretchBackground = null;
    for (let componentState of componentStates) {
      if (componentState.componentType === 'ConceptMap') {
        const studentData = componentState.studentData;
        const conceptMapData = studentData.conceptMapData;
        mergedNodes = mergedNodes.concat(conceptMapData.nodes);
        mergedLinks = mergedLinks.concat(conceptMapData.links);
        if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath !== '') {
          backgroundPath = conceptMapData.backgroundPath;
          stretchBackground = conceptMapData.stretchBackground;
        }
      } else if (
        componentState.componentType === 'Draw' ||
        componentState.componentType === 'Embedded' ||
        componentState.componentType === 'Graph' ||
        componentState.componentType === 'Label' ||
        componentState.componentType === 'Table'
      ) {
        let connectedComponent = this.UtilService.getConnectedComponentByComponentState(
          this.componentContent,
          componentState
        );
        if (connectedComponent.importWorkAsBackground === true) {
          this.setComponentStateAsBackgroundImage(componentState);
        }
      }
    }

    if (this.componentContent.background != null && this.componentContent.background !== '') {
      backgroundPath = this.componentContent.background;
      if (this.componentContent.stretchBackground) {
        stretchBackground = this.componentContent.stretchBackground;
      }
    }

    let mergedComponentState: any = this.NodeService.createNewComponentState();
    mergedComponentState.studentData = {
      conceptMapData: {
        nodes: mergedNodes,
        links: mergedLinks,
        backgroundPath: backgroundPath
      }
    };

    if (stretchBackground != null) {
      mergedComponentState.studentData.conceptMapData.stretchBackground = stretchBackground;
    }

    mergedComponentState = this.ProjectService.injectAssetPaths(mergedComponentState);
    return mergedComponentState;
  }

  /**
   * Create an image from a component state and set the image as the background.
   * @param componentState A component state.
   */
  setComponentStateAsBackgroundImage(componentState) {
    this.generateImageFromComponentState(componentState).then((image) => {
      const stretchBackground = false;
      this.setBackgroundImage(image.url, stretchBackground);
    });
  }

  /**
   * Set the background image on the svg canvas
   * @param backgroundPath the absolute path to the background image
   * @param stretchBackground whether to stretch the background to cover the
   * whole svg background
   */
  setBackgroundImage(backgroundPath, stretchBackground) {
    this.background = backgroundPath;
    this.stretchBackground = stretchBackground;
    if (stretchBackground) {
      // stretch the background to fit the whole svg element
      this.backgroundSize = '100% 100%';
    } else {
      // use the original dimensions of the background image
      this.backgroundSize = '';
    }
  }

  generateStarterState(): void {
    this.NodeService.respondStarterState({
      nodeId: this.nodeId,
      componentId: this.componentId,
      starterState: this.getConceptMapData()
    });
  }
}

export default ConceptMapController;

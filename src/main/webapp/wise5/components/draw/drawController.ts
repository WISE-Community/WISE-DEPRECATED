'use strict';

import * as angular from 'angular';
import * as $ from 'jquery';
import * as fabric from 'fabric';
window['fabric'] = fabric.fabric;
import ComponentController from '../componentController';
import * as EventEmitter2 from 'eventemitter2';
window['EventEmitter2'] = EventEmitter2;
import DrawingTool from '../../lib/drawingTool/drawing-tool';
import { DrawService } from './drawService';

class DrawController extends ComponentController {
  $injector: any;
  $q: any;
  $timeout: any;
  DrawService: DrawService;
  isResetButtonVisible: boolean;
  notebookConfig: any;
  drawingTool: any;
  latestConnectedComponentState: any;
  latestConnectedComponentParams: any;
  width: number;
  height: number;
  drawingToolId: string;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'DrawService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $injector,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    $timeout,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    DrawService,
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
    this.$injector = $injector;
    this.$q = $q;
    this.$timeout = $timeout;
    this.DrawService = DrawService;

    this.isResetButtonVisible = false;
    this.notebookConfig = this.NotebookService.getNotebookConfig();
    this.drawingTool = null;
    this.latestConnectedComponentState = null;
    this.latestConnectedComponentParams = null;
    this.width = 800;
    this.height = 600;

    if (this.componentContent.width != null) {
      this.width = this.componentContent.width;
    }

    if (this.componentContent.height != null) {
      this.height = this.componentContent.height;
    }

    this.componentType = this.componentContent.type;

    if (this.isStudentMode() || this.isAuthoringComponentPreviewMode()) {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.isResetButtonVisible = true;
      this.drawingToolId = 'drawingtool_' + this.nodeId + '_' + this.componentId;
    } else if (this.isGradingMode() || this.isGradingRevisionMode()) {
      const componentState = this.$scope.componentState;
      if (componentState != null) {
        if (this.isGradingRevisionMode()) {
          this.drawingToolId = 'drawingtool_gradingRevision_' + componentState.id;
        } else {
          this.drawingToolId = 'drawingtool_' + componentState.id;
        }
      }
    }

    /*
     * Running this inside a timeout ensures that the code only runs after the markup is rendered.
     * Maybe there's a better way to do this, like with an event?
     */
    this.$timeout(angular.bind(this, this.initializeDrawingTool));

    this.initializeScopeGetComponentState(this.$scope, 'drawController');
    this.registerNotebookItemChosenListener();
    this.broadcastDoneRenderingComponent();
  }

  handleStudentWorkSavedToServerAdditionalProcessing(args: any) {
    let componentState = args.studentWork;
    if (
      this.isForThisComponent(componentState) &&
      this.ProjectService.isConnectedComponent(
        this.nodeId,
        this.componentId,
        componentState.componentId
      )
    ) {
      const connectedComponentParams: any = this.ProjectService.getConnectedComponentParams(
        this.componentContent,
        componentState.componentId
      );
      if (connectedComponentParams != null) {
        if (
          connectedComponentParams.updateOn === 'save' ||
          (connectedComponentParams.updateOn === 'submit' && componentState.isSubmit)
        ) {
          let performUpdate = false;
          /*
           * make a copy of the component state so we don't accidentally
           * change any values in the referenced object
           */
          componentState = this.UtilService.makeCopyOfJSONObject(componentState);

          if (this.isCanvasEmpty()) {
            performUpdate = true;
          } else {
            // the student has drawn on the canvas so we will ask them if they want to update it
            if (confirm(this.$translate('draw.doYouWantToUpdateTheConnectedDrawing'))) {
              performUpdate = true;
            }
          }

          if (performUpdate) {
            if (!connectedComponentParams.includeBackground) {
              this.DrawService.removeBackgroundFromComponentState(componentState);
            }
            this.setDrawData(componentState);
            this.$scope.drawController.isDirty = true;
            this.$scope.drawController.isSubmitDirty = true;
          }

          /*
           * remember the component state and connected component params
           * in case we need to use them again later
           */
          this.latestConnectedComponentState = componentState;
          this.latestConnectedComponentParams = connectedComponentParams;
        }
      }
    }
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  initializeDrawingTool() {
    this.drawingTool = new DrawingTool('#' + this.drawingToolId, {
      stamps: this.componentContent.stamps || {},
      parseSVG: true,
      width: this.width,
      height: this.height
    });
    let state = null;
    $('#set-background').on('click', () => {
      this.drawingTool.setBackgroundImage($('#background-src').val());
    });
    $('#resize-background').on('click', () => {
      this.drawingTool.resizeBackgroundToCanvas();
    });
    $('#resize-canvas').on('click', () => {
      this.drawingTool.resizeCanvasToBackground();
    });
    $('#shrink-background').on('click', () => {
      this.drawingTool.shrinkBackgroundToCanvas();
    });
    $('#clear').on('click', () => {
      this.drawingTool.clear(true);
    });
    $('#save').on('click', () => {
      state = this.drawingTool.save();
      $('#load').removeAttr('disabled');
    });
    $('#load').on('click', () => {
      if (state === null) return;
      this.drawingTool.load(state);
    });

    const componentState = this.$scope.componentState;
    if (this.isStudentMode()) {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (
        componentState == null ||
        !this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        if (this.componentContent.starterDrawData != null) {
          this.drawingTool.load(this.componentContent.starterDrawData);
        }
        if (this.componentContent.background != null) {
          this.drawingTool.setBackgroundImage(this.componentContent.background);
        }
      }
    } else if (this.isAuthoringComponentPreviewMode()) {
      if (this.componentContent.starterDrawData != null) {
        this.drawingTool.load(this.componentContent.starterDrawData);
      }
      if (this.componentContent.background != null) {
        this.drawingTool.setBackgroundImage(this.componentContent.background);
      }
    } else {
      this.setStudentWork(componentState);
    }

    if (this.hasMaxSubmitCount() && this.hasSubmitsLeft()) {
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();

    /*
     * Wait before we start listening for the drawing:changed event. We need to wait
     * because the calls above to this.drawingTool.setBackgroundImage() will cause
     * the drawing:changed event to be fired from the drawingTool, but when that happens,
     * we don't want to call this.studentDataChanged() because it marks the student work
     * as dirty. We only want to call this.studentDataChanged() when the drawing:changed
     * event occurs in response to the student changing the drawing and this timeout
     * will help make sure of that.
     */
    this.$timeout(
      angular.bind(this, () => {
        this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));
      }),
      500
    );

    if (this.isStudentMode()) {
      this.drawingTool.on('tool:changed', (toolName) => {
        const category = 'Tool';
        const event = 'toolSelected';
        const data = {
          selectedToolName: toolName
        };
        this.StudentDataService.saveComponentEvent(this, category, event, data);
      });
    }

    if (this.isGradingMode() || this.isGradingRevisionMode()) {
      $('#' + this.drawingToolId)
        .find('.dt-tools')
        .hide();
    } else {
      this.setupTools();
    }

    if (this.isDisabled) {
      this.drawingTool.canvas.removeListeners();
    }
  }

  handleConnectedComponentsPostProcess() {
    if (this.componentContent.background != null) {
      this.drawingTool.setBackgroundImage(this.componentContent.background);
    }
  }

  /**
   * Setup the tools that we will make available to the student
   */
  setupTools() {
    const tools = this.componentContent.tools;
    if (tools == null) {
      // we will display all the tools
    } else {
      // we will only display the tools the authored specified to show
      const drawingTool = $('#' + this.drawingToolId);
      this.setupSelectTool(drawingTool, tools);
      this.setupLineTool(drawingTool, tools);
      this.setupShapeTool(drawingTool, tools);
      this.setupFreeHandTool(drawingTool, tools);
      this.setupTextTool(drawingTool, tools);
      this.setupStampTool(drawingTool, tools);
      this.setupCloneTool(drawingTool, tools);
      this.setupStrokeColorTool(drawingTool, tools);
      this.setupFillColorTool(drawingTool, tools);
      this.setupStrokeWidthTool(drawingTool, tools);
      this.setupSendBackTool(drawingTool, tools);
      this.setupSendForwardTool(drawingTool, tools);
      this.setupUndoTool(drawingTool, tools);
      this.setupRedoTool(drawingTool, tools);
      this.setupDeleteTool(drawingTool, tools);
      if (this.isDisabled) {
        drawingTool.find('.dt-tools').hide();
      }
    }
  }

  setupSelectTool(drawingTool, tools) {
    const selectTitle = this.$translate('draw.selectToolTooltip');
    if (tools.select) {
      drawingTool.find('[title="' + selectTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + selectTitle + '"]').hide();
    }
  }

  setupLineTool(drawingTool, tools) {
    const lineTitle = this.$translate('draw.lineToolTooltip');
    if (tools.line) {
      drawingTool.find('[title="' + lineTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + lineTitle + '"]').hide();
    }
  }

  setupShapeTool(drawingTool, tools) {
    const shapeTitle = this.$translate('draw.shapeToolTooltip');
    if (tools.shape) {
      drawingTool.find('[title="' + shapeTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + shapeTitle + '"]').hide();
    }
  }

  setupFreeHandTool(drawingTool, tools) {
    const freeHandTitle = this.$translate('draw.freeHandToolTooltip');
    if (tools.freeHand) {
      drawingTool.find('[title="' + freeHandTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + freeHandTitle + '"]').hide();
    }
  }

  setupTextTool(drawingTool, tools) {
    const textTitle = this.$translate('draw.textToolTooltip');
    if (tools.text) {
      drawingTool.find('[title="' + textTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + textTitle + '"]').hide();
    }
  }

  setupStampTool(drawingTool, tools) {
    const stampTitle = this.$translate('draw.stampToolTooltip');
    if (tools.stamp) {
      drawingTool.find('[title="' + stampTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + stampTitle + '"]').hide();
    }
  }

  setupCloneTool(drawingTool, tools) {
    const cloneTitle = this.$translate('draw.cloneToolTooltip');
    if (tools.clone) {
      drawingTool.find('[title="' + cloneTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + cloneTitle + '"]').hide();
    }
  }

  setupStrokeColorTool(drawingTool, tools) {
    const strokeColorTitle = this.$translate('draw.strokeColorToolTooltip');
    if (tools.strokeColor) {
      drawingTool.find('[title="' + strokeColorTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + strokeColorTitle + '"]').hide();
    }
  }

  setupFillColorTool(drawingTool, tools) {
    const fillColorTitle = this.$translate('draw.fillColorToolTooltip');
    if (tools.fillColor) {
      drawingTool.find('[title="' + fillColorTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + fillColorTitle + '"]').hide();
    }
  }

  setupStrokeWidthTool(drawingTool, tools) {
    const strokeWidthTitle = this.$translate('draw.strokeWidthToolTooltip');
    if (tools.strokeWidth) {
      drawingTool.find('[title="' + strokeWidthTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + strokeWidthTitle + '"]').hide();
    }
  }

  setupSendBackTool(drawingTool, tools) {
    const sendBackTitle = this.$translate('draw.sendBackToolTooltip');
    if (tools.sendBack) {
      drawingTool.find('[title="' + sendBackTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + sendBackTitle + '"]').hide();
    }
  }

  setupSendForwardTool(drawingTool, tools) {
    const sendForwardTitle = this.$translate('draw.sendForwardToolTooltip');
    if (tools.sendForward) {
      drawingTool.find('[title="' + sendForwardTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + sendForwardTitle + '"]').hide();
    }
  }

  setupUndoTool(drawingTool, tools) {
    const undoTitle = this.$translate('draw.undo');
    if (tools.undo) {
      drawingTool.find('[title="' + undoTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + undoTitle + '"]').hide();
    }
  }

  setupRedoTool(drawingTool, tools) {
    const redoTitle = this.$translate('draw.redo');
    if (tools.redo) {
      drawingTool.find('[title="' + redoTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + redoTitle + '"]').hide();
    }
  }

  setupDeleteTool(drawingTool, tools) {
    const deleteTitle = this.$translate('draw.deleteToolTooltip');
    if (tools.delete) {
      drawingTool.find('[title="' + deleteTitle + '"]').show();
    } else {
      drawingTool.find('[title="' + deleteTitle + '"]').hide();
    }
  }

  setStudentWork(componentState) {
    if (componentState != null) {
      this.setDrawData(componentState);
      this.processLatestStudentWork();
    }
  }

  resetButtonClicked() {
    if (confirm(this.$translate('draw.areYouSureYouWantToClearYourDrawing'))) {
      this.drawingTool.clear();
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        this.handleConnectedComponents();
      } else if (this.latestConnectedComponentState) {
        this.setDrawData(this.latestConnectedComponentState);
      } else if (this.componentContent.starterDrawData != null) {
        this.drawingTool.load(this.componentContent.starterDrawData);
      }
      if (this.componentContent.background != null && this.componentContent.background != '') {
        this.drawingTool.setBackgroundImage(this.componentContent.background);
      }
      this.parentStudentWorkIds = null;
    }
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
    const studentDataJSONString = this.getDrawData();
    studentData.drawData = studentDataJSONString;
    studentData.submitCounter = this.submitCounter;
    if (this.parentStudentWorkIds != null) {
      studentData.parentStudentWorkIds = this.parentStudentWorkIds;
    }
    componentState.isSubmit = this.isSubmit;
    componentState.studentData = studentData;
    componentState.componentType = 'Draw';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;
    this.isSubmit = false;
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);
    return deferred.promise;
  }

  /**
   * Add student asset images as objects in the drawing canvas
   * @param studentAsset
   */
  attachStudentAsset(studentAsset) {
    this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
      fabric.Image.fromURL(copiedAsset.url, (oImg) => {
        oImg.scaleToWidth(200); // set max width and have height scale proportionally
        // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
        //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
        //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
        //oImg.center();
        oImg.studentAssetId = copiedAsset.id; // keep track of this asset id
        this.drawingTool.canvas.add(oImg); // add copied asset image to canvas
      });
    });
  }

  getDrawData() {
    return this.drawingTool.save();
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObject() {
    if (this.drawingTool != null && this.drawingTool.canvas != null) {
      const canvasBase64Image = this.drawingTool.canvas.toDataURL('image/png');
      return this.UtilService.getImageObjectFromBase64String(canvasBase64Image);
    }
    return null;
  }

  setDrawData(componentState) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      if (studentData.submitCounter != null) {
        this.submitCounter = studentData.submitCounter;
      }
      const drawData = studentData.drawData;
      if (drawData != null && drawData != '' && drawData != '{}') {
        this.drawingTool.load(drawData);
      }
    }
  }

  /**
   * Check if the student has drawn anything
   * @returns whether the canvas is empty
   */
  isCanvasEmpty() {
    if (this.drawingTool != null && this.drawingTool.canvas != null) {
      const objects = this.drawingTool.canvas.getObjects();
      if (objects != null && objects.length > 0) {
        return false;
      }
    }
    return true;
  }

  /**
   * Snip the drawing by converting it to an image
   * @param $event the click event
   */
  snipDrawing($event, studentWorkId) {
    let canvas = angular.element(
      document.querySelector('#drawingtool_' + this.nodeId + '_' + this.componentId + ' canvas')
    );
    if (canvas != null && canvas.length > 0) {
      canvas = canvas[0];
      const canvasBase64Image = canvas.toDataURL('image/png');
      const imageObject = this.UtilService.getImageObjectFromBase64String(canvasBase64Image);
      const noteText = null;
      this.NotebookService.addNote(imageObject, noteText, [studentWorkId]);
    }
  }

  snipButtonClicked($event) {
    if (this.isDirty) {
      const studentWorkSavedToServerSubscription = this.StudentDataService.studentWorkSavedToServer$.subscribe(
        (args: any) => {
          const componentState = args.studentWork;
          if (this.isForThisComponent(componentState)) {
            this.snipDrawing($event, componentState.id);
            studentWorkSavedToServerSubscription.unsubscribe();
          }
        }
      );
      this.saveButtonClicked();
    } else {
      const studentWork = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(
        this.nodeId,
        this.componentId
      );
      this.snipDrawing($event, studentWork.id);
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {
    const mergedComponentState: any = this.NodeService.createNewComponentState();
    if (componentStates != null) {
      let allDrawCanvasObjects = [];
      let firstDrawData = {};
      for (let c = 0; c < componentStates.length; c++) {
        const componentState = componentStates[c];
        if (componentState.componentType == 'Draw') {
          const studentData = componentState.studentData;
          const drawData = studentData.drawData;
          const drawDataJSON = angular.fromJson(drawData);
          if (
            drawDataJSON != null &&
            drawDataJSON.canvas != null &&
            drawDataJSON.canvas.objects != null
          ) {
            if (c == 0) {
              firstDrawData = drawDataJSON;
            }
            allDrawCanvasObjects = allDrawCanvasObjects.concat(drawDataJSON.canvas.objects);
          }
        } else if (
          componentState.componentType == 'Graph' ||
          componentState.componentType == 'ConceptMap' ||
          componentState.componentType == 'Embedded' ||
          componentState.componentType == 'Label' ||
          componentState.componentType == 'Table'
        ) {
          const connectedComponent = this.UtilService.getConnectedComponentByComponentState(
            this.componentContent,
            componentState
          );
          if (connectedComponent.importWorkAsBackground === true) {
            this.setComponentStateAsBackgroundImage(componentState);
          }
        }
      }
      if (allDrawCanvasObjects != null) {
        const drawData: any = firstDrawData;
        if (drawData.canvas != null && drawData.canvas.objects != null) {
          drawData.canvas.objects = allDrawCanvasObjects;
        }
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.drawData = angular.toJson(drawData);
      }
    }
    return mergedComponentState;
  }

  /**
   * Create an image from a component state and set the image as the background.
   * @param componentState A component state.
   */
  setComponentStateAsBackgroundImage(componentState) {
    this.generateImageFromComponentState(componentState).then((image) => {
      this.drawingTool.setBackgroundImage(image.url);
    });
  }

  generateStarterState() {
    this.NodeService.respondStarterState({
      nodeId: this.nodeId,
      componentId: this.componentId,
      starterState: this.getDrawData()
    });
  }
}

export default DrawController;

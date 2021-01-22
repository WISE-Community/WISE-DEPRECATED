'use strict';

import * as angular from 'angular';
import * as $ from 'jquery';
import { fabric } from 'fabric';
window['fabric'] = fabric;
import ComponentController from '../componentController';
import { LabelService } from './labelService';

class LabelController extends ComponentController {
  $q: any;
  $timeout: any;
  $window: any;
  LabelService: LabelService;
  isNewLabelButtonVisible: boolean;
  isCancelButtonVisible: boolean;
  notebookConfig: any;
  canCreateLabels: boolean;
  createLabelMode: boolean;
  canvas: any;
  canvasWidth: number;
  canvasHeight: number;
  lineZIndex: number;
  textZIndex: number;
  circleZIndex: number;
  canvasId: string;
  backgroundImage: string;
  isResetButtonVisible: boolean;
  enableCircles: boolean;
  studentDataVersion: number;
  labels: any[];
  disabled: boolean;
  selectedLabel: any;
  selectedLabelText: any;
  editLabelMode: boolean = false;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    '$window',
    'AnnotationService',
    'AudioRecorderService',
    'ConfigService',
    'LabelService',
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
    $window,
    AnnotationService,
    AudioRecorderService,
    ConfigService,
    LabelService,
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
    this.$q = $q;
    this.$timeout = $timeout;
    this.$window = $window;
    this.LabelService = LabelService;

    // whether the new label button is shown or not
    this.isNewLabelButtonVisible = true;

    // whether the cancel button is shown or not
    this.isCancelButtonVisible = false;

    // the label for the notebook in thos project
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    // whether the student can create new labels
    this.canCreateLabels = true;

    // whether the student is in the mode to create a new label
    this.createLabelMode = false;

    // a reference to the canvas
    this.canvas = null;

    // the canvas width
    this.canvasWidth = 800;

    // the canvas height
    this.canvasHeight = 600;

    // the z index of line elements
    this.lineZIndex = 0;

    // the z index of text elements
    this.textZIndex = 1;

    // the z index of circle elements
    this.circleZIndex = 2;

    // the canvas id
    this.canvasId = 'c';

    // the background image path
    this.backgroundImage = null;

    // whether to show the reset button
    this.isResetButtonVisible = true;

    this.enableCircles = true;

    // modify Fabric so that Text elements can utilize padding
    fabric.Text.prototype.set({
      _getNonTransformedDimensions() {
        // Object dimensions
        return new fabric.Point(this.width, this.height).scalarAdd(this.padding);
      },
      _calculateCurrentDimensions() {
        // Controls dimensions
        return fabric.util.transformPoint(
          this._getTransformedDimensions(),
          this.getViewportTransform(),
          true
        );
      }
    });

    /*
     * Student data version 1 is where the text x and y positioning is relative
     * to the circle.
     * Student data version 2 is where the text x and y positioning is absolute.
     */
    this.studentDataVersion = 2;

    /*
     * This will hold canvas label objects. A canvas label object contains a
     * circle object, line object, and text object.
     */
    this.labels = [];

    this.canvasId = 'canvas_' + this.nodeId + '_' + this.componentId;

    // get the component state from the scope
    const componentState = this.$scope.componentState;

    if (this.componentContent.canCreateLabels != null) {
      this.canCreateLabels = this.componentContent.canCreateLabels;
    }

    if (this.componentContent.width != null) {
      this.canvasWidth = this.componentContent.width;
    }

    if (this.componentContent.height != null) {
      this.canvasHeight = this.componentContent.height;
    }

    if (this.componentContent.enableCircles != null) {
      this.enableCircles = this.componentContent.enableCircles;
    }

    if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isNewLabelButtonVisible = false;
      this.isDisabled = true;

      if (componentState != null) {
        // create a unique id for the application label element using this component state
        this.canvasId = 'labelCanvas_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          this.canvasId = 'labelCanvas_gradingRevision_' + componentState.id;
        }
      }
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isNewLabelButtonVisible = false;
      this.isDisabled = true;
    } else {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      if (this.onlyHasShowWorkConnectedComponents()) {
        this.isDisabled = true;
      }

      if (this.canCreateLabels) {
        this.isNewLabelButtonVisible = true;
      } else {
        this.isNewLabelButtonVisible = false;
      }

      if (this.isDisabled) {
        this.isNewLabelButtonVisible = false;
        this.canCreateLabels = false;
        this.isResetButtonVisible = false;
      }
    }
    this.$timeout(
      angular.bind(this, function () {
        // wait for angular to completely render the html before we initialize the canvas

        this.setupCanvas();
      })
    );

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function () {
      return this.$scope.labelController.isDirty;
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function (isSubmit) {
      const deferred = this.$q.defer();
      let getState = false;
      let action = 'change';

      if (isSubmit) {
        if (this.$scope.labelController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.labelController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.labelController.createComponentState(action).then((componentState) => {
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
     * The student has changed the file input
     * @param element the file input element
     */
    this.$scope.fileUploadChanged = function (element) {
      // get the current background image if any
      const backgroundImage = this.labelController.getBackgroundImage();

      let overwrite = true;

      if (backgroundImage != null && backgroundImage != '') {
        /*
         * there is an existing background image so we will ask the
         * student if they want to change it
         */
        const answer = confirm(
          this.labelController.$translate('label.areYouSureYouWantToChangeTheBackgroundImage')
        );

        if (answer) {
          // the student wants to change the background image
          overwrite = true;
        } else {
          // the student does not want to change the background image
          overwrite = false;

          /*
           * clear the input file value otherwise it will show the
           * name of the file they recently selected but decided not
           * to use because they decided not to change the background
           * image
           */
          element.value = null;
        }
      }

      if (overwrite) {
        // we will change the current background

        // get the files from the file input element
        const files = element.files;

        if (files != null && files.length > 0) {
          // upload the file to the studentuploads folder
          this.labelController.StudentAssetService.uploadAsset(files[0]).then(
            (unreferencedAsset) => {
              // make a referenced copy of the unreferenced asset
              this.labelController.StudentAssetService.copyAssetForReference(
                unreferencedAsset
              ).then((referencedAsset) => {
                if (referencedAsset != null) {
                  // get the url of the referenced asset
                  const imageURL = referencedAsset.url;

                  if (imageURL != null && imageURL != '') {
                    // set the referenced asset as the background image
                    this.labelController.setBackgroundImage(imageURL);
                    this.labelController.studentDataChanged();
                  }
                }
              });
            }
          );
        }
      }
    };

    this.broadcastDoneRenderingComponent();
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setupCanvas() {
    // initialize the canvas
    const canvas = this.initializeCanvas();
    this.canvas = canvas;

    // get the component state from the scope
    const componentState = this.$scope.componentState;

    if (!this.disabled) {
      // create the key down listener to listen for the delete key
      this.createKeydownListener();
    }

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      } else if (
        this.LabelService.componentStateHasStudentWork(componentState, this.componentContent)
      ) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();

        if (this.componentContent.labels != null) {
          // populate the canvas with the starter labels
          this.addLabelsToCanvas(this.componentContent.labels);
        }
      } else if (
        this.LabelService.componentStateIsSameAsStarter(componentState, this.componentContent)
      ) {
        // the student labels are the same as the starter labels
        this.setStudentWork(componentState);
      } else if (componentState == null) {
        if (this.componentContent.labels != null) {
          /*
           * the student has not done any work and there are starter labels
           * so we will populate the canvas with the starter labels
           */
          this.addLabelsToCanvas(this.componentContent.labels);
        }
      }
    } else if (this.mode === 'grading') {
      // populate the student work into this component
      this.setStudentWork(componentState);
    } else {
      if (componentState == null && this.componentContent.labels != null) {
        // populate the canvas with the starter labels
        this.addLabelsToCanvas(this.componentContent.labels);
      } else {
        // populate the student work into this component
        this.setStudentWork(componentState);
      }
    }

    // get the background image that may have been set by the student data
    const backgroundImage = this.getBackgroundImage();

    if (backgroundImage == null && this.componentContent.backgroundImage != null) {
      // get the background image from the component content if any
      this.setBackgroundImage(this.componentContent.backgroundImage);
    }

    // check if the student has used up all of their submits
    if (
      this.componentContent.maxSubmitCount != null &&
      this.submitCounter >= this.componentContent.maxSubmitCount
    ) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {
    if (componentState != null) {
      const studentData = componentState.studentData;

      if (studentData != null) {
        if (studentData.version == null) {
          this.setStudentDataVersion(1);
        } else {
          this.setStudentDataVersion(studentData.version);
        }

        // get the labels from the student data
        const labels = studentData.labels;

        // add the labels to the canvas
        this.addLabelsToCanvas(labels);

        // get the background image from the student data
        const backgroundImage = studentData.backgroundImage;

        if (backgroundImage != null) {
          this.setBackgroundImage(backgroundImage);
        }

        const submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        this.processLatestStudentWork();
      }
    }
  }

  /**
   * Add labels ot the canvas
   * @param labels an array of objects that contain the values for a label
   */
  addLabelsToCanvas(labels) {
    if (labels != null) {
      // loop through all the labels
      for (let x = 0; x < labels.length; x++) {
        // get a label
        const label = labels[x];

        if (label != null) {
          // get the values of the label
          let pointX = label.pointX;
          let pointY = label.pointY;
          let textX = label.textX;
          let textY = label.textY;
          let text = label.text;
          let color = label.color;
          let canEdit = label.canEdit;
          let canDelete = label.canDelete;

          // create the label
          const fabricLabel: any = this.createLabel(
            pointX,
            pointY,
            textX,
            textY,
            text,
            color,
            canEdit,
            canDelete
          );

          // add the label to the canvas
          this.addLabelToCanvas(this.canvas, fabricLabel);
        }
      }
    }
  }

  newLabelButtonClicked() {
    this.createLabelOnCanvas();
  }

  /**
   * Called when the student clicks on the cancel button to exit
   * create label mode
   */
  cancelButtonClicked() {
    this.createLabelMode = false;
    this.isCancelButtonVisible = false;
  }

  /**
   * Get the label data from the canvas.
   * @returns An array of simple JSON objects that contain the label data.
   */
  getLabelData() {
    const labels = [];

    /*
     * get all the circle objects from the canvas which each correspond to
     * a label point
     */
    const objects = this.canvas.getObjects('i-text');

    if (objects != null) {
      // loop through all the circle objects
      for (let x = 0; x < objects.length; x++) {
        /*
         * the object is a circle which contains all the data
         * for a label
         */
        const object = objects[x];

        if (object != null) {
          // get the simple JSON object that represents the label
          const labelJSONObject = this.getLabelJSONObjectFromText(object);

          if (labelJSONObject != null) {
            // add the object to our array of labels
            labels.push(labelJSONObject);
          }
        }
      }
    }

    return labels;
  }

  /**
   * Get the simple JSON object that represents the label
   * @param circle a Fabric circle object
   * @returns a simple JSON object that represents the label
   */
  getLabelJSONObjectFromCircle(circle) {
    const labelJSONObject: any = {};

    // get the label object that contains the circle, line, and text objects
    const label = this.getLabelFromCircle(circle);

    // get the line associated with the circle
    const lineObject = circle.line;

    // get the text object associated with the circle
    const textObject = circle.text;

    // get the position of the circle
    const pointX = circle.get('left');
    const pointY = circle.get('top');

    // get the position of the text object
    let textX = null;
    let textY = null;
    if (this.isStudentDataVersion(1)) {
      /*
       * get the offset of the end of the line (this is where the text object is
       * also located)
       */
      const xDiff = lineObject.x2 - lineObject.x1;
      const yDiff = lineObject.y2 - lineObject.y1;

      // the text x and y position is relative to the circle
      textX = xDiff;
      textY = yDiff;
    } else {
      // the text x and y position is absolute
      textX = textObject.left;
      textY = textObject.top;
    }

    // get the text and background color of the text
    const text = label.textString;
    const color = textObject.backgroundColor;

    // set all the values into the object
    labelJSONObject.pointX = parseInt(pointX);
    labelJSONObject.pointY = parseInt(pointY);
    labelJSONObject.textX = parseInt(textX);
    labelJSONObject.textY = parseInt(textY);
    labelJSONObject.text = text;
    labelJSONObject.color = color;

    return labelJSONObject;
  }

  /**
   * Get the simple JSON object that represents the label
   * @param text a Fabric text object
   * @returns a simple JSON object that represents the label
   */
  getLabelJSONObjectFromText(text) {
    let labelJSONObject: any = {};

    // get the label object that contains the circle, line, and text objects
    let label = this.getLabelFromText(text);
    let circleObject = label.circle;
    let lineObject = label.line;
    let textObject = label.text;

    // get the position of the circle
    let pointX = circleObject.get('left');
    let pointY = circleObject.get('top');

    // get the position of the text object
    let textX = null;
    let textY = null;
    if (this.isStudentDataVersion(1)) {
      /*
       * get the offset of the end of the line (this is where the text object is
       * also located)
       */
      let xDiff = lineObject.x2 - lineObject.x1;
      let yDiff = lineObject.y2 - lineObject.y1;

      // the text x and y position is relative to the circle
      textX = xDiff;
      textY = yDiff;
    } else {
      // the text x and y position is absolute
      textX = textObject.left;
      textY = textObject.top;
    }

    // get the text and background color of the text
    let textString = label.textString;
    let color = textObject.backgroundColor;

    // set all the values into the object
    labelJSONObject.pointX = parseInt(pointX);
    labelJSONObject.pointY = parseInt(pointY);
    labelJSONObject.textX = parseInt(textX);
    labelJSONObject.textY = parseInt(textY);
    labelJSONObject.text = textString;
    labelJSONObject.color = color;

    let canEdit = label.canEdit;
    if (canEdit == null) {
      canEdit = false;
    }
    labelJSONObject.canEdit = canEdit;

    let canDelete = label.canDelete;
    if (canDelete == null) {
      canDelete = false;
    }
    labelJSONObject.canDelete = canDelete;

    return labelJSONObject;
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const deferred = this.$q.defer();

    // create a new component state
    const componentState: any = this.NodeService.createNewComponentState();

    const studentData: any = {};
    studentData.version = this.getStudentDataVersion();
    studentData.labels = this.getLabelData();

    const backgroundImage = this.getBackgroundImage();
    if (backgroundImage != null) {
      studentData.backgroundImage = backgroundImage;
    }

    // set the submit counter
    studentData.submitCounter = this.submitCounter;

    // the student submitted this work
    componentState.isSubmit = this.isSubmit;

    // set the student data into the component state
    componentState.studentData = studentData;

    // set the component type
    componentState.componentType = 'Label';

    // set the node id
    componentState.nodeId = this.nodeId;

    // set the component id
    componentState.componentId = this.componentId;

    /*
     * reset the isSubmit value so that the next component state
     * doesn't maintain the same value
     */
    this.isSubmit = false;

    /*
     * perform any additional processing that is required before returning
     * the component state
     */
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);

    return deferred.promise;
  }

  /**
   * Check whether we need to show the new label button
   * @returns whether to show the new label button
   */
  showNewLabelButton() {
    return this.isNewLabelButtonVisible;
  }

  /**
   * Check whether we need to show the cancel button
   * @returns whether to show the cancel button
   */
  showCancelButton() {
    return this.isCancelButtonVisible;
  }

  /**
   * Initialize the canvas
   * @returns the canvas object
   */
  initializeCanvas() {
    let canvas = null;

    if (this.componentContent.width != null && this.componentContent.width != '') {
      this.canvasWidth = this.componentContent.width;
    }

    if (this.componentContent.height != null && this.componentContent.height != '') {
      this.canvasHeight = this.componentContent.height;
    }

    // get the canvas object from the html
    if (this.isDisabled) {
      // we will make the canvas uneditable
      canvas = new fabric.StaticCanvas(this.canvasId);
    } else {
      // make the canvas editable
      canvas = new fabric.Canvas(this.canvasId);
    }

    // disable selection of items
    canvas.selection = false;

    // change the cursor to a hand when it is hovering over an object
    canvas.hoverCursor = 'pointer';

    // set the width and height of the canvas
    canvas.setWidth(this.canvasWidth);
    canvas.setHeight(this.canvasHeight);
    (<HTMLInputElement>document.getElementById(this.canvasId)).width = this.canvasWidth;
    (<HTMLInputElement>document.getElementById(this.canvasId)).height = this.canvasHeight;

    // set the height on the parent div so that a vertical scrollbar doesn't show up
    $('#canvasParent_' + this.canvasId).css('height', this.canvasHeight + 2);

    // listen for the mouse down event
    canvas.on(
      'mouse:down',
      angular.bind(this, function (options) {
        // get the object that was clicked on if any
        const activeObject = this.canvas.getActiveObject();

        if (activeObject == null) {
          /*
           * no objects in the canvas were clicked. the user clicked
           * on a blank area of the canvas so we will unselect any label
           * that was selected and turn off edit label mode
           */
          this.selectedLabel = null;
          this.editLabelMode = false;
        }
      })
    );

    // listen for the object moving event
    canvas.on(
      'object:moving',
      angular.bind(this, function (options) {
        const target = options.target;

        if (target != null) {
          // get the type of the object that is moving
          const type = target.get('type');

          // get the position of the element
          let left = target.get('left');
          let top = target.get('top');

          // limit the x position to the canvas
          if (left < 0) {
            target.set('left', 0);
            left = 0;
          } else if (left > this.canvasWidth) {
            target.set('left', this.canvasWidth);
            left = this.canvasWidth;
          }

          // limit the y position to the canvas
          if (top < 0) {
            target.set('top', 0);
            top = 0;
          } else if (top > this.canvasHeight) {
            target.set('top', this.canvasHeight);
            top = this.canvasHeight;
          }

          if (type === 'circle') {
            /*
             * the student is moving the point of the label so we need to update
             * the endpoint of the line and the position of the text element.
             * the endpoint of the line and the position of the text element should
             * maintain the relative position to the point.
             */

            // get the line associated with the circle
            const line = target.line;

            let xDiff = 0;
            let yDiff = 0;

            if (line != null) {
              // calculate the relative offset of the end of the line
              xDiff = line.x2 - line.x1;
              yDiff = line.y2 - line.y1;

              if (this.isStudentDataVersion(1)) {
                // set the new position of the two endpoints of the line
                line.set({ x1: left, y1: top, x2: left + xDiff, y2: top + yDiff });
              } else {
                // set the new position of the circle endpoint of the line
                line.set({ x1: left, y1: top });
              }

              // remove and add the line to refresh the element in the canvas
              canvas.remove(line);
              canvas.add(line);

              // set the z index so it will be below the circle and text elements
              canvas.moveTo(line, this.lineZIndex);
            }

            // get the text element
            const text = target.text;

            if (text != null) {
              if (this.isStudentDataVersion(1)) {
                /*
                 * In the old student data version the text position is relative
                 * to the circle so we need to move the text along with the circle.
                 */

                // set the new position of the text element
                text.set({ left: left + xDiff, top: top + yDiff });

                // remove and add the line to refresh the element in the canvas
                canvas.remove(text);
                canvas.add(text);

                // set the z index so it will be above line elements and below circle elements
                canvas.moveTo(text, this.textZIndex);
              }
            }
          } else if (type === 'i-text') {
            if (this.enableCircles) {
              /*
               * the student is moving the text of the label so we need to update
               * the endpoint of the line. the endpoint of the line should be in
               * the same position as the text element.
               */
              const line = target.line;
              if (line != null) {
                // set the new position of the text element
                line.set({ x2: left, y2: top });

                // remove and add the line to refresh the element in the canvas
                canvas.remove(line);
                canvas.add(line);

                // set the z index so it will be below the circle and text elements
                canvas.moveTo(line, this.lineZIndex);
              }
            } else {
              /*
               * Circles are not enabled so we are only showing the text. We will
               * set the circle position to be the same as the text position.
               */
              let circle = target.circle;
              let line = target.line;
              circle.set({ left: left, top: top });
              line.set({ x1: left, y1: top, x2: left, y2: top });
            }
          }

          // refresh the canvas
          canvas.renderAll();
          this.studentDataChanged();
        }
      })
    );

    // listen for the text changed event
    canvas.on(
      'text:changed',
      angular.bind(this, function (options) {
        const target = options.target;
        if (target != null) {
          const type = target.get('type');
          if (type === 'i-text') {
            this.studentDataChanged();
          }
        }
      })
    );

    return canvas;
  }

  createLabelOnCanvas() {
    this.createLabelMode = false;
    this.isCancelButtonVisible = false;
    const newLabelLocation = this.getNewLabelLocation();
    const canEdit = true;
    const canDelete = true;
    const newLabel = this.createLabel(
      newLabelLocation.pointX,
      newLabelLocation.pointY,
      newLabelLocation.textX,
      newLabelLocation.textY,
      this.$translate('label.aNewLabel'),
      'blue',
      canEdit,
      canDelete
    );
    this.addLabelToCanvas(this.canvas, newLabel);
    this.selectLabel(newLabel);
    this.studentDataChanged();
  }

  getNewLabelLocation() {
    const nextPointLocation = this.getNextPointLocation();
    const pointX = nextPointLocation.pointX;
    const pointY = nextPointLocation.pointY;
    const newTextLocation = this.getNextTextLocation(pointX, pointY);
    const textX = newTextLocation.textX;
    const textY = newTextLocation.textY;
    return {
      pointX: pointX,
      pointY: pointY,
      textX: textX,
      textY: textY
    };
  }

  getNextPointLocation() {
    let unoccupiedPointLocation = this.getUnoccupiedPointLocation();
    if (unoccupiedPointLocation == null) {
      return { pointX: 50, pointY: 50 };
    } else {
      return unoccupiedPointLocation;
    }
  }

  getNextTextLocation(pointX, pointY) {
    let textX = null;
    let textY = null;
    if (this.enableCircles) {
      // place the text to the bottom right of the circle
      if (this.isStudentDataVersion(1)) {
        // text is relatively positioned
        textX = 100;
        textY = 100;
      } else {
        // text is absolutely positioned
        textX = pointX + 100;
        textY = pointY + 100;
      }
    } else {
      // circles are not enabled so we are only using the text
      textX = pointX;
      textY = pointY;
    }
    return { textX: textX, textY: textY };
  }

  getOccupiedPointLocations() {
    let labels = this.getLabelData();
    const occupiedPointLocations = [];
    for (let label of labels) {
      occupiedPointLocations.push({ pointX: label.pointX, pointY: label.pointY });
    }
    return occupiedPointLocations;
  }

  isPointOccupied(occupiedPointLocations, pointX, pointY) {
    for (let occupiedPointLocation of occupiedPointLocations) {
      if (occupiedPointLocation.pointX == pointX && occupiedPointLocation.pointY == pointY) {
        return true;
      }
    }
    return false;
  }

  getUnoccupiedPointLocation() {
    const occupiedPointLocations = this.getOccupiedPointLocations();
    for (let y = 50; y < this.canvasHeight; y += 150) {
      for (let x = 50; x < this.canvasWidth; x += 150) {
        if (!this.isPointOccupied(occupiedPointLocations, x, y)) {
          return { pointX: x, pointY: y };
        }
      }
    }
    return null;
  }

  /**
   * Set the background image
   * @param backgroundImagePath the url path to an image
   */
  setBackgroundImage(backgroundImagePath) {
    if (backgroundImagePath != null) {
      this.backgroundImage = backgroundImagePath;
      this.canvas.setBackgroundImage(backgroundImagePath, this.canvas.renderAll.bind(this.canvas));
    }
  }

  /**
   * Get the background image
   * @returns the background image path
   */
  getBackgroundImage() {
    return this.backgroundImage;
  }

  /**
   * Create the keydown listener that we will use for deleting labels
   */
  createKeydownListener() {
    window.addEventListener('keydown', angular.bind(this, this.keyPressed), false);
  }

  /**
   * The callback handler for the keydown event
   * @param e the event
   */
  keyPressed(e) {
    // get the key code of the key that was pressed
    const keyCode = e.keyCode;
    if (keyCode === 13) {
      // the enter key was pressed
      if (this.selectedLabel != null) {
        /*
         * There is a selected label so we will treat the enter keypress as
         * the intention of submitting any changes to the label text.
         */
        this.saveLabelButtonClicked();
        this.$scope.$apply();
      }
    }
  }

  /**
   * Get the label object given the canvas circle object.
   * @param circle A canvas circle object.
   * @return A label object.
   */
  getLabelFromCircle(circle) {
    for (let label of this.labels) {
      if (circle == label.circle) {
        return label;
      }
    }
    return null;
  }

  /**
   * Get the label object given the canvas text object.
   * @param text A canvas text object.
   * @return A label object.
   */
  getLabelFromText(text) {
    for (let label of this.labels) {
      if (text == label.text) {
        return label;
      }
    }
    return null;
  }

  /**
   * Create a label object. The label object is represented by a circle
   * element (the point), a line element, and a text element. The circle
   * element will contain a reference to the line and text elements. The
   * text element will contain a reference to the line element.
   * @param pointX the x position of the point (circle)
   * @param pointY the y position of the point (circle)
   * @param textX the x position of the text relative to the point (circle)
   * @param textY the y position of the text relative to the point (circle)
   * @param textString the text of the label
   * @param color the background color of the label
   * @param canEdit whether the student can edit the label
   * @param canDelete whether the student can delete the label
   * @returns an object containing a circle, line, and text
   */
  createLabel(pointX, pointY, textX, textY, textString, color, canEdit, canDelete) {
    let label: any = {};

    // get the position of the point
    let x1 = pointX;
    let y1 = pointY;
    let x2 = null;
    let y2 = null;

    if (this.isStudentDataVersion(1)) {
      // get the absolute position of the text
      x2 = pointX + textX;
      y2 = pointY + textY;
    } else {
      x2 = textX;
      y2 = textY;
    }

    /*
     * Make sure all the positions are within the bounds of the canvas. If there
     * are any positions that are outside the bounds, we will change the
     * position to be within the bounds.
     */
    x1 = this.makeSureXIsWithinXMinMaxLimits(x1);
    y1 = this.makeSureYIsWithinYMinMaxLimits(y1);
    x2 = this.makeSureXIsWithinXMinMaxLimits(x2);
    y2 = this.makeSureYIsWithinYMinMaxLimits(y2);

    if (color == null) {
      // the default background color for text elements will be blue
      color = 'blue';
    }

    let radius = 5;
    if (this.componentContent.pointSize != null && this.componentContent.pointSize != '') {
      radius = parseFloat(this.componentContent.pointSize);
    }

    let fontSize = 20;
    if (this.componentContent.fontSize != null && this.componentContent.fontSize != '') {
      fontSize = parseFloat(this.componentContent.fontSize);
    }

    // create a circle element
    const circle = new fabric.Circle({
      radius: radius,
      left: x1,
      top: y1,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      borderColor: 'red',
      hasBorders: true,
      selectable: true
    });

    // create a line element
    const line = new fabric.Line([x1, y1, x2, y2], {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 3,
      selectable: false
    });

    // wrap the text if necessary
    let wrappedTextString = textString;
    if (this.componentContent.labelWidth) {
      wrappedTextString = this.UtilService.wordWrap(textString, this.componentContent.labelWidth);
    }

    // create an editable text element
    const text = new fabric.IText(wrappedTextString, {
      left: x2,
      top: y2,
      originX: 'center',
      originY: 'center',
      fontSize: fontSize,
      fill: 'white',
      backgroundColor: color,
      width: 100,
      hasControls: false,
      hasBorders: true,
      borderColor: 'red',
      borderDashArray: [8, 8],
      borderScaleFactor: 3,
      borderOpacityWhenMoving: 1,
      selectable: true,
      cursorWidth: 0,
      editable: false,
      padding: 16
    });

    // give the circle a reference to the line and text elements
    circle.line = line;
    circle.text = text;

    // give the text element a reference to the line and circle elements
    text.line = line;
    text.circle = circle;

    // add the circle, line, and text elements to the label object
    label.circle = circle;
    label.line = line;
    label.text = text;
    label.textString = textString;

    if (canEdit == null) {
      canEdit = true;
    }
    label.canEdit = canEdit;

    if (canDelete == null) {
      canDelete = true;
    }
    label.canDelete = canDelete;

    return label;
  }

  /**
   * Make sure the x coordinate is within the bounds of the canvas.
   * @param x The x coordinate.
   * @return The x coordinate that may have been modified to be within the
   * bounds.
   */
  makeSureXIsWithinXMinMaxLimits(x) {
    // make sure the x is not to the left of the left edge
    if (x < 0) {
      x = 0;
    }
    // make sure the x is not to the right of the right edge
    if (x > this.canvasWidth) {
      x = this.canvasWidth;
    }
    return x;
  }

  /**
   * Make sure the y coordinate is within the bounds of the canvas.
   * @param y The y coordinate.
   * @return The y coordinate that may have been modified to be within the
   * bounds.
   */
  makeSureYIsWithinYMinMaxLimits(y) {
    // make sure the y is not above the top edge
    if (y < 0) {
      y = 0;
    }
    // make sure the y is not below the bottom edge
    if (y > this.canvasHeight) {
      y = this.canvasHeight;
    }
    return y;
  }

  /**
   * Add a label to canvas
   * @param canvas the canvas
   * @param label an object that contains a Fabric circle, Fabric line,
   * and Fabric itext elements
   */
  addLabelToCanvas(canvas, label) {
    if (canvas != null && label != null) {
      // get the circle, line and text elements
      const circle = label.circle;
      const line = label.line;
      const text = label.text;

      if (circle != null && line != null && text != null) {
        if (this.enableCircles) {
          // add the elements to the canvas
          canvas.add(circle, line, text);

          // set the z indexes for the elements
          canvas.moveTo(line, this.lineZIndex);
          canvas.moveTo(text, this.textZIndex);
          canvas.moveTo(circle, this.circleZIndex);
        } else {
          // add the text element to the canvas
          canvas.add(text);
          canvas.moveTo(text, this.textZIndex);
        }

        // refresh the canvas
        canvas.renderAll();

        if (this.enableCircles) {
          circle.on('mousedown', () => {
            /*
             * the circle was clicked so we will make the associated
             * label selected
             */
            this.selectLabel(label);
          });
        }

        text.on('mousedown', () => {
          /*
           * the text was clicked so we will make the associated
           * label selected
           */
          this.selectLabel(label);
        });

        this.labels.push(label);
      }
    }
  }

  /**
   * Make the label selected which means we will show the UI elements to
   * allow the text to be edited and the label to deleted.
   * @param label the label object
   */
  selectLabel(label) {
    // create a reference to the selected label
    this.selectedLabel = label;

    if (label.canEdit) {
      /*
       * remember the label text before the student changes it in case the
       * student wants to cancel any changes they make
       */
      this.selectedLabelText = label.text.text;

      this.editLabelMode = true;
      this.canvas.setActiveObject(label.text);
      this.giveFocusToLabelTextInput();
    } else {
      // hide label text input
      this.editLabelMode = false;
    }
  }

  giveFocusToLabelTextInput() {
    this.$timeout(() => {
      /*
       * Get the y position of the top of the edit label text input. If this
       * value is negative, it means the element is above the currently
       * viewable area and can not be seen. If the value is positive, it means
       * the element is currently in the viewable area and can be seen.
       */
      const offset = $('#editLabelTextInput').offset();
      if (offset != null) {
        const editLabelTextInputTop = offset.top;

        /*
         * Check if the edit label text input is viewable. We want to make sure
         * the input is in view. If the input is not in view and we give it
         * focus, it will have the undesirable effect of scrolling the view up
         * so that the input comes into view. We don't want it to scroll because
         * it's jarring when the student is trying to select a label in the
         * canvas.
         */
        if (editLabelTextInputTop > 100) {
          // the input is in view so we will give it focus.
          angular.element(document.querySelector('#editLabelTextInput')).focus();
        }
      }
    });
  }

  /**
   * The student has changed the label text on the selected label
   * @param label The label that has changed.
   * @param textObject The label's canvas text object.
   * @param textString The text string.
   */
  selectedLabelTextChanged(label, textObject, textString) {
    // save the text string into the label
    label.textString = textString;

    // wrap the text if necessary
    let wrappedText = textString;
    if (this.componentContent.labelWidth != null && this.componentContent.labelWidth != '') {
      wrappedText = this.UtilService.wordWrap(textString, this.componentContent.labelWidth);
    }

    // set the wrapped text into the text object
    textObject.text = wrappedText;
    this.studentDataChanged();

    // refresh the canvas
    this.canvas.renderAll();
  }

  /**
   * Remove a label from the canvas.
   * @param canvas The canvas.
   * @param label A label object that contains a circle object, line object, and
   * text object.
   */
  removeLabelFromCanvas(canvas, label) {
    if (canvas != null && label != null) {
      // get the circle, line, and text elements
      const circle = label.circle;
      const line = label.line;
      const text = label.text;

      if (circle != null && line != null && text != null) {
        // remove the elements from the canvas
        canvas.remove(circle);
        canvas.remove(line);
        canvas.remove(text);

        this.labels.splice(this.labels.indexOf(label), 1);

        // refresh the canvas
        canvas.renderAll();
      }
    }
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObject() {
    let pngFile = null;

    if (this.canvas != null) {
      // get the image as a base64 string
      const img_b64 = this.canvas.toDataURL('image/png');

      // get the image object
      pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
    }

    return pngFile;
  }

  /**
   * Snip the labels by converting it to an image
   * @param $event the click event
   */
  snipImage($event) {
    // get the canvas element
    let canvas = angular.element(document.querySelector('#' + this.canvasId));

    if (canvas != null && canvas.length > 0) {
      // get the top canvas
      canvas = canvas[0];

      // get the canvas as a base64 string
      const img_b64 = canvas.toDataURL('image/png');

      // get the image object
      const imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

      // create a notebook item with the image populated into it
      this.NotebookService.addNote(imageObject);
    }
  }

  /**
   * The student clicked the save button in the edit label mode
   */
  saveLabelButtonClicked() {
    if (this.selectedLabel != null) {
      /*
       * we do not need to perform any saving of the text since it has
       * already been handled by the ng-model for the label text
       */

      /*
       * remove the reference to the selected label since it will no
       * longer be selected
       */
      this.selectedLabel = null;

      // turn off edit label mode
      this.editLabelMode = false;

      // make the canvas object no longer the active object
      this.canvas.discardActiveObject();
    }
  }

  /**
   * The student clicked the cancel button in the edit label mode
   */
  cancelLabelButtonClicked() {
    if (this.selectedLabel != null) {
      // get the label text before the student recently made changes to it
      const selectedLabelText = this.selectedLabelText;

      // revert the label text to what it was before
      this.selectedLabel.text.setText(selectedLabelText);

      // clear the label text holder
      this.selectedLabelText = null;

      /*
       * remove the reference to the selected label since it will no
       * longer be selected
       */
      this.selectedLabel = null;

      // turn off edit label mode
      this.editLabelMode = false;

      // make the canvas object no longer the active object
      this.canvas.discardActiveObject();
      this.studentDataChanged();

      // refresh the canvas
      this.canvas.renderAll();
    }
  }

  /**
   * The student clicked the delete button in the edit label mode
   */
  deleteLabelButtonClicked() {
    if (this.selectedLabel != null) {
      // get the text from the label we are going to delete
      const selectedLabelText = this.selectedLabel.textString;

      // confirm with the student that they want to delete the label
      const answer = confirm(
        this.$translate('label.areYouSureYouWantToDeleteThisLabel', {
          selectedLabelText: selectedLabelText
        })
      );

      if (answer) {
        // the student is sure they want to delete the label
        this.deleteLabel(this.selectedLabel);

        /*
         * remove the reference to the selected label since it will no
         * longer be selected
         */
        this.selectedLabel = null;

        // turn off edit label mode
        this.editLabelMode = false;

        // make the canvas object no longer the active object
        this.canvas.discardActiveObject();
        this.studentDataChanged();
      }
    }
  }

  /**
   * Delete a label from the canvas.
   * @param label A label object.
   */
  deleteLabel(label) {
    // remove the label from the canvas
    this.removeLabelFromCanvas(this.canvas, label);
  }

  handleConnectedComponentsPostProcess() {
    if (
      this.componentContent.backgroundImage != null &&
      this.componentContent.backgroundImage != ''
    ) {
      this.setBackgroundImage(this.componentContent.backgroundImage);
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {
    let mergedComponentState: any = this.NodeService.createNewComponentState();

    if (componentStates != null) {
      let mergedLabels = [];
      let mergedBackgroundImage = null;
      let studentDataVersion = 2;
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];
        if (componentState != null) {
          if (componentState.componentType == 'Label') {
            let studentData = componentState.studentData;
            if (studentData != null) {
              if (studentData.version != null) {
                studentDataVersion = studentData.version;
              }
              let labels = studentData.labels;
              let backgroundImage = studentData.backgroundImage;
              if (labels != null && labels != '') {
                mergedLabels = mergedLabels.concat(labels);
              }
              if (backgroundImage != null && backgroundImage != '') {
                mergedBackgroundImage = backgroundImage;
              }
            }
          } else if (componentState.componentType == 'OpenResponse') {
            let connectedComponent = this.getConnectedComponentForComponentState(componentState);
            if (connectedComponent != null) {
              let studentData = componentState.studentData;
              let response = studentData.response;
              if (connectedComponent.importWorkAsBackground) {
                let charactersPerLine = connectedComponent.charactersPerLine;
                let spaceInbetweenLines = connectedComponent.spaceInbetweenLines;
                let fontSize = connectedComponent.fontSize;

                // create an image from the concept map data
                this.LabelService.createImageFromText(
                  response,
                  null,
                  null,
                  charactersPerLine,
                  null,
                  spaceInbetweenLines,
                  fontSize
                ).then((image) => {
                  // set the image as the background
                  this.setBackgroundImage(image);

                  // make the work dirty so that it gets saved
                  this.studentDataChanged();
                });
              }
            }
          } else if (
            componentState.componentType == 'ConceptMap' ||
            componentState.componentType == 'Draw' ||
            componentState.componentType == 'Embedded' ||
            componentState.componentType == 'Graph' ||
            componentState.componentType == 'Table'
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
      }

      if (mergedLabels != null) {
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.labels = mergedLabels;
        mergedComponentState.studentData.backgroundImage = mergedBackgroundImage;
      }
      if (studentDataVersion != null) {
        mergedComponentState.studentData.version = studentDataVersion;
      }
    }

    return mergedComponentState;
  }

  /**
   * Get the connected component associated with the component state.
   * @param componentState A component state object that was obtained from a
   * connected component.
   * @return A connected component object.
   */
  getConnectedComponentForComponentState(componentState) {
    for (let connectedComponent of this.componentContent.connectedComponents) {
      if (
        componentState.nodeId == connectedComponent.nodeId &&
        componentState.componentId == connectedComponent.componentId
      ) {
        return connectedComponent;
      }
    }
    return null;
  }

  /**
   * Create an image from a component state and set the image as the background.
   * @param componentState A component state.
   */
  setComponentStateAsBackgroundImage(componentState) {
    this.generateImageFromComponentState(componentState).then((image) => {
      this.setBackgroundImage(image.url);
    });
  }

  /**
   * The student clicked the reset button so we will delete all the labels and
   * reset the background if applicable.
   */
  resetButtonClicked() {
    // confirm with the student that they want to delete the label
    const answer = confirm(this.$translate('label.areYouSureYouWantToReset'));

    if (answer) {
      let tempLabels = [];
      for (let label of this.labels) {
        tempLabels.push(label);
      }

      for (let tempLabel of tempLabels) {
        this.deleteLabel(tempLabel);
      }

      if (this.componentContent.backgroundImage != null) {
        this.setBackgroundImage(this.componentContent.backgroundImage);
      }

      /*
       * remove the reference to the selected label since it will no
       * longer be selected
       */
      this.selectedLabel = null;

      // turn off edit label mode
      this.editLabelMode = false;

      // make the canvas object no longer the active object
      this.canvas.discardActiveObject();

      if (this.componentContent.labels != null) {
        /*
         * the student has not done any work and there are starter labels
         * so we will populate the canvas with the starter labels
         */
        this.addLabelsToCanvas(this.componentContent.labels);
      }

      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      }
      this.studentDataChanged();
    }
  }

  /**
   * Set the student data version for this controller.
   * @param studentDataVersion The student data version.
   */
  setStudentDataVersion(studentDataVersion) {
    this.studentDataVersion = studentDataVersion;
  }

  /**
   * Get the student data version.
   * @return The student data version.
   */
  getStudentDataVersion() {
    return this.studentDataVersion;
  }

  /**
   * Check if the student data version we are using matches the argument.
   * @param studentDataVersion The studentDataVersion to compare.
   * @return Whether the passed in studentDataVersion matches the
   * studentDataVersion this controller is set to.
   */
  isStudentDataVersion(studentDataVersion) {
    return this.getStudentDataVersion() == studentDataVersion;
  }

  /**
   * Check if this component only has show work connected components.
   * @return If this component has connected components and all of them are
   * 'showWork', then return true. Otherwise return false.
   */
  onlyHasShowWorkConnectedComponents() {
    let connectedComponents = this.componentContent.connectedComponents;
    let showWorkConnectedComponentCount = 0;
    if (connectedComponents != null) {
      for (let connectedComponent of connectedComponents) {
        if (connectedComponent.type == 'showWork') {
          showWorkConnectedComponentCount += 1;
        }
      }
      if (
        connectedComponents.length > 0 &&
        connectedComponents.length == showWorkConnectedComponentCount
      ) {
        return true;
      }
    }
    return false;
  }

  generateStarterState() {
    this.NodeService.respondStarterState({
      nodeId: this.nodeId,
      componentId: this.componentId,
      starterState: this.getLabelData()
    });
  }
}

export default LabelController;

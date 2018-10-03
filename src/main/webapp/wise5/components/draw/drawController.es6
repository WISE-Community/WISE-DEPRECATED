'use strict';

import ComponentController from "../componentController";
import drawingTool from 'lib/drawingTool/drawing-tool';
import drawingToolVendor from 'lib/drawingTool/vendor.min';
import html2canvas from 'html2canvas';

class DrawController extends ComponentController {
  constructor($filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConfigService,
      DrawService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$injector = $injector;
    this.$q = $q;
    this.$timeout = $timeout;
    this.DrawService = DrawService;

    // whether the reset button is visible or not
    this.isResetButtonVisible = false;

    // the label for the notebook in thos project
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    // will hold the drawing tool object
    this.drawingTool = null;

    this.latestConnectedComponentState = null;
    this.latestConnectedComponentParams = null;

    // the default width and height of the canvas
    this.width = 800;
    this.height = 600;

    if (this.componentContent.width != null) {
      this.width = this.componentContent.width;
    }

    if (this.componentContent.height != null) {
      this.height = this.componentContent.height;
    }

    this.componentType = this.componentContent.type;

    if (this.mode === 'student') {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.isResetButtonVisible = true;

      this.drawingToolId = 'drawingtool_' + this.nodeId + '_' + this.componentId;
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision' || this.mode === 'onlyShowWork') {
      // get the component state from the scope
      let componentState = this.$scope.componentState;

      if (componentState != null) {
        // create a unique id for the application drawing tool element using this component state
        this.drawingToolId = 'drawingtool_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          this.drawingToolId = 'drawingtool_gradingRevision_' + componentState.id;
        }
      }
    } else if (this.mode === 'showPreviousWork') {
      // get the component state from the scope
      var componentState = this.$scope.componentState;
      if (componentState != null) {
        this.drawingToolId = 'drawingtool_' + componentState.id;
      }
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    // running this in side a timeout ensures that the code only runs after the markup is rendered.
    // maybe there's a better way to do this, like with an event?
    this.$timeout(angular.bind(this, this.initializeDrawingTool));

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a component state containing the student data
     */
    this.$scope.getComponentState = function(isSubmit) {
      let deferred = this.$q.defer();
      let getState = false;
      let action = 'change';

      if (isSubmit) {
        if (this.$scope.drawController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.drawController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.drawController.createComponentState(action).then((componentState) => {
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

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    this.$scope.$on('requestImage', (event, args) => {
      // get the node id and component id from the args
      var nodeId = args.nodeId;
      var componentId = args.componentId;

      // check if the image is being requested from this component
      if (this.nodeId === nodeId && this.componentId === componentId) {

        // obtain the image blob
        var imageObject = this.getImageObject();

        if (imageObject != null) {
          var args = {};
          args.nodeId = nodeId;
          args.componentId = componentId;
          args.imageObject = imageObject;

          // fire an event that contains the image object
          this.$scope.$emit('requestImageCallback', args);
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', angular.bind(this, function(event, args) {

    }));

    this.$scope.$on('notebookItemChosen', (event, args) => {
      if (args.requester == this.nodeId + '-' + this.componentId) {
        const notebookItem = args.notebookItem;
        const studentWorkId = notebookItem.content.studentWorkIds[0];
        this.importWorkByStudentWorkId(studentWorkId);
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  registerStudentWorkSavedToServerListener() {
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
        let serverSaveTime = componentState.serverSaveTime;
        let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

        if (isSubmit) {
          this.setSubmittedMessage(clientSaveTime);
          this.lockIfNecessary();

          // set isSubmitDirty to false because the component state was just submitted and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        } else if (isAutoSave) {
          this.setAutoSavedMessage(clientSaveTime);
        } else {
          this.setSavedMessage(clientSaveTime);
        }
      }

      // check if the component state is from a connected component
      if (this.ProjectService.isConnectedComponent(this.nodeId, this.componentId, componentState.componentId)) {

        // get the connected component params
        var connectedComponentParams = this.ProjectService.getConnectedComponentParams(this.componentContent, componentState.componentId);

        if (connectedComponentParams != null) {

          if (connectedComponentParams.updateOn === 'save' ||
            (connectedComponentParams.updateOn === 'submit' && componentState.isSubmit)) {

            var performUpdate = false;

            /*
             * make a copy of the component state so we don't accidentally
             * change any values in the referenced object
             */
            componentState = this.UtilService.makeCopyOfJSONObject(componentState);

            /*
             * check if the the canvas is empty which means the student has
             * not drawn anything yet
             */
            if (this.isCanvasEmpty()) {
              performUpdate = true;
            } else {
              /*
               * the student has drawn on the canvas so we
               * will ask them if they want to update it
               */
              var answer = confirm(this.$translate('draw.doYouWantToUpdateTheConnectedDrawing'));

              if (answer) {
                // the student answered yes
                performUpdate = true;
              }
            }

            if (performUpdate) {

              if (!connectedComponentParams.includeBackground) {
                // remove the background from the draw data
                this.DrawService.removeBackgroundFromComponentState(componentState);
              }

              // update the draw data
              this.setDrawData(componentState);

              // the table has changed
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
    }));
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  /**
   * Initialize the drawing tool
   */
  initializeDrawingTool() {

    this.drawingTool = new DrawingTool('#' + this.drawingToolId, {
      stamps: this.componentContent.stamps || {},
      parseSVG: true,
      width: this.width,
      height: this.height
    });
    var state = null;
    $('#set-background').on('click', angular.bind(this, function () {
      this.drawingTool.setBackgroundImage($('#background-src').val());
    }));
    $('#resize-background').on('click', angular.bind(this, function () {
      this.drawingTool.resizeBackgroundToCanvas();
    }));
    $('#resize-canvas').on('click', angular.bind(this, function () {
      this.drawingTool.resizeCanvasToBackground();
    }));
    $('#shrink-background').on('click', angular.bind(this, function () {
      this.drawingTool.shrinkBackgroundToCanvas();
    }));
    $('#clear').on('click', angular.bind(this, function () {
      this.drawingTool.clear(true);
    }));
    $('#save').on('click', angular.bind(this, function () {
      state = drawingTool.save();
      $('#load').removeAttr('disabled');
    }));
    $('#load').on('click', angular.bind(this, function () {
      if (state === null) return;
      this.drawingTool.load(state);
    }));

    var componentState = null;

    // get the component state from the scope
    componentState = this.$scope.componentState;

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      }  else if (this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      } else if (componentState == null ||
             !this.DrawService.componentStateHasStudentWork(componentState, this.componentContent)) {
        /*
         * only import work or use starter draw data if the student
         * does not already have work for this component
         */

        // get the starter draw data if any
        var starterDrawData = this.componentContent.starterDrawData;
        if (starterDrawData != null) {
          // there is starter draw data so we will populate it into the draw tool
          this.drawingTool.load(starterDrawData);

          if (this.componentContent.background != null) {
            // set the background from the component content
            this.drawingTool.setBackgroundImage(this.componentContent.background);
          }
        } else {
          if (this.componentContent.background != null) {
            // set the background from the component content
            this.drawingTool.setBackgroundImage(this.componentContent.background);
          }
        }
      }
    } else if (this.mode == 'authoring') {

      if (this.componentContent.starterDrawData != null) {
        // there is starter draw data so we will populate it into the draw tool
        this.drawingTool.load(this.componentContent.starterDrawData);
      }

      if (this.componentContent.background != null) {
        this.drawingTool.setBackgroundImage(this.componentContent.background);
      }
    } else {
      // populate the student work into this component
      this.setStudentWork(componentState);
    }

    // check if the student has used up all of their submits
    if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
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
    this.$timeout(angular.bind(this, () => {
      this.drawingTool.on('drawing:changed', angular.bind(this, this.studentDataChanged));
    }), 500);

    if (this.mode === 'student') {
      // listen for selected tool changed event
      this.drawingTool.on('tool:changed', function (toolName) {
        // log this event
        var category = 'Tool';
        var event = 'toolSelected';
        var data = {};
        data.selectedToolName = toolName;
        this.StudentDataService.saveComponentEvent(this, category, event, data);
      }.bind(this));
    }

    if (this.mode === 'grading' || this.mode === 'gradingRevision' || this.mode === 'onlyShowWork') {
      // we're in show student work mode, so hide the toolbar and make the drawing non-editable
      $('#' + this.drawingToolId).find('.dt-tools').hide();
    } else {
      // show or hide the draw tools
      this.setupTools();
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

    // get the tools values from the authored content
    var tools = this.componentContent.tools;

    if (tools == null) {
      // we will display all the tools
    } else {
      // we will only display the tools the authored specified to show

      // the title for the select button
      var selectTitle = this.$translate('draw.selectToolTooltip');
      let $drawingTool = $('#' + this.drawingToolId);

      if (tools.select) {
        $drawingTool.find('[title="' + selectTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + selectTitle + '"]').hide();
      }

      // the title for the line button
      var lineTitle = this.$translate('draw.lineToolTooltip');

      if (tools.line) {
        $drawingTool.find('[title="' + lineTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + lineTitle + '"]').hide();
      }

      // the title for the shape button
      var shapeTitle = this.$translate('draw.shapeToolTooltip');

      if (tools.shape) {
        $drawingTool.find('[title="' + shapeTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + shapeTitle + '"]').hide();
      }

      // the title for the free hand button
      var freeHandTitle = this.$translate('draw.freeHandToolTooltip');

      if (tools.freeHand) {
        $drawingTool.find('[title="' + freeHandTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + freeHandTitle + '"]').hide();
      }

      // the title for the text button
      var textTitle = this.$translate('draw.textToolTooltip');

      if (tools.text) {
        $drawingTool.find('[title="' + textTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + textTitle + '"]').hide();
      }

      // the title for the stamp button
      var stampTitle = this.$translate('draw.stampToolTooltip');

      if (tools.stamp) {
        $drawingTool.find('[title="' + stampTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + stampTitle + '"]').hide();
      }

      // the title for the clone button
      var cloneTitle = this.$translate('draw.cloneToolTooltip');

      if (tools.clone) {
        $drawingTool.find('[title="' + cloneTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + cloneTitle + '"]').hide();
      }

      // the title for the stroke color button
      var strokeColorTitle = this.$translate('draw.strokeColorToolTooltip');

      if (tools.strokeColor) {
        $drawingTool.find('[title="' + strokeColorTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + strokeColorTitle + '"]').hide();
      }

      // the title for the fill color button
      var fillColorTitle = this.$translate('draw.fillColorToolTooltip');

      if (tools.fillColor) {
        $drawingTool.find('[title="' + fillColorTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + fillColorTitle + '"]').hide();
      }

      // the title for the stroke width button
      var strokeWidthTitle = this.$translate('draw.strokeWidthToolTooltip');

      if (tools.strokeWidth) {
        $drawingTool.find('[title="' + strokeWidthTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + strokeWidthTitle + '"]').hide();
      }

      // the title for the send back button
      var sendBackTitle = this.$translate('draw.sendBackToolTooltip');

      if (tools.sendBack) {
        $drawingTool.find('[title="' + sendBackTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + sendBackTitle + '"]').hide();
      }

      // the title for the send forward button
      var sendForwardTitle = this.$translate('draw.sendForwardToolTooltip');

      if (tools.sendForward) {
        $drawingTool.find('[title="' + sendForwardTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + sendForwardTitle + '"]').hide();
      }

      // the title for the undo button
      var undoTitle = this.$translate('draw.undo');

      if (tools.undo) {
        $drawingTool.find('[title="' + undoTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + undoTitle + '"]').hide();
      }

      // the title for the redo button
      var redoTitle = this.$translate('draw.redo');

      if (tools.redo) {
        $drawingTool.find('[title="' + redoTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + redoTitle + '"]').hide();
      }

      // the title for the delete button
      var deleteTitle = this.$translate('draw.deleteToolTooltip');

      if (tools.delete) {
        $drawingTool.find('[title="' + deleteTitle + '"]').show();
      } else {
        $drawingTool.find('[title="' + deleteTitle + '"]').hide();
      }

      if (this.isDisabled) {
        $drawingTool.find('.dt-tools').hide();
      }
    }
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {

    if (componentState != null) {
      this.setDrawData(componentState);
       this.processLatestStudentWork();
    }
  };

  /**
   * The reset button was clicked
   */
  resetButtonClicked() {

    // ask the student if they are sure they want to clear the drawing
    var result = confirm(this.$translate('draw.areYouSureYouWantToClearYourDrawing'));

    if (result) {
      // clear the drawing
      this.drawingTool.clear();

      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      } else if (this.latestConnectedComponentState && this.latestConnectedComponentParams) {
        // reload the student data from the connected component
        this.setDrawData(latestConnectedComponentState, latestConnectedComponentParams);
      } else if (this.componentContent.starterDrawData != null) {
        // this component has starter draw data

        // there is starter draw data so we will populate it into the draw tool
        this.drawingTool.load(this.componentContent.starterDrawData);
      }

      if (this.componentContent.background != null && this.componentContent.background != '') {
        // set the background
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

    var deferred = this.$q.defer();

    // create a new component state
    var componentState = this.NodeService.createNewComponentState();

    var studentData = {};

    // get the draw JSON string
    var studentDataJSONString = this.getDrawData();

    // set the draw JSON string into the draw data
    studentData.drawData = studentDataJSONString;

    // set the submit counter
    studentData.submitCounter = this.submitCounter;

    if (this.parentStudentWorkIds != null) {
      studentData.parentStudentWorkIds = this.parentStudentWorkIds;
    }

    // set the flag for whether the student submitted this work
    componentState.isSubmit = this.isSubmit;

    // set the student data into the component state
    componentState.studentData = studentData;

    // set the component type
    componentState.componentType = 'Draw';

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
  };

  /**
   * Add student asset images as objects in the drawing canvas
   * @param studentAsset
   */
  attachStudentAsset(studentAsset) {
    if (studentAsset != null) {
      this.StudentAssetService.copyAssetForReference(studentAsset).then( (copiedAsset) => {
        if (copiedAsset != null) {
          fabric.Image.fromURL(copiedAsset.url, (oImg) => {
            oImg.scaleToWidth(200);  // set max width and have height scale proportionally
            // TODO: center image or put them at mouse position? Wasn't straight-forward, tried below but had issues...
            //oImg.setLeft((this.drawingTool.canvas.width / 2) - (oImg.width / 2));  // center image vertically and horizontally
            //oImg.setTop((this.drawingTool.canvas.height / 2) - (oImg.height / 2));
            //oImg.center();
            oImg.studentAssetId = copiedAsset.id;  // keep track of this asset id
            this.drawingTool.canvas.add(oImg);   // add copied asset image to canvas
          });
        }
      });
    }
  };

  /**
   * Get the draw data
   * @return the draw data from the drawing tool as a JSON string
   */
  getDrawData() {
    var drawData = null;

    drawData = this.drawingTool.save();

    return drawData;
  };

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObject() {
    var pngFile = null;

    if (this.drawingTool != null && this.drawingTool.canvas != null) {

      // get the image as a base64 string
      var img_b64 = this.drawingTool.canvas.toDataURL('image/png');

      // get the image object
      pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
    }

    return pngFile;
  }

  /**
   * Set the draw data
   * @param componentState the component state
   */
  setDrawData(componentState) {
    if (componentState != null) {

      // get the student data from the component state
      var studentData = componentState.studentData;

      if (studentData != null) {

        var submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        // get the draw data
        var drawData = studentData.drawData;

        if (drawData != null && drawData != '' && drawData != '{}') {
          // set the draw data into the drawing tool
          this.drawingTool.load(drawData);
        }
      }
    }
  }

  /**
   * Check if the student has drawn anything
   * @returns whether the canvas is empty
   */
  isCanvasEmpty() {

    var result = true;

    if (this.drawingTool != null && this.drawingTool.canvas != null) {

      // get the objects in the canvas where the student draws
      var objects = this.drawingTool.canvas.getObjects();

      if (objects != null && objects.length > 0) {
        // there are objects in the canvas
        result = false;
      }
    }

    return result;
  }

  /**
   * Snip the drawing by converting it to an image
   * @param $event the click event
   */
  snipDrawing($event, studentWorkId) {
    // get the canvas element
    var canvas = angular.element('#drawingtool_' + this.nodeId + '_' + this.componentId + ' canvas');

    if (canvas != null && canvas.length > 0) {

      // get the top canvas
      canvas = canvas[0];

      // get the canvas as a base64 string
      var img_b64 = canvas.toDataURL('image/png');

      // get the image object
      var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

      // create a notebook item with the image populated into it
      const noteText = null;
      this.NotebookService.addNote($event, imageObject, noteText, [ studentWorkId ]);
    }
  }

  snipButtonClicked($event) {
    if (this.isDirty) {
      const deregisterListener = this.$scope.$on('studentWorkSavedToServer',
        (event, args) => {
          let componentState = args.studentWork;
          if (componentState &&
            this.nodeId === componentState.nodeId &&
            this.componentId === componentState.componentId) {
            this.snipDrawing($event, componentState.id);
            deregisterListener();
          }
        }
      );
      this.saveButtonClicked(); // trigger a save
    } else {
      const studentWork =
          this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId)
      this.snipDrawing($event, studentWork.id);
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {

    // create a new component state
    let mergedComponentState = this.NodeService.createNewComponentState();

    if (componentStates != null) {

      // used to collect the objects from all the component states
      let allObjects = [];

      // the draw data from the first component state
      let firstDrawData = {};

      // loop through all the component state
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];
        if (componentState.componentType == 'Draw') {
          let studentData = componentState.studentData;

          if (studentData != null) {

            let drawData = studentData.drawData;

            if (drawData != null) {

              // convert the JSON string to a JSON object
              let drawDataJSON = angular.fromJson(drawData);

              if (drawDataJSON != null &&
                drawDataJSON.canvas != null &&
                drawDataJSON.canvas.objects != null) {

                if (c == 0) {
                  // remember the first draw data
                  firstDrawData = drawDataJSON;
                }

                // append the objects
                allObjects = allObjects.concat(drawDataJSON.canvas.objects);
              }
            }
          }
        } else if (componentState.componentType == 'Graph' ||
            componentState.componentType == 'ConceptMap' ||
            componentState.componentType == 'Embedded' ||
            componentState.componentType == 'Label' ||
            componentState.componentType == 'Table') {
          let connectedComponent =
            this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
          if (connectedComponent.importWorkAsBackground === true) {
            this.setComponentStateAsBackgroundImage(componentState);
          }
        }
      }

      if (allObjects != null) {

        // create the draw data with all the objects
        let drawData = firstDrawData;

        if (drawData != null &&
            drawData.canvas != null &&
            drawData.canvas.objects != null) {

          drawData.canvas.objects = allObjects;
        }

        // set the draw data JSON string into the component state
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
    this.UtilService.generateImageFromComponentState(componentState).then((image) => {
      this.drawingTool.setBackgroundImage(image.url);
    });
  }
}

DrawController.$inject = [
  '$filter',
  '$injector',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConfigService',
  'DrawService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'];

export default DrawController;

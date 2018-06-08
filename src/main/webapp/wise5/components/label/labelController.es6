'use strict';

import ComponentController from "../componentController";
import Fabric from 'fabric';
import html2canvas from 'html2canvas';

class LabelController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      $window,
      AnnotationService,
      ConfigService,
      LabelService,
      NodeService,
      NotebookService,
      OpenResponseService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$q = $q;
    this.$timeout = $timeout;
    this.$window = $window;
    this.LabelService = LabelService;
    this.OpenResponseService = OpenResponseService;

    // holds student attachments like assets
    this.attachments = [];

    // the latest annotations
    this.latestAnnotations = null;

    // whether the new label button is shown or not
    this.isNewLabelButtonVisible = true;

    // whether the cancel button is shown or not
    this.isCancelButtonVisible = false;

    // whether the snip image button is shown or not
    this.isSnipImageButtonVisible = true;

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
      _getNonTransformedDimensions() { // Object dimensions
        return new fabric.Point(this.width, this.height).scalarAdd(this.padding);
      },
      _calculateCurrentDimensions() { // Controls dimensions
        return fabric.util.transformPoint(this._getTransformedDimensions(),
            this.getViewportTransform(), true);
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

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;


    this.canvasId = 'canvas_' + this.nodeId + '_' + this.componentId;

    // get the component state from the scope
    var componentState = this.$scope.componentState;

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

    if (this.mode === 'student') {
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

      // get the latest annotations
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isNewLabelButtonVisible = false;
      this.isSnipImageButtonVisible = false;
      this.isDisabled = true;

      if (componentState != null) {
        // create a unique id for the application label element using this component state
        this.canvasId = 'labelCanvas_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          this.canvasId = 'labelCanvas_gradingRevision_' + componentState.id;
        }
      }

      // get the latest annotations
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'onlyShowWork') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isNewLabelButtonVisible = false;
      this.isSnipImageButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isNewLabelButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'authoring') {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

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

      if (this.componentContent.enableCircles == null) {
        /*
         * If this component was created before enableCircles was implemented,
         * we will default it to true in the authoring so that the
         * "Enable Dots" checkbox is checked.
         */
        this.authoringComponentContent.enableCircles = true;
      }

      this.updateAdvancedAuthoringView();

      $scope.$watch(function() {
        return this.authoringComponentContent;
      }.bind(this), function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);

        // the canvas width
        this.canvasWidth = 800;

        // the canvas height
        this.canvasHeight = 600;

        this.submitCounter = 0;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.enableCircles = this.componentContent.enableCircles;

        if (this.canvas != null) {

          // clear the parent to remove the canvas
          $('#canvasParent_' + this.canvasId).empty();

          // create a new canvas
          var canvas = $('<canvas/>');
          canvas.attr('id', this.canvasId);
          canvas.css('border', '1px solid black');

          // add the new canvas
          $('#canvasParent_' + this.canvasId).append(canvas);

          /*
           * clear the background so that setupCanvas() can
           * reapply the background
           */
          this.backgroundImage = null;

          // setup the new canvas
          this.setupCanvas();
        }

        if (this.componentContent.canCreateLabels != null) {
          this.canCreateLabels = this.componentContent.canCreateLabels;
        }

        if (this.canCreateLabels) {
          this.isNewLabelButtonVisible = true;
        } else {
          this.isNewLabelButtonVisible = false;
        }
      }.bind(this), true);
    }

    this.$timeout(angular.bind(this, function() {
      // wait for angular to completely render the html before we initialize the canvas

      this.setupCanvas();
    }));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function() {
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
    this.$scope.getComponentState = function(isSubmit) {
      var deferred = this.$q.defer();
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

    /**
     * The student has changed the file input
     * @param element the file input element
     */
    this.$scope.fileUploadChanged = function(element) {

      // get the current background image if any
      var backgroundImage = this.labelController.getBackgroundImage();

      var overwrite = true;

      if (backgroundImage != null && backgroundImage != '') {
        /*
         * there is an existing background image so we will ask the
         * student if they want to change it
         */
        var answer = confirm(this.labelController.$translate('label.areYouSureYouWantToChangeTheBackgroundImage'));

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
        var files = element.files;

        if (files != null && files.length > 0) {

          // upload the file to the studentuploads folder
          this.labelController.StudentAssetService.uploadAsset(files[0]).then((unreferencedAsset) => {

            // make a referenced copy of the unreferenced asset
            this.labelController.StudentAssetService.copyAssetForReference(unreferencedAsset).then((referencedAsset) => {

              if (referencedAsset != null) {
                // get the url of the referenced asset
                var imageURL = referencedAsset.url;

                if (imageURL != null && imageURL != '') {

                  // set the referenced asset as the background image
                  this.labelController.setBackgroundImage(imageURL);
                  this.labelController.studentDataChanged();
                }
              }
            });
          });
        }
      }
    }

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
              } else if (args.target == 'background') {
                // the target is the background image

                // set the background file name
                this.authoringComponentContent.backgroundImage = fileName;

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
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
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
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

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (args != null) {
        let componentId = args.componentId;
        if (this.componentId === componentId) {
          this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        }
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  setupCanvas() {
    // initialize the canvas
    var canvas = this.initializeCanvas();
    this.canvas = canvas;

    // get the component state from the scope
    var componentState = this.$scope.componentState;

    if (!this.disabled) {
      // create the key down listener to listen for the delete key
      this.createKeydownListener();
    }

    // set whether studentAttachment is enabled
    this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      } else if (this.LabelService.componentStateHasStudentWork(componentState, this.componentContent)) {
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
      } else if (this.LabelService.componentStateIsSameAsStarter(componentState, this.componentContent)) {
        // the student labels are the same as the starter labels
        this.setStudentWork(componentState);
      } else if (componentState == null) {
        /*
         * only import work if the student does not already have
         * work for this component
         */

        // check if we need to import work
        var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
        var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

        if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
          /*
           * check if the node id is in the field that we used to store
           * the import previous work node id in
           */
          importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
        }

        if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
          /*
           * check if the component id is in the field that we used to store
           * the import previous work component id in
           */
          importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
        }

        if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
          // import the work from the other component
          this.importWork();
        } else if (this.componentContent.labels != null) {
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
    var backgroundImage = this.getBackgroundImage();

    if (backgroundImage == null && this.componentContent.backgroundImage != null) {
      // get the background image from the component content if any
      this.setBackgroundImage(this.componentContent.backgroundImage);
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

    if (this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {

    if (componentState != null) {

      var studentData = componentState.studentData;

      if (studentData != null) {

        if (studentData.version == null) {
          this.setStudentDataVersion(1);
        } else {
          this.setStudentDataVersion(studentData.version);
        }

        // get the labels from the student data
        var labels = studentData.labels;

        // add the labels to the canvas
        this.addLabelsToCanvas(labels);

        // get the background image from the student data
        var backgroundImage = studentData.backgroundImage;

        if (backgroundImage != null) {
          this.setBackgroundImage(backgroundImage);
        }

        var submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        this.processLatestSubmit();
      }
    }
  };

  /**
   * Check if latest component state is a submission and set isSubmitDirty accordingly
   */
  processLatestSubmit() {
    let latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

    if (latestState) {
      let serverSaveTime = latestState.serverSaveTime;
      let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestState.isSubmit) {
        // latest state is a submission, so set isSubmitDirty to false and notify node
        this.isSubmitDirty = false;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
      } else {
        // latest state is not a submission, so set isSubmitDirty to true and notify node
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
      }
    }
  };

  /**
   * Add labels ot the canvas
   * @param labels an array of objects that contain the values for a label
   */
  addLabelsToCanvas(labels) {
    if (labels != null) {

      // loop through all the labels
      for (let x = 0; x < labels.length; x++) {

        // get a label
        var label = labels[x];

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
          var label = this.createLabel(pointX, pointY, textX, textY, text,
              color, canEdit, canDelete);

          // add the label to the canvas
          this.addLabelToCanvas(this.canvas, label);
        }
      }
    }
  };

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

    if (this.isSubmitDirty) {
      // the student has unsubmitted work

      var performSubmit = true;

      if (this.componentContent.maxSubmitCount != null) {
        // there is a max submit count

        // calculate the number of submits this student has left
        var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

        var message = '';

        if (numberOfSubmitsLeft <= 0) {
          // the student does not have any more chances to submit
          performSubmit = false;
        } else if (numberOfSubmitsLeft == 1) {
          /*
           * the student has one more chance to submit left so maybe
           * we should ask the student if they are sure they want to submit
           */
        } else if (numberOfSubmitsLeft > 1) {
          /*
           * the student has more than one chance to submit left so maybe
           * we should ask the student if they are sure they want to submit
           */
        }
      }

      if (performSubmit) {

        /*
         * set isSubmit to true so that when the component state is
         * created, it will know that is a submit component state
         * instead of just a save component state
         */
        this.isSubmit = true;
        this.incrementSubmitCounter();

        // check if the student has used up all of their submits
        if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
          /*
           * the student has used up all of their submits so we will
           * disable the submit button
           */
          this.isSubmitButtonDisabled = true;
        }

        if (this.mode === 'authoring') {
          /*
           * we are in authoring mode so we will set values appropriately
           * here because the 'componentSubmitTriggered' event won't
           * work in authoring mode
           */
          this.isDirty = false;
          this.isSubmitDirty = false;
          this.createComponentState('submit');
        }

        if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
          // tell the parent node that this component wants to submit
          this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
        } else if (submitTriggeredBy === 'nodeSubmitButton') {
          // nothing extra needs to be performed
        }
      } else {
        /*
         * the student has cancelled the submit so if a component state
         * is created, it will just be a regular save and not submit
         */
        this.isSubmit = false;
      }
    }
  }

  /**
   * Called when the student clicks on the new label button to enter
   * create label mode
   */
  newLabelButtonClicked() {
    this.createLabelMode = true;
    this.isCancelButtonVisible = true;
    this.editLabelMode = false;
    this.selectedLabel = null;
  };

  /**
   * Called when the student clicks on the cancel button to exit
   * create label mode
   */
  cancelButtonClicked() {
    this.createLabelMode = false;
    this.isCancelButtonVisible = false;
  };

  /**
   * Get the label data from the canvas.
   * @returns An array of simple JSON objects that contain the label data.
   */
  getLabelData() {
    var labels = [];

    /*
     * get all the circle objects from the canvas which each correspond to
     * a label point
     */
    var objects = this.canvas.getObjects('i-text');

    if (objects != null) {

      // loop through all the circle objects
      for (var x = 0; x < objects.length; x++) {

        /*
         * the object is a circle which contains all the data
         * for a label
         */
        var object = objects[x];

        if (object != null) {

          // get the simple JSON object that represents the label
          var labelJSONObject = this.getLabelJSONObjectFromText(object);

          if (labelJSONObject != null) {
            // add the object to our array of labels
            labels.push(labelJSONObject);
          }
        }
      }
    }

    return labels;
  };

  /**
   * Get the simple JSON object that represents the label
   * @param circle a Fabric circle object
   * @returns a simple JSON object that represents the label
   */
  getLabelJSONObjectFromCircle(circle) {
    var labelJSONObject = {};

    // get the label object that contains the circle, line, and text objects
    var label = this.getLabelFromCircle(circle);

    // get the line associated with the circle
    var lineObject = circle.line;

    // get the text object associated with the circle
    var textObject = circle.text;

    // get the position of the circle
    var pointX = circle.get('left');
    var pointY = circle.get('top');

    // get the position of the text object
    let textX = null;
    let textY = null;
    if (this.isStudentDataVersion(1)) {
      /*
       * get the offset of the end of the line (this is where the text object is
       * also located)
       */
      var xDiff = lineObject.x2 - lineObject.x1;
      var yDiff = lineObject.y2 - lineObject.y1;

      // the text x and y position is relative to the circle
      textX = xDiff;
      textY = yDiff;
    } else {
      // the text x and y position is absolute
      textX = textObject.left;
      textY = textObject.top;
    }

    // get the text and background color of the text
    var text = label.textString;
    var color = textObject.backgroundColor;

    // set all the values into the object
    labelJSONObject.pointX = parseInt(pointX);
    labelJSONObject.pointY = parseInt(pointY);
    labelJSONObject.textX = parseInt(textX);
    labelJSONObject.textY = parseInt(textY);
    labelJSONObject.text = text;
    labelJSONObject.color = color;

    return labelJSONObject;
  };

  /**
   * Get the simple JSON object that represents the label
   * @param text a Fabric text object
   * @returns a simple JSON object that represents the label
   */
  getLabelJSONObjectFromText(text) {
    let labelJSONObject = {};

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
  };

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
    studentData.version = this.getStudentDataVersion();
    studentData.labels = this.getLabelData();

    var backgroundImage = this.getBackgroundImage();
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
  };

  /**
   * Check whether we need to show the new label button
   * @returns whether to show the new label button
   */
  showNewLabelButton() {
    return this.isNewLabelButtonVisible;
  };

  /**
   * Check whether we need to show the cancel button
   * @returns whether to show the cancel button
   */
  showCancelButton() {
    return this.isCancelButtonVisible;
  };

  removeAttachment(attachment) {
    if (this.attachments.indexOf(attachment) != -1) {
      this.attachments.splice(this.attachments.indexOf(attachment), 1);
      this.studentDataChanged();
    }
  };

  attachStudentAsset(studentAsset) {
    if (studentAsset != null) {
      this.StudentAssetService.copyAssetForReference(studentAsset).then((copiedAsset) => {
        if (copiedAsset != null) {
          var attachment = {
            studentAssetId: copiedAsset.id,
            iconURL: copiedAsset.iconURL
          };

          this.attachments.push(attachment);
          this.studentDataChanged();
        }
      });
    }
  };

  /**
   * Import work from another component
   */
  importWork() {

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      // get the import previous work node id and component id
      var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
      var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

      if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

        /*
         * check if the node id is in the field that we used to store
         * the import previous work node id in
         */
        if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
          importPreviousWorkNodeId = componentContent.importWorkNodeId;
        }
      }

      if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

        /*
         * check if the component id is in the field that we used to store
         * the import previous work component id in
         */
        if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
          importPreviousWorkComponentId = componentContent.importWorkComponentId;
        }
      }

      if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

        // get the latest component state for this component
        var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

        /*
         * we will only import work into this component if the student
         * has not done any work for this component
         */
        if(componentState == null) {
          // the student has not done any work for this component

          // get the latest component state from the component we are importing from
          var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

          if (importWorkComponentState != null) {
            /*
             * populate a new component state with the work from the
             * imported component state
             */
            var populatedComponentState = this.LabelService.populateComponentState(importWorkComponentState);

            // populate the component state into this component
            this.setStudentWork(populatedComponentState);
            this.studentDataChanged();
          }
        }
      }
    }
  };

  /**
   * Initialize the canvas
   * @returns the canvas object
   */
  initializeCanvas() {

    var canvas = null;

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
    document.getElementById(this.canvasId).width = this.canvasWidth;
    document.getElementById(this.canvasId).height = this.canvasHeight;

    // set the height on the parent div so that a vertical scrollbar doesn't show up
    $('#canvasParent_' + this.canvasId).css('height', this.canvasHeight + 2);

    // listen for the mouse down event
    canvas.on('mouse:down', angular.bind(this, function(options) {

      // get the object that was clicked on if any
      var activeObject = this.canvas.getActiveObject();

      if (activeObject == null) {
        /*
         * no objects in the canvas were clicked. the user clicked
         * on a blank area of the canvas so we will unselect any label
         * that was selected and turn off edit label mode
         */
        this.selectedLabel = null;
        this.editLabelMode = false;
      }

      // check if the student is in create label mode
      if (this.createLabelMode) {
        /*
         * the student is in create label mode so we will create a new label
         * where they have clicked
         */

        // turn off create label mode and hide the cancel button
        this.createLabelMode = false;
        this.isCancelButtonVisible = false;

        var event = options.e;

        if (event != null) {
          // get the x and y position that the student clicked on
          var x = event.layerX;
          var y = event.layerY;

          /*
           * set the location of the text object to be down to the right
           * of the position the student clicked on
           */
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
              textX = x + 100;
              textY = y + 100;
            }
          } else {
            // circles are not enabled so we are only using the text
            textX = x;
            textY = y;
          }

          let canEdit = true;
          let canDelete = true;

          // create a new label
          var newLabel = this.createLabel(x, y, textX, textY,
              this.$translate('label.aNewLabel'), 'blue', canEdit, canDelete);

          // add the label to the canvas
          this.addLabelToCanvas(this.canvas, newLabel);

          /*
           * make the new label selected so that the student can edit
           * the text
           */
          this.selectLabel(newLabel);
          this.studentDataChanged();
        }
      }
    }));

    // listen for the object moving event
    canvas.on('object:moving', angular.bind(this, function(options) {
      var target = options.target;

      if (target != null) {

        // get the type of the object that is moving
        var type = target.get('type');

        // get the position of the element
        var left = target.get('left');
        var top = target.get('top');

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
          var line = target.line;

          var xDiff = 0;
          var yDiff = 0;

          if (line != null) {
            // calculate the relative offset of the end of the line
            xDiff = line.x2 - line.x1;
            yDiff = line.y2 - line.y1;

            if (this.isStudentDataVersion(1)) {
              // set the new position of the two endpoints of the line
              line.set({x1: left, y1: top, x2: left + xDiff, y2: top + yDiff});
            } else {
              // set the new position of the circle endpoint of the line
              line.set({x1: left, y1: top});
            }

            // remove and add the line to refresh the element in the canvas
            canvas.remove(line);
            canvas.add(line);

            // set the z index so it will be below the circle and text elements
            canvas.moveTo(line, this.lineZIndex);
          }

          // get the text element
          var text = target.text;

          if (text != null) {
            if (this.isStudentDataVersion(1)) {
              /*
               * In the old student data version the text position is relative
               * to the circle so we need to move the text along with the circle.
               */

              // set the new position of the text element
              text.set({left: left + xDiff, top: top + yDiff});

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
            var line = target.line;
            if (line != null) {
              // set the new position of the text element
              line.set({x2: left, y2: top});

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
            circle.set({left: left, top: top});
            line.set({x1: left, y1: top, x2: left, y2: top});
          }
        }

        // refresh the canvas
        canvas.renderAll();
        this.studentDataChanged();
      }
    }));

    // listen for the text changed event
    canvas.on('text:changed', angular.bind(this, function(options) {
      var target = options.target;
      if (target != null) {
        var type = target.get('type');
        if (type === 'i-text') {
          this.studentDataChanged();
        }
      }
    }));

    return canvas;
  };

  /**
   * Set the background image
   * @param backgroundImagePath the url path to an image
   */
  setBackgroundImage(backgroundImagePath) {
    if (backgroundImagePath != null) {
      this.backgroundImage = backgroundImagePath;
      this.canvas.setBackgroundImage(backgroundImagePath, this.canvas.renderAll.bind(this.canvas));
    }
  };

  /**
   * Get the background image
   * @returns the background image path
   */
  getBackgroundImage() {
    return this.backgroundImage;
  };

  /**
   * Create the keydown listener that we will use for deleting labels
   */
  createKeydownListener() {
    window.addEventListener('keydown', angular.bind(this, this.keyPressed), false);
  };

  /**
   * The callback handler for the keydown event
   * @param e the event
   */
  keyPressed(e) {

    // get the key code of the key that was pressed
    var keyCode = e.keyCode;
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
  };

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
    let label = {};

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
    if (this.componentContent.pointSize != null &&
        this.componentContent.pointSize != '') {
      radius = parseFloat(this.componentContent.pointSize);
    }

    let fontSize = 20;
    if (this.componentContent.fontSize != null &&
        this.componentContent.fontSize != '') {
      fontSize = parseFloat(this.componentContent.fontSize);
    }

    // create a circle element
    var circle = new fabric.Circle({
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
    var line = new fabric.Line([x1, y1, x2, y2], {
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
    var text = new fabric.IText(wrappedTextString, {
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
  };

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
      var circle = label.circle;
      var line = label.line;
      var text = label.text;

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
  };

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

      // show the label text input
      this.editLabelMode = true;

      /*
       * Give focus to the label text input element so the student can immediately
       * start typing.
       */
      this.$timeout(() => {
        /*
         * Get the y position of the top of the edit label text input. If this
         * value is negative, it means the element is above the currently
         * viewable area and can not be seen. If the value is positive, it means
         * the element is currently in the viewable area and can be seen.
         */
        var editLabelTextInputTop = $('#editLabelTextInput').offset().top;

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
          angular.element('#editLabelTextInput').focus();
        }
      });
    } else {
      // hide label text input
      this.editLabelMode = false;
    }

    /*
     * force angular to refresh, otherwise angular will wait until the
     * user generates another input (such as moving the mouse) before
     * refreshing
     */
    this.$scope.$apply();
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
    if (this.componentContent.labelWidth != null &&
        this.componentContent.labelWidth != '') {
      wrappedText = this.UtilService.wordWrap(textString, this.componentContent.labelWidth);
    }

    // set the wrapped text into the text object
    textObject.setText(wrappedText);
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
      var circle = label.circle;
      var line = label.line;
      var text = label.text;

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
      var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

      // set the new authoring component content
      this.authoringComponentContent = authoringComponentContent;

      // set the component content
      this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

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
   * Add a label in the authoring view
   */
  authoringAddLabelClicked() {

    // create the new label
    var newLabel = {};
    newLabel.text = this.$translate('label.enterTextHere');
    newLabel.color = 'blue';
    newLabel.pointX = 100;
    newLabel.pointY = 100;
    newLabel.textX = 200;
    newLabel.textY = 200;
    newLabel.canEdit = false;
    newLabel.canDelete = false;

    // add the label to the array of labels
    this.authoringComponentContent.labels.push(newLabel);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a label in the authoring view
   * @param index the index of the label in the labels array
   */
  authoringDeleteLabelClicked(index, label) {

    // get the label text
    var selectedLabelText = label.textString;

    // ask the author if they are sure they want to delete this label
    var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteThisLabel', { selectedLabelText: selectedLabelText }));

    if (answer) {
      // the author answered yes to delete the label

      // delete the label from the array
      this.authoringComponentContent.labels.splice(index, 1);

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObject() {
    var pngFile = null;

    if (this.canvas != null) {

      // get the image as a base64 string
      var img_b64 = this.canvas.toDataURL('image/png');

      // get the image object
      pngFile = this.UtilService.getImageObjectFromBase64String(img_b64);
    }

    return pngFile;
  }

  /**
   * Check whether we need to show the snip image button
   * @return whether to show the snip image button
   */
  showSnipImageButton() {
    if (this.NotebookService.isNotebookEnabled() && this.isSnipImageButtonVisible) {
      return true;
    } else {
      return false;
    }
  }

  /**
   * Snip the labels by converting it to an image
   * @param $event the click event
   */
  snipImage($event) {

    // get the canvas element
    var canvas = angular.element('#' + this.canvasId);

    if (canvas != null && canvas.length > 0) {

      // get the top canvas
      canvas = canvas[0];

      // get the canvas as a base64 string
      var img_b64 = canvas.toDataURL('image/png');

      // get the image object
      var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);

      // create a notebook item with the image populated into it
      this.NotebookService.addNote($event, imageObject);
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
      var selectedLabelText = this.selectedLabelText;

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
      var selectedLabelText = this.selectedLabel.textString;

      // confirm with the student that they want to delete the label
      var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteThisLabel', { selectedLabelText: selectedLabelText }));

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
   * Show the asset popup to allow the author to choose the background image
   */
  chooseBackgroundImage() {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'background';

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
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

  /**
   * Set the show submit button value
   * @param show whether to show the submit button
   */
  setShowSubmitButtonValue(show) {

    if (show == null || show == false) {
      // we are hiding the submit button
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      // we are showing the submit button
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }

    /*
     * notify the parent node that this component is changing its
     * showSubmitButton value so that it can show save buttons on the
     * step or sibling components accordingly
     */
    this.$scope.$emit('componentShowSubmitButtonValueChanged', {nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show});
  }

  /**
   * The showSubmitButton value has changed
   */
  showSubmitButtonValueChanged() {

    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Save the starter labels from the component authoring preview
   */
  saveStarterLabels() {

    // ask the author if they are sure they want to save the starter labels
    var answer = confirm(this.$translate('label.areYouSureYouWantToSaveTheStarterLabels'));

    if (answer) {
      // the author answered yes to save the starter labels

      // get the labels in the component authoring preview
      var labels = this.getLabelData();

      /*
       * make a copy of the labels so we don't run into any referencing issues
       * later
       */
      var starterLabels = this.UtilService.makeCopyOfJSONObject(labels);

      // sort the labels alphabetically by their text
      starterLabels.sort(this.labelTextComparator);

      // set the labels
      this.authoringComponentContent.labels = starterLabels;

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * A comparator used to sort labels alphabetically
   * It should be used like labels.sort(this.labelTextComparator);
   * @param labelA a label object
   * @param labelB a label object
   * @return -1 if labelA comes before labelB
   * 1 if labelB comes after labelB
   * 0 of the labels are equal
   */
  labelTextComparator(labelA, labelB) {

    if (labelA.text < labelB.text) {
      // the labelA text comes before the labelB text alphabetically
      return -1;
    } else if (labelA.text > labelB.text) {
      // the labelA text comes after the labelB text alphabetically
      return 1;
    } else {
      /*
       * the labelA text is the same as the labelB text so we will
       * try to break the tie by looking at the color
       */

      if (labelA.color < labelB.color) {
        // the labelA color text comes before the labelB color text alphabetically
        return -1;
      } else if (labelA.color > labelB.color) {
        // the labelA color text comes after the labelB color text alphabetically
        return 1;
      } else {
        /*
         * the labelA color text is the same as the labelB color text so
         * we will try to break the tie by looking at the pointX
         */

        if (labelA.pointX < labelB.pointX) {
          // the labelA pointX is smaller than the labelB pointX
          return -1;
        } else if (labelA.pointX > labelB.pointX) {
          // the labelA pointX is larger than the labelB pointX
          return 1;
        } else {
          /*
           * the labelA pointX is the same as the labelB pointX so
           * we will try to break the tie by looking at the pointY
           */

          if (labelA.pointY < labelB.pointY) {
            // the labelA pointY is smaller than the labelB pointY
            return -1;
          } else if (labelA.pointY > labelB.pointY) {
            // the labelA pointY is larger than the labelB pointY
            return 1;
          } else {
            /*
             * all the label values are the same between labelA
             * and labelB
             */
            return 0;
          }
        }
      }
    }
  }

  /**
   * Delete all the starter labels
   */
  deleteStarterLabels() {

    /*
     * ask the author if they are sure they want to delete all the starter
     * labels
     */
    var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteAllTheStarterLabels'));

    if (answer) {
      // the author answered yes to delete

      // clear the labels array
      this.authoringComponentContent.labels = [];

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Open a webpage in a new tab that shows a lot of the javascript colors
   */
  openColorViewer() {

    // open the webpage in a new tab
    this.$window.open('http://www.javascripter.net/faq/colornam.htm');
  }

  /**
   * Add a tag
   */
  addTag() {

    if (this.authoringComponentContent.tags == null) {
      // initialize the tags array
      this.authoringComponentContent.tags = [];
    }

    // add a tag
    this.authoringComponentContent.tags.push('');

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag up
   * @param index the index of the tag to move up
   */
  moveTagUp(index) {

    if (index > 0) {
      // the index is not at the top so we can move it up

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);

      // insert the tag one index back
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag down
   * @param index the index of the tag to move down
   */
  moveTagDown(index) {

    if (index < this.authoringComponentContent.tags.length - 1) {
      // the index is not at the bottom so we can move it down

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);

      // insert the tag one index forward
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a tag
   * @param index the index of the tag to delete
   */
  deleteTag(index) {

    // ask the author if they are sure they want to delete the tag
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

    if (answer) {
      // the author answered yes to delete the tag

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  handleConnectedComponentsPostProcess() {
    if (this.componentContent.backgroundImage != null &&
        this.componentContent.backgroundImage != '') {
      this.setBackgroundImage(this.componentContent.backgroundImage);
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {

    let mergedComponentState = this.NodeService.createNewComponentState();

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
                this.LabelService.createImageFromText(response, null, null,
                    charactersPerLine, null, spaceInbetweenLines, fontSize).then((image) => {
                  // set the image as the background
                  this.setBackgroundImage(image);

                  // make the work dirty so that it gets saved
                  this.studentDataChanged();
                });
              }
            }
          } else if (componentState.componentType == 'ConceptMap' ||
              componentState.componentType == 'Draw' ||
              componentState.componentType == 'Embedded' ||
              componentState.componentType == 'Graph' ||
              componentState.componentType == 'Table') {
            let connectedComponent =
              this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
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
      if (componentState.nodeId == connectedComponent.nodeId &&
          componentState.componentId == connectedComponent.componentId) {
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
    this.UtilService.generateImageFromComponentState(componentState).then((image) => {
      this.setBackgroundImage(image.url);
    });
  }

  /**
   * Add a connected component
   */
  authoringAddConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.type = null;
    this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

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
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    if (connectedComponent != null) {
      let components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        let numberOfAllowedComponents = 0;
        let allowedComponent = null;
        for (let component of components) {
          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) &&
                component.id != this.componentId) {
              // we have found a viable component we can connect to
              numberOfAllowedComponents += 1;
              allowedComponent = component;
            }
          }
        }

        if (numberOfAllowedComponents == 1) {
          /*
           * there is only one viable component to connect to so we
           * will use it
           */
          connectedComponent.componentId = allowedComponent.id;
          connectedComponent.type = 'importWork';
          this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
        }
      }
    }
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {

    // ask the author if they are sure they want to delete the connected component
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

    if (answer) {
      // the author answered yes to delete

      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the connected component type
   * @param connectedComponent get the component type of this connected component
   * @return the connected component type
   */
  authoringGetConnectedComponentType(connectedComponent) {

    var connectedComponentType = null;

    if (connectedComponent != null) {

      // get the node id and component id of the connected component
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;

      // get the component
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
        // get the component type
        connectedComponentType = component.type;
      }
    }

    return connectedComponentType;
  }

  /**
   * The connected component node id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentNodeIdChanged(connectedComponent) {
    if (connectedComponent != null) {
      connectedComponent.componentId = null;
      connectedComponent.type = null;
      delete connectedComponent.importWorkAsBackground;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

    if (connectedComponent != null) {

      // default the type to import work
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * If the component type is a certain type, we will set the importWorkAsBackground
   * field to true.
   * @param connectedComponent The connected component object.
   */
  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    let componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (componentType == 'ConceptMap' ||
        componentType == 'Draw' ||
        componentType == 'Embedded' ||
        componentType == 'Graph' ||
        componentType == 'Table') {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

    if (connectedComponent != null) {

      if (connectedComponent.type == 'importWork') {
        /*
         * the type has changed to import work
         */
      } else if (connectedComponent.type == 'showWork') {
        /*
         * the type has changed to show work
         */
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Check if we are allowed to connect to this component type
   * @param componentType the component type
   * @return whether we can connect to the component type
   */
  isConnectedComponentTypeAllowed(componentType) {

    if (componentType != null) {

      let allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

      // loop through the allowed connected component types
      for (let a = 0; a < allowedConnectedComponentTypes.length; a++) {
        let allowedConnectedComponentType = allowedConnectedComponentTypes[a];

        if (allowedConnectedComponentType != null) {
          if (componentType == allowedConnectedComponentType.type) {
            // the component type is allowed
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * The show JSON button was clicked to show or hide the JSON authoring
   */
  showJSONButtonClicked() {
    // toggle the JSON authoring textarea
    this.showJSONAuthoring = !this.showJSONAuthoring;

    if (this.jsonStringChanged && !this.showJSONAuthoring) {
      /*
       * the author has changed the JSON and has just closed the JSON
       * authoring view so we will save the component
       */
      this.advancedAuthoringViewComponentChanged();

      // scroll to the top of the component
      this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

      this.jsonStringChanged = false;
    }
  }

  /**
   * The author has changed the JSON manually in the advanced view
   */
  authoringJSONChanged() {
    this.jsonStringChanged = true;
  }

  /**
   * The student clicked the reset button so we will delete all the labels and
   * reset the background if applicable.
   */
  resetButtonClicked() {
    // confirm with the student that they want to delete the label
    var answer = confirm(this.$translate('label.areYouSureYouWantToReset'));

    if (answer) {
      let tempLabels = [];
      for (let label of this.labels) {
        tempLabels.push(label);
      }

      for (let tempLabel of tempLabels) {
        this.deleteLabel(tempLabel);
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
   * The "Import Work As Background" checkbox was clicked.
   * @param connectedComponent The connected component associated with the
   * checkbox.
   */
  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (connectedComponent.importWorkAsBackground) {
      // the checkbox is checked
      connectedComponent.charactersPerLine = 100;
      connectedComponent.spaceInbetweenLines = 40;
      connectedComponent.fontSize = 16;
    } else {
      // the checkbox is not checked
      delete connectedComponent.charactersPerLine;
      delete connectedComponent.spaceInbetweenLines;
      delete connectedComponent.fontSize;
      delete connectedComponent.importWorkAsBackground;
    }

    this.authoringViewComponentChanged();
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
      if (connectedComponents.length > 0 &&
          connectedComponents.length == showWorkConnectedComponentCount) {
        return true;
      }
    }
    return false;
  }
}

LabelController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  '$window',
  'AnnotationService',
  'ConfigService',
  'LabelService',
  'NodeService',
  'NotebookService',
  'OpenResponseService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default LabelController;

'use strict';

import ComponentController from "../componentController";

class MatchController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $mdMedia,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      dragulaService,
      MatchService,
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
    this.$q = $q;
    this.dragulaService = dragulaService;
    this.MatchService = MatchService;
    this.$mdMedia = $mdMedia;
    this.autoScroll = require('dom-autoscroller');

    // the choices
    this.choices = [];

    // the buckets
    this.buckets = [];

    // whether the student has correctly placed the choices
    this.isCorrect = null;

    // the flex (%) width for displaying the buckets
    this.bucketWidth = 100;

    // the number of columns for displaying the choices
    this.choiceColumns = 1;

    // whether to orient the choices and buckets side-by-side
    this.horizontal = false;

    // css style for the choice items
    this.choiceStyle = '';

    // css style for the buckets
    this.bucketStyle = '';

    // the latest annotations
    this.latestAnnotations = null;

    // the id for the source bucket
    this.sourceBucketId = '0';

    // whether this component has been authored with a correct answer
    this.hasCorrectAnswer = false;

    // whether the latest component state was a submit
    this.isLatestComponentStateSubmit = false;

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
      {
        type: 'Match'
      }
    ];

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;


    this.horizontal = this.componentContent.horizontal;

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      // get the latest annotations
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;

      if (this.mode === 'grading') {
        // get the latest annotations
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      }
    } else if (this.mode === 'onlyShowWork') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
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

      this.updateAdvancedAuthoringView();

      $scope.$watch(function() {
        return this.authoringComponentContent;
      }.bind(this), function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);

        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

        this.isCorrect = null;
        this.submitCounter = 0;
        this.isDisabled = false;
        this.isSubmitButtonDisabled = false;

        /*
         * initialize the choices and buckets with the values from the
         * component content
         */
        this.initializeChoices();
        this.initializeBuckets();
      }.bind(this), true);
    }

    // check if there is a correct answer
    this.hasCorrectAnswer = this.hasCorrectChoices();

    /*
     * initialize the choices and buckets with the values from the
     * component content
     */
    this.initializeChoices();
    this.initializeBuckets();

    // get the component state from the scope
    var componentState = this.$scope.componentState;

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      }  else if (this.MatchService.componentStateHasStudentWork(componentState, this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      } else if (componentState == null) {
        // check if we need to import work

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
        }
      }
    } else {
      // populate the student work into this component
      this.setStudentWork(componentState);
    }

    if (componentState != null && componentState.isSubmit) {
      /*
       * the latest component state is a submit. this is used to
       * determine if we should show the feedback.
       */
      this.isLatestComponentStateSubmit = true;
    }

    // check if the student has used up all of their submits
    if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      this.isDisabled = true;
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();

    if (this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

    let dragId = 'match_' + this.componentId;
    // handle choice drop events
    let dropEvent = dragId + '.drop-model';
    this.$scope.$on(dropEvent, (e, el, container, source) => {
      // choice item has been dropped in new location, so run studentDataChanged function
      this.$scope.matchController.studentDataChanged();
    });

    // drag and drop options
    this.dragulaService.options(this.$scope, dragId, {
      moves: (el, source, handle, sibling) => {
        return !this.$scope.matchController.isDisabled;
      }
    });

    // provide visual indicator when choice is dragged over a new bucket
    let drake = dragulaService.find(this.$scope, dragId).drake;
    drake.on('over', (el, container, source) => {
      if (source !== container) {
        container.className += ' match-bucket__contents--over';
      }
    }).on('out', (el, container, source) => {
      if (source !== container) {
        container.className = container.className.replace('match-bucket__contents--over', '');;
      }
    });

    // support scroll while dragging
    let scroll = this.autoScroll(
      [document.querySelector('#content')], {
      margin: 30,
      pixels: 50,
      scrollWhenOutside: true,
      autoScroll: function() {
        // Only scroll when the pointer is down, and there is a child being dragged
        return this.down && drake.dragging;
      }
    });

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
        if (this.$scope.matchController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.matchController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.matchController.createComponentState(action).then((componentState) => {
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
     * The parent node submit button was clicked
     */
    this.$scope.$on('nodeSubmitClicked', angular.bind(this, function(event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (this.nodeId === nodeId) {

        // trigger the submit
        var submitTriggeredBy = 'nodeSubmitButton';
        this.submit(submitTriggeredBy);
      }
    }));

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    this.$scope.$on('studentWorkSavedToServer', angular.bind(this, function(event, args) {

      let componentState = args.studentWork;

      // check that the component state is for this component
      if (componentState && this.nodeId === componentState.nodeId
        && this.componentId === componentState.componentId) {

        // set isDirty to false because the component state was just saved
        this.isDirty = false;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});

        // set saveFailed to false because the save was successful
        this.saveFailed = false;

        let isAutoSave = componentState.isAutoSave;
        let isSubmit = componentState.isSubmit;
        let serverSaveTime = componentState.serverSaveTime;
        let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

        // set save message
        if (isSubmit) {
          this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

          this.lockIfNecessary();

          // set isSubmitDirty to false because the component state was just submitted and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        } else if (isAutoSave) {
          this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
        }
      }
    }));

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    this.$scope.$on('annotationSavedToServer', (event, args) => {

      if (args != null ) {

        // get the annotation that was saved to the server
        var annotation = args.annotation;

        if (annotation != null) {

          // get the node id and component id of the annotation
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;

          // make sure the annotation was for this component
          if (this.nodeId === annotationNodeId &&
            this.componentId === annotationComponentId) {

            // get latest score and comment annotations for this component
            this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
      // do nothing
    }));

    this.$scope.$watch(function() { return $mdMedia('gt-sm'); }, function(md) {
      $scope.mdScreen = md;
    });

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

              if (args.target == 'prompt' || args.target == 'rubric') {

                var summernoteId = '';

                if (args.target == 'prompt') {
                  // the target is the summernote prompt element
                  summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
                } else if (args.target == 'rubric') {
                  // the target is the summernote rubric element
                  summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
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
              } else if (args.target == 'choice') {
                // the target is a choice

                /*
                 * get the target object which should be a
                 * choice object
                 */
                var targetObject = args.targetObject;

                if (targetObject != null) {

                  // create the img html
                  var text = '<img src="' + fileName + '"/>';

                  // set the html into the choice text
                  targetObject.value = text;

                  // save the component
                  this.authoringViewComponentChanged();
                }
              } else if (args.target == 'bucket') {
                // the target is a bucket

                /*
                 * get the target object which should be a
                 * choice object
                 */
                var targetObject = args.targetObject;

                if (targetObject != null) {

                  // create the img html
                  var text = '<img src="' + fileName + '"/>';

                  // set the html into the choice text
                  targetObject.value = text;

                  // save the component
                  this.authoringViewComponentChanged();
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

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {
    if (componentState != null) {

      // get the student data from the component state
      let studentData = componentState.studentData;

      if (studentData != null) {

        // get the buckets and number of submits
        let componentStateBuckets = studentData.buckets;

        // set the buckets
        if (componentStateBuckets != null) {

          // clear the choices bucket
          let choicesBucket = this.getBucketById(this.sourceBucketId);
          choicesBucket.items = [];

          let bucketIds = this.buckets.map(b => { return b.id; });
          let choiceIds = this.choices.map(c => { return c.id; });

          for (let i = 0, l = componentStateBuckets.length; i < l; i++) {
            let componentStateBucketId = componentStateBuckets[i].id;
            // componentState bucket is a valid bucket, so process choices
            if (bucketIds.indexOf(componentStateBucketId) > -1) {
              let currentBucket = componentStateBuckets[i];
              let currentChoices = currentBucket.items;

              for (let x = 0, len = currentChoices.length; x < len; x++) {
                let currentChoice = currentChoices[x];
                let currentChoiceId = currentChoice.id;
                let currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
                if (currentChoiceLocation > -1) {
                  // choice is valid and used by student in a valid bucket, so add it to that bucket
                  let bucket = this.getBucketById(componentStateBucketId);
                  // content for choice with this id may have change, so get updated content
                  let updatedChoice = this.getChoiceById(currentChoiceId);
                  bucket.items.push(updatedChoice);
                  choiceIds.splice(currentChoiceLocation, 1);
                }
              }
            }
          }

          // add unused choices to the source bucket
          for (let i = 0, l = choiceIds.length; i < l; i++) {
            choicesBucket.items.push(this.getChoiceById(choiceIds[i]));
          }
        }

        var submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        if (this.submitCounter > 0) {
          // the student has submitted at least once in the past

          if (componentState.isSubmit) {
            /*
             * the component state was a submit so we will check the
             * answer
             */
            this.checkAnswer()
          } else {
            /*
             * The component state was not a submit but the student
             * submitted some time in the past. We want to show the
             * feedback for choices that have not moved since the
             * student submitted.
             */
            this.processLatestSubmit(true);
          }
        } else {
          /*
           * there was no submit in the past but we will still need to
           * check if submit is dirty.
           */
          this.processLatestSubmit(true);
        }
      }
    }
  };

  /**
   * Get the latest submitted componentState and display feedback for choices
   * that haven't changed since. This will also determine if submit is dirty.
   * @param onload boolean whether this function is being executed on the
   * initial component load or not
   */
  processLatestSubmit(onload) {
    let componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    let numStates = componentStates.length
    let latestSubmitState = null;

    for (let l = numStates-1; l > -1; l--) {
      let componentState = componentStates[l];
      if (componentState.isSubmit) {
        latestSubmitState = componentState;
        break;
      }
    }

    if (latestSubmitState && latestSubmitState.studentData) {
      let latestBucketIds = this.buckets.map(b => { return b.id; });
      let latestChoiceIds = this.choices.map(c => { return c.id; });
      let excludeIds = [];
      let latestSubmitStateBuckets = latestSubmitState.studentData.buckets;

      // loop through all the buckets in the latest student data
      for (let b = 0; b < this.buckets.length; b++) {

        // get a bucket from the latest student data
        let latestBucket = this.buckets[b];

        if (latestBucket != null) {
          let latestBucketId = latestBucket.id;

          // get the same bucket in the previously submitted student data
          let submitBucket = this.getBucketById(latestBucketId, latestSubmitStateBuckets);

          if (submitBucket != null) {
            // get the choice ids in the bucket in the latest student data
            let latestBucketChoiceIds = latestBucket.items.map(c => { return c.id; });

            // get the choice ids in the bucket in the previously submitted student data
            let submitChoiceIds = submitBucket.items.map(c => { return c.id; });

            // loop through all the choice ids in the bucket in the latest student data
            for (let c = 0; c < latestBucketChoiceIds.length; c++) {
              let latestBucketChoiceId = latestBucketChoiceIds[c];

              if (submitChoiceIds.indexOf(latestBucketChoiceId) == -1) {
                /*
                 * the choice in the latest state is not in the same
                 * bucket as it was in the last submit so we will
                 * not show the feedback for this choice by adding
                 * it to the excluded choice ids
                 */
                excludeIds.push(latestBucketChoiceId);
              } else {
                /*
                 * the choice is in the same bucket as it was in
                 * the last submit
                 */

                 if (this.choiceHasCorrectPosition(latestBucketChoiceId)) {
                   /*
                    * the choice has a correct position so we will check if
                    * the position is the same in the submit vs the latest
                    */
                   if (c != submitChoiceIds.indexOf(latestBucketChoiceId)) {
                     // the position has changed so we will not show the feedback
                     excludeIds.push(latestBucketChoiceId);
                   }
                 }
              }
            }
          }
        }
      }

      if (excludeIds.length) {
        // state has changed since last submit, so set isSubmitDirty to true and notify node
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
      } else {
        // state has not changed since last submit, so set isSubmitDirty to false and notify node
        this.isSubmitDirty = false;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
      }
      this.checkAnswer(excludeIds);
    } else {
      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
    }

    if (onload && numStates) {
      let latestState = componentStates[numStates-1];

      if (latestState) {
        let serverSaveTime = latestState.serverSaveTime;
        let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          // set whether the latest component state is correct
          this.isCorrect = latestState.isCorrect;
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          /*
           * the latest component state was not a submit so we will
           * not show whether it was correct or incorrect
           */
          this.isCorrect = null;
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  };

  /**
   * Initialize the available choices from the component content
   */
  initializeChoices() {

    this.choices = [];

    if(this.componentContent != null && this.componentContent.choices != null) {
      this.choices = this.componentContent.choices;
    }
  };

  /**
   * Get the choices
   */
  getChoices() {
    return this.choices;
  };

  /**
   * Initialize the available buckets from the component content
   */
  initializeBuckets() {

    this.buckets = [];

    if (this.componentContent != null && this.componentContent.buckets != null) {

      // get the buckets from the component content
      let buckets = this.componentContent.buckets;

      if (this.horizontal) {
        this.bucketWidth = 100;
        this.choiceColumns = 1;
      } else {
        if (typeof this.componentContent.bucketWidth === 'number') {
          this.bucketWidth = this.componentContent.bucketWidth;
          this.choiceColumns = Math.round(100/this.componentContent.bucketWidth);
        } else {
          let n = buckets.length;
          if (n % 3 === 0 || n > 4) {
            this.bucketWidth = Math.round(100/3);
            this.choiceColumns = 3;
          } else if (n % 2 === 0) {
            this.bucketWidth = 100/2;
            this.choiceColumns = 2;
          }
        }

        if (typeof this.componentContent.choiceColumns === 'number') {
          this.choiceColumns = this.componentContent.choiceColumns;
        }

        this.choiceStyle = {
          '-moz-column-count': this.choiceColumns,
          '-webkit-column-count': this.choiceColumns,
          'column-count':this.choiceColumns
        };

        if (this.bucketWidth === 100) {
          this.bucketStyle = this.choiceStyle;
        }
      }

      /*
       * create a bucket that will contain the choices when
       * the student first starts working
       */
      let originBucket = {};
      originBucket.id = this.sourceBucketId;
      originBucket.value = this.componentContent.choicesLabel ? this.componentContent.choicesLabel : this.$translate('match.choices');
      originBucket.type = 'bucket';
      originBucket.items = [];

      let choices = this.getChoices();

      // add all the choices to the origin bucket
      for (let c = 0; c < choices.length; c++) {
        let choice = choices[c];

        originBucket.items.push(choice);
      }

      // add the origin bucket to our array of buckets
      this.buckets.push(originBucket);

      // add all the other buckets to our array of buckets
      for (let b = 0; b < buckets.length; b++) {
        let bucket = buckets[b];

        bucket.items = [];

        this.buckets.push(bucket);
      }
    }
  };

  /**
   * Get the buckets
   */
  getBuckets() {
    return this.buckets;
  };

  /**
   * Create a copy of the buckets for cases when we want to make
   * sure we don't accidentally change a bucket and have it also
   * change previous versions of the buckets.
   * @return a copy of the buckets
   */
  getCopyOfBuckets() {
    var buckets = this.getBuckets();

    // get a JSON string representation of the buckets
    var bucketsJSONString = angular.toJson(buckets);

    // turn the JSON string back into a JSON array
    var copyOfBuckets = angular.fromJson(bucketsJSONString);

    return copyOfBuckets;
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
         * created, it will know it is a submit component state
         * instead of just a save component state
         */
        this.isSubmit = true;

        // clear the isCorrect value because it will be evaluated again later
        this.isCorrect = null;
        this.incrementSubmitCounter();

        // check if the student has used up all of their submits
        if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
          /*
           * the student has used up all of their submits so we will
           * disable the submit button
           */
          this.isDisabled = true;
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
   * Check if the student has answered correctly
   * @param ids array of choice ids to exclude
   */
  checkAnswer(ids) {
    let isCorrect = true;

    // get the buckets
    let buckets = this.getBuckets();
    let excludeIds = ids ? ids : [];

    if (buckets != null) {

      // loop through all the buckets
      for(let b = 0, l = buckets.length; b < l; b++) {

        // get a bucket
        let bucket = buckets[b];

        if (bucket != null) {
          let bucketId = bucket.id;
          let items = bucket.items;

          if (items != null) {

            // loop through all the items in the bucket
            for (let i = 0, len = items.length; i < len; i++) {
              let item = items[i];
              let position = i + 1;

              if (item != null) {
                let choiceId = item.id;

                // check if the choice has a correct bucket it should be in
                let choiceIdHasCorrectBucket = this.choiceHasCorrectBucket(choiceId);

                // get the feedback object for the bucket and choice
                let feedbackObject = this.getFeedbackObject(bucketId, choiceId);

                if (feedbackObject != null) {
                  let feedback = feedbackObject.feedback;

                  let feedbackPosition = feedbackObject.position;
                  let feedbackIsCorrect = feedbackObject.isCorrect;

                  if (this.hasCorrectAnswer) {

                    if (!choiceIdHasCorrectBucket) {
                      /*
                       * the component has a correct answer but there
                       * is no correct bucket for the current choice
                       */

                      if (bucketId == this.sourceBucketId) {
                        /*
                         * the choice is in the source bucket and
                         * the choice does not have a correct bucket
                         * so we will mark the choice as correct
                         */
                        feedbackIsCorrect = true;
                      }
                    }
                  }

                  if (feedback == null || feedback == '') {
                    // there is no authored feedback

                    if (this.hasCorrectAnswer) {
                      /*
                       * there is a correct answer for the component
                       * so we will show default feedback
                       */
                      if (feedbackIsCorrect) {
                        feedback = this.$translate('CORRECT');
                      } else {
                        feedback = this.$translate('INCORRECT');
                      }
                    }
                  }

                  if (!this.componentContent.ordered || feedbackPosition == null) {
                    /*
                     * position does not matter and the choice may be
                     * in the correct or incorrect bucket
                     */

                    // set the feedback into the item
                    item.feedback = feedback;

                    // set whether the choice is in the correct bucket
                    item.isCorrect = feedbackIsCorrect;

                    /*
                     * there is no feedback position in the feeback object so
                     * position doesn't matter
                     */
                    item.isIncorrectPosition = false;

                    // update whether the student has answered the step correctly
                    isCorrect = isCorrect && feedbackIsCorrect;
                  } else {
                    /*
                     * position does matter and the choice is in a correct
                     * bucket. we know this because a feedback object will
                     * only have a non-null position value if the choice is
                     * in the correct bucket. if the feedback object is for
                     * a choice that is in an incorrect bucket, the position
                     * value will be null.
                     */

                    if (position === feedbackPosition) {
                      // the item is in the correct position

                      // set the feedback into the item
                      item.feedback = feedback;

                      // set whether the choice is in the correct bucket
                      item.isCorrect = feedbackIsCorrect;

                      // the choice is in the correct position
                      item.isIncorrectPosition = false;

                      // update whether the student has answered the step correctly
                      isCorrect = isCorrect && feedbackIsCorrect;
                    } else {
                      // item is in the correct bucket but wrong position

                      /*
                       * get the feedback for when the choice is in the correct
                       * bucket but wrong position
                       */
                      let incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;

                      // set the default feedback if none is authored
                      if (incorrectPositionFeedback == null || incorrectPositionFeedback == '') {
                        incorrectPositionFeedback = this.$translate('match.correctBucketButWrongPosition');
                      }

                      item.feedback = incorrectPositionFeedback;

                      /*
                       * the choice is in the incorrect position so it isn't correct
                       */
                      item.isCorrect = false;

                      // the choice is in the incorrect position
                      item.isIncorrectPosition = true;

                      // the student has answered incorrectly
                      isCorrect = false;
                    }
                  }
                }

                if (!this.hasCorrectAnswer) {
                  /*
                   * the component does not have a correct answer
                   * so we will clear the isCorrect and isIncorrectPosition
                   * fields
                   */
                  item.isCorrect = null;
                  item.isIncorrectPosition = null;
                }

                if (excludeIds.indexOf(choiceId) > -1) {
                  // don't show feedback for choices that should be excluded
                  item.feedback = null;
                }
              }
            }
          }
        }
      }
    }

    if (this.hasCorrectAnswer) {
      /*
       * set the isCorrect value into the controller
       * so we can read it later
       */
      this.isCorrect = isCorrect;
    } else {
      this.isCorrect = null;
    }
  };

  /**
   * Get the array of feedback
   * @return the array of feedback objects
   */
  getFeedback() {
    var feedback = null;

    var componentContent = this.componentContent;

    if (componentContent != null) {

      // get the feedback from the component content
      feedback = componentContent.feedback;
    }

    return feedback;
  }

  /**
   * Get the feedback object for the combination of bucket and choice
   * @param bucketId the bucket id
   * @param choiceId the choice id
   * @return the feedback object for the combination of bucket and choice
   */
  getFeedbackObject(bucketId, choiceId) {
    var feedbackObject = null;

    // get the feedback
    var feedback = this.getFeedback();

    if (feedback != null) {

      /*
       * loop through the feedback. each element in the feedback represents
       * a bucket
       */
      for (var f = 0; f < feedback.length; f++) {

        // get a bucket feedback object
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          // get the bucket id
          var tempBucketId = bucketFeedback.bucketId;

          if (bucketId === tempBucketId) {
            // we have found the bucket we are looking for

            var choices = bucketFeedback.choices;

            if (choices != null) {

              // loop through all the choice feedback
              for (var c = 0; c < choices.length; c++) {
                var choiceFeedback = choices[c];

                if (choiceFeedback != null) {
                  var tempChoiceId = choiceFeedback.choiceId;

                  if (choiceId === tempChoiceId) {
                    // we have found the choice we are looking for
                    feedbackObject = choiceFeedback;
                    break;
                  }
                }
              }

              if (feedbackObject != null) {
                break;
              }
            }
          }
        }
      }
    }

    return feedbackObject;
  };

  studentDataChanged() {
    this.isCorrect = null;
    this.isLatestComponentStateSubmit = false;
    super.studentDataChanged();
  };

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {

    // create a new component state
    let componentState = this.NodeService.createNewComponentState();

    if (componentState != null) {

      let studentData = {};


      if (action === 'submit') {

        /*
         * check if the choices are in the correct buckets and also
         * display feedback
         */
        this.checkAnswer();

        if (this.hasCorrectAnswer && this.isCorrect != null) {
          /*
           * there are correct choices so we will set whether the
           * student was correct
           */
          studentData.isCorrect = this.isCorrect;
        }

        /*
         * the latest component state is a submit. this is used to
         * determine if we should show the feedback.
         */
        this.isLatestComponentStateSubmit = true;
      } else {

        // clear the feedback in the choices
        this.clearFeedback();
        this.processLatestSubmit();

        /*
         * the latest component state is not a submit. this is used to
         * determine if we should show the feedback.
         */
        this.isLatestComponentStateSubmit = false;
      }

      // set the buckets into the student data
      studentData.buckets = this.getCopyOfBuckets();

      // the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;

      //set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'Match';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;
    }

    let deferred = this.$q.defer();

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
            var populatedComponentState = this.MatchService.populateComponentState(importWorkComponentState);

            /*
             * update the choice ids so that it uses the choice ids
             * from this component. we need to do this because the choice
             * ids are likely to be different. we update the choice ids
             * by matching the choice text.
             */
            this.updateIdsFromImportedWork(populatedComponentState);

            // populate the component state into this component
            this.setStudentWork(populatedComponentState);
            this.studentDataChanged();
          }
        }
      }
    }
  };

  /**
   * Update the choice ids and bucket ids to use the ids from this component.
   * We will use the choice text and bucket text to perform matching.
   * @param componentState the component state
   */
  updateIdsFromImportedWork(componentState) {

    if (componentState != null) {

      // get the student data
      var studentData = componentState.studentData;

      if (studentData != null) {

        // get the buckets from the student data
        var studentBuckets = studentData.buckets;

        if (studentBuckets != null) {

          // loop through all the student buckets
          for (var b = 0; b < studentBuckets.length; b++) {

            // get a student bucket
            var studentBucket = studentBuckets[b];

            if (studentBucket != null) {

              // get the text of the student bucket
              var tempStudentBucketText = studentBucket.value;

              // get the bucket from this component that has the matching text
              var bucket = this.getBucketByText(tempStudentBucketText);

              if (bucket != null) {
                // change the id of the student bucket
                studentBucket.id = bucket.id;
              }

              // get the choices the student put into this bucket
              var studentChoices = studentBucket.items;

              if (studentChoices != null) {

                // loop through the choices in the bucket
                for (var c = 0; c < studentChoices.length; c++) {

                  // get a student choice
                  var studentChoice = studentChoices[c];

                  if (studentChoice != null) {

                    // get the text of the student choice
                    var tempStudentChoiceText = studentChoice.value;

                    // get the choice from this component that has the matching text
                    var choice = this.getChoiceByText(tempStudentChoiceText);

                    if (choice != null) {
                      // change the id of the student choice
                      studentChoice.id = choice.id;
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
   * Add a choice
   */
  authoringAddChoice() {

    // create a new choice
    var newChoice = {};
    newChoice.id = this.UtilService.generateKey(10);
    newChoice.value = '';
    newChoice.type = 'choice';

    // add the choice to the array of choices
    this.authoringComponentContent.choices.push(newChoice);

    // add the choice to the feedback
    this.addChoiceToFeedback(newChoice.id);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Add a bucket
   */
  authoringAddBucket() {

    // create a new bucket
    var newBucket = {};
    newBucket.id = this.UtilService.generateKey(10);
    newBucket.value = '';
    newBucket.type = 'bucket';

    // add the bucket to the array of buckets
    this.authoringComponentContent.buckets.push(newBucket);

    // add the bucket to the feedback
    this.addBucketToFeedback(newBucket.id);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move a choice up
   * @param index the index of the choice
   */
  authoringMoveChoiceUp(index) {

    if (index != 0) {
      // the choice is not at the top so we can move it up

      // remember the choice
      var choice = this.authoringComponentContent.choices[index];

      if (choice != null) {

        // remove the choice
        this.authoringComponentContent.choices.splice(index, 1);

        // insert the choice one index back
        this.authoringComponentContent.choices.splice(index - 1, 0, choice);
      }

      /*
       * get the feedback so we can update the order of the choices within
       * the bucket feedback
       */
      var feedback = this.authoringComponentContent.feedback;

      if (feedback != null) {

        // loop through all the bucket feedback objects
        for (var f = 0; f < feedback.length; f++) {
          var bucketFeedback = feedback[f];

          if (bucketFeedback != null) {

            // get all the choices
            var bucketFeedbackChoices = bucketFeedback.choices;

            if (bucketFeedbackChoices != null) {

              // remmeber the choice
              var tempChoice = bucketFeedbackChoices[index];

              if (tempChoice != null) {
                // remove the choice
                bucketFeedbackChoices.splice(index, 1);

                // insert the choice one index back
                bucketFeedbackChoices.splice(index - 1, 0, tempChoice);
              }
            }
          }
        }
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a choice down
   * @param index the index of the choice
   */
  authoringMoveChoiceDown(index) {

    if (index < this.authoringComponentContent.choices.length - 1) {
      // the choice is not at the bottom so we can move it down

      // remember the choice
      var choice = this.authoringComponentContent.choices[index];

      if (choice != null) {

        // remove the choice
        this.authoringComponentContent.choices.splice(index, 1);

        // insert the choice one index forward
        this.authoringComponentContent.choices.splice(index + 1, 0, choice);
      }

      /*
       * get the feedback so we can update the order of the choices within
       * the bucket feedback
       */
      var feedback = this.authoringComponentContent.feedback;

      if (feedback != null) {

        // loop through all the bucket feedback objects
        for (var f = 0; f < feedback.length; f++) {
          var bucketFeedback = feedback[f];

          if (bucketFeedback != null) {

            // get all the choices
            var bucketFeedbackChoices = bucketFeedback.choices;

            if (bucketFeedbackChoices != null) {

              // remmeber the choice
              var tempChoice = bucketFeedbackChoices[index];

              if (tempChoice != null) {
                // remove the choice
                bucketFeedbackChoices.splice(index, 1);

                // insert the choice one index forward
                bucketFeedbackChoices.splice(index + 1, 0, tempChoice);
              }
            }
          }
        }
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a choice
   * @param index the index of the choice in the choice array
   */
  authoringDeleteChoice(index) {

    // confirm with the user that they want to delete the choice
    var answer = confirm(this.$translate('match.areYouSureYouWantToDeleteThisChoice'));

    if (answer) {

      // remove the choice from the array
      var deletedChoice = this.authoringComponentContent.choices.splice(index, 1);

      if (deletedChoice != null && deletedChoice.length > 0) {

        // splice returns an array so we need to get the element out of it
        deletedChoice = deletedChoice[0];

        // get the choice id
        var choiceId = deletedChoice.id;

        // remove the choice from the feedback
        this.removeChoiceFromFeedback(choiceId);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a bucket up
   * @param index the index of the bucket
   */
  authoringMoveBucketUp(index) {

    if (index > 0) {
      // the bucket is not at the top so we can move it up

      // remember the bucket
      var bucket = this.authoringComponentContent.buckets[index];

      if (bucket != null) {

        // remove the bucket
        this.authoringComponentContent.buckets.splice(index, 1);

        // insert the bucket one index back
        this.authoringComponentContent.buckets.splice(index - 1, 0, bucket);
      }

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      var bucketFeedback = this.authoringComponentContent.feedback[index + 1];

      if (bucketFeedback != null) {

        // remove the bucket feedback
        this.authoringComponentContent.feedback.splice(index + 1, 1);

        // insert the bucket one index back
        this.authoringComponentContent.feedback.splice(index, 0, bucketFeedback);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a bucket down
   * @param index the index of the bucket
   */
  authoringMoveBucketDown(index) {

    if (index < this.authoringComponentContent.buckets.length - 1) {
      // the bucket is not at the bottom so we can move it down

      // remember the bucket
      var bucket = this.authoringComponentContent.buckets[index];

      if (bucket != null) {

        // remove the bucket
        this.authoringComponentContent.buckets.splice(index, 1);

        // insert the bucket one index forward
        this.authoringComponentContent.buckets.splice(index + 1, 0, bucket);
      }

      /*
       * Remember the bucket feedback. The first element of the feedback
       * contains the origin bucket. The first authored bucket is located
       * at index 1. This means we need the index of the bucket feedback
       * that we want is located at index + 1.
       */
      var bucketFeedback = this.authoringComponentContent.feedback[index + 1];

      if (bucketFeedback != null) {

        // remove the bucket feedback
        this.authoringComponentContent.feedback.splice(index + 1, 1);

        // insert the bucket one index forward
        this.authoringComponentContent.feedback.splice(index + 2, 0, bucketFeedback);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a bucket
   * @param index the index of the bucket in the bucket array
   */
  authoringDeleteBucket(index) {

    // confirm with the user tha tthey want to delete the bucket
    var answer = confirm(this.$translate('match.areYouSureYouWantToDeleteThisBucket'));

    if (answer) {

      // remove the bucket from the array
      var deletedBucket = this.authoringComponentContent.buckets.splice(index, 1);

      if (deletedBucket != null && deletedBucket.length > 0) {

        // splice returns an array so we need to get the element out of it
        deletedBucket = deletedBucket[0];

        // get the bucket id
        var bucketId = deletedBucket.id;

        // remove the bucket from the feedback
        this.removeBucketFromFeedback(bucketId);
      }

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Get the choice by id from the authoring component content
   * @param id the choice id
   * @returns the choice object from the authoring component content
   */
  getChoiceById(id) {

    var choice = null;

    // get the choices
    var choices = this.componentContent.choices;

    // loop through all the choices
    for (var c = 0; c < choices.length; c++) {
      // get a choice
      var tempChoice = choices[c];

      if (tempChoice != null) {
        if (id === tempChoice.id) {
          // we have found the choice we want
          choice = tempChoice;
          break;
        }
      }
    }

    return choice;
  }

  /**
   * Get the choice by text
   * @param text look for a choice with this text
   * @returns the choice with the given text
   */
  getChoiceByText(text) {

    var choice = null;

    if (text != null) {

      // get the choices from the component content
      var choices = this.componentContent.choices;

      if (choices != null) {

        // loop through all the choices
        for (var c = 0; c < choices.length; c++) {
          var tempChoice = choices[c];

          if (tempChoice != null) {
            if (text == tempChoice.value) {
              // we have found the choice we want
              choice = tempChoice;
              break;
            }
          }
        }
      }
    }

    return choice;
  }

  /**
   * Get the bucket by id from the authoring component content
   * @param id the bucket id
   * @param buckets (optional) the buckets to get the bucket from
   * @returns the bucket object from the authoring component content
   */
  getBucketById(id, buckets) {

    var bucket = null;

    if (buckets == null) {
      if (this.buckets != null) {
        // get the buckets from the component
        buckets = this.buckets;
      } else {
        // get the buckets from the authoring component content
        buckets = this.authoringComponentContent.buckets;
      }
    }

    // loop through the buckets
    for (var b = 0; b < buckets.length; b++) {
      var tempBucket = buckets[b];

      if (tempBucket != null) {
        if (id == tempBucket.id) {
          // we have found the bucket we want
          bucket = tempBucket;
          break;
        }
      }
    }

    return bucket;
  }

  /**
   * Get the bucket by text
   * @param text look for a bucket with this text
   * @returns the bucket with the given text
   */
  getBucketByText(text) {

    var bucket = null;

    if (text != null) {

      // get the buckets from the component content
      var buckets = this.componentContent.buckets;

      if (buckets != null) {

        // loop throgh all the buckets
        for (var b = 0; b < buckets.length; b++) {
          var tempBucket = buckets[b];

          if (tempBucket != null) {
            if (text == tempBucket.value) {
              // we have found the bucket we want
              bucket = tempBucket;
              break;
            }
          }
        }
      }
    }

    return bucket;
  }

  /**
   * Get the choice value by id from the authoring component content
   * @param id the choice id
   * @returns the choice value from the authoring component content
   */
  getChoiceValueById(id) {

    var value = null;

    // get the choice
    var choice = this.getChoiceById(id);

    if (choice != null) {
      // get the value
      value = choice.value;
    }

    return value;
  }

  /**
   * Get the bucket value by id from the authoring component content
   * @param id the bucket id
   * @returns the bucket value from the authoring component content
   */
  getBucketValueById(id) {

    var value = null;

    // get the bucket
    var bucket = this.getBucketById(id);

    if (bucket != null) {
      // get the value
      value = bucket.value;
    }

    return value;
  }

  /**
   * Add a choice to the feedback
   * @param choiceId the choice id
   */
  addChoiceToFeedback(choiceId) {

    // get the feedback array
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      /*
       * loop through all the elements in the feedback. each element
       * represents a bucket.
       */
      for (var f = 0; f < feedback.length; f++) {
        // get a bucket
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          // get the choices in the bucket
          var choices = bucketFeedback.choices;

          var feedbackText = '';
          var isCorrect = false;

          // create a feedback object
          var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

          // add the feedback object
          choices.push(feedbackObject);
        }
      }
    }
  }

  /**
   * Add a bucket to the feedback
   * @param bucketId the bucket id
   */
  addBucketToFeedback(bucketId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // create a new bucket feedback object
      var bucket = {};
      bucket.bucketId = bucketId;
      bucket.choices = [];

      // get all the choices
      var choices = this.authoringComponentContent.choices;

      // loop through all the choices and add a choice feedback object to the bucket
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {

          var choiceId = choice.id;
          var feedbackText = '';
          var isCorrect = false;

          // create a feedback object
          var feedbackObject = this.createFeedbackObject(choiceId, feedbackText, isCorrect);

          // add the feedback object
          bucket.choices.push(feedbackObject);
        }
      }

      // add the feedback bucket
      feedback.push(bucket);
    }
  }

  /**
   * Create a feedback object
   * @param choiceId the choice id
   * @param feedback the feedback
   * @param isCorrect whether the choice is correct
   * @param position (optional) the position
   * @param incorrectPositionFeedback (optional) the feedback for when the
   * choice is in the correct but wrong position
   * @returns the feedback object
   */
  createFeedbackObject(choiceId, feedback, isCorrect, position, incorrectPositionFeedback) {

    var feedbackObject = {};
    feedbackObject.choiceId = choiceId;
    feedbackObject.feedback = feedback;
    feedbackObject.isCorrect = isCorrect;
    feedbackObject.position = position;
    feedbackObject.incorrectPositionFeedback = incorrectPositionFeedback;

    return feedbackObject;
  }

  /**
   * Remove a choice from the feedback
   * @param choiceId the choice id to remove
   */
  removeChoiceFromFeedback(choiceId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      /*
       * loop through each bucket feedback and remove the choice from each
       * bucket feedback object
       */
      for (var f = 0; f < feedback.length; f++) {
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          var choices = bucketFeedback.choices;

          // loop through all the choices
          for (var c = 0; c < choices.length; c++) {
            var choice = choices[c];

            if (choice != null) {
              if (choiceId === choice.choiceId) {
                // we have found the choice we want to remove

                // remove the choice feedback object
                choices.splice(c, 1);
                break;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Remove a bucket from the feedback
   * @param bucketId the bucket id to remove
   */
  removeBucketFromFeedback(bucketId) {

    // get the feedback array. each element in the array represents a bucket.
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // loop through all the bucket feedback objects
      for (var f = 0; f < feedback.length; f++) {
        var bucketFeedback = feedback[f];

        if (bucketFeedback != null) {

          if (bucketId === bucketFeedback.bucketId) {
            // we have found the bucket feedback object we want to remove

            // remove the bucket feedback object
            feedback.splice(f, 1);
            break;
          }
        }
      }
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

      // do nothing
      this.$rootScope.$broadcast('doneExiting');
    }));
  };

  /**
   * Check if a component generates student work
   * @param component the component
   * @return whether the component generates student work
   */
  componentHasWork(component) {
    var result = true;

    if (component != null) {
      result = this.ProjectService.componentHasWork(component);
    }

    return result;
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
   * Check if the component has been authored with a correct choice
   * @return whether the component has been authored with a correct choice
   */
  hasCorrectChoices() {
    var result = false;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      // get the buckets
      var buckets = componentContent.feedback;

      if (buckets != null) {

        // loop through all the buckets
        for (var b = 0; b < buckets.length; b++) {
          var bucket = buckets[b];

          if (bucket != null) {

            // get the choices
            var choices = bucket.choices;

            if (choices != null) {

              // loop through all the choices
              for (var c = 0; c < choices.length; c++) {
                var choice = choices[c];

                if (choice != null) {
                  if (choice.isCorrect) {
                    // there is a correct choice
                    return true;
                  }
                }
              }
            }
          }
        }
      }
    }

    return false;
  };

  /**
   * Remove a choice from a bucket
   * @param choiceId the choice id we want to remove
   * @param bucketId remove the choice from this bucket
   */
  removeChoiceFromBucket(choiceId, bucketId) {

    if (choiceId != null && bucketId != null) {

      // get the bucket
      var bucket = this.getBucketById(bucketId);

      if (bucket != null) {

        // get the choices in the bucket
        var bucketItems = bucket.items;

        if (bucketItems != null) {

          // loop through all the choices in the bucket
          for (var i = 0; i < bucketItems.length; i++) {
            var bucketItem = bucketItems[i];

            if (bucketItem != null && bucketItem.id === choiceId) {
              // we have found the choice we want to remove
              bucketItems.splice(i, 1);
              break;
            }
          }
        }
      }
    }
  }

  /**
   * Clear the feedback and isCorrect fields in all the choices
   */
  clearFeedback() {

    // get all the choices
    var choices = this.getChoices();

    if (choices != null) {

      // loop through all the choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          // set the feedback fields to null
          choice.isCorrect = null;
          choice.isIncorrectPosition = null;
          choice.feedback = null;
        }
      }
    }
  }

  /**
   * Check if a choice has a correct bucket
   * @param choiceId the choice id
   * @return whether the choice has a correct bucket
   */
  choiceHasCorrectBucket(choiceId) {

    var buckets = this.getFeedback();

    if (buckets != null) {

      // loop through all the buckets
      for (var b = 0; b < buckets.length; b++) {
        var bucket = buckets[b];

        if (bucket != null) {
          var choices = bucket.choices;

          if (choices != null) {

            // loop through all the choices in the bucket
            for (var c = 0; c < choices.length; c++) {
              var choice = choices[c];

              if (choice != null && choice.choiceId === choiceId) {
                // we have found the choice we are looking for

                if (choice.isCorrect) {
                  /*
                   * the item is correct when placed in this bucket
                   * which means this choice does have a correct
                   * bucket
                   */
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * Check if the choice has a correct position
   * @param choiceId the choice id
   * @return whether the choice has a correct position in any bucket
   */
  choiceHasCorrectPosition(choiceId) {
    var buckets = this.getFeedback();

    if (buckets != null) {

      // loop through all the buckets
      for (var b = 0; b < buckets.length; b++) {
        var bucket = buckets[b];

        if (bucket != null) {
          var choices = bucket.choices;

          if (choices != null) {

            // loop through all the choices in the bucket
            for (var c = 0; c < choices.length; c++) {
              var choice = choices[c];

              if (choice != null && choice.choiceId === choiceId) {
                // we have found the choice we are looking for

                if (choice.position != null) {
                  /*
                   * the item has a position when placed in this bucket
                   * which means this choice does have a correct
                   * position
                   */
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
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
   * Check if this component has been authored to have feedback or a correct
   * choice
   * @return whether this component has feedback or a correct choice
   */
  componentHasFeedback() {

    // get the feedback
    var feedback = this.authoringComponentContent.feedback;

    if (feedback != null) {

      // loop through all the feedback buckets
      for (var f = 0; f < feedback.length; f++) {

        var tempFeedback = feedback[f];

        if (tempFeedback != null) {
          var tempChoices = tempFeedback.choices;

          if (tempChoices != null) {

            // loop through the feedback choices
            for (var c = 0; c < tempChoices.length; c++) {
              var tempChoice = tempChoices[c];

              if (tempChoice != null) {

                if (tempChoice.feedback != null && tempChoice.feedback != '') {
                  // this choice has feedback
                  return true;
                }

                if (tempChoice.isCorrect) {
                  // this choice is correct
                  return true;
                }
              }
            }
          }
        }
      }
    }

    return false;
  }

  /**
   * The author has changed the feedback so we will enable the submit button
   */
  authoringViewFeedbackChanged() {

    var show = true;

    if (this.componentHasFeedback()) {
      // this component has feedback so we will show the submit button
      show = true;
    } else {
      /*
       * this component does not have feedback so we will not show the
       * submit button
       */
      show = false;
    }

    // show or hide the submit button
    this.setShowSubmitButtonValue(show);

    // save the component
    this.authoringViewComponentChanged();
  }

  /**
   * The "Is Correct" checkbox for a choice feedback has been clicked.
   * @param feedback The choice feedback.
   */
  authoringViewIsCorrectClicked(feedback) {
    if (!feedback.isCorrect) {
      // the choice has been set to not correct so we will remove the position
      delete feedback.position;
      delete feedback.incorrectPositionFeedback;
    }
    // save the component
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
   * Show the asset popup to allow the author to choose an image for the
   * choice
   * @param choice the choice object to set the image into
   */
  chooseChoiceAsset(choice) {
    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'choice';
    params.targetObject = choice;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose an image for the
   * bucket
   * @param bucket the bucket object to set the image into
   */
  chooseBucketAsset(bucket) {
    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'bucket';
    params.targetObject = bucket;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
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

  /**
   * Import any work we need from connected components
   */
  handleConnectedComponents() {

    // get the connected components
    var connectedComponents = this.componentContent.connectedComponents;

    if (connectedComponents != null) {

      var componentStates = [];

      // loop through all the connected components
      for (var c = 0; c < connectedComponents.length; c++) {
        var connectedComponent = connectedComponents[c];

        if (connectedComponent != null) {
          var nodeId = connectedComponent.nodeId;
          var componentId = connectedComponent.componentId;
          var type = connectedComponent.type;

          if (type == 'showWork') {
            // we are getting the work from this student

            // get the latest component state from the component
            var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

            if (componentState != null) {
              componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
            }

            // we are showing work so we will not allow the student to edit it
            this.isDisabled = true;
          } else if (type == 'importWork' || type == null) {
            // we are getting the work from this student

            // get the latest component state from the component
            var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

            if (componentState != null) {
              componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
            }
          }
        }
      }

      // merge the student responses from all the component states
      var mergedComponentState = this.createMergedComponentState(componentStates);

      // set the student work into the component
      this.setStudentWork(mergedComponentState);
      this.studentDataChanged();
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
      let mergedBuckets = [];
      // loop through all the component states and merge the buckets
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];
        if (componentState != null) {
          let studentData = componentState.studentData;
          if (studentData != null) {
            let buckets = studentData.buckets;
            for (let b = 0; b < buckets.length; b++) {
              let bucket = buckets[b];
              this.mergeBucket(mergedBuckets, bucket);
            }
          }
        }
      }

      if (mergedBuckets != null && mergedBuckets != '') {
        // set the merged response into the merged component state
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.buckets = mergedBuckets;
      }
    }

    return mergedComponentState;
  }

  /**
   * Merge a bucket into the array of buckets
   * @param buckets an array of buckets to merge into
   * @param bucket the bucket to merge into the array of buckets
   * @return an array of buckets with the merged bucket
   */
  mergeBucket(buckets, bucket) {

    if (buckets != null && bucket != null) {
      let bucketFound = false;
      for (let b = 0; b < buckets.length; b++) {
        let tempBucket = buckets[b];
        if (tempBucket != null) {
          if (tempBucket.id == bucket.id) {
            /*
             * the bucket is already in the array of buckets so we
             * will just merge the items
             */
            bucketFound = true;
            let tempItems = tempBucket.items;
            this.mergeItems(tempItems, bucket.items);
          }
        }
      }
      if (!bucketFound) {
        /*
         * the bucket was not in the array of buckets so we will add the
         * bucket
         */
        buckets.push(bucket);
      }
    }

    return buckets;
  }

  /**
   * Merge the items. Only merge the items with an id that is not already in
   * the array of items
   * @param oldItems an array of objects with ids
   * @param newItems an array of objects with ids
   * @return an array of objects that have been merged
   */
  mergeItems(oldItems, newItems) {

    let oldItemIds = this.getIds(oldItems);

    /*
     * loop through all the new items and add them to the old items if the
     * item does not already exist in the old items array
     */
    for (let i = 0; i < newItems.length; i++) {
      let newItem = newItems[i];
      if (newItem != null) {
        if (oldItemIds.indexOf(newItem.id) == -1) {
          // the new item is not in the old items array so we will add it
          oldItems.push(newItem);
        }
      }
    }

    return oldItems;
  }

  /**
   * Get the ids from the array of objects
   * @param arrayOfObjects an array of objects that have ids
   * @param an array of id strings
   */
  getIds(arrayOfObjects) {
    let ids = [];
    if (arrayOfObjects != null) {
      for (let o = 0; o < arrayOfObjects.length; o++) {
        let obj = arrayOfObjects[o];
        if (obj != null) {
          ids.push(obj.id);
        }
      }
    }

    return ids;
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

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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
}

MatchController.$inject = [
  '$filter',
  '$mdDialog',
  '$mdMedia',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'dragulaService',
  'MatchService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default MatchController;

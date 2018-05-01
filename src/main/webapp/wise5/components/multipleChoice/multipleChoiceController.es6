class MultipleChoiceController {
  constructor($filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      MultipleChoiceService,
      NodeService,
      ProjectService,
      StudentDataService,
      UtilService) {

    this.$filter = $filter;
    this.$injector = $injector;
    this.$mdDialog = $mdDialog;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.$scope = $scope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.MultipleChoiceService = MultipleChoiceService;
    this.NodeService = NodeService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    this.idToOrder = this.ProjectService.idToOrder;
    this.$translate = this.$filter('translate');

    // the node id of the current node
    this.nodeId = null;

    // the component id
    this.componentId = null;

    // field that will hold the component content
    this.componentContent = null;

    // field that will hold the authoring component content
    this.authoringComponentContent = null;

    // whether the component should be disabled
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

    // flag for whether to show the advanced authoring
    this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    this.showJSONAuthoring = false;

    // holds the ids of the choices the student has chosen
    this.studentChoices = [];

    // whether this part is showing previous work
    this.isShowPreviousWork = false;

    // holds whether the student answered correctly if there is a correct answer
    this.isCorrect = null;

    // whether the latest work was submitted or not
    this.isSubmit = null;

    // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
    this.mode = null;

    // whether the prompt is shown or not
    this.isPromptVisible = true;

    // whether the save button is shown or not
    this.isSaveButtonVisible = false;

    // whether the submit button is shown or not
    this.isSubmitButtonVisible = false;

    // whether to show the feedback or not
    this.showFeedback = true;

    // the latest annotations
    this.latestAnnotations = null;

    // counter to keep track of the number of submits
    this.submitCounter = 0;

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
        type: 'MultipleChoice'
      }
    ];

    this.nodeId = this.$scope.nodeId;

    // get the component content from the scope
    this.componentContent = this.$scope.componentContent;

    // get the authoring component content
    this.authoringComponentContent = this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    // the mode to load the component in e.g. 'student', 'grading', 'onlyShowWork'
    this.mode = this.$scope.mode;

    this.workgroupId = this.$scope.workgroupId;
    this.teacherWorkgroupId = this.$scope.teacherWorkgroupId;

    if (this.componentContent != null) {

      // get the component id
      this.componentId = this.componentContent.id;

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
        this.isPromptVisible = true;
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
        }.bind(this), true);
      }

      // check if there is a correct answer
      this.hasCorrectAnswer = this.hasCorrectChoices();

      this.showFeedback = this.componentContent.showFeedback;

      // get the component type
      this.componentType = this.componentContent.type;

      var componentState = null;

      // get the component state from the scope
      componentState = this.$scope.componentState;

      if (this.mode == 'student') {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          // we will show work from another component
          this.handleConnectedComponents();
        }  else if (this.MultipleChoiceService.componentStateHasStudentWork(componentState, this.componentContent)) {
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
         * will disable the choices and the submit button
         */
        this.isDisabled = true;
        this.isSubmitButtonDisabled = true;
      }

      // check if we need to lock this component
      this.calculateDisabled();

      if (this.$scope.$parent.nodeController != null) {
        // register this component with the parent node
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }
    }

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
        if (this.$scope.multipleChoiceController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.multipleChoiceController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.multipleChoiceController.createComponentState(action).then((componentState) => {
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

        // set isDirty to false because the component state was just saved and notify node
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

    }));

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
                  targetObject.text = text;

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
  };

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {

    if (componentState != null) {

      // get the student data
      var studentData = componentState.studentData;

      if (studentData != null) {
        // get the choice ids the student previously chose
        var choiceIds = this.getChoiceIdsFromStudentData(studentData);

        // set the choice(s) the student previously chose
        if (this.isRadio()) {
          this.studentChoices = choiceIds[0];
        } else if (this.isCheckbox()) {
          this.studentChoices = choiceIds;
        }

        if (studentData.isCorrect != null) {
          this.isCorrect = studentData.isCorrect;
        }

        if (this.showFeedback && componentState.isSubmit) {
          // the previous work was a submit so we will show the feedback
          this.showFeedbackForChoiceIds(choiceIds);
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
        // set save message
        this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
      } else {
        // latest state is not a submission, so set isSubmitDirty to true and notify node
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        // set save message
        this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
      }
    }
  };

  showFeedbackForChoiceIds(choiceIds) {

    if (choiceIds != null) {
      for (var c = 0; c < choiceIds.length; c++) {
        var choiceId = choiceIds[c];

        var choiceObject = this.getChoiceById(choiceId);

        if (choiceObject != null) {
          choiceObject.showFeedback = true;
          choiceObject.feedbackToShow = choiceObject.feedback;
        }
      }
    }
  };

  /**
   * Determine if the choice id has been checked
   * @param the choice id to look at
   * @return whether the choice id was checked
   */
  isChecked(choiceId) {
    var result = false;

    // get the choices the student chose
    var studentChoices = this.studentChoices;

    if (studentChoices != null) {
      if (this.isRadio()) {
        // this is a radio button step

        if (choiceId === studentChoices) {
          // the student checked the choice id
          result = true;
        }
      } else if(this.isCheckbox()) {
        // this is a checkbox step

        if (studentChoices.indexOf(choiceId) != -1) {
          // the student checked the choice id
          result = true;
        }
      }
    }

    return result;
  };

  /**
   * Get the choice ids from the student data
   * @param studentData an array that contains the objects of the
   * choices the student chose
   * @return an array containing the choice id(s) the student chose
   */
  getChoiceIdsFromStudentData(studentData) {
    var choiceIds = [];

    if (studentData != null && studentData.studentChoices != null) {

      // get the choices the student chose
      var studentChoices = studentData.studentChoices;

      // loop through all the choice objects in the student data
      for (var x = 0; x < studentChoices.length; x++) {
        // get a choice object
        var studentDataChoice = studentChoices[x];

        if (studentDataChoice != null) {
          // get the choice id
          var studentDataChoiceId = studentDataChoice.id;

          // add the choice id to our array
          choiceIds.push(studentDataChoiceId);
        }
      }
    }

    return choiceIds;
  };

  /**
   * The student clicked on one of the radio button choices
   * @param choiceId the choice id of the radio button the student clicked
   */
  radioChoiceSelected(choiceId) {
    // notify this node that the student choice has changed
    this.studentDataChanged();

    if (choiceId != null) {
      // log this event
      var category = 'StudentInteraction';
      var event = 'choiceSelected';
      var data = {};
      data.selectedChoiceId = choiceId;
      this.StudentDataService.saveComponentEvent(this, category, event, data);
    }
  };

  /**
   * The student clicked on one of the check box choices
   * @param choiceId the choice id of the checkbox the student clicked
   */
  toggleSelection(choiceId) {

    if (choiceId != null) {
      /*
       * get the array of choice ids that were checked before the
       * student clicked the most current check box
       */
      var studentChoices = this.studentChoices;

      if (studentChoices != null) {
        /*
         * check if the newest check is in the array of checked
         * choices
         */
        var index = studentChoices.indexOf(choiceId);

        if (index == -1) {
          /*
           * the choice was not previously checked so we will add
           * the choice id to the array
           */
          studentChoices.push(choiceId);
        } else {
          /*
           * the choice was previously checked so we will remove
           * the choice id from the array
           */
          studentChoices.splice(index, 1);
        }
      }

      // notify this node that the student choice has changed
      this.studentDataChanged();

      // log this event
      var category = 'StudentInteraction';
      var event = 'choiceSelected';
      var data = {};
      data.selectedChoiceId = choiceId;
      data.choicesAfter = studentChoices;
      this.StudentDataService.saveComponentEvent(this, category, event, data);
    }
  };

  /**
   * Check if this multiple choice component is using radio buttons
   * @return whether this multiple choice component is using radio buttons
   */
  isRadio() {
    return this.isChoiceType('radio');
  };

  /**
   * Check if this multiple choice component is using checkboxes
   * @return whether this multiple choice component is using checkboxes
   */
  isCheckbox() {
    return this.isChoiceType('checkbox');
  };

  /**
   * Check if the component is authored to use the given choice type
   * @param choiceType the choice type ('radio' or 'checkbox')
   * @return whether the component is authored to use the given
   * choice type
   */
  isChoiceType(choiceType) {
    var result = false;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {
      // get the choice type from the component content
      var componentContentChoiceType = componentContent.choiceType;

      if (choiceType === componentContentChoiceType) {
        // the choice type matches
        result = true;
      }
    }

    return result;
  };

  /**
   * Called when the student clicks the save button
   */
  saveButtonClicked() {
    this.isSubmit = false;
    this.isCorrect = null;
    this.hideAllFeedback();

    if (this.mode === 'authoring') {
      /*
       * we are in authoring mode so we will set isDirty to false here
       * because the 'componentSaveTriggered' event won't work in
       * authoring mode
       */
      this.isDirty = false;
    }

    // tell the parent node that this component wants to save
    this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
  };

  /**
   * Called when the student clicks the submit button
   */
  submitButtonClicked() {
    // trigger the submit
    var submitTriggeredBy = 'componentSubmitButton';
    this.submit(submitTriggeredBy);
  };

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

    if (this.isSubmitDirty) {
      // TODO: add confirmation dialog if lock after submit is enabled on this component

      // set saveFailed to true; will be set to false on save success response from server
      this.saveFailed = true;

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

        // hide any previous feedback
        this.hideAllFeedback();

        // increment the submit counter
        this.incrementSubmitCounter();

        // check if the student has used up all of their submits
        if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
          /*
           * the student has used up all of their submits so we will
           * disable the choices and buttons
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
          this.checkAnswer();
          this.isLatestComponentStateSubmit = true;
          this.isDirty = false;
          this.isSubmitDirty = false;
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
   * Hide all the feedback
   */
  hideAllFeedback() {

    // get all the choices
    var choices = this.getChoices();

    // loop through all the choices
    for (var c = 0; c < choices.length; c++) {
      var choice = choices[c];

      if (choice != null) {
        // hide all the feedback
        choice.showFeedback = false;
      }
    }
  };

  /**
   * Increment the submit counter
   */
  incrementSubmitCounter() {
    this.submitCounter++;
  }

  /**
   * Check the answer the student has submitted and display feedback
   * for the choices the student has checked
   */
  checkAnswer() {
    var isCorrect = false;

    // check if any correct choices have been authored
    if (this.hasFeedback() || this.hasCorrectAnswer) {

      var isCorrectSoFar = true;

      // get all the authored choices
      var choices = this.getChoices();

      // loop through all the choices and check if each should be checked or not

      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          var choiceId = choice.id;

          // whether the choice is correct
          var isChoiceCorrect = choice.isCorrect;

          if (isChoiceCorrect == null) {
            isChoiceCorrect = false;
          }

          // whether the student checked the choice
          var isChoiceChecked = this.isChecked(choiceId);

          if (isChoiceCorrect != isChoiceChecked) {
            // the student answered this choice incorrectly
            isCorrectSoFar = false;
          }

          // show the feedback if it exists and the student checked it
          if (this.showFeedback && isChoiceChecked && choice.feedback != null && choice.feedback !== '') {
            choice.showFeedback = true;
            choice.feedbackToShow = choice.feedback;
          }
        }
      }

      isCorrect = isCorrectSoFar;
    }

    if (this.hasCorrectAnswer) {
      this.isCorrect = isCorrect;
    }
  };

  /**
   * Get the correct choice for a radio button component
   * @return a choice id string
   */
  getCorrectChoice() {
    var correctChoice = null;

    if (this.componentContent != null) {
      correctChoice = this.componentContent.correctChoice;
    }

    return correctChoice;
  };

  /**
   * Get the correct choices for a checkbox component
   * @return an array of correct choice ids
   */
  getCorrectChoices() {
    var correctChoices = null;

    if (this.componentContent != null) {
      correctChoices = this.componentContent.correctChoices;
    }

    return correctChoices;
  };

  lockIfNecessary() {
    // check if we need to lock the component after the student submits
    if (this.isLockAfterSubmit()) {
      this.isDisabled = true;
    }
  };

  /**
   * Called when the student changes their work
   */
  studentDataChanged() {
    /*
     * set the dirty flag so we will know we need to save the
     * student work later
     */
     this.isDirty = true;
     this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

     this.isSubmitDirty = true;
     this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});

     // clear out the save message
     this.setSaveMessage('', null);

    // get this component id
    var componentId = this.getComponentId();

    this.isCorrect = null;
    this.isLatestComponentStateSubmit = false;

    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */
    var action = 'change';

    // create a component state populated with the student data
    this.createComponentState(action).then((componentState) => {
      this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: componentId, componentState: componentState});
    });
  };

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {

    // create a new component state
    var componentState = this.NodeService.createNewComponentState();

    if (componentState != null) {

      var studentData = {};

      // set the student choices into the component state
      studentData.studentChoices = this.getStudentChoiceObjects();

      if (action === 'submit') {
        /*
         * the student has clicked submit or save so we will
         * check if the student has chosen all the correct choices.
         * the isCorrect value will be stored in this.isCorrect.
         */
        this.checkAnswer();

        if (this.isCorrect != null) {
          // set the isCorrect value into the student data
          studentData.isCorrect = this.isCorrect;
        }
      } else {
        /*
         * the student data has changed but the student has not
         * clicked on the submit or save button so we will not
         * check the answer yet.
         */
      }

      if (action === 'submit') {
        if (this.isSubmit) {
          // the student submitted this work
          componentState.isSubmit = this.isSubmit;

          /*
           * reset the isSubmit value so that the next component state
           * doesn't maintain the same value
           */
          this.isSubmit = false;

          /*
           * the latest component state is a submit. this is used to
           * determine if we should show the feedback.
           */
          this.isLatestComponentStateSubmit = true;
        }
      } else if (action === 'save') {
        /*
         * the latest component state is not a submit. this is used to
         * determine if we should show the feedback.
         */
        this.isLatestComponentStateSubmit = false;
      }

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'MultipleChoice';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;
    }

    var deferred = this.$q.defer();

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
   * Check if we need to lock the component
   */
  calculateDisabled() {

    var nodeId = this.nodeId;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      // check if the parent has set this component to disabled
      if (componentContent.isDisabled) {
        this.isDisabled = true;
      } else if (componentContent.lockAfterSubmit) {
        // we need to lock the step after the student has submitted

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
  };

  /**
   * Get the choices the student has chosen as objects. The objects
   * will contain the choice id and the choice text.
   */
  getStudentChoiceObjects() {
    var studentChoiceObjects = [];

    /*
     * get the choices the student has chosen. this will be an
     * array of choice ids.
     */
    var studentChoices = this.studentChoices;
    var choiceObject = null;
    var studentChoiceObject = null;

    if (studentChoices != null) {

      if (this.isRadio()) {
        // this is a radio button component

        // get the choice object
        choiceObject = this.getChoiceById(studentChoices);

        if (choiceObject != null) {
          // create a student choice object and set the id and text
          studentChoiceObject = {};
          studentChoiceObject.id = choiceObject.id;
          studentChoiceObject.text = choiceObject.text;

          // add the student choice object to our array
          studentChoiceObjects.push(studentChoiceObject);
        }
      } else if (this.isCheckbox()) {
        // this is a checkbox component

        // loop through all the choices the student chose
        for (var x = 0; x < studentChoices.length; x++) {

          // get a choice id that the student chose
          var studentChoiceId = studentChoices[x];

          // get the choice object
          choiceObject = this.getChoiceById(studentChoiceId);

          if (choiceObject != null) {
            // create a student choice object and set the id and text
            studentChoiceObject = {};
            studentChoiceObject.id = choiceObject.id;
            studentChoiceObject.text = choiceObject.text;

            // add the student choice object to our array
            studentChoiceObjects.push(studentChoiceObject);
          }
        }
      }
    }

    return studentChoiceObjects;
  };

  /**
   * Check if the component has been authored with a correct choice
   * @return whether the component has been authored with a correct choice
   */
  hasCorrectChoices() {
    var result = false;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      var choices = componentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            if (choice.isCorrect) {
              result = true;
            }
          }
        }
      }
    }

    return result;
  };

  /**
   * Check if there is any feedback
   * @returns whether there is any feedback
   */
  hasFeedback() {
    var result = false;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      var choices = componentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            if (choice.feedback != null && choice.feedback != '') {
              result = true;
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get a choice object by choice id
   * @param choiceId the choice id
   * @return the choice object with the given choice id
   */
  getChoiceById(choiceId) {
    var choice = null;

    if (choiceId != null) {
      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the choices
        var choices = componentContent.choices;

        // loop through all the choices
        for (var c = 0; c < choices.length; c++) {
          // get a choice
          var tempChoice = choices[c];

          if (tempChoice != null) {
            // get a choice id
            var tempChoiceId = tempChoice.id;

            // check if the choice id matches
            if (choiceId === tempChoiceId) {
              /*
               * the choice id matches so we will return this
               * choice
               */
              choice = tempChoice;
              break;
            }
          }
        }
      }
    }

    return choice;
  };

  /**
   * Get a choice by choice text
   * @param text the choice text
   * @return the choice with the given text
   */
  getChoiceByText(text) {

    var choice = null;

    if (text != null) {
      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the choices
        var choices = componentContent.choices;

        // loop through all the choices
        for (var c = 0; c < choices.length; c++) {
          // get a choice
          var tempChoice = choices[c];

          if (tempChoice != null) {
            // get a choice text
            var tempChoiceText = tempChoice.text;

            // check if the choice text matches
            if (text == tempChoiceText) {
              /*
               * the choice text matches so we will return this
               * choice
               */
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
   * Get the choice type for this component ('radio' or 'checkbox')
   * @return the choice type for this component
   */
  getChoiceType() {
    var choiceType = null;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {
      // get the choice type
      choiceType = componentContent.choiceType;
    }

    return choiceType;
  };

  /**
   * Get the available choices from component content
   * @return the available choices from the component content
   */
  getChoices() {
    var choices = null;

    // get the component content
    var componentContent = this.componentContent;

    if (componentContent != null) {

      // get the choices
      choices = componentContent.choices;
    }

    return choices;
  };

  /**
   * Get the available choices from component content
   * @return the available choices from the component content
   */
  getAuthoringChoices() {
    var choices = null;

    // get the component content
    var authoringComponentContent = this.authoringComponentContent;

    if (authoringComponentContent != null) {

      // get the choices
      choices = authoringComponentContent.choices;
    }

    return choices;
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
   * Get the prompt to show to the student
   */
  getPrompt() {
    var prompt = null;

    if (this.originalComponentContent != null) {
      // this is a show previous work component

      if (this.originalComponentContent.showPreviousWorkPrompt) {
        // show the prompt from the previous work component
        prompt = this.componentContent.prompt;
      } else {
        // show the prompt from the original component
        prompt = this.originalComponentContent.prompt;
      }
    } else if (this.componentContent != null) {
      prompt = this.componentContent.prompt;
    }

    return prompt;
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
            var populatedComponentState = this.MultipleChoiceService.populateComponentState(importWorkComponentState);

            /*
             * update the choice ids so that it uses the choice ids
             * from this component. we need to do this because the choice
             * ids are likely to be different. we update the choice ids
             * by matching the choice text.
             */
            this.updateChoiceIdsFromImportedWork(populatedComponentState);

            // populate the component state into this component
            this.setStudentWork(populatedComponentState);

            // make the work dirty so that it gets saved
            this.studentDataChanged();
          }
        }
      }
    }
  };

  /**
   * Update the choice ids to use the choice ids from this component.
   * We will use the choice text to match the choices.
   * @param componentState the component state
   */
  updateChoiceIdsFromImportedWork(componentState) {

    if (componentState != null) {

      // get the student data
      var studentData = componentState.studentData;

      if (studentData != null) {

        // get the choices the student chose
        var studentChoices = studentData.studentChoices;

        if (studentChoices != null) {

          // loop through all the choices the student chose
          for (var s = 0; s < studentChoices.length; s++) {

            // get a choice the student chose
            var studentChoice = studentChoices[s];

            if (studentChoice != null) {

              // get the choice text
              var studentChoiceText = studentChoice.text;

              // get the choice in this component with the given tetxt
              var choice = this.getChoiceByText(studentChoiceText);

              if (choice != null) {

                // get the choice id
                var choiceId = choice.id;

                // update the id to have the id from this component
                studentChoice.id = choiceId;
              }
            }
          }
        }
      }
    }
  }

  /**
   * Get the component id
   * @return the component id
   */
  getComponentId() {
    return this.componentContent.id;
  };

  /**
   * Check if this component has been authored to have feedback or has a
   * correct choice
   * @return whether this component has feedback or has a correct choice
   */
  componentHasFeedback() {

    // get the choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {

          if (choice.feedback != null && choice.feedback != '') {
            // the choice has feedback
            return true;
          }

          if (choice.isCorrect) {
            // the choice is correct
            return true;
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
   * The component has changed in the regular authoring view so we will save the project
   */
  authoringViewComponentChanged() {

    // clean up the choices by removing fields injected by the controller during run time
    //this.cleanUpChoices();

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
      var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

      // set the new component into the controller
      this.componentContent = editedComponentContent;

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
   * Get all the step node ids in the project
   * @returns all the step node ids
   */
  getStepNodeIds() {
    var stepNodeIds = this.ProjectService.getNodeIds();

    return stepNodeIds;
  }

  /**
   * Get the step number and title
   * @param nodeId get the step number and title for this node
   * @returns the step number and title
   */
  getNodePositionAndTitleByNodeId(nodeId) {
    var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

    return nodePositionAndTitle;
  }

  /**
   * Get the components in a step
   * @param nodeId get the components in the step
   * @returns the components in the step
   */
  getComponentsByNodeId(nodeId) {
    var components = this.ProjectService.getComponentsByNodeId(nodeId);

    return components;
  }

  /**
   * Check if a node is a step node
   * @param nodeId the node id to check
   * @returns whether the node is an application node
   */
  isApplicationNode(nodeId) {
    var result = this.ProjectService.isApplicationNode(nodeId);

    return result;
  }

  /**
   * Add a choice from within the authoring tool
   */
  addChoice() {

    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    // make the new choice
    var newChoice = {};
    newChoice.id = this.UtilService.generateKey(10);
    newChoice.text = '';
    newChoice.feedback = '';
    newChoice.isCorrect = false;

    // add the new choice
    choices.push(newChoice);

    // save the component
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a choice from within the authoring tool
   * @param choiceId
   */
  deleteChoice(choiceId) {

    // ask the author if they are sure they want to delete the choice
    var answer = confirm(this.$translate('multipleChoice.areYouSureYouWantToDeleteThisChoice'));

    if (answer) {
      // the author answered yes to delete the choice

      // get the authored choices
      var choices = this.authoringComponentContent.choices;

      if (choices != null) {

        // loop through all the authored choices
        for (var c = 0; c < choices.length; c++) {
          var choice = choices[c];

          if (choice != null) {
            var tempChoiceId = choice.id;

            if (choiceId === tempChoiceId) {
              // we have found the choice that we want to delete so we will remove it
              choices.splice(c, 1);
              break;
            }
          }
        }
      }

      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a choice up
   * @param choiceId the choice to move
   */
  moveChoiceUp(choiceId) {

    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          var tempChoiceId = choice.id;

          if (choiceId === tempChoiceId) {

            if (c == 0) {
              /*
               * the choice is the first choice so we can't move
               * it up
               */
            } else {
              // we have found the choice that we want to move up

              // remove the choice
              choices.splice(c, 1);

              // add the choice one index back
              choices.splice(c - 1, 0, choice);
            }

            break;
          }
        }
      }
    }

    this.authoringViewComponentChanged();
  }

  /**
   * Move a choice down
   * @param choiceId the choice to move
   */
  moveChoiceDown(choiceId) {
    // get the authored choices
    var choices = this.authoringComponentContent.choices;

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          var tempChoiceId = choice.id;

          if (choiceId === tempChoiceId) {

            if (c == choices.length - 1) {
              /*
               * the choice is the last choice so we can't move
               * it down
               */
            } else {
              // we have found the choice that we want to move down

              // remove the choice
              choices.splice(c, 1);

              // add the choice one index forward
              choices.splice(c + 1, 0, choice);
            }

            break;
          }
        }
      }
    }
  }

  /**
   * Clean up the choice objects. In the authoring tool this is required
   * because we use the choice objects as ng-model values and inject
   * fields into the choice objects such as showFeedback and feedbackToShow.
   */
  cleanUpChoices() {

    // get the authored choices
    var choices = this.getAuthoringChoices();

    if (choices != null) {

      // loop through all the authored choices
      for (var c = 0; c < choices.length; c++) {
        var choice = choices[c];

        if (choice != null) {
          // remove the fields we don't want to be saved
          delete choice.showFeedback;
          delete choice.feedbackToShow;
        }
      }
    }
  }

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

      // make the work dirty so that it gets saved
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
      let mergedStudentChoices = [];
      /*
       * loop through all the component states to accumulate all the
       * choices the student chose
       */
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];
        if (componentState != null) {
          let studentData = componentState.studentData;
          if (studentData != null) {
            let studentChoices = studentData.studentChoices;
            if (studentChoices != null && studentChoices.length > 0) {
              mergedStudentChoices = mergedStudentChoices.concat(studentChoices);
            }
          }
        }
      }
      if (mergedStudentChoices != null && mergedStudentChoices != '') {
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.studentChoices = mergedStudentChoices;
      }
    }

    return mergedComponentState;
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
};

MultipleChoiceController.$inject = [
  '$filter',
  '$injector',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'MultipleChoiceService',
  'NodeService',
  'ProjectService',
  'StudentDataService',
  'UtilService'
];

export default MultipleChoiceController;

'use strict';

import ComponentController from "../componentController";

class MultipleChoiceController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      MultipleChoiceService,
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
    this.MultipleChoiceService = MultipleChoiceService;

    // holds the ids of the choices the student has chosen
    this.studentChoices = [];

    // holds whether the student answered correctly if there is a correct answer
    this.isCorrect = null;

    // whether the latest component state was a submit
    this.isLatestComponentStateSubmit = false;

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
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
    }

    // check if there is a correct answer
    this.componentHasCorrectAnswer = this.hasCorrectChoices();

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

    this.disableComponentIfNecessary();

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
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', angular.bind(this, function(event, args) {

    }));

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  };

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

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

        this.processLatestStudentWork();
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
    if (this.isDisabled) {
      return;
    }
    this.studentDataChanged();

    if (this.mode === 'student') {
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
    if (this.isDisabled) {
      return;
    }
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
      this.studentDataChanged();

      // log this event
      if (this.mode === 'student') {
        var category = 'StudentInteraction';
        var event = 'choiceSelected';
        var data = {};
        data.selectedChoiceId = choiceId;
        data.choicesAfter = studentChoices;
        this.StudentDataService.saveComponentEvent(this, category, event, data);
      }
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

  saveButtonClicked() {
    this.isCorrect = null;
    this.hideAllFeedback();
    super.saveButtonClicked();
  };

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

    if (this.isSubmitDirty) {
      // TODO: add confirmation dialog if lock after submit is enabled on this component

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
  }

  checkAnswer() {
    if (this.getChoiceType() === 'radio') {
      this.checkSingleAnswer();
    } else if (this.getChoiceType() === 'checkbox') {
      this.checkMultipleAnswer();
    }
  }

  checkSingleAnswer() {
    let isCorrect = false;
    const choices = this.getChoices();
    for (let choice of choices) {
      if (this.componentHasCorrectAnswer) {
        if (choice.isCorrect && this.isChecked(choice.id)) {
          isCorrect = true;
        }
      }
      this.displayFeedbackOnChoiceIfNecessary(choice);
    }
    if (this.componentHasCorrectAnswer) {
      this.isCorrect = isCorrect;
    }
  }

  checkMultipleAnswer() {
    let isAllCorrect = true;
    const choices = this.getChoices();
    for (const choice of choices) {
      if (this.componentHasCorrectAnswer) {
        if (this.isStudentChoiceValueCorrect(choice)) {
          isAllCorrect &= true;
        } else {
          isAllCorrect = false;
        }
      }
      this.displayFeedbackOnChoiceIfNecessary(choice);
    }
    if (this.componentHasCorrectAnswer) {
      this.isCorrect = isAllCorrect;
    }
  }

  displayFeedbackOnChoiceIfNecessary(choice) {
    if (this.showFeedback && this.isChecked(choice.id)) {
      choice.showFeedback = true;
      choice.feedbackToShow = choice.feedback;
    }
  }

  isStudentChoiceValueCorrect(choice) {
    if (choice.isCorrect && this.isChecked(choice.id)) {
      return true;
    } else if (!choice.isCorrect && !this.isChecked(choice.id)) {
      return true;
    } else {
      return false;
    }
  }

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
};

MultipleChoiceController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'MultipleChoiceService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default MultipleChoiceController;

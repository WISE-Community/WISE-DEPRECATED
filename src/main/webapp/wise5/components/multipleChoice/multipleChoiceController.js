'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MultipleChoiceController = function (_ComponentController) {
  _inherits(MultipleChoiceController, _ComponentController);

  function MultipleChoiceController($filter, $mdDialog, $q, $rootScope, $scope, AnnotationService, ConfigService, MultipleChoiceService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, MultipleChoiceController);

    var _this = _possibleConstructorReturn(this, (MultipleChoiceController.__proto__ || Object.getPrototypeOf(MultipleChoiceController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.MultipleChoiceService = MultipleChoiceService;

    // holds the ids of the choices the student has chosen
    _this.studentChoices = [];

    // holds whether the student answered correctly if there is a correct answer
    _this.isCorrect = null;

    // whether to show the feedback or not
    _this.showFeedback = true;

    // the latest annotations
    _this.latestAnnotations = null;

    // whether this component has been authored with a correct answer
    _this.hasCorrectAnswer = false;

    // whether the latest component state was a submit
    _this.isLatestComponentStateSubmit = false;

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    }

    // check if there is a correct answer
    _this.hasCorrectAnswer = _this.hasCorrectChoices();

    _this.showFeedback = _this.componentContent.showFeedback;

    // get the component type
    _this.componentType = _this.componentContent.type;

    var componentState = null;

    // get the component state from the scope
    componentState = _this.$scope.componentState;

    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        // we will show work from another component
        _this.handleConnectedComponents();
      } else if (_this.MultipleChoiceService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        // we will import work from another component
        _this.handleConnectedComponents();
      }
    } else {
      // populate the student work into this component
      _this.setStudentWork(componentState);
    }

    if (componentState != null && componentState.isSubmit) {
      /*
       * the latest component state is a submit. this is used to
       * determine if we should show the feedback.
       */
      _this.isLatestComponentStateSubmit = true;
    }

    // check if the student has used up all of their submits
    if (_this.componentContent.maxSubmitCount != null && _this.submitCounter >= _this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the choices and the submit button
       */
      _this.isDisabled = true;
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    if (_this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

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
        this.$scope.multipleChoiceController.createComponentState(action).then(function (componentState) {
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
    }.bind(_this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', angular.bind(_this, function (event, args) {}));

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(MultipleChoiceController, [{
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {

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
    }
  }, {
    key: 'processLatestSubmit',


    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */
    value: function processLatestSubmit() {
      var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'showFeedbackForChoiceIds',
    value: function showFeedbackForChoiceIds(choiceIds) {

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
    }
  }, {
    key: 'isChecked',


    /**
     * Determine if the choice id has been checked
     * @param the choice id to look at
     * @return whether the choice id was checked
     */
    value: function isChecked(choiceId) {
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
        } else if (this.isCheckbox()) {
          // this is a checkbox step

          if (studentChoices.indexOf(choiceId) != -1) {
            // the student checked the choice id
            result = true;
          }
        }
      }

      return result;
    }
  }, {
    key: 'getChoiceIdsFromStudentData',


    /**
     * Get the choice ids from the student data
     * @param studentData an array that contains the objects of the
     * choices the student chose
     * @return an array containing the choice id(s) the student chose
     */
    value: function getChoiceIdsFromStudentData(studentData) {
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
    }
  }, {
    key: 'radioChoiceSelected',


    /**
     * The student clicked on one of the radio button choices
     * @param choiceId the choice id of the radio button the student clicked
     */
    value: function radioChoiceSelected(choiceId) {
      this.studentDataChanged();

      if (choiceId != null) {
        // log this event
        var category = 'StudentInteraction';
        var event = 'choiceSelected';
        var data = {};
        data.selectedChoiceId = choiceId;
        this.StudentDataService.saveComponentEvent(this, category, event, data);
      }
    }
  }, {
    key: 'toggleSelection',


    /**
     * The student clicked on one of the check box choices
     * @param choiceId the choice id of the checkbox the student clicked
     */
    value: function toggleSelection(choiceId) {

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
        var category = 'StudentInteraction';
        var event = 'choiceSelected';
        var data = {};
        data.selectedChoiceId = choiceId;
        data.choicesAfter = studentChoices;
        this.StudentDataService.saveComponentEvent(this, category, event, data);
      }
    }
  }, {
    key: 'isRadio',


    /**
     * Check if this multiple choice component is using radio buttons
     * @return whether this multiple choice component is using radio buttons
     */
    value: function isRadio() {
      return this.isChoiceType('radio');
    }
  }, {
    key: 'isCheckbox',


    /**
     * Check if this multiple choice component is using checkboxes
     * @return whether this multiple choice component is using checkboxes
     */
    value: function isCheckbox() {
      return this.isChoiceType('checkbox');
    }
  }, {
    key: 'isChoiceType',


    /**
     * Check if the component is authored to use the given choice type
     * @param choiceType the choice type ('radio' or 'checkbox')
     * @return whether the component is authored to use the given
     * choice type
     */
    value: function isChoiceType(choiceType) {
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
    }
  }, {
    key: 'saveButtonClicked',
    value: function saveButtonClicked() {
      this.isCorrect = null;
      this.hideAllFeedback();
      _get(MultipleChoiceController.prototype.__proto__ || Object.getPrototypeOf(MultipleChoiceController.prototype), 'saveButtonClicked', this).call(this);
    }
  }, {
    key: 'submit',


    /**
     * A submit was triggered by the component submit button or node submit button
     * @param submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */
    value: function submit(submitTriggeredBy) {

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
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
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

  }, {
    key: 'hideAllFeedback',
    value: function hideAllFeedback() {

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
  }, {
    key: 'checkAnswer',


    /**
     * Check the answer the student has submitted and display feedback
     * for the choices the student has checked
     */
    value: function checkAnswer() {
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
    }
  }, {
    key: 'getCorrectChoice',


    /**
     * Get the correct choice for a radio button component
     * @return a choice id string
     */
    value: function getCorrectChoice() {
      var correctChoice = null;

      if (this.componentContent != null) {
        correctChoice = this.componentContent.correctChoice;
      }

      return correctChoice;
    }
  }, {
    key: 'getCorrectChoices',


    /**
     * Get the correct choices for a checkbox component
     * @return an array of correct choice ids
     */
    value: function getCorrectChoices() {
      var correctChoices = null;

      if (this.componentContent != null) {
        correctChoices = this.componentContent.correctChoices;
      }

      return correctChoices;
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      this.isCorrect = null;
      this.isLatestComponentStateSubmit = false;
      _get(MultipleChoiceController.prototype.__proto__ || Object.getPrototypeOf(MultipleChoiceController.prototype), 'studentDataChanged', this).call(this);
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    value: function createComponentState(action) {

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
    }
  }, {
    key: 'getStudentChoiceObjects',


    /**
     * Get the choices the student has chosen as objects. The objects
     * will contain the choice id and the choice text.
     */
    value: function getStudentChoiceObjects() {
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
    }
  }, {
    key: 'hasCorrectChoices',


    /**
     * Check if the component has been authored with a correct choice
     * @return whether the component has been authored with a correct choice
     */
    value: function hasCorrectChoices() {
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
    }
  }, {
    key: 'hasFeedback',


    /**
     * Check if there is any feedback
     * @returns whether there is any feedback
     */
    value: function hasFeedback() {
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

  }, {
    key: 'getChoiceById',
    value: function getChoiceById(choiceId) {
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
    }
  }, {
    key: 'getChoiceByText',


    /**
     * Get a choice by choice text
     * @param text the choice text
     * @return the choice with the given text
     */
    value: function getChoiceByText(text) {

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

  }, {
    key: 'getChoiceType',
    value: function getChoiceType() {
      var choiceType = null;

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {
        // get the choice type
        choiceType = componentContent.choiceType;
      }

      return choiceType;
    }
  }, {
    key: 'getChoices',


    /**
     * Get the available choices from component content
     * @return the available choices from the component content
     */
    value: function getChoices() {
      var choices = null;

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the choices
        choices = componentContent.choices;
      }

      return choices;
    }
  }, {
    key: 'createMergedComponentState',


    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */
    value: function createMergedComponentState(componentStates) {

      // create a new component state
      var mergedComponentState = this.NodeService.createNewComponentState();
      if (componentStates != null) {
        var mergedStudentChoices = [];
        /*
         * loop through all the component states to accumulate all the
         * choices the student chose
         */
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];
          if (componentState != null) {
            var studentData = componentState.studentData;
            if (studentData != null) {
              var studentChoices = studentData.studentChoices;
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
  }]);

  return MultipleChoiceController;
}(_componentController2.default);

;

MultipleChoiceController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'MultipleChoiceService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = MultipleChoiceController;
//# sourceMappingURL=multipleChoiceController.js.map

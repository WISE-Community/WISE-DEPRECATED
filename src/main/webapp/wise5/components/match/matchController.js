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

var MatchController = function (_ComponentController) {
  _inherits(MatchController, _ComponentController);

  function MatchController($filter, $mdDialog, $mdMedia, $q, $rootScope, $scope, AnnotationService, ConfigService, dragulaService, MatchService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, MatchController);

    var _this = _possibleConstructorReturn(this, (MatchController.__proto__ || Object.getPrototypeOf(MatchController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.dragulaService = dragulaService;
    _this.MatchService = MatchService;
    _this.$mdMedia = $mdMedia;
    _this.autoScroll = require('dom-autoscroller');

    _this.choices = [];
    _this.buckets = [];
    _this.isCorrect = null;
    _this.bucketWidth = 100; // the flex (%) width for displaying the buckets
    _this.numChoiceColumns = 1;
    _this.isHorizontal = _this.componentContent.horizontal; // whether to orient the choices and buckets side-by-side
    _this.choiceStyle = '';
    _this.bucketStyle = '';
    _this.sourceBucketId = '0';
    _this.hasCorrectAnswer = false;
    _this.isLatestComponentStateSubmit = false;
    _this.sourceBucket = null;

    _this.privateNotebookItems = [];

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      if (_this.shouldImportPrivateNotes()) {
        _this.privateNotebookItems = _this.NotebookService.getPrivateNotebookItems();
        _this.$rootScope.$on('notebookUpdated', function (event, args) {
          if (args.notebookItem.type === 'note') {
            _this.addNotebookItemToSourceBucket(args.notebookItem);
          }
        });
      }
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
      if (_this.shouldImportPrivateNotes()) {
        _this.privateNotebookItems = _this.NotebookService.getPrivateNotebookItems(_this.workgroupId);
      }
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

    _this.hasCorrectAnswer = _this.hasCorrectChoices();
    _this.initializeChoices();
    _this.initializeBuckets();
    var componentState = _this.$scope.componentState;
    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      } else if (_this.MatchService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        _this.handleConnectedComponents();
      }
    } else if (componentState != null) {
      _this.setStudentWork(componentState);
    }

    if (componentState != null && componentState.isSubmit) {
      _this.isLatestComponentStateSubmit = componentState.isSubmit === true;
    }

    if (_this.studentHasUsedAllSubmits()) {
      _this.isDisabled = true;
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    _this.registerDragListeners();

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param {boolean} isSubmit whether the request is coming from a submit
     * action (optional; default is false)
     * @return {promise} a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = _this.$q.defer();
      var hasDirtyWork = false;
      var action = 'change';

      if (isSubmit) {
        if (_this.$scope.matchController.isSubmitDirty) {
          hasDirtyWork = true;
          action = 'submit';
        }
      } else {
        if (_this.$scope.matchController.isDirty) {
          hasDirtyWork = true;
          action = 'save';
        }
      }

      if (hasDirtyWork) {
        _this.$scope.matchController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(MatchController, [{
    key: 'addNotebookItemToSourceBucket',
    value: function addNotebookItemToSourceBucket(notebookItem) {
      var choice = this.createChoiceFromNotebookItem(notebookItem);
      this.choices.push(choice);
      var sourceBucket = this.getBucketById(this.sourceBucketId);
      sourceBucket.items.push(choice);
    }
  }, {
    key: 'studentHasUsedAllSubmits',
    value: function studentHasUsedAllSubmits() {
      return this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount;
    }
  }, {
    key: 'registerDragListeners',
    value: function registerDragListeners() {
      var dragId = 'match_' + this.componentId;
      this.registerStudentDataChangedOnDrop(dragId);
      this.disableDraggingIfNeeded(dragId);
      var drake = this.dragulaService.find(this.$scope, dragId).drake;
      this.showVisualIndicatorWhileDragging(drake);
      this.supportScrollWhileDragging(drake);
    }
  }, {
    key: 'registerStudentDataChangedOnDrop',
    value: function registerStudentDataChangedOnDrop(dragId) {
      var _this2 = this;

      var dropEvent = dragId + '.drop-model';
      this.$scope.$on(dropEvent, function (e, el, container, source) {
        _this2.$scope.matchController.studentDataChanged();
      });
    }
  }, {
    key: 'disableDraggingIfNeeded',
    value: function disableDraggingIfNeeded(dragId) {
      var _this3 = this;

      this.dragulaService.options(this.$scope, dragId, {
        moves: function moves(el, source, handle, sibling) {
          return !_this3.$scope.matchController.isDisabled;
        }
      });
    }
  }, {
    key: 'showVisualIndicatorWhileDragging',
    value: function showVisualIndicatorWhileDragging(drake) {
      drake.on('over', function (el, container, source) {
        if (source !== container) {
          container.className += ' match-bucket__contents--over';
        }
      }).on('out', function (el, container, source) {
        if (source !== container) {
          container.className = container.className.replace('match-bucket__contents--over', '');;
        }
      });
    }
  }, {
    key: 'supportScrollWhileDragging',
    value: function supportScrollWhileDragging(drake) {
      this.autoScroll([document.querySelector('#content')], {
        margin: 30,
        pixels: 50,
        scrollWhenOutside: true,
        autoScroll: function autoScroll() {
          // Only scroll when the pointer is down, and there is a child being dragged
          return this.down && drake.dragging;
        }
      });
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      var studentData = componentState.studentData;
      var componentStateBuckets = studentData.buckets;
      var sourceBucket = this.getBucketById(this.sourceBucketId);
      sourceBucket.items = []; // clear the source bucket
      var bucketIds = this.getBucketIds();
      var choiceIds = this.getChoiceIds();

      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = componentStateBuckets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var componentStateBucket = _step.value;

          var componentStateBucketId = componentStateBucket.id;
          if (bucketIds.indexOf(componentStateBucketId) > -1) {
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = componentStateBucket.items[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var currentChoice = _step3.value;

                var currentChoiceId = currentChoice.id;
                var currentChoiceLocation = choiceIds.indexOf(currentChoiceId);
                var bucket = this.getBucketById(componentStateBucketId);
                if (currentChoiceLocation > -1) {
                  // choice is valid and used by student in a valid bucket, so add it to that bucket

                  // content for choice with this id may have changed, so get updated content
                  var updatedChoice = this.getChoiceById(currentChoiceId);
                  bucket.items.push(updatedChoice);
                  choiceIds.splice(currentChoiceLocation, 1);
                } else {
                  bucket.items.push(currentChoice);
                }
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
        }

        // add unused choices to the source bucket
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = choiceIds[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var choiceId = _step2.value;

          sourceBucket.items.push(this.getChoiceById(choiceId));
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      var submitCounter = studentData.submitCounter;
      if (submitCounter != null) {
        this.submitCounter = submitCounter;
      }

      if (this.submitCounter > 0) {
        if (componentState.isSubmit) {
          this.checkAnswer();
        } else {
          /*
           * This component state was not a submit, but the student
           * submitted some time in the past. We want to show the
           * feedback for choices that have not moved since the
           * student submitted.
           */
          this.processPreviousStudentWork();
        }
      } else {
        /*
         * there was no submit in the past but we will still need to
         * check if submit is dirty.
         */
        this.processPreviousStudentWork();
      }
    }

    /**
     * Get the latest submitted componentState and display feedback for choices
     * that haven't changed since. This will also determine if submit is dirty.
     */

  }, {
    key: 'processPreviousStudentWork',
    value: function processPreviousStudentWork() {
      var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
      if (latestComponentState == null) {
        return;
      }

      var serverSaveTime = latestComponentState.serverSaveTime;
      var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestComponentState.isSubmit === true) {
        this.isCorrect = latestComponentState.isCorrect;
        this.setIsSubmitDirty(false);
        this.setSubmittedMessage(clientSaveTime);
        this.checkAnswer();
      } else {
        var latestSubmitComponentState = this.StudentDataService.getLatestSubmitComponentState(this.nodeId, this.componentId);
        if (latestSubmitComponentState != null) {
          this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
        } else {
          this.isCorrect = null;
          this.setIsSubmitDirty(false);
          this.setSavedMessage(clientSaveTime);
        }
      }
    }
  }, {
    key: 'processDirtyStudentWork',


    /**
     * There is unsaved student work that is not yet saved in a component state
     */
    value: function processDirtyStudentWork() {
      var latestSubmitComponentState = this.StudentDataService.getLatestSubmitComponentState(this.nodeId, this.componentId);
      if (latestSubmitComponentState != null) {
        this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
      } else {
        var latestComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        if (latestComponentState != null) {
          this.isCorrect = null;
          this.setIsSubmitDirty(true);
          this.setSavedMessage(latestComponentState.clientSaveTime);
        }
      }
    }
  }, {
    key: 'showFeedbackOnUnchangedChoices',
    value: function showFeedbackOnUnchangedChoices(latestSubmitComponentState) {
      var choicesThatChangedSinceLastSubmit = this.getChoicesThatChangedSinceLastSubmit(latestSubmitComponentState);
      if (choicesThatChangedSinceLastSubmit.length > 0) {
        this.setIsSubmitDirty(true);
      } else {
        this.setIsSubmitDirty(false);
      }
      this.checkAnswer(choicesThatChangedSinceLastSubmit);
    }
  }, {
    key: 'setIsSubmitDirty',
    value: function setIsSubmitDirty(isSubmitDirty) {
      this.isSubmitDirty = isSubmitDirty;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: isSubmitDirty });
    }
  }, {
    key: 'isLatestComponentStateASubmit',
    value: function isLatestComponentStateASubmit() {}
  }, {
    key: 'getBucketIds',
    value: function getBucketIds() {
      return this.buckets.map(function (b) {
        return b.id;
      });
    }
  }, {
    key: 'getChoiceIds',
    value: function getChoiceIds() {
      return this.choices.map(function (c) {
        return c.id;
      });
    }
  }, {
    key: 'getChoicesThatChangedSinceLastSubmit',
    value: function getChoicesThatChangedSinceLastSubmit(latestSubmitComponentState) {
      var latestSubmitComponentStateBuckets = latestSubmitComponentState.studentData.buckets;
      var choicesThatChangedSinceLastSubmit = [];
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.buckets[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var currentComponentStateBucket = _step4.value;

          var currentComponentStateBucketChoiceIds = currentComponentStateBucket.items.map(function (choice) {
            return choice.id;
          });
          var bucketFromSubmitComponentState = this.getBucketById(currentComponentStateBucket.id, latestSubmitComponentStateBuckets);
          if (bucketFromSubmitComponentState != null) {
            var latestSubmitComponentStateChoiceIds = bucketFromSubmitComponentState.items.map(function (choice) {
              return choice.id;
            });

            for (var choiceIndexInBucket = 0; choiceIndexInBucket < currentComponentStateBucketChoiceIds.length; choiceIndexInBucket++) {
              var currentBucketChoiceId = currentComponentStateBucketChoiceIds[choiceIndexInBucket];
              if (latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId) == -1) {
                choicesThatChangedSinceLastSubmit.push(currentBucketChoiceId);
              } else if (this.isAuthorHasSpecifiedACorrectPosition(currentBucketChoiceId) && choiceIndexInBucket != latestSubmitComponentStateChoiceIds.indexOf(currentBucketChoiceId)) {
                choicesThatChangedSinceLastSubmit.push(currentBucketChoiceId);
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }

      return choicesThatChangedSinceLastSubmit;
    }
  }, {
    key: 'getChoices',
    value: function getChoices() {
      return this.choices;
    }
  }, {
    key: 'initializeChoices',
    value: function initializeChoices() {
      this.choices = this.componentContent.choices;
      if (this.shouldImportPrivateNotes()) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = this.privateNotebookItems[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var privateNotebookItem = _step5.value;

            if (privateNotebookItem.type === 'note') {
              this.choices.push(this.createChoiceFromNotebookItem(privateNotebookItem));
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }
      }
    }
  }, {
    key: 'shouldImportPrivateNotes',
    value: function shouldImportPrivateNotes() {
      return this.isNotebookEnabled() && this.componentContent.importPrivateNotes;
    }
  }, {
    key: 'createChoiceFromNotebookItem',
    value: function createChoiceFromNotebookItem(notebookItem) {
      var value = notebookItem.content.text;
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = notebookItem.content.attachments[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var attachment = _step6.value;

          value += '<br/><img src="' + attachment.iconURL + '"/>';
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return {
        id: notebookItem.localNotebookItemId,
        value: value,
        type: 'choice'
      };
    }
  }, {
    key: 'initializeBuckets',
    value: function initializeBuckets() {
      this.buckets = [];
      this.setBucketWidth();
      this.setNumChoiceColumns();
      this.setChoiceStyle();
      this.setBucketStyle();
      this.sourceBucket = {
        id: this.sourceBucketId,
        value: this.componentContent.choicesLabel ? this.componentContent.choicesLabel : this.$translate('match.choices'),
        type: 'bucket',
        items: []
      };
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.getChoices()[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var choice = _step7.value;

          this.sourceBucket.items.push(choice);
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      this.buckets.push(this.sourceBucket);
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.componentContent.buckets[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var bucket = _step8.value;

          bucket.items = [];
          this.buckets.push(bucket);
        }
      } catch (err) {
        _didIteratorError8 = true;
        _iteratorError8 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion8 && _iterator8.return) {
            _iterator8.return();
          }
        } finally {
          if (_didIteratorError8) {
            throw _iteratorError8;
          }
        }
      }
    }
  }, {
    key: 'setBucketWidth',
    value: function setBucketWidth() {
      if (this.isHorizontal) {
        this.bucketWidth = 100;
      } else {
        if (typeof this.componentContent.bucketWidth === 'number') {
          this.bucketWidth = this.componentContent.bucketWidth;
        } else {
          var n = this.componentContent.buckets.length;
          if (n % 3 === 0 || n > 4) {
            this.bucketWidth = Math.round(100 / 3);
          } else if (n % 2 === 0) {
            this.bucketWidth = 100 / 2;
          }
        }
      }
    }
  }, {
    key: 'setNumChoiceColumns',
    value: function setNumChoiceColumns() {
      if (this.isHorizontal) {
        this.numChoiceColumns = 1;
      } else {
        if (typeof this.componentContent.bucketWidth === 'number') {
          this.numChoiceColumns = Math.round(100 / this.componentContent.bucketWidth);
        } else {
          var n = this.componentContent.buckets.length;
          if (n % 3 === 0 || n > 4) {
            this.numChoiceColumns = 3;
          } else if (n % 2 === 0) {
            this.numChoiceColumns = 2;
          }
        }
        if (typeof this.componentContent.choiceColumns === 'number') {
          this.numChoiceColumns = this.componentContent.choiceColumns;
        }
      }
    }
  }, {
    key: 'setChoiceStyle',
    value: function setChoiceStyle() {
      this.choiceStyle = {
        '-moz-column-count': this.numChoiceColumns,
        '-webkit-column-count': this.numChoiceColumns,
        'column-count': this.numChoiceColumns
      };
    }
  }, {
    key: 'setBucketStyle',
    value: function setBucketStyle() {
      if (this.bucketWidth === 100) {
        this.bucketStyle = this.choiceStyle;
      }
    }
  }, {
    key: 'getBuckets',
    value: function getBuckets() {
      return this.buckets;
    }
  }, {
    key: 'getCopyOfBuckets',


    /**
     * Create a copy of the array of buckets with brand new objects.
     * @return {array}
     */
    value: function getCopyOfBuckets() {
      var bucketsJSONString = angular.toJson(this.getBuckets());
      return angular.fromJson(bucketsJSONString);
    }
  }, {
    key: 'getNumSubmitsLeft',
    value: function getNumSubmitsLeft() {
      return this.componentContent.maxSubmitCount - this.submitCounter;
    }
  }, {
    key: 'hasStudentUsedAllSubmits',
    value: function hasStudentUsedAllSubmits() {
      return this.getNumSubmitsLeft() <= 0;
    }

    /**
     * Check if the student has answered correctly and show feedback.
     * @param {array} choice ids to not show feedback for
     */

  }, {
    key: 'checkAnswer',
    value: function checkAnswer() {
      var choiceIdsExcludedFromFeedback = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      var isCorrect = true;
      var buckets = this.getBuckets();
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = buckets[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var bucket = _step9.value;

          var bucketId = bucket.id;
          var items = bucket.items;
          for (var i = 0; i < items.length; i++) {
            var item = items[i];
            var position = i + 1;
            var choiceId = item.id;
            var feedbackObject = this.getFeedbackObject(bucketId, choiceId);
            if (feedbackObject != null) {
              var feedback = feedbackObject.feedback;
              var correctPosition = feedbackObject.position;
              var feedbackIsCorrect = feedbackObject.isCorrect;
              if (this.hasCorrectAnswer) {
                if (!this.isAuthorHasSpecifiedACorrectBucket(choiceId)) {
                  if (bucketId == this.sourceBucketId) {
                    // set this choice as correct because this choice belongs in the source bucket
                    feedbackIsCorrect = true;
                  }
                }
              }

              if (feedback == '') {
                if (this.hasCorrectAnswer) {
                  if (feedbackIsCorrect) {
                    feedback = this.$translate('CORRECT');
                  } else {
                    feedback = this.$translate('INCORRECT');
                  }
                }
              }

              if (this.doesPositionNotMatter(correctPosition)) {
                item.feedback = feedback;
                item.isCorrect = feedbackIsCorrect;
                item.isIncorrectPosition = false;
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
                if (position === correctPosition) {
                  item.feedback = feedback;
                  item.isCorrect = feedbackIsCorrect;
                  item.isIncorrectPosition = false;
                  isCorrect = isCorrect && feedbackIsCorrect;
                } else {
                  // item is in the correct bucket but wrong position
                  var incorrectPositionFeedback = feedbackObject.incorrectPositionFeedback;
                  if (incorrectPositionFeedback == null || incorrectPositionFeedback == '') {
                    incorrectPositionFeedback = this.$translate('match.correctBucketButWrongPosition');
                  }
                  item.feedback = incorrectPositionFeedback;
                  item.isCorrect = false;
                  item.isIncorrectPosition = true;
                  isCorrect = false;
                }
              }
            }

            if (!this.hasCorrectAnswer) {
              item.isCorrect = null;
              item.isIncorrectPosition = null;
            }

            if (choiceIdsExcludedFromFeedback.indexOf(choiceId) > -1) {
              item.feedback = null;
            }
          }
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      if (this.hasCorrectAnswer) {
        this.isCorrect = isCorrect;
      } else {
        this.isCorrect = null;
      }
    }

    /**
     * Get the array of feedback
     * @return {array} the array of feedback objects
     */

  }, {
    key: 'getAllFeedback',
    value: function getAllFeedback() {
      return this.componentContent.feedback;
    }

    /**
     * Get the feedback object for the combination of bucket and choice
     * @param {string} bucketId the bucket id
     * @param {string} choiceId the choice id
     * @return {object} the feedback object for the combination of bucket and choice
     */

  }, {
    key: 'getFeedbackObject',
    value: function getFeedbackObject(bucketId, choiceId) {
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.getAllFeedback()[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var bucketFeedback = _step10.value;

          if (bucketFeedback.bucketId === bucketId) {
            var _iteratorNormalCompletion11 = true;
            var _didIteratorError11 = false;
            var _iteratorError11 = undefined;

            try {
              for (var _iterator11 = bucketFeedback.choices[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
                var choiceFeedback = _step11.value;

                if (choiceFeedback.choiceId === choiceId) {
                  return choiceFeedback;
                }
              }
            } catch (err) {
              _didIteratorError11 = true;
              _iteratorError11 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion11 && _iterator11.return) {
                  _iterator11.return();
                }
              } finally {
                if (_didIteratorError11) {
                  throw _iteratorError11;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError10 = true;
        _iteratorError10 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion10 && _iterator10.return) {
            _iterator10.return();
          }
        } finally {
          if (_didIteratorError10) {
            throw _iteratorError10;
          }
        }
      }

      return null;
    }
  }, {
    key: 'doesPositionNotMatter',
    value: function doesPositionNotMatter(feedbackPosition) {
      return !this.componentContent.ordered || feedbackPosition == null;
    }
  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      this.isCorrect = null;
      this.isLatestComponentStateSubmit = false;
      _get(MatchController.prototype.__proto__ || Object.getPrototypeOf(MatchController.prototype), 'studentDataChanged', this).call(this);
    }

    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */

  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {};
      if (action === 'submit') {
        this.checkAnswer();
        if (this.hasCorrectAnswer && this.isCorrect != null) {
          studentData.isCorrect = this.isCorrect;
        }
        this.isLatestComponentStateSubmit = true;
      } else {
        this.clearFeedback();
        this.processDirtyStudentWork();
        this.isLatestComponentStateSubmit = false;
      }

      /*
       * Create a copy of the buckets so we don't accidentally change a bucket and have it also
       * change previous versions of the buckets.
       */
      studentData.buckets = this.getCopyOfBuckets();
      componentState.isSubmit = this.isSubmit;
      studentData.submitCounter = this.submitCounter;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;

      componentState.studentData = studentData;
      componentState.componentType = 'Match';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;

      var deferred = this.$q.defer();

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }

    /**
     * Get the choice by id from the authoring component content
     * @param {string} id the choice id
     * @returns {object} the choice object from the authoring component content
     */

  }, {
    key: 'getChoiceById',
    value: function getChoiceById(id) {
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = this.componentContent.choices[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var choice = _step12.value;

          if (choice.id === id) {
            return choice;
          }
        }
      } catch (err) {
        _didIteratorError12 = true;
        _iteratorError12 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion12 && _iterator12.return) {
            _iterator12.return();
          }
        } finally {
          if (_didIteratorError12) {
            throw _iteratorError12;
          }
        }
      }

      return null;
    }

    /**
     * Get the choice with the given text.
     * @param {string} text look for a choice with this text
     * @returns {object} the choice with the given text
     */

  }, {
    key: 'getChoiceByText',
    value: function getChoiceByText(text) {
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = this.componentContent.choices[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var choice = _step13.value;

          if (choice.value === text) {
            return choice;
          }
        }
      } catch (err) {
        _didIteratorError13 = true;
        _iteratorError13 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion13 && _iterator13.return) {
            _iterator13.return();
          }
        } finally {
          if (_didIteratorError13) {
            throw _iteratorError13;
          }
        }
      }

      return null;
    }

    /**
     * Get the bucket by id from the authoring component content.
     * @param {string} id the bucket id
     * @param {array} buckets (optional) the buckets to get the bucket from
     * @returns {object} the bucket object from the authoring component content
     */

  }, {
    key: 'getBucketById',
    value: function getBucketById(id) {
      var buckets = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.buckets;
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = buckets[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var bucket = _step14.value;

          if (bucket.id == id) {
            return bucket;
          }
        }
      } catch (err) {
        _didIteratorError14 = true;
        _iteratorError14 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion14 && _iterator14.return) {
            _iterator14.return();
          }
        } finally {
          if (_didIteratorError14) {
            throw _iteratorError14;
          }
        }
      }

      return null;
    }

    /**
     * Get the choice value by id from the authoring component content
     * @param {string} choiceId the choice id
     * @returns {string} the choice value from the authoring component content
     */

  }, {
    key: 'getChoiceValueById',
    value: function getChoiceValueById(choiceId) {
      var choice = this.getChoiceById(choiceId);
      if (choice != null) {
        return choice.value;
      }
      return null;
    }

    /**
     * Get the bucket value by id from the authoring component content
     * @param {string} bucketId the bucket id
     * @returns {string} the bucket value from the authoring component content
     */

  }, {
    key: 'getBucketValueById',
    value: function getBucketValueById(bucketId) {
      var bucket = this.getBucketById(bucketId);
      if (bucket != null) {
        return bucket.value;
      }
      return null;
    }

    /**
     * Check if the component has been authored with a correct choice
     * @return {boolean} whether the component has been authored with a correct choice
     */

  }, {
    key: 'hasCorrectChoices',
    value: function hasCorrectChoices() {
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.componentContent.feedback[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var bucket = _step15.value;
          var _iteratorNormalCompletion16 = true;
          var _didIteratorError16 = false;
          var _iteratorError16 = undefined;

          try {
            for (var _iterator16 = bucket.choices[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
              var choice = _step16.value;

              if (choice.isCorrect) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError16 = true;
            _iteratorError16 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion16 && _iterator16.return) {
                _iterator16.return();
              }
            } finally {
              if (_didIteratorError16) {
                throw _iteratorError16;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError15 = true;
        _iteratorError15 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion15 && _iterator15.return) {
            _iterator15.return();
          }
        } finally {
          if (_didIteratorError15) {
            throw _iteratorError15;
          }
        }
      }

      return false;
    }
  }, {
    key: 'clearFeedback',
    value: function clearFeedback() {
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.getChoices()[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var choice = _step17.value;

          choice.isCorrect = null;
          choice.isIncorrectPosition = null;
          choice.feedback = null;
        }
      } catch (err) {
        _didIteratorError17 = true;
        _iteratorError17 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion17 && _iterator17.return) {
            _iterator17.return();
          }
        } finally {
          if (_didIteratorError17) {
            throw _iteratorError17;
          }
        }
      }
    }

    /**
     * Check if a choice has a correct bucket
     * @param {string} choiceId the choice id
     * @return {boolean} whether the choice has a correct bucket
     */

  }, {
    key: 'isAuthorHasSpecifiedACorrectBucket',
    value: function isAuthorHasSpecifiedACorrectBucket(choiceId) {
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = this.getAllFeedback()[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var bucket = _step18.value;
          var _iteratorNormalCompletion19 = true;
          var _didIteratorError19 = false;
          var _iteratorError19 = undefined;

          try {
            for (var _iterator19 = bucket.choices[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
              var choice = _step19.value;

              if (choice.choiceId === choiceId) {
                if (choice.isCorrect) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError19 = true;
            _iteratorError19 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion19 && _iterator19.return) {
                _iterator19.return();
              }
            } finally {
              if (_didIteratorError19) {
                throw _iteratorError19;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError18 = true;
        _iteratorError18 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion18 && _iterator18.return) {
            _iterator18.return();
          }
        } finally {
          if (_didIteratorError18) {
            throw _iteratorError18;
          }
        }
      }

      return false;
    }

    /**
     * Returns true if the choice has been authored to have a correct position
     * @param {string} choiceId the choice id
     * @return {boolean} whether the choice has a correct position in any bucket
     */

  }, {
    key: 'isAuthorHasSpecifiedACorrectPosition',
    value: function isAuthorHasSpecifiedACorrectPosition(choiceId) {
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = this.getAllFeedback()[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var bucket = _step20.value;
          var _iteratorNormalCompletion21 = true;
          var _didIteratorError21 = false;
          var _iteratorError21 = undefined;

          try {
            for (var _iterator21 = bucket.choices[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
              var choice = _step21.value;

              if (choice.choiceId === choiceId) {
                if (choice.position != null) {
                  return true;
                }
              }
            }
          } catch (err) {
            _didIteratorError21 = true;
            _iteratorError21 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion21 && _iterator21.return) {
                _iterator21.return();
              }
            } finally {
              if (_didIteratorError21) {
                throw _iteratorError21;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError20 = true;
        _iteratorError20 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion20 && _iterator20.return) {
            _iterator20.return();
          }
        } finally {
          if (_didIteratorError20) {
            throw _iteratorError20;
          }
        }
      }

      return false;
    }
  }, {
    key: 'choiceIsInCorrectPosition',
    value: function choiceIsInCorrectPosition(choiceId) {
      // dummy. not called.
      // TODO: implement me.
      return false;
    }

    /**
     * Create a component state with the merged student responses
     * @param {array} componentStates an array of component states
     * @return {object} a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var mergedBuckets = [];
      var _iteratorNormalCompletion22 = true;
      var _didIteratorError22 = false;
      var _iteratorError22 = undefined;

      try {
        for (var _iterator22 = componentStates[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
          var componentState = _step22.value;
          var _iteratorNormalCompletion23 = true;
          var _didIteratorError23 = false;
          var _iteratorError23 = undefined;

          try {
            for (var _iterator23 = componentState.studentData.buckets[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
              var bucket = _step23.value;

              this.mergeBucket(mergedBuckets, bucket);
            }
          } catch (err) {
            _didIteratorError23 = true;
            _iteratorError23 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion23 && _iterator23.return) {
                _iterator23.return();
              }
            } finally {
              if (_didIteratorError23) {
                throw _iteratorError23;
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError22 = true;
        _iteratorError22 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion22 && _iterator22.return) {
            _iterator22.return();
          }
        } finally {
          if (_didIteratorError22) {
            throw _iteratorError22;
          }
        }
      }

      var mergedComponentState = this.NodeService.createNewComponentState();
      mergedComponentState.studentData = {
        buckets: mergedBuckets
      };
      return mergedComponentState;
    }

    /**
     * Merge a bucket into the array of buckets
     * @param {array} buckets an array of buckets to merge into
     * @param {object} bucket the bucket to merge into the array of buckets
     * @return {array} an array of buckets with the merged bucket
     */

  }, {
    key: 'mergeBucket',
    value: function mergeBucket(buckets, bucket) {
      var bucketFound = false;
      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        for (var _iterator24 = buckets[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          var tempBucket = _step24.value;

          if (tempBucket.id == bucket.id) {
            /*
             * the bucket is already in the array of buckets so we
             * will just merge the items
             */
            bucketFound = true;
            this.mergeChoices(tempBucket.items, bucket.items);
          }
        }
      } catch (err) {
        _didIteratorError24 = true;
        _iteratorError24 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion24 && _iterator24.return) {
            _iterator24.return();
          }
        } finally {
          if (_didIteratorError24) {
            throw _iteratorError24;
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
      return buckets;
    }

    /**
     * Merge the items. Only merge the items with an id that is not already in
     * the array of items.
     * @param {array} choices1 an array of choice objects
     * @param {array} choices2 an array of choice objects
     * @return {array} an array of objects that have been merged
     */

  }, {
    key: 'mergeChoices',
    value: function mergeChoices(choices1, choices2) {
      var choices1Ids = this.getIds(choices1);
      var _iteratorNormalCompletion25 = true;
      var _didIteratorError25 = false;
      var _iteratorError25 = undefined;

      try {
        for (var _iterator25 = choices2[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
          var choice2 = _step25.value;

          if (choices1Ids.indexOf(choice2.id) == -1) {
            choices1.push(choice2);
          }
        }
      } catch (err) {
        _didIteratorError25 = true;
        _iteratorError25 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion25 && _iterator25.return) {
            _iterator25.return();
          }
        } finally {
          if (_didIteratorError25) {
            throw _iteratorError25;
          }
        }
      }

      return choices1;
    }

    /**
     * Get the ids from the array of objects
     * @param {array} objects an array of objects that have ids
     * @param {array} an array of id strings
     */

  }, {
    key: 'getIds',
    value: function getIds(objects) {
      var ids = [];
      var _iteratorNormalCompletion26 = true;
      var _didIteratorError26 = false;
      var _iteratorError26 = undefined;

      try {
        for (var _iterator26 = objects[Symbol.iterator](), _step26; !(_iteratorNormalCompletion26 = (_step26 = _iterator26.next()).done); _iteratorNormalCompletion26 = true) {
          var object = _step26.value;

          ids.push(object.id);
        }
      } catch (err) {
        _didIteratorError26 = true;
        _iteratorError26 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion26 && _iterator26.return) {
            _iterator26.return();
          }
        } finally {
          if (_didIteratorError26) {
            throw _iteratorError26;
          }
        }
      }

      return ids;
    }
  }, {
    key: 'addChoice',
    value: function addChoice() {
      var _this4 = this;

      var confirm = this.$mdDialog.prompt().title(this.$translate('match.enterChoiceText')).placeholder(this.$translate('match.typeSomething')).cancel(this.$translate('CANCEL')).ok(this.$translate('OK'));
      this.$mdDialog.show(confirm).then(function (result) {
        if (result != null && result != '') {
          var newChoice = {
            id: _this4.UtilService.generateKey(10),
            value: result,
            type: 'choice',
            studentCreated: true
          };
          _this4.sourceBucket.items.push(newChoice);
          _this4.studentDataChanged();
        }
      });
    }
  }, {
    key: 'deleteChoice',
    value: function deleteChoice(choice) {
      if (confirm(this.$translate('match.areYouSureYouWantToDeleteThisChoice'))) {
        var buckets = this.getBuckets();
        var _iteratorNormalCompletion27 = true;
        var _didIteratorError27 = false;
        var _iteratorError27 = undefined;

        try {
          for (var _iterator27 = buckets[Symbol.iterator](), _step27; !(_iteratorNormalCompletion27 = (_step27 = _iterator27.next()).done); _iteratorNormalCompletion27 = true) {
            var bucket = _step27.value;

            var items = bucket.items;
            for (var i = 0; i < items.length; i++) {
              var item = items[i];
              if (item.id == choice.id) {
                items.splice(i, 1);
              }
            }
          }
        } catch (err) {
          _didIteratorError27 = true;
          _iteratorError27 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion27 && _iterator27.return) {
              _iterator27.return();
            }
          } finally {
            if (_didIteratorError27) {
              throw _iteratorError27;
            }
          }
        }

        this.studentDataChanged();
      }
    }
  }]);

  return MatchController;
}(_componentController2.default);

MatchController.$inject = ['$filter', '$mdDialog', '$mdMedia', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'dragulaService', 'MatchService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = MatchController;
//# sourceMappingURL=matchController.js.map

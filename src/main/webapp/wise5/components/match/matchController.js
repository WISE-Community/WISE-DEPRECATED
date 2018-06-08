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
    _this.latestAnnotations = null;
    _this.sourceBucketId = '0';
    _this.hasCorrectAnswer = false;
    _this.isLatestComponentStateSubmit = false;
    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];
    _this.allowedConnectedComponentTypes = [{
      type: 'Match'
    }];

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
      if (_this.mode === 'grading') {
        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
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
    } else if (_this.mode === 'authoring') {
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
      _this.summernoteRubricHTML = _this.componentContent.rubric;
      var insertAssetString = _this.$translate('INSERT_ASSET');
      var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);
      _this.summernoteRubricOptions = {
        toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
        height: 300,
        disableDragAndDrop: true,
        buttons: {
          insertAssetButton: InsertAssetButton
        }
      };

      _this.updateAdvancedAuthoringView();

      $scope.$watch(function () {
        return this.authoringComponentContent;
      }.bind(_this), function (newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.isCorrect = null;
        this.submitCounter = 0;
        this.isDisabled = false;
        this.isSubmitButtonDisabled = false;
        this.initializeChoices();
        this.initializeBuckets();
      }.bind(_this), true);
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

    if (_this.$scope.$parent.nodeController != null) {
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

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

    _this.$scope.$on('assetSelected', function (event, args) {
      if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
        var assetItem = args.assetItem;
        var fileName = assetItem.fileName;
        var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
        var fullAssetPath = assetsDirectoryPath + '/' + fileName;
        if (args.target == 'prompt' || args.target == 'rubric') {
          var summernoteId = '';
          if (args.target == 'prompt') {
            summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
          } else if (args.target == 'rubric') {
            summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
          }
          if (summernoteId != '') {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked
             */
            $('#' + summernoteId).summernote('editor.restoreRange');
            $('#' + summernoteId).summernote('editor.focus');

            if (_this.UtilService.isImage(fileName)) {
              $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
            } else if (_this.UtilService.isVideo(fileName)) {
              var videoElement = document.createElement('video');
              videoElement.controls = 'true';
              videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
              $('#' + summernoteId).summernote('insertNode', videoElement);
            }
          }
        } else if (args.target == 'choice') {
          var choiceObject = args.targetObject;
          choiceObject.value = '<img src="' + fileName + '"/>';
          _this.authoringViewComponentChanged();
        } else if (args.target == 'bucket') {
          var bucketObject = args.targetObject;
          bucketObject.value = '<img src="' + fileName + '"/>';
          _this.authoringViewComponentChanged();
        }
      }
      _this.$mdDialog.hide();
    });

    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (_this.componentId === args.componentId) {
        _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
      }
    });

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(MatchController, [{
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
                if (currentChoiceLocation > -1) {
                  // choice is valid and used by student in a valid bucket, so add it to that bucket
                  var bucket = this.getBucketById(componentStateBucketId);
                  // content for choice with this id may have change, so get updated content
                  var updatedChoice = this.getChoiceById(currentChoiceId);
                  bucket.items.push(updatedChoice);
                  choiceIds.splice(currentChoiceLocation, 1);
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
  }, {
    key: 'processPreviousStudentWork',


    /**
     * Get the latest submitted componentState and display feedback for choices
     * that haven't changed since. This will also determine if submit is dirty.
     */
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
        this.showSubmitMessage(clientSaveTime);
        this.checkAnswer();
      } else {
        var latestSubmitComponentState = this.StudentDataService.getLatestSubmitComponentState(this.nodeId, this.componentId);
        if (latestSubmitComponentState != null) {
          this.showFeedbackOnUnchangedChoices(latestSubmitComponentState);
        } else {
          this.isCorrect = null;
          this.setIsSubmitDirty(false);
          this.showSaveMessage(clientSaveTime);
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
          this.showSaveMessage(latestComponentState.clientSaveTime);
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
    key: 'showSaveMessage',
    value: function showSaveMessage(time) {
      this.setSaveMessage(this.$translate('LAST_SAVED'), time);
    }
  }, {
    key: 'showSubmitMessage',
    value: function showSubmitMessage(time) {
      this.setSaveMessage(this.$translate('LAST_SUBMITTED'), time);
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
    }
  }, {
    key: 'initializeBuckets',
    value: function initializeBuckets() {
      this.buckets = [];
      this.setBucketWidth();
      this.setNumChoiceColumns();
      this.setChoiceStyle();
      this.setBucketStyle();
      var sourceBucket = {
        id: this.sourceBucketId,
        value: this.componentContent.choicesLabel ? this.componentContent.choicesLabel : this.$translate('match.choices'),
        type: 'bucket',
        items: []
      };
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.getChoices()[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var choice = _step5.value;

          sourceBucket.items.push(choice);
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

      this.buckets.push(sourceBucket);
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.componentContent.buckets[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var bucket = _step6.value;

          bucket.items = [];
          this.buckets.push(bucket);
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

    /**
     * A submit was triggered by the component submit button or node submit button
     * @param {string} submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */

  }, {
    key: 'submit',
    value: function submit(submitTriggeredBy) {
      if (this.isSubmitDirty) {
        var performSubmit = true;
        if (this.componentContent.maxSubmitCount != null && this.hasStudentUsedAllSubmits()) {
          performSubmit = false;
        }
        if (performSubmit) {
          this.isSubmit = true;
          this.isCorrect = null;
          this.incrementSubmitCounter();
          if (this.componentContent.maxSubmitCount != null && this.hasStudentUsedAllSubmits()) {
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

          if (submitTriggeredBy === 'componentSubmitButton') {
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
          }
        } else {
          this.isSubmit = false;
        }
      }
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
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = buckets[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var bucket = _step7.value;

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
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.getAllFeedback()[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var bucketFeedback = _step8.value;

          if (bucketFeedback.bucketId === bucketId) {
            var _iteratorNormalCompletion9 = true;
            var _didIteratorError9 = false;
            var _iteratorError9 = undefined;

            try {
              for (var _iterator9 = bucketFeedback.choices[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
                var choiceFeedback = _step9.value;

                if (choiceFeedback.choiceId === choiceId) {
                  return choiceFeedback;
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
          }
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
     * The component has changed in the regular authoring view so we will save the project
     */

  }, {
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {

      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

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
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'authoringAddChoice',


    /**
     * Add a choice
     */
    value: function authoringAddChoice() {

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

  }, {
    key: 'authoringAddBucket',
    value: function authoringAddBucket() {

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

  }, {
    key: 'authoringMoveChoiceUp',
    value: function authoringMoveChoiceUp(index) {

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

  }, {
    key: 'authoringMoveChoiceDown',
    value: function authoringMoveChoiceDown(index) {

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

  }, {
    key: 'authoringDeleteChoice',
    value: function authoringDeleteChoice(index) {

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

  }, {
    key: 'authoringMoveBucketUp',
    value: function authoringMoveBucketUp(index) {

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

  }, {
    key: 'authoringMoveBucketDown',
    value: function authoringMoveBucketDown(index) {

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

  }, {
    key: 'authoringDeleteBucket',
    value: function authoringDeleteBucket(index) {

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
     * @param {string} id the choice id
     * @returns {object} the choice object from the authoring component content
     */

  }, {
    key: 'getChoiceById',
    value: function getChoiceById(id) {
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.componentContent.choices[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var choice = _step10.value;

          if (choice.id === id) {
            return choice;
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

    /**
     * Get the choice with the given text.
     * @param {string} text look for a choice with this text
     * @returns {object} the choice with the given text
     */

  }, {
    key: 'getChoiceByText',
    value: function getChoiceByText(text) {
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = this.componentContent.choices[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var choice = _step11.value;

          if (choice.value === text) {
            return choice;
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
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = buckets[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var bucket = _step12.value;

          if (bucket.id == id) {
            return bucket;
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
     * Add a choice to the feedback
     * @param choiceId the choice id
     */

  }, {
    key: 'addChoiceToFeedback',
    value: function addChoiceToFeedback(choiceId) {

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

  }, {
    key: 'addBucketToFeedback',
    value: function addBucketToFeedback(bucketId) {

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

  }, {
    key: 'createFeedbackObject',
    value: function createFeedbackObject(choiceId, feedback, isCorrect, position, incorrectPositionFeedback) {

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

  }, {
    key: 'removeChoiceFromFeedback',
    value: function removeChoiceFromFeedback(choiceId) {

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

  }, {
    key: 'removeBucketFromFeedback',
    value: function removeBucketFromFeedback(bucketId) {

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
     * The author has changed the rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {

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
     * @return {boolean} whether the component has been authored with a correct choice
     */

  }, {
    key: 'hasCorrectChoices',
    value: function hasCorrectChoices() {
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = this.componentContent.feedback[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var bucket = _step13.value;
          var _iteratorNormalCompletion14 = true;
          var _didIteratorError14 = false;
          var _iteratorError14 = undefined;

          try {
            for (var _iterator14 = bucket.choices[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
              var choice = _step14.value;

              if (choice.isCorrect) {
                return true;
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

      return false;
    }
  }, {
    key: 'clearFeedback',
    value: function clearFeedback() {
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.getChoices()[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var choice = _step15.value;

          choice.isCorrect = null;
          choice.isIncorrectPosition = null;
          choice.feedback = null;
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
    }

    /**
     * Check if a choice has a correct bucket
     * @param {string} choiceId the choice id
     * @return {boolean} whether the choice has a correct bucket
     */

  }, {
    key: 'isAuthorHasSpecifiedACorrectBucket',
    value: function isAuthorHasSpecifiedACorrectBucket(choiceId) {
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = this.getAllFeedback()[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var bucket = _step16.value;
          var _iteratorNormalCompletion17 = true;
          var _didIteratorError17 = false;
          var _iteratorError17 = undefined;

          try {
            for (var _iterator17 = bucket.choices[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
              var choice = _step17.value;

              if (choice.choiceId === choiceId) {
                if (choice.isCorrect) {
                  return true;
                }
              }
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
                if (choice.position != null) {
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
  }, {
    key: 'choiceIsInCorrectPosition',
    value: function choiceIsInCorrectPosition(choiceId) {
      // dummy. not called.
      // TODO: implement me.
      return false;
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'addConnectedComponent',
    value: function addConnectedComponent() {

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

  }, {
    key: 'deleteConnectedComponent',
    value: function deleteConnectedComponent(index) {

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

  }, {
    key: 'componentHasFeedback',
    value: function componentHasFeedback() {

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

  }, {
    key: 'authoringViewFeedbackChanged',
    value: function authoringViewFeedbackChanged() {

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

  }, {
    key: 'authoringViewIsCorrectClicked',
    value: function authoringViewIsCorrectClicked(feedback) {
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

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

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
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

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

  }, {
    key: 'chooseChoiceAsset',
    value: function chooseChoiceAsset(choice) {
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

  }, {
    key: 'chooseBucketAsset',
    value: function chooseBucketAsset(bucket) {
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

  }, {
    key: 'addTag',
    value: function addTag() {

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

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
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
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = componentStates[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var componentState = _step20.value;
          var _iteratorNormalCompletion21 = true;
          var _didIteratorError21 = false;
          var _iteratorError21 = undefined;

          try {
            for (var _iterator21 = componentState.studentData.buckets[Symbol.iterator](), _step21; !(_iteratorNormalCompletion21 = (_step21 = _iterator21.next()).done); _iteratorNormalCompletion21 = true) {
              var bucket = _step21.value;

              this.mergeBucket(mergedBuckets, bucket);
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
      var _iteratorNormalCompletion22 = true;
      var _didIteratorError22 = false;
      var _iteratorError22 = undefined;

      try {
        for (var _iterator22 = buckets[Symbol.iterator](), _step22; !(_iteratorNormalCompletion22 = (_step22 = _iterator22.next()).done); _iteratorNormalCompletion22 = true) {
          var tempBucket = _step22.value;

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
      var _iteratorNormalCompletion23 = true;
      var _didIteratorError23 = false;
      var _iteratorError23 = undefined;

      try {
        for (var _iterator23 = choices2[Symbol.iterator](), _step23; !(_iteratorNormalCompletion23 = (_step23 = _iterator23.next()).done); _iteratorNormalCompletion23 = true) {
          var choice2 = _step23.value;

          if (choices1Ids.indexOf(choice2.id) == -1) {
            choices1.push(choice2);
          }
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
      var _iteratorNormalCompletion24 = true;
      var _didIteratorError24 = false;
      var _iteratorError24 = undefined;

      try {
        for (var _iterator24 = objects[Symbol.iterator](), _step24; !(_iteratorNormalCompletion24 = (_step24 = _iterator24.next()).done); _iteratorNormalCompletion24 = true) {
          var object = _step24.value;

          ids.push(object.id);
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

      return ids;
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

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

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion25 = true;
          var _didIteratorError25 = false;
          var _iteratorError25 = undefined;

          try {
            for (var _iterator25 = components[Symbol.iterator](), _step25; !(_iteratorNormalCompletion25 = (_step25 = _iterator25.next()).done); _iteratorNormalCompletion25 = true) {
              var component = _step25.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
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

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
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

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
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

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }
  }]);

  return MatchController;
}(_componentController2.default);

MatchController.$inject = ['$filter', '$mdDialog', '$mdMedia', '$q', '$rootScope', '$scope', 'AnnotationService', 'ConfigService', 'dragulaService', 'MatchService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = MatchController;
//# sourceMappingURL=matchController.js.map

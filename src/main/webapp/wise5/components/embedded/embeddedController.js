'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

var _iframeResizer = require('iframe-resizer');

var _iframeResizer2 = _interopRequireDefault(_iframeResizer);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var EmbeddedController = function (_ComponentController) {
  _inherits(EmbeddedController, _ComponentController);

  function EmbeddedController($filter, $mdDialog, $q, $rootScope, $scope, $sce, $timeout, $window, AnnotationService, ConfigService, EmbeddedService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, EmbeddedController);

    var _this = _possibleConstructorReturn(this, (EmbeddedController.__proto__ || Object.getPrototypeOf(EmbeddedController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$sce = $sce;
    _this.$timeout = $timeout;
    _this.$window = $window;
    _this.EmbeddedService = EmbeddedService;
    _this.componentType = null;
    _this.url = null;
    _this.width = _this.componentContent.width ? _this.componentContent.width : '100%';
    _this.height = _this.componentContent.height ? _this.componentContent.height : '100%';
    _this.maxWidth = null;
    _this.maxHeight = null;
    _this.notebookConfig = _this.NotebookService.getNotebookConfig();
    _this.componentStateId = null;
    _this.embeddedApplicationIFrameId = '';
    _this.annotationsToSave = [];
    _this.embeddedApplicationIFrameId = 'componentApp_' + _this.componentId;
    _this.componentType = _this.componentContent.type;

    if (_this.isGradingMode() || _this.isGradingRevisionMode()) {
      var componentState = _this.$scope.componentState;
      if (componentState != null) {
        _this.embeddedApplicationIFrameId = 'componentApp_' + componentState.id;
        if (_this.isGradingRevisionMode()) {
          _this.embeddedApplicationIFrameId = 'componentApp_gradingRevision_' + componentState.id;
        }
      }
    }

    _this.setURL(_this.componentContent.url);

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected component that has changed
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {
      var message = {
        messageType: 'handleConnectedComponentStudentDataChanged',
        componentState: componentState
      };
      _this.sendMessageToApplication(message);
    };

    _this.initializeScopeGetComponentState(_this.$scope, 'embeddedController');

    /*
     * Listen for the siblingComponentStudentDataChanged event which occurs
     * when the student data has changed for another component in this step.
     */
    _this.$scope.$on('siblingComponentStudentDataChanged', function (event, args) {
      if (_this.isEventTargetThisComponent(args)) {
        var message = {
          messageType: 'siblingComponentStudentDataChanged',
          componentState: args.componentState
        };
        _this.sendMessageToApplication(message);
      }
    });

    _this.initializeMessageEventListener();
    _this.broadcastDoneRenderingComponent();
    return _this;
  }

  _createClass(EmbeddedController, [{
    key: 'cleanupBeforeExiting',
    value: function cleanupBeforeExiting() {
      this.$window.removeEventListener('message', this.messageEventListener);
    }
  }, {
    key: 'initializeMessageEventListener',
    value: function initializeMessageEventListener() {
      var _this2 = this;

      this.messageEventListener = function (messageEvent) {
        var messageEventData = messageEvent.data;
        if (messageEventData.messageType === 'event') {
          _this2.handleEventMessage(messageEventData);
        } else if (messageEventData.messageType === 'studentWork') {
          _this2.handleStudentWorkMessage(messageEventData);
        } else if (messageEventData.messageType === 'applicationInitialized') {
          _this2.handleApplicationInitializedMessage(messageEventData);
        } else if (messageEventData.messageType === 'componentDirty') {
          _this2.handleComponentDirtyMessage(messageEventData);
        } else if (messageEventData.messageType === 'componentSubmitDirty') {
          _this2.handleComponentSubmitDirtyMessage(messageEventData);
        } else if (messageEventData.messageType === 'studentDataChanged') {
          _this2.handleStudentDataChangedMessage(messageEventData);
        } else if (messageEventData.messageType === 'getStudentWork') {
          _this2.handleGetStudentWorkMessage(messageEventData);
        } else if (messageEventData.messageType === 'getLatestStudentWork') {
          _this2.handleGetLatestStudentWorkMessage(messageEventData);
        } else if (messageEventData.messageType === 'getParameters') {
          _this2.handleGetParametersMessage(messageEventData);
        } else if (messageEventData.messageType === 'getProjectPath') {
          _this2.handleGetProjectPathMessage(messageEventData);
        } else if (messageEventData.messageType === 'getLatestAnnotations') {
          _this2.handleGetLatestAnnotationsMessage(messageEventData);
        }
      };
    }
  }, {
    key: 'handleEventMessage',
    value: function handleEventMessage(messageEventData) {
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var componentType = this.componentType;
      var category = messageEventData.eventCategory;
      var event = messageEventData.event;
      var eventData = messageEventData.eventData;
      this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
    }
  }, {
    key: 'handleStudentWorkMessage',
    value: function handleStudentWorkMessage(messageEventData) {
      if (messageEventData.id != null) {
        //the model wants to update/overwrite an existing component state
        this.componentStateId = messageEventData.id;
      } else {
        // the model wants to create a new component state
        this.componentStateId = null;
      }

      if (messageEventData.isSubmit) {
        this.isSubmit = messageEventData.isSubmit;
      }

      this.isDirty = true;
      this.setStudentData(messageEventData.studentData);
      if (messageEventData.annotations != null) {
        this.setAnnotations(messageEventData.annotations);
      }
      this.studentDataChanged();

      // tell the parent node that this component wants to save
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'handleApplicationInitializedMessage',
    value: function handleApplicationInitializedMessage(messageEventData) {
      this.sendLatestWorkToApplication();
      this.processLatestStudentWork();
      $('#' + this.embeddedApplicationIFrameId).iFrameResize({ scrolling: true });
    }
  }, {
    key: 'handleComponentDirtyMessage',
    value: function handleComponentDirtyMessage(messageEventData) {
      this.isDirty = messageEventData.isDirty;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: isDirty });
    }
  }, {
    key: 'handleComponentSubmitDirtyMessage',
    value: function handleComponentSubmitDirtyMessage(messageEventData) {
      this.isSubmitDirty = messageEventData.isDirty;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: isDirty });
    }
  }, {
    key: 'handleStudentDataChangedMessage',
    value: function handleStudentDataChangedMessage(messageEventData) {
      this.setStudentData(messageEventData.studentData);
      if (messageEventData.annotations != null) {
        this.setAnnotations(messageEventData.annotations);
      }
      this.studentDataChanged();
    }
  }, {
    key: 'handleGetStudentWorkMessage',
    value: function handleGetStudentWorkMessage(messageEventData) {
      var getStudentWorkParams = messageEventData.getStudentWorkParams;
      var studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);
      var message = studentWork;
      message.messageType = 'studentWork';
      message.getStudentWorkParams = getStudentWorkParams;
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'handleGetLatestStudentWorkMessage',
    value: function handleGetLatestStudentWorkMessage(messageEventData) {
      var latestComponentState = this.getLatestStudentWork();
      var message = {
        messageType: 'latestStudentWork',
        latestStudentWork: latestComponentState
      };
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'handleGetParametersMessage',
    value: function handleGetParametersMessage(messageEventData) {
      var parameters = {};
      if (this.componentContent.parameters != null) {
        parameters = this.UtilService.makeCopyOfJSONObject(this.componentContent.parameters);
      }
      parameters.nodeId = this.nodeId;
      parameters.componentId = this.componentId;
      var message = {
        messageType: 'parameters',
        parameters: parameters
      };
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'handleGetProjectPathMessage',
    value: function handleGetProjectPathMessage(messageEventData) {
      var message = {
        messageType: 'projectPath',
        projectPath: this.ConfigService.getConfigParam('projectBaseURL'),
        projectAssetsPath: this.ConfigService.getConfigParam('projectBaseURL') + 'assets'
      };
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'handleGetLatestAnnotationsMessage',
    value: function handleGetLatestAnnotationsMessage(messageEventData) {
      var latestScoreAnnotation = this.AnnotationService.getLatestScoreAnnotation(this.nodeId, this.componentId, this.ConfigService.getWorkgroupId(), 'any');
      var latestCommentAnnotation = this.AnnotationService.getLatestCommentAnnotation(this.nodeId, this.componentId, this.ConfigService.getWorkgroupId(), 'any');
      var message = {
        messageType: 'latestAnnotations',
        latestScoreAnnotation: latestScoreAnnotation,
        latestCommentAnnotation: latestCommentAnnotation
      };
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      var _this3 = this;

      this.$scope.$on('studentWorkSavedToServer', function (event, args) {
        var componentState = args.studentWork;
        if (componentState != null) {
          if (componentState.componentId === _this3.componentId) {
            _this3.isDirty = false;
            _this3.$scope.$emit('componentDirty', { componentId: _this3.componentId, isDirty: false });
            _this3.$scope.embeddedController.componentState = null;
            var isAutoSave = componentState.isAutoSave;
            var isSubmit = componentState.isSubmit;
            var serverSaveTime = componentState.serverSaveTime;
            var clientSaveTime = _this3.ConfigService.convertToClientTimestamp(serverSaveTime);
            if (isSubmit) {
              _this3.setSubmittedMessage(clientSaveTime);
              _this3.submit();
              _this3.isSubmitDirty = false;
              _this3.$scope.$emit('componentSubmitDirty', { componentId: _this3.componentId, isDirty: false });
            } else if (isAutoSave) {
              _this3.setAutoSavedMessage(clientSaveTime);
            } else {
              _this3.setSavedMessage(clientSaveTime);
            }
            var message = {
              messageType: 'componentStateSaved',
              componentState: componentState
            };
            _this3.sendMessageToApplication(message);
          }
        }
      });
    }
  }, {
    key: 'iframeLoaded',
    value: function iframeLoaded(contentLocation) {
      window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.addEventListener('message', this.messageEventListener);
    }
  }, {
    key: 'setURL',
    value: function setURL(url) {
      this.url = this.$sce.trustAsResourceUrl(url);
    }

    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */

  }, {
    key: 'createComponentState',
    value: function createComponentState(action) {
      var componentState = this.NodeService.createNewComponentState();
      componentState.studentData = this.studentData;
      componentState.componentType = 'Embedded';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      if (this.componentStateId != null) {
        componentState.id = this.componentStateId;
      }
      if (this.isSubmit) {
        componentState.isSubmit = this.isSubmit;
        this.isSubmit = false;
      }
      if (this.annotationsToSave.length !== 0) {
        componentState.annotations = this.annotationsToSave;
      }
      if (action === 'save') {
        this.clearAnnotationsToSave();
      }
      var deferred = this.$q.defer();
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);
      return deferred.promise;
    }
  }, {
    key: 'clearAnnotationsToSave',
    value: function clearAnnotationsToSave() {
      this.annotationsToSave = [];
    }
  }, {
    key: 'sendLatestWorkToApplication',
    value: function sendLatestWorkToApplication() {
      var componentState = this.$scope.componentState;
      if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        componentState = this.handleConnectedComponents();
      }
      var message = {
        messageType: 'componentState',
        componentState: componentState
      };
      this.sendMessageToApplication(message);
    }
  }, {
    key: 'sendMessageToApplication',
    value: function sendMessageToApplication(message) {
      window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.postMessage(message, '*');
    }

    /**
     * Snip the model by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snipModel',
    value: function snipModel($event) {
      var _this4 = this;

      var iframe = $('#' + this.embeddedApplicationIFrameId);
      if (iframe != null && iframe.length > 0) {
        var modelElement = iframe.contents().find('html');
        if (modelElement != null && modelElement.length > 0) {
          modelElement = modelElement[0];
          (0, _html2canvas2.default)(modelElement).then(function (canvas) {
            var base64Image = canvas.toDataURL('image/png');
            var imageObject = _this4.UtilService.getImageObjectFromBase64String(base64Image);
            _this4.NotebookService.addNote($event, imageObject);
          });
        }
      }
    }
  }, {
    key: 'getLatestStudentWork',
    value: function getLatestStudentWork() {
      return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
    }

    /**
     * Get the student work from the specified components/nodes
     * @param params The params for getting the student work. The possible
     * values to request are
     * getLatestStudentWorkFromThisComponent
     * getAllStudentWorkFromThisComponent
     * getLatestStudentWorkFromThisNode
     * getAllStudentWorkFromThisNode
     * getLatestStudentWorkFromOtherComponents
     * getAllStudentWorkFromOtherComponents
     * If getLatestStudentWorkFromOtherComponents or getAllStudentWorkFromOtherComponents
     * are requested, the otherComponents param must be provided. otherComponents
     * should be an array of objects. The objects should contain a nodeId and
     * componentId.
     * @return an object containing other objects that contain work from the
     * specified components/nodes
     */

  }, {
    key: 'getStudentWork',
    value: function getStudentWork(params) {
      var studentWork = {};
      if (params != null) {
        if (params.getLatestStudentWorkFromThisComponent) {
          studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
        }
        if (params.getAllStudentWorkFromThisComponent) {
          studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        }
        if (params.getLatestStudentWorkFromThisNode) {
          studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
        }
        if (params.getAllStudentWorkFromThisNode) {
          studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(this.nodeId);
        }
        if (params.getLatestStudentWorkFromOtherComponents) {
          studentWork.latestStudentWorkFromOtherComponents = this.getLatestStudentWorkFromOtherComponents(params.otherComponents);
        }
        if (params.getAllStudentWorkFromOtherComponents) {
          studentWork.allStudentWorkFromOtherComponents = this.getAllStudentWorkFromOtherComponents(params.otherComponents);
        }
      }
      return studentWork;
    }
  }, {
    key: 'getLatestStudentWorkFromOtherComponents',
    value: function getLatestStudentWorkFromOtherComponents(otherComponents) {
      var latestStudentWorkFromOtherComponents = [];
      if (otherComponents != null) {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = otherComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var otherComponent = _step.value;

            var tempNodeId = otherComponent.nodeId;
            var tempComponentId = otherComponent.componentId;
            if (tempNodeId != null && tempComponentId != null) {
              var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);
              if (tempComponentState != null) {
                latestStudentWorkFromOtherComponents.push(tempComponentState);
              }
            }
          }
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
      }
      return latestStudentWorkFromOtherComponents;
    }
  }, {
    key: 'getAllStudentWorkFromOtherComponents',
    value: function getAllStudentWorkFromOtherComponents(otherComponents) {
      var allStudentWorkFromOtherComponents = [];
      if (otherComponents != null) {
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = otherComponents[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var otherComponent = _step2.value;

            if (otherComponent != null) {
              var tempNodeId = otherComponent.nodeId;
              var tempComponentId = otherComponent.componentId;
              if (tempNodeId != null && tempComponentId != null) {
                var tempComponentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);
                if (tempComponentStates != null && tempComponentStates.length > 0) {
                  allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents.concat(tempComponentStates);
                }
              }
            }
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
      }
      return allStudentWorkFromOtherComponents;
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {
      var mergedComponentState = this.$scope.componentState;
      var firstTime = true;
      if (mergedComponentState == null) {
        mergedComponentState = this.NodeService.createNewComponentState();
        mergedComponentState.studentData = {};
      } else {
        firstTime = false;
      }
      var connectedComponents = this.componentContent.connectedComponents;
      if (connectedComponents != null) {
        var componentStates = [];
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = connectedComponents[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var connectedComponent = _step3.value;

            var type = connectedComponent.type;
            if (type === 'showWork') {
              this.handleShowWorkConnectedComponent(connectedComponent, componentStates);
            } else if (type === 'importWork' || type == null) {
              mergedComponentState = this.handleImportWorkConnectedComponent(connectedComponent, mergedComponentState, firstTime);
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

        if (mergedComponentState != null) {
          this.setStudentWork(mergedComponentState);
          this.studentDataChanged();
        }
      }
      return mergedComponentState;
    }
  }, {
    key: 'handleShowWorkConnectedComponent',
    value: function handleShowWorkConnectedComponent(connectedComponent, componentStates) {
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
      if (componentState != null) {
        componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
      }
      this.isDisabled = true;
    }
  }, {
    key: 'handleImportWorkConnectedComponent',
    value: function handleImportWorkConnectedComponent(connectedComponent, mergedComponentState, firstTime) {
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
      if (connectedComponentState != null) {
        var fields = connectedComponent.fields;
        var when = connectedComponent.when;
        if (when == null || when === 'firstTime' && firstTime) {
          mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
        }
      }
      return mergedComponentState;
    }

    /**
     * Merge a new component state into a base component state.
     * @param toComponentState The component state we will be merging into.
     * @param fromComponentState The component state we will be merging from.
     * @param mergeFields The fields to merge.
     * @param firstTime Whether this is the first time the baseComponentState is
     * being merged into.
     */

  }, {
    key: 'mergeComponentState',
    value: function mergeComponentState(toComponentState, fromComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {
        // there are no merge fields specified so we will get all of the fields
        if (fromComponentState.componentType === 'Embedded') {
          toComponentState.studentData = this.UtilService.makeCopyOfJSONObject(fromComponentState.studentData);
        }
      } else {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = mergeFields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var mergeField = _step4.value;

            this.mergeField(toComponentState, fromComponentState, mergeField, firstTime);
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
      }
      return toComponentState;
    }
  }, {
    key: 'mergeField',
    value: function mergeField(toComponentState, fromComponentState, _mergeField, firstTime) {
      var name = _mergeField.name;
      var when = _mergeField.when;
      var action = _mergeField.action;
      if (when == 'firstTime' && firstTime == true) {
        if (action == 'write') {
          toComponentState.studentData[name] = fromComponentState.studentData[name];
        } else if (action == 'read') {
          // TODO
        }
      } else if (when == 'always') {
        if (action == 'write') {
          toComponentState.studentData[name] = fromComponentState.studentData[name];
        } else if (action == 'read') {
          // TODO
        }
      }
    }
  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      this.studentData = componentState.studentData;
    }
  }, {
    key: 'setStudentData',
    value: function setStudentData(studentData) {
      this.studentData = studentData;
    }
  }, {
    key: 'setAnnotations',
    value: function setAnnotations(annotations) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = annotations[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var annotation = _step5.value;

          if (this.isAnnotationValid(annotation)) {
            if (annotation.type === 'autoScore') {
              var scoreAnnotation = this.createAutoScoreAnnotation(annotation.data);
              this.updateLatestScoreAnnotation(scoreAnnotation);
              this.addToAnnotationsToSave(scoreAnnotation);
            } else if (annotation.type === 'autoComment') {
              var commentAnnotation = this.createAutoCommentAnnotation(annotation.data);
              this.updateLatestCommentAnnotation(commentAnnotation);
              this.addToAnnotationsToSave(commentAnnotation);
            }
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
  }, {
    key: 'isAnnotationValid',
    value: function isAnnotationValid(annotation) {
      return annotation.type != null && annotation.data != null && annotation.data.value != null;
    }
  }, {
    key: 'addToAnnotationsToSave',
    value: function addToAnnotationsToSave(annotation) {
      this.annotationsToSave.push(annotation);
    }
  }]);

  return EmbeddedController;
}(_componentController2.default);

EmbeddedController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'EmbeddedService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedController;
//# sourceMappingURL=embeddedController.js.map

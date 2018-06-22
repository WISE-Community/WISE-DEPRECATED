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

    // the width of the iframe (optional)
    _this.width = null;

    // the height of the iframe (optional)
    _this.height = null;

    // the max width of the iframe
    _this.maxWidth = null;

    // the max height of the iframe
    _this.maxHeight = null;

    _this.notebookConfig = _this.NotebookService.getNotebookConfig();

    _this.latestAnnotations = null;
    _this.componentStateId = null;
    _this.embeddedApplicationIFrameId = '';

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    _this.embeddedApplicationIFrameId = 'componentApp_' + _this.componentId;
    _this.componentType = _this.componentContent.type;

    if (_this.mode === 'student') {
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      var componentState = _this.$scope.componentState;
      if (componentState != null) {
        // create a unique id for the application iframe using this component state
        _this.embeddedApplicationIFrameId = 'componentApp_' + componentState.id;
        if (_this.mode === 'gradingRevision') {
          _this.embeddedApplicationIFrameId = 'componentApp_gradingRevision_' + componentState.id;
        }
      }

      if (_this.mode === 'grading') {
        _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
      }
    } else if (_this.mode === 'onlyShowWork') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
    }

    if (_this.componentContent != null) {
      _this.setURL(_this.componentContent.url);
    }

    _this.width = _this.componentContent.width ? _this.componentContent.width : '100%';
    _this.height = _this.componentContent.height ? _this.componentContent.height : '100%';

    if (_this.$scope.$parent.nodeController != null) {
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {
      var message = {};
      message.messageType = 'handleConnectedComponentStudentDataChanged';
      message.componentState = componentState;
      _this.sendMessageToApplication(message);
    };

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
        if (this.$scope.embeddedController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.embeddedController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        this.$scope.embeddedController.createComponentState(action).then(function (componentState) {
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
    _this.$scope.$on('exitNode', angular.bind(_this, function (event, args) {
      this.$window.removeEventListener('message', this.messageEventListener);
    }));

    /*
     * Listen for the siblingComponentStudentDataChanged event which occurs
     * when the student data has changed for another component in this step
     */
    _this.$scope.$on('siblingComponentStudentDataChanged', function (event, args) {
      if (_this.nodeId == args.nodeId && _this.componentId != args.componentId) {
        var message = {};
        message.messageType = 'siblingComponentStudentDataChanged';
        message.componentState = args.componentState;
        _this.sendMessageToApplication(message);
      }
    });

    _this.messageEventListener = angular.bind(_this, function (messageEvent) {
      var messageEventData = messageEvent.data;
      if (messageEventData.messageType === 'event') {
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var componentType = this.componentType;
        var category = messageEventData.eventCategory;
        var event = messageEventData.event;
        var eventData = messageEventData.eventData;
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
      } else if (messageEventData.messageType === 'studentWork') {
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
        this.studentDataChanged();

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
      } else if (messageEventData.messageType === 'applicationInitialized') {
        this.sendLatestWorkToApplication();
        this.processLatestSubmit();

        // activate iframe-resizer on the embedded app's iframe
        $('#' + this.embeddedApplicationIFrameId).iFrameResize({ scrolling: true });
      } else if (messageEventData.messageType === 'componentDirty') {
        var _isDirty = messageEventData.isDirty;
        this.isDirty = _isDirty;
        this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: _isDirty });
      } else if (messageEventData.messageType === 'componentSubmitDirty') {
        var isSubmitDirty = messageEventData.isDirty;
        this.isSubmitDirty = isSubmitDirty;
        this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: isDirty });
      } else if (messageEventData.messageType === 'studentDataChanged') {
        this.setStudentData(messageEventData.studentData);
        this.studentDataChanged();
      } else if (messageEventData.messageType === 'getStudentWork') {
        var getStudentWorkParams = messageEventData.getStudentWorkParams;
        var studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);
        var message = studentWork;
        message.messageType = 'studentWork';
        message.getStudentWorkParams = getStudentWorkParams;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getLatestStudentWork') {
        var latestComponentState = this.getLatestStudentWork();
        var message = {};
        message.messageType = 'latestStudentWork';
        message.latestStudentWork = latestComponentState;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getParameters') {
        var message = {};
        message.messageType = 'parameters';
        var parameters = {};
        if (this.componentContent.parameters != null) {
          parameters = this.UtilService.makeCopyOfJSONObject(this.componentContent.parameters);
        }
        parameters.nodeId = this.nodeId;
        parameters.componentId = this.componentId;
        message.parameters = parameters;
        this.sendMessageToApplication(message);
      }
    });

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(EmbeddedController, [{
    key: 'registerStudentWorkSavedToServerListener',
    value: function registerStudentWorkSavedToServerListener() {
      var _this2 = this;

      this.$scope.$on('studentWorkSavedToServer', function (event, args) {
        var componentState = args.studentWork;
        if (componentState != null) {
          if (componentState.componentId === _this2.componentId) {
            // set isDirty to false because the component state was just saved and notify node
            _this2.isDirty = false;
            _this2.$scope.$emit('componentDirty', { componentId: _this2.componentId, isDirty: false });
            _this2.$scope.embeddedController.componentState = null;

            var isAutoSave = componentState.isAutoSave;
            var isSubmit = componentState.isSubmit;
            var serverSaveTime = componentState.serverSaveTime;
            var clientSaveTime = _this2.ConfigService.convertToClientTimestamp(serverSaveTime);

            if (isSubmit) {
              _this2.setSaveMessage(_this2.$translate('SUBMITTED'), clientSaveTime);
              _this2.submit();
              _this2.isSubmitDirty = false;
              _this2.$scope.$emit('componentSubmitDirty', { componentId: _this2.componentId, isDirty: false });
            } else if (isAutoSave) {
              _this2.setSaveMessage(_this2.$translate('AUTO_SAVED'), clientSaveTime);
            } else {
              _this2.setSaveMessage(_this2.$translate('SAVED'), clientSaveTime);
            }

            var message = {};
            message.messageType = 'componentStateSaved';
            message.componentState = componentState;
            _this2.sendMessageToApplication(message);
          }
        }
      });
    }
  }, {
    key: 'iframeLoaded',
    value: function iframeLoaded(contentLocation) {
      window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.addEventListener('message', this.messageEventListener);
    }

    /**
     * Check if latest component state is a submission and if not, set isSubmitDirty to true
     */

  }, {
    key: 'processLatestSubmit',
    value: function processLatestSubmit() {
      var latestState = this.$scope.componentState;
      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'setURL',
    value: function setURL(url) {
      if (url != null) {
        this.url = this.$sce.trustAsResourceUrl(url);
      }
    }
  }, {
    key: 'submit',
    value: function submit() {
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @return the componentState after it has been populated
     */
    value: function createComponentState(action) {
      var componentState = this.NodeService.createNewComponentState();

      if (this.componentStateId != null) {
        componentState.id = this.componentStateId;
      }

      if (this.isSubmit) {
        componentState.isSubmit = this.isSubmit;

        /*
         * reset the isSubmit value so that the next component state
         * doesn't maintain the same value
         */
        this.isSubmit = false;
      }

      componentState.studentData = this.studentData;
      componentState.componentType = 'Embedded';
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
  }, {
    key: 'snipModel',


    /**
     * Snip the model by converting it to an image
     * @param $event the click event
     */
    value: function snipModel($event) {
      var _this3 = this;

      var iframe = $('#' + this.embeddedApplicationIFrameId);
      if (iframe != null && iframe.length > 0) {
        var modelElement = iframe.contents().find('html');
        if (modelElement != null && modelElement.length > 0) {
          modelElement = modelElement[0];

          // convert the model element to a canvas element
          (0, _html2canvas2.default)(modelElement).then(function (canvas) {
            var img_b64 = canvas.toDataURL('image/png');
            var imageObject = _this3.UtilService.getImageObjectFromBase64String(img_b64);
            _this3.NotebookService.addNote($event, imageObject);
          });
        }
      }
    }

    /**
     * Register the the listener that will listen for the exit event
     * so that we can perform saving before exiting.
     */

  }, {
    key: 'registerExitListener',
    value: function registerExitListener() {
      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      this.exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
    }
  }, {
    key: 'submit',
    value: function submit(submitTriggeredBy) {
      this.isSubmit = true;
      this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
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

      if (params != null && params.getLatestStudentWorkFromThisComponent) {
        studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
      }

      if (params != null && params.getAllStudentWorkFromThisComponent) {
        studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
      }

      if (params != null && params.getLatestStudentWorkFromThisNode) {
        studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
      }

      if (params != null && params.getAllStudentWorkFromThisNode) {
        studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(this.nodeId);
      }

      if (params != null && params.getLatestStudentWorkFromOtherComponents) {
        // an array of objects that contain a nodeId and component Id
        var otherComponents = params.otherComponents;
        var latestStudentWorkFromOtherComponents = [];
        if (otherComponents != null) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = otherComponents[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var otherComponent = _step.value;

              if (otherComponent != null) {
                var tempNodeId = otherComponent.nodeId;
                var tempComponentId = otherComponent.componentId;

                if (tempNodeId != null && tempComponentId != null) {
                  var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);
                  if (tempComponentState != null) {
                    latestStudentWorkFromOtherComponents.push(tempComponentState);
                  }
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
        studentWork.latestStudentWorkFromOtherComponents = latestStudentWorkFromOtherComponents;
      }

      if (params != null && params.getAllStudentWorkFromOtherComponents) {
        var otherComponents = params.otherComponents;
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
        studentWork.allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents;
      }
      return studentWork;
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

            if (connectedComponent != null) {
              var nodeId = connectedComponent.nodeId;
              var componentId = connectedComponent.componentId;
              var type = connectedComponent.type;
              var mergeFields = connectedComponent.mergeFields;
              if (type == 'showWork') {
                var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (componentState != null) {
                  componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
                }
                // we are showing work so we will not allow the student to edit it
                this.isDisabled = true;
              } else if (type == 'importWork' || type == null) {
                var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                if (connectedComponentState != null) {
                  var fields = connectedComponent.fields;
                  mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
                }
              }
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

    /**
     * Merge a new component state into a base component state.
     * @param baseComponentState The component state we will be merging into.
     * @param newComponentState The component state we will be merging from.
     * @param mergeFields The fields to merge.
     * @param firstTime Whether this is the first time the baseComponentState is
     * being merged into.
     */

  }, {
    key: 'mergeComponentState',
    value: function mergeComponentState(baseComponentState, newComponentState, mergeFields, firstTime) {
      if (mergeFields == null) {
        if (newComponentState.componentType == 'Embedded') {
          // there are no merge fields specified so we will get all of the fields
          baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(newComponentState.studentData);
        }
      } else {
        // we will merge specific fields
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = mergeFields[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var mergeField = _step4.value;

            var name = mergeField.name;
            var when = mergeField.when;
            var action = mergeField.action;
            if (when == 'firstTime' && firstTime == true) {
              if (action == 'write') {
                baseComponentState.studentData[name] = newComponentState.studentData[name];
              } else if (action == 'read') {
                // TODO
              }
            } else if (when == 'always') {
              if (action == 'write') {
                baseComponentState.studentData[name] = newComponentState.studentData[name];
              } else if (action == 'read') {
                // TODO
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
      }
      return baseComponentState;
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      this.studentData = componentState.studentData;
    }
  }, {
    key: 'setStudentData',


    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */
    value: function setStudentData(studentData) {
      this.studentData = studentData;
    }
  }]);

  return EmbeddedController;
}(_componentController2.default);

EmbeddedController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$sce', '$timeout', '$window', 'AnnotationService', 'ConfigService', 'EmbeddedService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = EmbeddedController;
//# sourceMappingURL=embeddedController.js.map

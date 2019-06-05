'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('svg.js');

require('svg.draggable.js');

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConceptMapController = function (_ComponentController) {
  _inherits(ConceptMapController, _ComponentController);

  function ConceptMapController($anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConceptMapService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, ConceptMapController);

    var _this = _possibleConstructorReturn(this, (ConceptMapController.__proto__ || Object.getPrototypeOf(ConceptMapController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$anchorScroll = $anchorScroll;
    _this.$location = $location;
    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.ConceptMapService = ConceptMapService;

    _this.width = 800;
    _this.height = 600;
    _this.availableNodes = [];
    _this.availableLinks = [];
    _this.nodes = [];
    _this.links = [];
    _this.displayLinkTypeChooser = false;
    _this.displayLinkTypeChooserModalOverlay = false;
    _this.selectedLinkType = null;
    _this.initializedDisplayLinkTypeChooserModalOverlay = false;
    _this.modalWidth = 800;
    _this.modalHeight = 600;
    _this.autoFeedbackString = '';

    /*
     * used to remember the node the student has started dragging to create
     * so that we know what node to create once they let go off the mouse
     * on the svg element
     */
    _this.selectedNode = null;

    /*
     * used to remember the offset of the mouse relative to the upper left
     * of the node image the student started dragging to create a new node
     * instance
     */
    _this.tempOffsetX = 0;
    _this.tempOffsetY = 0;

    _this.setBackgroundImage(_this.componentContent.background, _this.componentContent.stretchBackground);
    _this.setIdsWithNodeIdComponentId();

    _this.initialize();

    if (_this.isStudentMode()) {
      _this.availableNodes = _this.componentContent.nodes;
      _this.availableLinks = _this.componentContent.links;
    } else if (_this.isGradingMode() || _this.isGradingRevisionMode()) {
      var componentState = _this.$scope.componentState;
      if (componentState) {
        if (_this.mode === 'gradingRevision') {
          _this.setIdsWithNodeIdComponentIdWorkgroupIdComponentStateIdPrefix(componentState);
        } else {
          _this.setIdsWithNodeIdComponentIdWorkgroupIdComponentStateId(componentState);
        }
      } else {
        _this.setIdsWithNodeIdComponentIdWorkgroupId();
      }
    } else if (_this.isOnlyShowWorkMode()) {
      var _componentState = _this.$scope.componentState;
      if (_componentState == null) {
        _this.setSVGId(_this.nodeId, _this.componentId, _this.workgroupId, 'onlyShowWork_');
      } else {
        _this.setSVGId(_this.nodeId, _this.componentId, _this.workgroupId, _this.componentStateId, 'onlyShowWork_');
      }
    }

    /*
     * Call the initializeSVG() after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    _this.$timeout(angular.bind(_this, _this.initializeSVG));

    _this.initializeScopeGetComponentState(_this.$scope, 'conceptMapController');
    return _this;
  }

  _createClass(ConceptMapController, [{
    key: 'initialize',
    value: function initialize() {
      this.initializeWidth();
      this.initializeHeight();
      this.initializeShowNodeLabels();
    }
  }, {
    key: 'initializeWidth',
    value: function initializeWidth() {
      if (this.componentContent.width != null) {
        this.width = this.componentContent.width;
      }
    }
  }, {
    key: 'initializeHeight',
    value: function initializeHeight() {
      if (this.componentContent.height != null) {
        this.height = this.componentContent.height;
      }
    }
  }, {
    key: 'initializeShowNodeLabels',
    value: function initializeShowNodeLabels() {
      if (this.componentContent.showNodeLabels == null) {
        this.componentContent.showNodeLabels = true;
      }
    }
  }, {
    key: 'setIdsWithNodeIdComponentId',
    value: function setIdsWithNodeIdComponentId() {
      this.setSVGId(this.nodeId, this.componentId);
      this.setConceptMapContainerId(this.nodeId, this.componentId);
      this.setSelectNodeBarId(this.nodeId, this.componentId);
      this.setFeedbackContainerId(this.nodeId, this.componentId);
    }
  }, {
    key: 'setIdsWithNodeIdComponentIdWorkgroupId',
    value: function setIdsWithNodeIdComponentIdWorkgroupId() {
      this.setSVGId(this.nodeId, this.componentId, this.workgroupId);
      this.setConceptMapContainerId(this.nodeId, this.componentId, this.workgroupId);
      this.setSelectNodeBarId(this.nodeId, this.componentId, this.workgroupId);
      this.setFeedbackContainerId(this.nodeId, this.componentId, this.workgroupId);
    }
  }, {
    key: 'setIdsWithNodeIdComponentIdWorkgroupIdComponentStateId',
    value: function setIdsWithNodeIdComponentIdWorkgroupIdComponentStateId(componentState) {
      this.setSVGId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
      this.setConceptMapContainerId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
      this.setSelectNodeBarId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
      this.setFeedbackContainerId(this.nodeId, this.componentId, this.workgroupId, componentState.id);
    }
  }, {
    key: 'setIdsWithNodeIdComponentIdWorkgroupIdComponentStateIdPrefix',
    value: function setIdsWithNodeIdComponentIdWorkgroupIdComponentStateIdPrefix(componentState) {
      this.setSVGId(this.nodeId, this.componentId, this.workgroupId, componentState.id, 'gradingRevision_');
      this.setConceptMapContainerId(this.nodeId, this.componentId, this.workgroupId, componentState.id, 'gradingRevision_');
      this.setSelectNodeBarId(this.nodeId, this.componentId, this.workgroupId, componentState.id, 'gradingRevision_');
      this.setFeedbackContainerId(this.nodeId, this.componentId, this.workgroupId, componentState.id, 'gradingRevision_');
    }
  }, {
    key: 'setSVGId',
    value: function setSVGId(nodeId, componentId, workgroupId, componentStateId) {
      var prefix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

      if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
        this.svgId = 'svg_' + prefix + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
      } else if (nodeId != null && componentId != null && workgroupId != null) {
        this.svgId = 'svg_' + nodeId + '_' + componentId + '_' + workgroupId;
      } else if (nodeId != null && componentId != null) {
        this.svgId = 'svg_' + nodeId + '_' + componentId;
      }
    }
  }, {
    key: 'setConceptMapContainerId',
    value: function setConceptMapContainerId(nodeId, componentId, workgroupId, componentStateId) {
      var prefix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

      if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
        this.conceptMapContainerId = 'conceptMapContainer_' + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
      } else if (nodeId != null && componentId != null && workgroupId != null) {
        this.conceptMapContainerId = 'conceptMapContainer_' + nodeId + '_' + componentId + '_' + workgroupId;
      } else if (nodeId != null && componentId != null) {
        this.conceptMapContainerId = 'conceptMapContainer_' + nodeId + '_' + componentId;
      }
    }
  }, {
    key: 'setSelectNodeBarId',
    value: function setSelectNodeBarId(nodeId, componentId, workgroupId, componentStateId) {
      var prefix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

      if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
        this.selectNodeBarId = 'selectNodeBar_' + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
      } else if (nodeId != null && componentId != null && workgroupId != null) {
        this.selectNodeBarId = 'selectNodeBar_' + nodeId + '_' + componentId + '_' + workgroupId;
      } else if (nodeId != null && componentId != null) {
        this.selectNodeBarId = 'selectNodeBar_' + nodeId + '_' + componentId;
      }
    }
  }, {
    key: 'setFeedbackContainerId',
    value: function setFeedbackContainerId(nodeId, componentId, workgroupId, componentStateId) {
      var prefix = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : '';

      if (nodeId != null && componentId != null && workgroupId != null && componentStateId != null) {
        this.feedbackContainerId = 'feedbackContainer_' + nodeId + '_' + componentId + '_' + workgroupId + '_' + componentStateId;
      } else if (nodeId != null && componentId != null && workgroupId != null) {
        this.feedbackContainerId = 'feedbackContainer_' + nodeId + '_' + componentId + '_' + workgroupId;
      } else if (nodeId != null && componentId != null) {
        this.feedbackContainerId = 'feedbackContainer_' + nodeId + '_' + componentId;
      }
    }
  }, {
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }
  }, {
    key: 'initializeSVG',
    value: function initializeSVG() {
      this.setupSVG();
      var componentState = this.$scope.componentState;

      if (this.isStudentMode()) {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (this.ConceptMapService.componentStateHasStudentWork(componentState, this.componentContent)) {
          componentState = this.ProjectService.injectAssetPaths(componentState);
          this.setStudentWork(componentState);
        } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (!this.ConceptMapService.componentStateHasStudentWork(componentState, this.componentContent) && this.componentContentHasStarterConceptMap()) {
          var conceptMapData = this.componentContent.starterConceptMap;
          this.populateConceptMapData(conceptMapData);
        }
      } else {
        if (componentState == null) {
          this.populateStarterConceptMap();
        } else {
          componentState = this.ProjectService.injectAssetPaths(componentState);
          this.setStudentWork(componentState);
        }
      }

      if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
        this.disableSubmitButton();
      }

      if (!this.isDisabled) {
        this.enableNodeDragging();
      }
      this.disableComponentIfNecessary();
      this.broadcastDoneRenderingComponent();
    }
  }, {
    key: 'componentContentHasStarterConceptMap',
    value: function componentContentHasStarterConceptMap() {
      return this.componentContent.starterConceptMap != null;
    }
  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {
      var studentData = componentState.studentData;
      if (studentData != null) {
        var conceptMapData = studentData.conceptMapData;
        var submitCounter = studentData.submitCounter;
        if (submitCounter != null) {
          this.submitCounter = submitCounter;
        }
        if (conceptMapData != null) {
          this.populateConceptMapData(conceptMapData);
        }
        this.processLatestStudentWork();
      }
    }
  }, {
    key: 'populateConceptMapData',
    value: function populateConceptMapData(conceptMapData) {
      var _this2 = this;

      this.populateNodes(conceptMapData);
      this.populateLinks(conceptMapData);

      if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath != '') {
        this.setBackgroundImage(conceptMapData.backgroundPath, conceptMapData.stretchBackground);
      }

      this.moveLinkTextToFront();
      this.moveNodesToFront();

      /*
       * set a timeout to refresh the link labels so that the rectangles
       * around the labels are properly resized
       */
      this.$timeout(function () {
        _this2.refreshLinkLabels();
      });
    }
  }, {
    key: 'populateNodes',
    value: function populateNodes(conceptMapData) {
      this.nodes = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = conceptMapData.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          var instanceId = node.instanceId;
          var originalId = node.originalId;
          var filePath = node.fileName;
          var label = node.label;
          var x = node.x;
          var y = node.y;
          var width = node.width;
          var height = node.height;
          var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, instanceId, originalId, filePath, label, x, y, width, height, this.componentContent.showNodeLabels);
          this.addNode(conceptMapNode);
          if (!this.isDisabled) {
            this.setNodeMouseEvents(conceptMapNode);
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
  }, {
    key: 'populateLinks',
    value: function populateLinks(conceptMapData) {
      this.links = [];

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = conceptMapData.links[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var link = _step2.value;

          var instanceId = link.instanceId;
          var originalId = link.originalId;
          var sourceNodeId = link.sourceNodeInstanceId;
          var destinationNodeId = link.destinationNodeInstanceId;
          var label = link.label;
          var color = link.color;
          var curvature = link.curvature;
          var startCurveUp = link.startCurveUp;
          var endCurveUp = link.endCurveUp;
          var sourceNode = null;
          var destinationNode = null;

          if (sourceNodeId != null) {
            sourceNode = this.getNodeById(sourceNodeId);
          }

          if (destinationNodeId != null) {
            destinationNode = this.getNodeById(destinationNodeId);
          }

          var conceptMapLink = this.ConceptMapService.newConceptMapLink(this.draw, instanceId, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp);
          this.addLink(conceptMapLink);
          if (!this.isDisabled) {
            this.setLinkMouseEvents(conceptMapLink);
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

    /**
     * Refresh the link labels so that the rectangles around the text
     * labels are resized to fit the text properly. This is required because
     * the rectangles are not properly sized when the ConceptMapLinks are
     * initialized. The rectangles need to be rendered first and then the
     * labels need to be set in order for the rectangles to be resized properly.
     * This is why this function is called in a $timeout.
     */

  }, {
    key: 'refreshLinkLabels',
    value: function refreshLinkLabels() {
      var _iteratorNormalCompletion3 = true;
      var _didIteratorError3 = false;
      var _iteratorError3 = undefined;

      try {
        for (var _iterator3 = this.nodes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
          var node = _step3.value;

          if (node.showLabel) {
            var label = node.getLabel();
            /*
             * set the label back into the node so that the rectangle
             * around the text label is resized to the text
             */
            node.setLabel(label);
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

      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = this.links[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var link = _step4.value;

          var _label = link.getLabel();
          /*
           * set the label back into the link so that the rectangle
           * around the text label is resized to the text
           */
          link.setLabel(_label);
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

    /**
     * A submit was triggered by the component submit button or node submit button
     * @param submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */

  }, {
    key: 'submit',
    value: function submit(submitTriggeredBy) {
      if (this.isSubmitDirty) {
        var performSubmit = true;
        if (this.hasMaxSubmitCount()) {
          var numberOfSubmitsLeft = this.getNumberOfSubmitsLeft();
          var message = '';
          if (numberOfSubmitsLeft <= 0) {
            alert(this.$translate('conceptMap.youHaveNoMoreChances'));
            performSubmit = false;
          } else if (numberOfSubmitsLeft === 1) {
            message = this.$translate('conceptMap.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            performSubmit = confirm(message);
          } else if (numberOfSubmitsLeft > 1) {
            message = this.$translate('conceptMap.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            performSubmit = confirm(message);
          }
        }

        if (performSubmit) {
          this.incrementSubmitCounter();
          if (this.hasMaxSubmitCount() && !this.hasSubmitsLeft()) {
            this.isSubmitButtonDisabled = true;
          }
          if (this.hasAutoGrading()) {
            this.performAutoGrading();
          }
          this.isSubmit = true;
          this.emitComponentSubmitTriggered();
        } else {
          this.isSubmit = false;
        }
      }
    }
  }, {
    key: 'hasAutoGrading',
    value: function hasAutoGrading() {
      return this.componentContent.customRuleEvaluator != null && this.componentContent.customRuleEvaluator != '';
    }
  }, {
    key: 'performAutoGrading',
    value: function performAutoGrading() {
      var customRuleEvaluator = this.componentContent.customRuleEvaluator;
      var componentContent = this.componentContent;
      var conceptMapData = this.getConceptMapData();
      var thisConceptMapService = this.ConceptMapService;
      var thisResult = {};

      /*
       * create the any function that can be called in the custom rule
       * evaluator code. the arguments to the any function are rule names.
       * for example if we are looking for any of the links below
       * Sun (Infrared Radiation) Space
       * Sun (Heat) Space
       * Sun (Solar Radiation) Space
       * we will call the any function like this
       * any("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
       * these dynamic arguments will be placed in the arguments variable
       */
      var any = function any() {
        return thisConceptMapService.any(componentContent, conceptMapData, arguments);
      };

      /*
       * create the all function that can be called in the custom rule
       * evaluator code. the arguments to the all function are rule names.
       * for example if we are looking for all of the links below
       * Sun (Infrared Radiation) Space
       * Sun (Heat) Space
       * Sun (Solar Radiation) Space
       * we will call the any function like this
       * all("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
       * these dynamic arguments will be placed in the arguments variable
       */
      var all = function all() {
        return thisConceptMapService.all(componentContent, conceptMapData, arguments);
      };

      /*
       * create the setResult function that can be called in the custom rule
       * evaluator code
       */
      var setResult = function setResult(result) {
        thisResult = result;
      };

      eval(customRuleEvaluator);

      this.autoFeedbackResult = thisResult;
      var resultString = '';

      if (this.componentContent.showAutoScore && thisResult.score != null) {
        resultString += this.$translate('SCORE') + ': ' + thisResult.score;
        if (this.hasMaxScore()) {
          resultString += '/' + this.getMaxScore();
        }
      }

      if (this.componentContent.showAutoFeedback && thisResult.feedback != null) {
        if (resultString !== '') {
          resultString += '<br/>';
        }
        resultString += this.$translate('FEEDBACK') + ': ' + thisResult.feedback;
      }

      if (resultString != '') {
        this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(this.$translate('FEEDBACK')).htmlContent(resultString).ariaLabel(this.$translate('FEEDBACK')).ok(this.$translate('CLOSE')));
      }

      this.autoFeedbackString = resultString;
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
      var deferred = this.$q.defer();
      var componentState = this.NodeService.createNewComponentState();
      var studentData = {};
      var conceptMapData = this.getConceptMapData();
      studentData.conceptMapData = conceptMapData;
      componentState.isSubmit = this.isSubmit;

      if (this.isSubmit) {
        this.isSubmit = false;
        if (this.hasAutoFeedbackScore() || this.hasAutoFeedbackText()) {
          var runId = this.ConfigService.getRunId();
          var periodId = this.ConfigService.getPeriodId();
          var nodeId = this.nodeId;
          var componentId = this.componentId;
          var toWorkgroupId = this.ConfigService.getWorkgroupId();
          componentState.annotations = [];

          if (this.hasAutoFeedbackScore()) {
            var data = {
              value: parseFloat(this.autoFeedbackResult.score),
              autoGrader: 'conceptMap'
            };

            if (this.hasMaxScore()) {
              data.maxAutoScore = parseFloat(this.getMaxScore());
            }

            var scoreAnnotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
            componentState.annotations.push(scoreAnnotation);

            if (this.isAuthoringMode()) {
              if (this.latestAnnotations == null) {
                this.latestAnnotations = {};
              }
              this.latestAnnotations.score = scoreAnnotation;
            }
          }

          if (this.hasAutoFeedbackText()) {
            var _data = {
              value: this.autoFeedbackResult.feedback,
              autoGrader: 'conceptMap'
            };
            var commentAnnotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, _data);
            componentState.annotations.push(commentAnnotation);

            if (this.isAuthoringMode()) {
              if (this.latestAnnotations == null) {
                this.latestAnnotations = {};
              }
              this.latestAnnotations.comment = commentAnnotation;
            }
          }
        }
      }

      studentData.submitCounter = this.submitCounter;
      componentState.studentData = studentData;
      componentState.componentType = 'ConceptMap';
      componentState.nodeId = this.nodeId;
      componentState.componentId = this.componentId;
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'hasAutoFeedback',
    value: function hasAutoFeedback() {
      return this.autoFeedbackResult != null;
    }
  }, {
    key: 'hasAutoFeedbackScore',
    value: function hasAutoFeedbackScore() {
      return this.autoFeedbackResult != null && this.autoFeedbackResult.score != null;
    }
  }, {
    key: 'hasAutoFeedbackText',
    value: function hasAutoFeedbackText() {
      return this.autoFeedbackResult != null && this.autoFeedbackResult.feedback != null;
    }
  }, {
    key: 'getConceptMapData',
    value: function getConceptMapData() {
      var studentData = {
        nodes: [],
        links: []
      };

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = this.nodes[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var node = _step5.value;

          var nodeJSON = node.toJSONObject();
          studentData.nodes.push(nodeJSON);
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

      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = this.links[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var link = _step6.value;

          var linkJSON = link.toJSONObject();
          studentData.links.push(linkJSON);
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

      if (this.background != null) {
        var background = this.background;
        studentData.background = this.getBackgroundFileName(background);

        // this is the background path e.g. /wise/curriculum/108/assets/background.png
        studentData.backgroundPath = background;

        studentData.stretchBackground = this.stretchBackground;
      }

      return studentData;
    }
  }, {
    key: 'getBackgroundFileName',
    value: function getBackgroundFileName(background) {
      return background.substring(background.lastIndexOf('/') + 1);
    }

    /**
     * Create an auto score annotation
     * @param data the annotation data
     * @returns the auto score annotation
     */

  }, {
    key: 'createAutoScoreAnnotation',
    value: function createAutoScoreAnnotation(data) {
      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();
      var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
      return annotation;
    }

    /**
     * Create an auto comment annotation
     * @param data the annotation data
     * @returns the auto comment annotation
     */

  }, {
    key: 'createAutoCommentAnnotation',
    value: function createAutoCommentAnnotation(data) {
      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();
      var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);
      return annotation;
    }
  }, {
    key: 'linkTypeSelected',
    value: function linkTypeSelected(selectedLink) {
      if (this.highlightedElement != null && this.highlightedElement.constructor.name === 'ConceptMapLink') {
        var link = this.highlightedElement;
        var label = selectedLink.label;
        var color = selectedLink.color;
        var originalId = selectedLink.id;
        link.setLabel(label);
        link.setColor(color);
        link.setOriginalId(originalId);
      }
      this.clearHighlightedElement();
      this.studentDataChanged();
    }
  }, {
    key: 'getLinksTitle',
    value: function getLinksTitle() {
      return this.componentContent.linksTitle;
    }
  }, {
    key: 'showLinkTypeChooser',
    value: function showLinkTypeChooser() {
      if (!this.initializedDisplayLinkTypeChooserModalOverlay) {
        this.setLinkTypeChooserOverlayStyle();
        this.initializedDisplayLinkTypeChooserModalOverlay = true;
      }
      this.linkTypeChooserStyle['top'] = '20px';
      this.linkTypeChooserStyle['left'] = '600px';
      this.displayLinkTypeChooser = true;
    }
  }, {
    key: 'hideLinkTypeChooser',
    value: function hideLinkTypeChooser() {
      this.displayLinkTypeChooser = false;
      this.displayLinkTypeChooserModalOverlay = false;
      this.newlyCreatedLink = null;
    }
  }, {
    key: 'setupSVG',
    value: function setupSVG() {
      var _this3 = this;

      this.draw = SVG(this.svgId);
      this.draw.width(this.width);
      this.draw.height(this.height);

      this.highlightedElement = null;
      this.activeNode = null;
      this.activeLink = null;
      this.drawingLink = false;
      this.newlyCreatedLink = null;

      if (!this.isDisabled) {
        this.draw.mousedown(function (event) {
          _this3.svgMouseDown(event);
        });

        this.draw.mouseup(function (event) {
          _this3.svgMouseUp(event);
        });

        this.draw.mousemove(function (event) {
          _this3.svgMouseMove(event);
        });

        this.addDragOverListenerIfNecessary();
        this.addDropListenerIfNecessary();
        this.setLinkTypeChooserStyle();
      }
    }
  }, {
    key: 'addDragOverListenerIfNecessary',
    value: function addDragOverListenerIfNecessary() {
      var svg = angular.element('#' + this.svgId);
      /*
       * check if we have already added the dragover listener so we don't
       * add multiple listeners for the same event. adding multiple listeners
       * to the same event may occur in the authoring tool.
       */
      if (!this.addedDragOverListener) {
        /*
         * listen for the dragover event which occurs when the user is
         * dragging a node onto the svg
         */
        svg[0].addEventListener('dragover', function (event) {
          /*
           * prevent the default because if we don't, the user won't
           * be able to drop a new node instance onto the svg in the
           * authoring mode
           */
          event.preventDefault();
        });

        this.addedDragOverListener = true;
      }
    }
  }, {
    key: 'addDropListenerIfNecessary',
    value: function addDropListenerIfNecessary() {
      var _this4 = this;

      var svg = angular.element('#' + this.svgId);
      /*
       * check if we have already added the drop listener so we don't
       * add multiple listeners for the same event. adding multiple listeners
       * to the same event may occur in the authoring tool.
       */
      if (!this.addedDropListener) {
        /*
         * listen for the drop event which occurs when the student drops
         * a new node onto the svg
         */
        svg[0].addEventListener('drop', function (event) {

          /*
           * the user has dropped a new node onto the svg to create a
           * new instance of a node
           */
          _this4.newNodeDropped(event);
        });

        this.addedDropListener = true;
      }
    }
  }, {
    key: 'setLinkTypeChooserStyle',
    value: function setLinkTypeChooserStyle() {
      this.linkTypeChooserStyle = {
        'width': '300px',
        'position': 'absolute',
        'left': '600px',
        'top': '20px',
        'border': '1px solid black',
        'backgroundColor': 'white',
        'cursor': 'pointer',
        'z-index': 10000,
        'padding': '16px'
      };
    }
  }, {
    key: 'setLinkTypeChooserOverlayStyle',
    value: function setLinkTypeChooserOverlayStyle() {
      this.modalWidth = this.getModalWidth();
      var overlayWidth = this.modalWidth;
      var conceptMapContainer = angular.element('#' + this.conceptMapContainerId);
      var height = conceptMapContainer.height();
      this.linkTypeChooserModalOverlayStyle = {
        'position': 'absolute',
        'z-index': 9999,
        'width': overlayWidth,
        'height': height,
        'background-color': '#000000',
        'opacity': 0.4
      };
    }
  }, {
    key: 'getModalWidth',
    value: function getModalWidth() {
      var selectNodeBarWidthString = angular.element(document.getElementById('#' + this.selectNodeBarId)).css('width');
      var svgWidthString = angular.element(document.getElementById(this.svgId)).css('width');
      if (selectNodeBarWidthString != null && svgWidthString != null) {
        var selectNodeBarWidth = parseInt(selectNodeBarWidthString.replace('px', ''));
        var svgWidth = parseInt(svgWidthString.replace('px', ''));
        if (selectNodeBarWidth != null && svgWidth != null) {
          return selectNodeBarWidth + svgWidth;
        }
      }
      return null;
    }
  }, {
    key: 'getModalHeight',
    value: function getModalHeight() {
      var selectNodeBarHeightString = angular.element(document.getElementById('#' + this.selectNodeBarId)).css('height');
      var svgHeightString = angular.element(document.getElementById(this.svgId)).css('height');
      if (selectNodeBarHeightString != null && svgHeightString != null) {
        var selectNodeBarHeight = parseInt(selectNodeBarHeightString.replace('px', ''));
        var svgHeight = parseInt(svgHeightString.replace('px', ''));
        if (selectNodeBarHeight != null && svgHeight != null) {
          return Math.max(selectNodeBarHeight, svgHeight);
        }
      }
      return null;
    }
  }, {
    key: 'cancelLinkTypeChooser',
    value: function cancelLinkTypeChooser() {
      if (this.newlyCreatedLink != null) {
        /*
         * the student has just created this link and has not yet chosen
         * a link type so we will remove the link
         */
        this.newlyCreatedLink.remove();
        this.newlyCreatedLink = null;
      }

      this.hideLinkTypeChooser();
      this.clearHighlightedElement();
    }
  }, {
    key: 'svgMouseDown',
    value: function svgMouseDown(event) {
      if (event.target.tagName === 'svg') {
        this.clearHighlightedElement();
      }
    }
  }, {
    key: 'svgMouseUp',
    value: function svgMouseUp(event) {
      if (this.activeLink != null && this.activeNode == null) {
        /*
         * the student was creating a link but did not connect the link
         * to a destination node so we will just remove the link
         */
        this.activeLink.remove();
      }

      this.drawingLink = false;
      this.activeLink = null;
      this.enableNodeDragging();
      this.moveLinkTextToFront();
      this.moveNodesToFront();
    }
  }, {
    key: 'svgMouseMove',
    value: function svgMouseMove(event) {
      if (this.activeLink != null) {
        /*
         * there is an active link which means the student has created a
         * new link and is in the process of choosing the link's destination
         * node
         */

        // get the coordinates that the link should be updated to
        var coordinates = this.getRelativeCoordinatesByEvent(event);
        var x1 = null;
        var y1 = null;
        var x2 = coordinates.x;
        var y2 = coordinates.y;

        /*
         * get the location of the center of the connector that the link
         * originated from
         */
        var startX = this.activeLinkStartX;
        var startY = this.activeLinkStartY;

        /*
         * get the distance from the start to the current position of the
         * mouse
         */
        var distance = this.ConceptMapService.calculateDistance(startX, startY, x2, y2);

        /*
         * check if we have set the curvature yet and that the mouse
         * is more than 20 pixels away from the start.
         *
         * we will determine the curvature of the link based upon how
         * the user has dragged the mouse in relation to the center
         * of the connector. if they start drawing the link horizontally
         * we will create a straight line with no curvature. if they
         * start drawing the link by moving the mouse up, we will create
         * a line that curves up. if they start drawing the link by
         * moving the mouse down, we will create a line that curves down.
         */
        if (!this.linkCurvatureSet && distance > 20) {
          /*
           * get the slope of the line from the start to the location
           * of the mouse
           */
          var slope = Math.abs(this.ConceptMapService.getSlope(startX, startY, x2, y2));

          if (y2 < startY) {
            // the user has moved the mouse above the connector
            this.setActiveLinkCurvature(slope);

            // make the link curve up
            this.activeLink.startCurveUp = true;
            this.activeLink.endCurveUp = true;
          } else if (y2 > startY) {
            // the user has moved the mouse below the connector
            this.setActiveLinkCurvature(slope);

            // make the link curve down
            this.activeLink.startCurveUp = false;
            this.activeLink.endCurveUp = false;
          }

          // remember that we have set the curvature
          this.linkCurvatureSet = true;
        }

        var isDragging = true;
        this.activeLink.updateCoordinates(x1, y1, x2, y2, isDragging);
      }
    }
  }, {
    key: 'setActiveLinkCurvature',
    value: function setActiveLinkCurvature(slope) {
      if (slope == null) {
        /*
         * the slope is infinite so we will default the
         * curvature to 0.5
         */
        this.activeLink.curvature = 0.5;
      } else if (slope < 1.0) {
        // make the link straight
        this.activeLink.curvature = 0.0;
      } else {
        // make the link curved
        this.activeLink.curvature = 0.5;
      }
    }

    /**
     * Set the active node. This is called when the student places the mouse
     * over a node. When a node becomes active, we show the delete button and
     * the border.
     * @param node the node to make active
     */

  }, {
    key: 'setActiveNode',
    value: function setActiveNode(node) {
      node.showDeleteButton();
      node.showBorder();
      this.activeNode = node;
    }
  }, {
    key: 'clearActiveNode',
    value: function clearActiveNode() {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = this.nodes[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var node = _step7.value;

          if (node === this.activeNode && node !== this.highlightedElement) {
            node.hideDeleteButton();
            node.hideBorder();
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

      this.activeNode = null;
    }

    /**
     * Get the coordinates of the mouse relative to the svg element
     * @param event a mouse event
     * @returns an object containing x and y values
     */

  }, {
    key: 'getRelativeCoordinatesByEvent',
    value: function getRelativeCoordinatesByEvent(event) {
      var offsetX = event.offsetX;
      var offsetY = event.offsetY;
      var parentOffsetX = 0;
      var parentOffsetY = 0;
      var userAgent = navigator.userAgent;
      if (event.target.tagName === 'svg') {
        if (this.isUserAgentChrome(userAgent)) {
          var matrix = event.target.getCTM();
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        } else if (this.isUserAgentFirefox(userAgent)) {
          var _matrix = event.target.createSVGMatrix();
          parentOffsetX = _matrix.e;
          parentOffsetY = _matrix.f;
        } else {
          var _matrix2 = event.target.getCTM();
          parentOffsetX = _matrix2.e;
          parentOffsetY = _matrix2.f;
        }
      } else if (event.target.tagName === 'circle') {
        if (this.isUserAgentChrome(userAgent)) {} else if (this.isUserAgentFirefox(userAgent)) {
          var _matrix3 = event.target.getCTM();
          var bbox = event.target.getBBox();
          parentOffsetX = _matrix3.e + bbox.x;
          parentOffsetY = _matrix3.f + bbox.y;
        }
      } else if (event.target.tagName === 'rect') {
        if (this.isUserAgentChrome(userAgent)) {} else if (this.isUserAgentFirefox(userAgent)) {
          var _matrix4 = event.target.getCTM();
          var _bbox = event.target.getBBox();
          var _x5 = _bbox.x;
          var _y = _bbox.y;
          parentOffsetX = _matrix4.e + _x5;
          parentOffsetY = _matrix4.f + _y;
        }
      } else if (event.target.tagName === 'image') {
        if (this.isUserAgentChrome(userAgent)) {} else if (this.isUserAgentFirefox(userAgent)) {
          var _matrix5 = event.target.parentElement.getCTM();
          parentOffsetX = _matrix5.e;
          parentOffsetY = _matrix5.f;
        }
      } else if (event.target.tagName === 'path') {
        if (this.isUserAgentChrome(userAgent)) {} else if (this.isUserAgentFirefox(userAgent)) {
          var x2 = event.target.attributes['x2'];
          var y2 = event.target.attributes['y2'];
          if (x2 != null && y2 != null) {
            parentOffsetX = parseInt(x2.value);
            parentOffsetY = parseInt(y2.value);
          }
        }
      } else {
        if (this.isUserAgentChrome(userAgent)) {} else if (this.isUserAgentFirefox(userAgent)) {
          var _matrix6 = event.target.getCTM();
          parentOffsetX = _matrix6.e;
          parentOffsetY = _matrix6.f;
        }
      }

      /*
       * add the parent offset values to the relative offset values to obtain
       * the x and y values relative to the upper left corner of the svg
       */
      var x = parentOffsetX + offsetX;
      var y = parentOffsetY + offsetY;

      var returnObject = {
        x: x,
        y: y
      };

      return returnObject;
    }
  }, {
    key: 'isUserAgentChrome',
    value: function isUserAgentChrome(userAgent) {
      return userAgent.indexOf('Chrome') !== -1;
    }
  }, {
    key: 'isUserAgentFirefox',
    value: function isUserAgentFirefox(userAgent) {
      return userAgent.indexOf('Firefox') !== -1;
    }

    /**
     * Called when the student clicks down on a node in the left node bar
     * @param $event the mouse down event
     * @param node the node the student clicked down on
     */

  }, {
    key: 'selectNode',
    value: function selectNode($event, node) {
      this.selectedNode = node;

      /*
       * remember the offset of the mouse relative to the upper left of the
       * node's image so that we properly calculate the node position when
       * the student releases the mouse to put the node in the svg
       */
      this.tempOffsetX = $event.offsetX;
      this.tempOffsetY = $event.offsetY;
    }
  }, {
    key: 'newNodeDropped',
    value: function newNodeDropped(event) {
      var selectedNode = this.selectedNode;
      var filePath = selectedNode.fileName;
      var label = selectedNode.label;
      var width = selectedNode.width;
      var height = selectedNode.height;
      var originalId = selectedNode.id;
      var coordinates = this.getRelativeCoordinatesByEvent(event);
      var x = coordinates.x - this.tempOffsetX;
      var y = coordinates.y - this.tempOffsetY;
      var newConceptMapNodeId = this.getNewConceptMapNodeId();
      var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, newConceptMapNodeId, originalId, filePath, label, x, y, width, height, this.componentContent.showNodeLabels);
      this.addNode(conceptMapNode);
      this.setNodeMouseEvents(conceptMapNode);
      this.setHighlightedElement(conceptMapNode);
      this.studentDataChanged();
      this.enableNodeDragging();
    }
  }, {
    key: 'getNewConceptMapNodeId',
    value: function getNewConceptMapNodeId() {
      return this.ConceptMapService.getNextAvailableId(this.nodes, 'studentNode');
    }
  }, {
    key: 'getNewConceptMapLinkId',
    value: function getNewConceptMapLinkId() {
      return this.ConceptMapService.getNextAvailableId(this.links, 'studentLink');
    }
  }, {
    key: 'setNodeMouseEvents',
    value: function setNodeMouseEvents(conceptMapNode) {
      var _this5 = this;

      conceptMapNode.setNodeMouseOver(function (event) {
        _this5.nodeMouseOver(event);
      });

      conceptMapNode.setNodeMouseOut(function (event) {
        _this5.nodeMouseOut(event);
      });

      conceptMapNode.setConnectorMouseDown(function (event) {
        _this5.disableNodeDragging();
        _this5.connectorMouseDown(event);
      });

      conceptMapNode.setNodeMouseDown(function (event) {
        _this5.nodeMouseDown(event);
      });

      conceptMapNode.setNodeMouseUp(function (event) {
        _this5.nodeMouseUp(event);
      });

      conceptMapNode.setDeleteButtonMouseDown(function (event) {
        _this5.nodeDeleteButtonMouseDown(event);
      });

      conceptMapNode.setDeleteButtonMouseOver(function (event) {
        _this5.nodeDeleteButtonMouseOver(event);
      });

      conceptMapNode.setDeleteButtonMouseOut(function (event) {
        _this5.nodeDeleteButtonMouseOut(event);
      });

      conceptMapNode.setDragMove(function (event) {
        _this5.nodeDragMove(event);
      });
    }
  }, {
    key: 'setHighlightedElement',
    value: function setHighlightedElement(element) {
      this.clearHighlightedElement();
      this.hideLinkTypeChooser();
      this.highlightedElement = element;
      element.isHighlighted(true);
      element.showDeleteButton();

      if (element.constructor.name === 'ConceptMapNode') {
        element.showBorder();
      } else if (element.constructor.name === 'ConceptMapLink') {
        this.showLinkTypeChooser();
        this.selectedLinkType = element.getOriginalId();
      }
    }
  }, {
    key: 'clearHighlightedElement',
    value: function clearHighlightedElement() {
      if (this.highlightedElement != null) {
        if (this.highlightedElement.constructor.name === 'ConceptMapNode') {
          this.highlightedElement.hideBorder();
        } else if (this.highlightedElement.constructor.name === 'ConceptMapLink') {
          this.hideLinkTypeChooser();
        }
        this.highlightedElement.isHighlighted(false);
        this.highlightedElement.hideDeleteButton();
        this.highlightedElement = null;
      }
    }
  }, {
    key: 'enableNodeDragging',
    value: function enableNodeDragging() {
      var _iteratorNormalCompletion8 = true;
      var _didIteratorError8 = false;
      var _iteratorError8 = undefined;

      try {
        for (var _iterator8 = this.nodes[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
          var node = _step8.value;

          var group = node.getGroup();
          // get the bounds that we will allow the node group to be dragged in dragged in
          var options = {
            minX: 0,
            minY: 0,
            maxX: this.width,
            maxY: this.height
          };
          group.draggable(options);
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
    key: 'disableNodeDragging',
    value: function disableNodeDragging() {
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = this.nodes[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var node = _step9.value;

          var group = node.getGroup();
          group.draggable(false);
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
  }, {
    key: 'moveLinkTextToFront',
    value: function moveLinkTextToFront() {
      var _iteratorNormalCompletion10 = true;
      var _didIteratorError10 = false;
      var _iteratorError10 = undefined;

      try {
        for (var _iterator10 = this.links[Symbol.iterator](), _step10; !(_iteratorNormalCompletion10 = (_step10 = _iterator10.next()).done); _iteratorNormalCompletion10 = true) {
          var link = _step10.value;

          link.moveTextGroupToFront();
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
    }
  }, {
    key: 'moveNodesToFront',
    value: function moveNodesToFront() {
      var _iteratorNormalCompletion11 = true;
      var _didIteratorError11 = false;
      var _iteratorError11 = undefined;

      try {
        for (var _iterator11 = this.nodes[Symbol.iterator](), _step11; !(_iteratorNormalCompletion11 = (_step11 = _iterator11.next()).done); _iteratorNormalCompletion11 = true) {
          var node = _step11.value;

          var group = node.getGroup();
          group.front();
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
  }, {
    key: 'addNode',
    value: function addNode(node) {
      this.nodes.push(node);
    }
  }, {
    key: 'removeNode',
    value: function removeNode(node) {
      var outgoingLinks = node.getOutgoingLinks();
      var numOutgoingLinks = outgoingLinks.length;
      while (numOutgoingLinks > 0) {
        var outgoingLink = outgoingLinks[0];
        this.removeLink(outgoingLink);
        numOutgoingLinks--;
      }

      var incomingLinks = node.getIncomingLinks();
      var numIncomingLinks = incomingLinks.length;
      while (numIncomingLinks > 0) {
        var incomingLink = incomingLinks[0];
        this.removeLink(incomingLink);
        numIncomingLinks--;
      }

      node.remove();

      for (var n = 0; n < this.nodes.length; n++) {
        var tempNode = this.nodes[n];
        if (tempNode == node) {
          this.nodes.splice(n, 1);
          break;
        }
      }
    }
  }, {
    key: 'removeAllNodes',
    value: function removeAllNodes() {
      var _iteratorNormalCompletion12 = true;
      var _didIteratorError12 = false;
      var _iteratorError12 = undefined;

      try {
        for (var _iterator12 = this.nodes[Symbol.iterator](), _step12; !(_iteratorNormalCompletion12 = (_step12 = _iterator12.next()).done); _iteratorNormalCompletion12 = true) {
          var node = _step12.value;

          node.remove();
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

      this.nodes = [];
    }
  }, {
    key: 'getNodeById',
    value: function getNodeById(id) {
      var _iteratorNormalCompletion13 = true;
      var _didIteratorError13 = false;
      var _iteratorError13 = undefined;

      try {
        for (var _iterator13 = this.nodes[Symbol.iterator](), _step13; !(_iteratorNormalCompletion13 = (_step13 = _iterator13.next()).done); _iteratorNormalCompletion13 = true) {
          var node = _step13.value;

          var nodeId = node.getId();
          if (id === nodeId) {
            return node;
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
  }, {
    key: 'getNodeByGroupId',
    value: function getNodeByGroupId(id) {
      var _iteratorNormalCompletion14 = true;
      var _didIteratorError14 = false;
      var _iteratorError14 = undefined;

      try {
        for (var _iterator14 = this.nodes[Symbol.iterator](), _step14; !(_iteratorNormalCompletion14 = (_step14 = _iterator14.next()).done); _iteratorNormalCompletion14 = true) {
          var node = _step14.value;

          var groupId = node.getGroupId();
          if (id === groupId) {
            return node;
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
  }, {
    key: 'getLinkById',
    value: function getLinkById(id) {
      var _iteratorNormalCompletion15 = true;
      var _didIteratorError15 = false;
      var _iteratorError15 = undefined;

      try {
        for (var _iterator15 = this.links[Symbol.iterator](), _step15; !(_iteratorNormalCompletion15 = (_step15 = _iterator15.next()).done); _iteratorNormalCompletion15 = true) {
          var link = _step15.value;

          var linkId = link.getId();
          if (id === linkId) {
            return link;
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

      return null;
    }
  }, {
    key: 'getLinkByGroupId',
    value: function getLinkByGroupId(id) {
      var _iteratorNormalCompletion16 = true;
      var _didIteratorError16 = false;
      var _iteratorError16 = undefined;

      try {
        for (var _iterator16 = this.links[Symbol.iterator](), _step16; !(_iteratorNormalCompletion16 = (_step16 = _iterator16.next()).done); _iteratorNormalCompletion16 = true) {
          var link = _step16.value;

          var groupId = link.getGroupId();
          if (id === groupId) {
            return link;
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

      return null;
    }
  }, {
    key: 'getNodeByConnectorId',
    value: function getNodeByConnectorId(id) {
      var _iteratorNormalCompletion17 = true;
      var _didIteratorError17 = false;
      var _iteratorError17 = undefined;

      try {
        for (var _iterator17 = this.nodes[Symbol.iterator](), _step17; !(_iteratorNormalCompletion17 = (_step17 = _iterator17.next()).done); _iteratorNormalCompletion17 = true) {
          var node = _step17.value;

          var connectorId = node.getConnectorId();
          if (id === connectorId) {
            return node;
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

      return null;
    }
  }, {
    key: 'removeNodeById',
    value: function removeNodeById(groupId) {
      for (var n = 0; n < this.nodes.length; n++) {
        var tempNode = this.nodes[n];
        var tempNodeId = tempNode.getId();
        if (groupId === tempNodeId) {
          this.nodes.splice(n, 1);
          break;
        }
      }
    }
  }, {
    key: 'addLink',
    value: function addLink(link) {
      this.links.push(link);
    }
  }, {
    key: 'removeLink',
    value: function removeLink(link) {
      link.remove();
      for (var l = 0; l < this.links.length; l++) {
        var tempLink = this.links[l];
        if (link == tempLink) {
          this.links.splice(l, 1);
          break;
        }
      }
    }
  }, {
    key: 'removeAllLinks',
    value: function removeAllLinks() {
      var _iteratorNormalCompletion18 = true;
      var _didIteratorError18 = false;
      var _iteratorError18 = undefined;

      try {
        for (var _iterator18 = this.links[Symbol.iterator](), _step18; !(_iteratorNormalCompletion18 = (_step18 = _iterator18.next()).done); _iteratorNormalCompletion18 = true) {
          var link = _step18.value;

          link.remove();
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

      this.links = [];
    }
  }, {
    key: 'nodeMouseOver',
    value: function nodeMouseOver(event) {
      var groupId = event.target.parentElement.id;
      var node = this.getNodeByGroupId(groupId);
      if (node != null) {
        this.setActiveNode(node);
      }
    }
  }, {
    key: 'nodeMouseOut',
    value: function nodeMouseOut(event) {
      var groupId = event.target.parentElement.id;
      var node = this.getNodeByGroupId(groupId);
      if (node != null) {
        this.clearActiveNode();
      }
    }
  }, {
    key: 'nodeMouseDown',
    value: function nodeMouseDown(event) {
      if (event.target.parentElement != null) {
        var groupId = event.target.parentElement.id;
        var node = this.getNodeByGroupId(groupId);
        if (node != null) {
          this.setHighlightedElement(node);
        }
      }
    }
  }, {
    key: 'nodeMouseUp',
    value: function nodeMouseUp(event) {
      if (this.drawingLink && this.activeLink != null) {
        /*
         * the student is creating a link and has just released the mouse
         * over a node to connect the destination node of the link
         */

        var groupId = event.target.parentElement.id;
        var node = this.getNodeByGroupId(groupId);
        var sourceNode = this.activeLink.sourceNode;
        var sourceNodeGroupId = sourceNode.getGroupId();

        if (sourceNodeGroupId === groupId) {
          /*
           * if the source of the link is the same as the
           * destination node, we will not connect the link
           */
          this.activeLink.remove();
          this.activeLink = null;
        } else {
          /*
           * the source node is different than the destination
           * node so we will connect the link
           */
          this.activeLink.setDestination(node);
          this.addLink(this.activeLink);
          this.setHighlightedElement(this.activeLink);

          /*
           * set the link as a newly created link so that if the
           * student clicks the cancel button, we will remove
           * the link
           */
          this.newlyCreatedLink = this.activeLink;
          this.displayLinkTypeChooserModalOverlay = true;
          this.studentDataChanged();
        }
      }

      this.drawingLink = false;
    }
  }, {
    key: 'linkDeleteButtonClicked',
    value: function linkDeleteButtonClicked(event, link) {
      this.removeLink(link);
      this.studentDataChanged();
      this.hideLinkTypeChooser();
    }
  }, {
    key: 'connectorMouseDown',
    value: function connectorMouseDown(event) {
      this.drawingLink = true;
      var connector = event.target;

      /*
       * disable node dragging so that the node isn't dragged when the
       * link head is being dragged
       */
      this.disableNodeDragging();
      var node = this.getNodeByConnectorId(connector.id);
      var newConceptMapLinkId = this.getNewConceptMapLinkId();

      /*
       * we will not know what the original id is until the student has
       * selected a link type
       */
      var originalId = null;
      var link = this.ConceptMapService.newConceptMapLink(this.draw, newConceptMapLinkId, originalId, node);
      this.setLinkMouseEvents(link);
      this.activeLink = link;
      this.linkCurvatureSet = false;
      this.activeLinkStartX = node.connectorCX();
      this.activeLinkStartY = node.connectorCY();
      this.setHighlightedElement(link);
      this.clearActiveNode();
      this.setActiveNode(node);
    }
  }, {
    key: 'setLinkMouseEvents',
    value: function setLinkMouseEvents(link) {
      var _this6 = this;

      link.setLinkMouseDown(function (event) {
        _this6.linkMouseDown(event);
      });

      link.setLinkTextMouseDown(function (event) {
        _this6.linkTextMouseDown(event);
      });

      link.setLinkMouseOver(function (event) {
        _this6.linkMouseOver(event);
      });

      link.setLinkMouseOut(function (event) {
        _this6.linkMouseOut(event);
      });

      link.setDeleteButtonClicked(function (event) {
        _this6.linkDeleteButtonClicked(event, link);
      });
    }
  }, {
    key: 'linkMouseDown',
    value: function linkMouseDown(event) {
      var groupId = this.getGroupId(event.target);
      var link = this.getLinkByGroupId(groupId);
      this.setHighlightedElement(link);
    }
  }, {
    key: 'linkTextMouseDown',
    value: function linkTextMouseDown(event) {
      var linkGroupId = null;

      /*
       * the link group id is set into the text group in the linkGroupId
       * variable. the text group hierarchy looks like this
       * text group > text > tspan
       * text group > rect
       */
      if (event.target.nodeName === 'tspan') {
        linkGroupId = event.target.parentElement.parentElement.linkGroupId;
      } else if (event.target.nodeName === 'text') {
        linkGroupId = event.target.parentElement.linkGroupId;
      } else if (event.target.nodeName === 'rect') {
        linkGroupId = event.target.parentElement.linkGroupId;
      }

      if (linkGroupId != null) {
        var link = this.getLinkByGroupId(linkGroupId);
        this.setHighlightedElement(link);
      }
    }
  }, {
    key: 'linkMouseOver',
    value: function linkMouseOver(event) {
      var groupId = this.getGroupId(event.target);
      var link = this.getLinkByGroupId(groupId);
      link.showDeleteButton();
    }
  }, {
    key: 'linkMouseOut',
    value: function linkMouseOut(event) {
      var groupId = this.getGroupId(event.target);
      var link = this.getLinkByGroupId(groupId);
      if (link != null && link != this.highlightedElement) {
        link.hideDeleteButton();
      }
    }
  }, {
    key: 'nodeDeleteButtonMouseDown',
    value: function nodeDeleteButtonMouseDown(event) {
      if (event.target.parentElement != null) {
        var groupId = event.target.parentElement.parentElement.id;
        var node = this.getNodeByGroupId(groupId);
        this.removeNode(node);
        this.studentDataChanged();
      }
    }
  }, {
    key: 'nodeDeleteButtonMouseOver',
    value: function nodeDeleteButtonMouseOver(event) {
      var groupId = event.target.parentElement.parentElement.id;
      var node = this.getNodeByGroupId(groupId);
      this.setActiveNode(node);
    }
  }, {
    key: 'nodeDeleteButtonMouseOut',
    value: function nodeDeleteButtonMouseOut(event) {
      var groupId = event.target.parentElement.parentElement.id;
      var node = this.getNodeByGroupId(groupId);
      this.clearActiveNode(node);
    }
  }, {
    key: 'nodeDragMove',
    value: function nodeDragMove(event) {
      var groupId = event.target.id;
      var node = this.getNodeByGroupId(groupId);
      if (node != null) {
        node.dragMove(event);
      }
      this.studentDataChanged();
    }

    /**
     * Get the group id of an element. All elements of a node or link are
     * contained in a group. These groups are the children of the main svg
     * element.
     * for example a node's image element will be located here
     * svg > group > image
     * for example a link's path element will be located here
     * svg > group > path
     *
     * @param element get the group id of this element
     * @returns the group id
     */

  }, {
    key: 'getGroupId',
    value: function getGroupId(element) {
      var groupId = null;
      var currentElement = element;
      var previousId = null;

      // loop until we have reached the svg element
      while (currentElement != null) {
        if (currentElement.tagName === 'svg') {
          // base case. we have found the svg element.

          // the group id will be the previous id we saw
          groupId = previousId;

          // set the current element to null so that the while loop ends
          currentElement = null;
        } else {
          // remember the element id
          previousId = currentElement.id;

          /*
           * set the current element to the parent to continue searching
           * up the hierarchy
           */
          currentElement = currentElement.parentElement;
        }
      }

      return groupId;
    }
  }, {
    key: 'populateStarterConceptMap',
    value: function populateStarterConceptMap() {
      if (this.componentContent.starterConceptMap != null) {
        this.populateConceptMapData(this.componentContent.starterConceptMap);
      }
    }
  }, {
    key: 'clearConceptMap',
    value: function clearConceptMap() {
      this.removeAllLinks();
      this.removeAllNodes();
    }

    /**
     * Reset the concept map data. We will clear the concept map data and
     * if there is starter concept map data we will set it into the concept map.
     */

  }, {
    key: 'resetConceptMap',
    value: function resetConceptMap() {
      var message = this.$translate('conceptMap.areYouSureYouWantToResetYourWork');
      if (confirm(message)) {
        this.clearConceptMap();
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          this.handleConnectedComponents();
        } else if (this.componentContent.starterConceptMap != null) {
          var conceptMapData = this.componentContent.starterConceptMap;
          this.populateConceptMapData(conceptMapData);
        }
      }
    }

    /**
     * Show the auto feedback that was generated when the student previously
     * clicked "Check Answer".
     */

  }, {
    key: 'showAutoFeedback',
    value: function showAutoFeedback() {
      this.$mdDialog.show(this.$mdDialog.alert().parent(angular.element(document.querySelector('#' + this.feedbackContainerId))).clickOutsideToClose(true).title(this.$translate('FEEDBACK')).htmlContent(this.autoFeedbackString).ariaLabel(this.$translate('FEEDBACK')).ok(this.$translate('CLOSE')));
    }

    /**
     * Snip the concept map by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snip',
    value: function snip($event) {
      var _this7 = this;

      // get the svg element. this will obtain an array.
      var svgElement = angular.element('#svg_' + this.nodeId + '_' + this.componentId);
      if (svgElement != null && svgElement.length > 0) {
        svgElement = svgElement[0];

        // get the svg element as a string
        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgElement);

        // find all the images in the svg and replace them with Base64 images
        this.ConceptMapService.getHrefToBase64ImageReplacements(svgString).then(function (images) {
          /*
           * Loop through all the image objects. Each object contains
           * an image href and a Base64 image.
           */
          var _iteratorNormalCompletion19 = true;
          var _didIteratorError19 = false;
          var _iteratorError19 = undefined;

          try {
            for (var _iterator19 = images[Symbol.iterator](), _step19; !(_iteratorNormalCompletion19 = (_step19 = _iterator19.next()).done); _iteratorNormalCompletion19 = true) {
              var imagePair = _step19.value;

              // get the image href e.g. /wise/curriculum/25/assets/Sun.png
              var imageHref = imagePair.imageHref;
              var base64Image = imagePair.base64Image;
              var imageRegEx = new RegExp(imageHref, 'g');

              /*
               * replace all the instances of the image href with the
               * Base64 image
               */
              svgString = svgString.replace(imageRegEx, base64Image);
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

          var myCanvas = document.createElement('canvas');
          var ctx = myCanvas.getContext('2d');
          var svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          var domURL = self.URL || self.webkitURL || self;
          var url = domURL.createObjectURL(svg);
          var image = new Image();

          /*
           * set the UtilService in a local variable so we can access it
           * in the onload callback function
           */
          var thisUtilService = _this7.UtilService;
          image.onload = function (event) {
            var image = event.target;

            // set the dimensions of the canvas
            myCanvas.width = image.width;
            myCanvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            var base64Image = myCanvas.toDataURL('image/png');

            // get the image object
            var imageObject = thisUtilService.getImageObjectFromBase64String(base64Image, false);
            _this7.NotebookService.addNote($event, imageObject);
          };

          // set the src of the image so that the image gets loaded
          image.src = url;
        });
      }
    }

    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var mergedNodes = [];
      var mergedLinks = [];
      var backgroundPath = null;
      var stretchBackground = null;
      var _iteratorNormalCompletion20 = true;
      var _didIteratorError20 = false;
      var _iteratorError20 = undefined;

      try {
        for (var _iterator20 = componentStates[Symbol.iterator](), _step20; !(_iteratorNormalCompletion20 = (_step20 = _iterator20.next()).done); _iteratorNormalCompletion20 = true) {
          var componentState = _step20.value;

          if (componentState.componentType === 'ConceptMap') {
            var studentData = componentState.studentData;
            var conceptMapData = studentData.conceptMapData;
            mergedNodes = mergedNodes.concat(conceptMapData.nodes);
            mergedLinks = mergedLinks.concat(conceptMapData.links);
            if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath !== '') {
              backgroundPath = conceptMapData.backgroundPath;
              stretchBackground = conceptMapData.stretchBackground;
            }
          } else if (componentState.componentType === 'Draw' || componentState.componentType === 'Embedded' || componentState.componentType === 'Graph' || componentState.componentType === 'Label' || componentState.componentType === 'Table') {
            var connectedComponent = this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
            if (connectedComponent.importWorkAsBackground === true) {
              this.setComponentStateAsBackgroundImage(componentState);
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

      if (this.componentContent.background != null && this.componentContent.background !== '') {
        backgroundPath = this.componentContent.background;
        if (this.componentContent.stretchBackground) {
          stretchBackground = this.componentContent.stretchBackground;
        }
      }

      var mergedComponentState = this.NodeService.createNewComponentState();
      mergedComponentState.studentData = {
        conceptMapData: {
          nodes: mergedNodes,
          links: mergedLinks,
          backgroundPath: backgroundPath
        }
      };

      if (stretchBackground != null) {
        mergedComponentState.studentData.conceptMapData.stretchBackground = stretchBackground;
      }

      mergedComponentState = this.ProjectService.injectAssetPaths(mergedComponentState);
      return mergedComponentState;
    }

    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     */

  }, {
    key: 'setComponentStateAsBackgroundImage',
    value: function setComponentStateAsBackgroundImage(componentState) {
      var _this8 = this;

      this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        _this8.setBackgroundImage(image.url);
      });
    }

    /**
     * Set the background image on the svg canvas
     * @param backgroundPath the absolute path to the background image
     * @param stretchBackground whether to stretch the background to cover the
     * whole svg background
     */

  }, {
    key: 'setBackgroundImage',
    value: function setBackgroundImage(backgroundPath, stretchBackground) {
      this.background = backgroundPath;
      this.stretchBackground = stretchBackground;
      if (stretchBackground) {
        // stretch the background to fit the whole svg element
        this.backgroundSize = '100% 100%';
      } else {
        // use the original dimensions of the background image
        this.backgroundSize = '';
      }
    }
  }]);

  return ConceptMapController;
}(_componentController2.default);

ConceptMapController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConceptMapService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = ConceptMapController;
//# sourceMappingURL=conceptMapController.js.map

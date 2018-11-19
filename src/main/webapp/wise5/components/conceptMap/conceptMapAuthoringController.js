'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

require('svg.js');

require('svg.draggable.js');

var _conceptMapController = require('./conceptMapController');

var _conceptMapController2 = _interopRequireDefault(_conceptMapController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConceptMapAuthoringController = function (_ConceptMapController) {
  _inherits(ConceptMapAuthoringController, _ConceptMapController);

  function ConceptMapAuthoringController($anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConceptMapService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, ConceptMapAuthoringController);

    var _this = _possibleConstructorReturn(this, (ConceptMapAuthoringController.__proto__ || Object.getPrototypeOf(ConceptMapAuthoringController)).call(this, $anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConceptMapService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    _this.shouldOptions = [{
      value: false, label: _this.$translate('conceptMap.should')
    }, {
      value: true, label: _this.$translate('conceptMap.shouldNot')
    }];

    _this.availableNodes = _this.componentContent.nodes;
    _this.availableLinks = _this.componentContent.links;

    if (_this.componentContent.showNodeLabels == null) {
      _this.componentContent.showNodeLabels = true;
      _this.authoringComponentContent.showNodeLabels = true;
    }

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.availableNodes = this.componentContent.nodes;
      this.availableLinks = this.componentContent.links;
      this.width = this.componentContent.width;
      this.height = this.componentContent.height;
      this.setBackgroundImage(this.componentContent.background, this.componentContent.stretchBackground);

      /*
       * make sure the SVG element can be accessed. we need to
       * perform this check because this watch is getting fired
       * before angular sets the svgId on the svg element. if
       * setupSVG() is called before the svgId is set on the svg
       * element, we will get an error.
       */
      if (document.getElementById(this.svgId) != null) {
        this.setupSVG();
      }
    }.bind(_this), true);

    _this.$scope.$on('assetSelected', function (event, args) {
      if (_this.isEventTargetThisComponent(args)) {
        var fileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          var summernoteId = _this.getSummernoteId(args);
          _this.restoreSummernoteCursorPosition(summernoteId);
          var fullAssetPath = _this.getFullAssetPath(fileName);
          if (_this.UtilService.isImage(fileName)) {
            _this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
          } else if (_this.UtilService.isVideo(fileName)) {
            _this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
          }
        } else if (args.target === 'background') {
          _this.authoringComponentContent.background = fileName;
          _this.authoringViewComponentChanged();
        } else if (args.target != null && args.target.indexOf('node') == 0) {
          var node = _this.authoringViewGetNodeById(args.target);
          node.fileName = fileName;
          _this.authoringViewComponentChanged();
        }
      }
      _this.$mdDialog.hide();
    });
    return _this;
  }

  /**
   * A move node up button was clicked in the authoring tool
   * @param index the index of the node that we will move
   */


  _createClass(ConceptMapAuthoringController, [{
    key: 'authoringViewMoveNodeUpButtonClicked',
    value: function authoringViewMoveNodeUpButtonClicked(index) {
      this.authoringViewMoveObjectUp(this.authoringComponentContent.nodes, index);
    }
  }, {
    key: 'authoringViewMoveObjectUp',
    value: function authoringViewMoveObjectUp(objects, index) {
      if (index !== 0) {
        var object = objects[index];
        objects.splice(index, 1);
        objects.splice(index - 1, 0, object);
        this.authoringViewComponentChanged();
      }
    }

    /**
     * A move node down button was clicked in the authoring tool.
     * @param index the index of the node that we will move
     */

  }, {
    key: 'authoringViewMoveNodeDownButtonClicked',
    value: function authoringViewMoveNodeDownButtonClicked(index) {
      this.authoringViewMoveObjectDown(this.authoringComponentContent.nodes, index);
    }
  }, {
    key: 'authoringViewMoveObjectDown',
    value: function authoringViewMoveObjectDown(objects, index) {
      if (index !== objects.length - 1) {
        var object = objects[index];
        objects.splice(index, 1);
        objects.splice(index + 1, 0, object);
        this.authoringViewComponentChanged();
      }
    }

    /**
     * A node delete button was clicked in the authoring tool.
     * @param index the index of the node that we will delete
     */

  }, {
    key: 'authoringViewNodeDeleteButtonClicked',
    value: function authoringViewNodeDeleteButtonClicked(index) {
      var nodes = this.authoringComponentContent.nodes;
      var node = nodes[index];
      var nodeFileName = node.fileName;
      var nodeLabel = node.label;
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisNode', { nodeFileName: nodeFileName, nodeLabel: nodeLabel }))) {
        nodes.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }

    /**
     * A move link up button was clicked in the authoring tool.
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewMoveLinkUpButtonClicked',
    value: function authoringViewMoveLinkUpButtonClicked(index) {
      this.authoringViewMoveObjectUp(this.authoringComponentContent.links, index);
    }

    /**
     * A move link down button was clicked in the authoring tool.
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewMoveLinkDownButtonClicked',
    value: function authoringViewMoveLinkDownButtonClicked(index) {
      this.authoringViewMoveObjectDown(this.authoringComponentContent.links, index);
    }

    /**
     * A link delete button was clicked in the authoring tool.
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewLinkDeleteButtonClicked',
    value: function authoringViewLinkDeleteButtonClicked(index) {
      var links = this.authoringComponentContent.links;
      var link = links[index];
      var linkLabel = link.label;
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisLink', { linkLabel: linkLabel }))) {
        links.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringViewAddNode',
    value: function authoringViewAddNode() {
      var id = this.authoringGetNewConceptMapNodeId();
      var newNode = {
        id: id,
        label: '',
        fileName: '',
        width: 100,
        height: 100
      };
      this.authoringComponentContent.nodes.push(newNode);
      this.authoringViewComponentChanged();
    }

    /**
     * Get the concept map node with the given id
     * @param nodeId the concept map node id
     * @return the concept map node with the given node id
     */

  }, {
    key: 'authoringViewGetNodeById',
    value: function authoringViewGetNodeById(nodeId) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.authoringComponentContent.nodes[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var node = _step.value;

          if (nodeId === node.id) {
            return node;
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

      return null;
    }
  }, {
    key: 'authoringViewAddLink',
    value: function authoringViewAddLink() {
      var id = this.authoringGetNewConceptMapLinkId();
      var newLink = {
        id: id,
        label: '',
        color: ''
      };
      this.authoringComponentContent.links.push(newLink);
      this.authoringViewComponentChanged();
    }

    /**
     * Get a new ConceptMapNode id that isn't being used
     * @returns a new ConceptMapNode id e.g. 'node3'
     */

  }, {
    key: 'authoringGetNewConceptMapNodeId',
    value: function authoringGetNewConceptMapNodeId() {
      return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.nodes, 'node');
    }

    /**
     * Get a new ConceptMapLink id that isn't being used
     * @returns a new ConceptMapLink id e.g. 'link3'
     */

  }, {
    key: 'authoringGetNewConceptMapLinkId',
    value: function authoringGetNewConceptMapLinkId() {
      return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.links, 'link');
    }

    /**
     * A "with link" checkbox was checked
     * @param ruleIndex the index of the rule
     */

  }, {
    key: 'authoringRuleLinkCheckboxClicked',
    value: function authoringRuleLinkCheckboxClicked(ruleIndex) {
      var rule = this.authoringComponentContent.rules[ruleIndex];
      if (rule.type === 'node') {
        /*
         * the rule has been set to 'node' instead of 'link' so we
         * will remove the link label and other node label
         */
        delete rule.linkLabel;
        delete rule.otherNodeLabel;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringAddRule',
    value: function authoringAddRule() {
      var newRule = {
        name: '',
        type: 'node',
        categories: [],
        nodeLabel: '',
        comparison: 'exactly',
        number: 1,
        not: false
      };

      this.authoringComponentContent.rules.push(newRule);
      var showSubmitButton = false;
      if (this.authoringComponentContent.rules.length > 0) {
        // there are scoring rules so we will show the submit button
        showSubmitButton = true;
      }

      this.setShowSubmitButtonValue(showSubmitButton);
      this.authoringViewComponentChanged();
    }

    /**
     * Move a rule up
     * @param index the index of the rule
     */

  }, {
    key: 'authoringViewMoveRuleUpButtonClicked',
    value: function authoringViewMoveRuleUpButtonClicked(index) {
      this.authoringViewMoveObjectUp(this.authoringComponentContent.rules, index);
    }

    /**
     * Move a rule down
     * @param index the index of the rule
     */

  }, {
    key: 'authoringViewMoveRuleDownButtonClicked',
    value: function authoringViewMoveRuleDownButtonClicked(index) {
      this.authoringViewMoveObjectDown(this.authoringComponentContent.rules, index);
    }

    /*
     * Delete a rule
     * @param index the index of the rule to delete
     */

  }, {
    key: 'authoringViewRuleDeleteButtonClicked',
    value: function authoringViewRuleDeleteButtonClicked(index) {
      var rule = this.authoringComponentContent.rules[index];
      var ruleName = rule.name;
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisRule', { ruleName: ruleName }))) {
        this.authoringComponentContent.rules.splice(index, 1);
        this.authoringViewComponentChanged();
      }

      var showSubmitButton = false;
      if (this.authoringComponentContent.rules.length > 0) {
        showSubmitButton = true;
      }
      this.setShowSubmitButtonValue(showSubmitButton);
    }
  }, {
    key: 'authoringViewAddCategoryToRule',
    value: function authoringViewAddCategoryToRule(rule) {
      rule.categories.push('');
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringViewDeleteCategoryFromRule',
    value: function authoringViewDeleteCategoryFromRule(rule, index) {
      var ruleName = rule.name;
      var categoryName = rule.categories[index];
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheCategory', { ruleName: ruleName, categoryName: categoryName }))) {
        rule.categories.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'saveStarterConceptMap',
    value: function saveStarterConceptMap() {
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToSaveTheStarterConceptMap'))) {
        this.authoringComponentContent.starterConceptMap = this.getConceptMapData();
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'deleteStarterConceptMap',
    value: function deleteStarterConceptMap() {
      if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheStarterConceptMap'))) {
        this.authoringComponentContent.starterConceptMap = null;
        this.clearConceptMap();
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Show the asset popup to allow the author to choose the background image
     */

  }, {
    key: 'chooseBackgroundImage',
    value: function chooseBackgroundImage() {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: 'background'
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Show the asset popup to allow the author to choose an image for the node
     * @param conceptMapNodeId the id of the node in the concept map
     */

  }, {
    key: 'chooseNodeImage',
    value: function chooseNodeImage(conceptMapNodeId) {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: conceptMapNodeId
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      var components = this.getComponentsByNodeId(connectedComponent.nodeId);
      var numberOfAllowedComponents = 0;
      var allowedComponent = null;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var component = _step2.value;

          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
              numberOfAllowedComponents += 1;
              allowedComponent = component;
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

      if (numberOfAllowedComponents === 1) {
        /*
         * there is only one viable component to connect to so we
         * will use it
         */
        connectedComponent.componentId = allowedComponent.id;
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      }
    }

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {
      // default the type to import work
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      this.authoringViewComponentChanged();
    }

    /**
     * If the component type is a certain type, we will set the importWorkAsBackground
     * field to true.
     * @param connectedComponent The connected component object.
     */

  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType === 'Draw' || componentType === 'Embedded' || componentType === 'Graph' || componentType === 'Label' || componentType === 'Table') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the
     * checkbox.
     */

  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'submit',
    value: function submit(submitTriggeredBy) {
      _get(ConceptMapAuthoringController.prototype.__proto__ || Object.getPrototypeOf(ConceptMapAuthoringController.prototype), 'submit', this).call(this, submitTriggeredBy);
      this.isDirty = false;
      this.isSubmitDirty = false;
      this.createComponentState('submit');
    }
  }]);

  return ConceptMapAuthoringController;
}(_conceptMapController2.default);

ConceptMapAuthoringController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConceptMapService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = ConceptMapAuthoringController;
//# sourceMappingURL=conceptMapAuthoringController.js.map

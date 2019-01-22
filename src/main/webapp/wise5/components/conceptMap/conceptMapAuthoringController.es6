'use strict';

import 'svg.js';
import 'svg.draggable.js';
import ConceptMapController from './conceptMapController';

class ConceptMapAuthoringController extends ConceptMapController {
  constructor($anchorScroll,
              $filter,
              $location,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnnotationService,
              ConceptMapService,
              ConfigService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($anchorScroll,
      $filter,
      $location,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConceptMapService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.allowedConnectedComponentTypes = [
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Table' }
    ];

    this.shouldOptions = [
      {
        value: false, label: this.$translate('conceptMap.should')
      },
      {
        value: true, label: this.$translate('conceptMap.shouldNot')
      }
    ];

    this.availableNodes = this.componentContent.nodes;
    this.availableLinks = this.componentContent.links;

    if (this.componentContent.showNodeLabels == null) {
      this.componentContent.showNodeLabels = true;
      this.authoringComponentContent.showNodeLabels = true;
    }

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.availableNodes = this.componentContent.nodes;
      this.availableLinks = this.componentContent.links;
      this.width = this.componentContent.width;
      this.height = this.componentContent.height;
      this.setBackgroundImage(this.componentContent.background,
        this.componentContent.stretchBackground);

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
    }.bind(this), true);
  }

  assetSelected(event, args) {
    if (this.isEventTargetThisComponent(args)) {
      const fileName = args.assetItem.fileName;
      if (args.target === 'rubric') {
        const summernoteId = this.getSummernoteId(args);
        this.restoreSummernoteCursorPosition(summernoteId);
        const fullAssetPath = this.getFullAssetPath(fileName);
        if (this.UtilService.isImage(fileName)) {
          this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
        } else if (this.UtilService.isVideo(fileName)) {
          this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
        }
      } else if (args.target === 'background') {
        this.authoringComponentContent.background = fileName;
        this.authoringViewComponentChanged();
      } else if (args.target != null && args.target.indexOf('node') == 0) {
        const node = this.authoringViewGetNodeById(args.target);
        node.fileName = fileName;
        this.authoringViewComponentChanged();
      }
    }
    this.$mdDialog.hide();
  }

  /**
   * A move node up button was clicked in the authoring tool
   * @param index the index of the node that we will move
   */
  authoringViewMoveNodeUpButtonClicked(index) {
    this.UtilService.moveObjectUp(this.authoringComponentContent.nodes, index);
    this.authoringViewComponentChanged();
  }

  /**
   * A move node down button was clicked in the authoring tool.
   * @param index the index of the node that we will move
   */
  authoringViewMoveNodeDownButtonClicked(index) {
    this.UtilService.moveObjectDown(this.authoringComponentContent.nodes, index);
    this.authoringViewComponentChanged();
  }

  /**
   * A node delete button was clicked in the authoring tool.
   * @param index the index of the node that we will delete
   */
  authoringViewNodeDeleteButtonClicked(index) {
    const nodes = this.authoringComponentContent.nodes;
    const node = nodes[index];
    const nodeFileName = node.fileName;
    const nodeLabel = node.label;
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisNode',
        { nodeFileName: nodeFileName, nodeLabel: nodeLabel}))) {
      nodes.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * A move link up button was clicked in the authoring tool.
   * @param index the index of the link
   */
  authoringViewMoveLinkUpButtonClicked(index) {
    this.UtilService.moveObjectUp(this.authoringComponentContent.links, index);
    this.authoringViewComponentChanged();
  }

  /**
   * A move link down button was clicked in the authoring tool.
   * @param index the index of the link
   */
  authoringViewMoveLinkDownButtonClicked(index) {
    this.UtilService.moveObjectDown(this.authoringComponentContent.links, index);
    this.authoringViewComponentChanged();
  }

  /**
   * A link delete button was clicked in the authoring tool.
   * @param index the index of the link
   */
  authoringViewLinkDeleteButtonClicked(index) {
    const links = this.authoringComponentContent.links;
    const link = links[index];
    const linkLabel = link.label;
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisLink', { linkLabel: linkLabel}))) {
      links.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringViewAddNode() {
    const id = this.authoringGetNewConceptMapNodeId();
    const newNode = {
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
  authoringViewGetNodeById(nodeId) {
    for (let node of this.authoringComponentContent.nodes) {
      if (nodeId === node.id) {
        return node;
      }
    }
    return null;
  }

  authoringViewAddLink() {
    const id = this.authoringGetNewConceptMapLinkId();
    const newLink = {
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
  authoringGetNewConceptMapNodeId() {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.nodes, 'node');
  }

  /**
   * Get a new ConceptMapLink id that isn't being used
   * @returns a new ConceptMapLink id e.g. 'link3'
   */
  authoringGetNewConceptMapLinkId() {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.links, 'link');
  }

  /**
   * A "with link" checkbox was checked
   * @param ruleIndex the index of the rule
   */
  authoringRuleLinkCheckboxClicked(ruleIndex) {
    const rule = this.authoringComponentContent.rules[ruleIndex];
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

  authoringAddRule() {
    const newRule = {
      name: '',
      type: 'node',
      categories: [],
      nodeLabel:'',
      comparison: 'exactly',
      number: 1,
      not: false
    };

    this.authoringComponentContent.rules.push(newRule);
    let showSubmitButton = false;
    if (this.authoringComponentContent.rules.length > 0) {
      showSubmitButton = true;
    }

    this.setShowSubmitButtonValue(showSubmitButton);
    this.authoringViewComponentChanged();
  }

  /**
   * Move a rule up
   * @param index the index of the rule
   */
  authoringViewMoveRuleUpButtonClicked(index) {
    this.UtilService.moveObjectUp(this.authoringComponentContent.rules, index);
    this.authoringViewComponentChanged();
  }

  /**
   * Move a rule down
   * @param index the index of the rule
   */
  authoringViewMoveRuleDownButtonClicked(index) {
    this.UtilService.moveObjectDown(this.authoringComponentContent.rules, index);
    this.authoringViewComponentChanged();
  }

  /*
   * Delete a rule
   * @param index the index of the rule to delete
   */
  authoringViewRuleDeleteButtonClicked(index) {
    const rule = this.authoringComponentContent.rules[index];
    const ruleName = rule.name;
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisRule', { ruleName: ruleName }))) {
      this.authoringComponentContent.rules.splice(index, 1);
      this.authoringViewComponentChanged();
    }

    let showSubmitButton = false;
    if (this.authoringComponentContent.rules.length > 0) {
      showSubmitButton = true;
    }
    this.setShowSubmitButtonValue(showSubmitButton);
  }

  authoringViewAddCategoryToRule(rule) {
    rule.categories.push('');
    this.authoringViewComponentChanged();
  }

  authoringViewDeleteCategoryFromRule(rule, index) {
    const ruleName = rule.name;
    const categoryName = rule.categories[index];
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheCategory',
        { ruleName: ruleName, categoryName: categoryName }))) {
      rule.categories.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  saveStarterConceptMap() {
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToSaveTheStarterConceptMap'))) {
      this.authoringComponentContent.starterConceptMap = this.getConceptMapData();
      this.authoringViewComponentChanged();
    }
  }

  deleteStarterConceptMap() {
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheStarterConceptMap'))) {
      this.authoringComponentContent.starterConceptMap = null;
      this.clearConceptMap();
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Show the asset popup to allow the author to choose the background image
   */
  chooseBackgroundImage() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target:'background'
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose an image for the node
   * @param conceptMapNodeId the id of the node in the concept map
   */
  chooseNodeImage(conceptMapNodeId) {
    const params = {
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
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let components = this.getComponentsByNodeId(connectedComponent.nodeId);
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (let component of components) {
      if (component != null) {
        if (this.isConnectedComponentTypeAllowed(component.type) &&
            component.id != this.componentId) {
          numberOfAllowedComponents += 1;
          allowedComponent = component;
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
  authoringConnectedComponentComponentIdChanged(connectedComponent) {
    connectedComponent.type = 'importWork';
    this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.authoringViewComponentChanged();
  }

  /**
   * If the component type is a certain type, we will set the importWorkAsBackground
   * field to true.
   * @param connectedComponent The connected component object.
   */
  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    let componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (componentType === 'Draw' ||
        componentType === 'Embedded' ||
        componentType === 'Graph' ||
        componentType === 'Label' ||
        componentType === 'Table') {
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
  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.authoringViewComponentChanged();
  }

  submit(submitTriggeredBy) {
    super.submit(submitTriggeredBy);
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.createComponentState('submit');
  }
}

ConceptMapAuthoringController.$inject = [
  '$anchorScroll',
  '$filter',
  '$location',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConceptMapService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default ConceptMapAuthoringController;

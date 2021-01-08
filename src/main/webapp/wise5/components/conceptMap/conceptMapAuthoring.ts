'use strict';

import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class ConceptMapAuthoringController extends EditComponentController {
  availableNodes: any[];
  availableLinks: any[];

  static $inject = [
    '$filter',
    'ConceptMapService',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    private ConceptMapService,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      ConfigService,
      NodeService,
      NotificationService,
      ProjectAssetService,
      ProjectService,
      UtilService
    );
  }

  $onInit() {
    super.$onInit();

    this.availableNodes = this.componentContent.nodes;
    this.availableLinks = this.componentContent.links;

    if (this.componentContent.showNodeLabels == null) {
      this.componentContent.showNodeLabels = true;
      this.authoringComponentContent.showNodeLabels = true;
    }
  }

  /**
   * A move node up button was clicked in the authoring tool
   * @param index the index of the node that we will move
   */
  moveNodeUpButtonClicked(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.nodes, index);
    this.componentChanged();
  }

  /**
   * A move node down button was clicked in the authoring tool.
   * @param index the index of the node that we will move
   */
  moveNodeDownButtonClicked(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.nodes, index);
    this.componentChanged();
  }

  /**
   * A node delete button was clicked in the authoring tool.
   * @param index the index of the node that we will delete
   */
  nodeDeleteButtonClicked(index: number): void {
    const nodes = this.authoringComponentContent.nodes;
    const node = nodes[index];
    const nodeFileName = node.fileName;
    const nodeLabel = node.label;
    if (
      confirm(
        this.$translate('conceptMap.areYouSureYouWantToDeleteThisNode', {
          nodeFileName: nodeFileName,
          nodeLabel: nodeLabel
        })
      )
    ) {
      nodes.splice(index, 1);
      this.componentChanged();
    }
  }

  /**
   * A move link up button was clicked in the authoring tool.
   * @param index the index of the link
   */
  moveLinkUpButtonClicked(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.links, index);
    this.componentChanged();
  }

  /**
   * A move link down button was clicked in the authoring tool.
   * @param index the index of the link
   */
  moveLinkDownButtonClicked(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.links, index);
    this.componentChanged();
  }

  /**
   * A link delete button was clicked in the authoring tool.
   * @param index the index of the link
   */
  linkDeleteButtonClicked(index: number): void {
    const links = this.authoringComponentContent.links;
    const link = links[index];
    const linkLabel = link.label;
    if (
      confirm(
        this.$translate('conceptMap.areYouSureYouWantToDeleteThisLink', { linkLabel: linkLabel })
      )
    ) {
      links.splice(index, 1);
      this.componentChanged();
    }
  }

  addNode(): void {
    const newNode = {
      id: this.getNewConceptMapNodeId(),
      label: '',
      fileName: '',
      width: 100,
      height: 100
    };
    this.authoringComponentContent.nodes.push(newNode);
    this.componentChanged();
  }

  /**
   * Get the concept map node with the given id
   * @param nodeId the concept map node id
   * @return the concept map node with the given node id
   */
  getNodeById(nodeId: number): any {
    for (const node of this.authoringComponentContent.nodes) {
      if (nodeId === node.id) {
        return node;
      }
    }
    return null;
  }

  addLink(): void {
    const newLink = {
      id: this.getNewConceptMapLinkId(),
      label: '',
      color: ''
    };
    this.authoringComponentContent.links.push(newLink);
    this.componentChanged();
  }

  /**
   * Get a new ConceptMapNode id that isn't being used
   * @returns a new ConceptMapNode id e.g. 'node3'
   */
  getNewConceptMapNodeId(): string {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.nodes, 'node');
  }

  /**
   * Get a new ConceptMapLink id that isn't being used
   * @returns a new ConceptMapLink id e.g. 'link3'
   */
  getNewConceptMapLinkId(): string {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.links, 'link');
  }

  saveStarterConceptMap(): void {
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToSaveTheStarterConceptMap'))) {
      this.NodeService.requestStarterState({nodeId: this.nodeId, componentId: this.componentId});
    }
  }

  saveStarterState(starterState: any): void {
    this.authoringComponentContent.starterConceptMap = starterState;
    this.componentChanged();
  }

  deleteStarterConceptMap(): void {
    if (confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheStarterConceptMap'))) {
      this.authoringComponentContent.starterConceptMap = null;
      this.componentChanged();
    }
  }

  /**
   * Show the asset popup to allow the author to choose the background image
   */
  chooseBackgroundImage(): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.openAssetChooser(params);
  }

  /**
   * Show the asset popup to allow the author to choose an image for the node
   * @param conceptMapNodeId the id of the node in the concept map
   */
  chooseNodeImage(conceptMapNodeId: string): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: conceptMapNodeId
    };
    this.openAssetChooser(params);
  }

  assetSelected(args: any): void {
    super.assetSelected(args);
    const fileName = args.assetItem.fileName;
    if (args.target === 'background') {
      this.authoringComponentContent.background = fileName;
      this.componentChanged();
    } else if (args.target != null && args.target.indexOf('node') == 0) {
      const node = this.getNodeById(args.target);
      node.fileName = fileName;
      this.componentChanged();
    }
  }

}

const ConceptMapAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: ConceptMapAuthoringController,
  controllerAs: 'conceptMapController',
  templateUrl: 'wise5/components/conceptMap/authoring.html'
}

export default ConceptMapAuthoring;

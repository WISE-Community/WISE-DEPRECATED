'use strict';

import { Component } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ProjectAssetService } from '../../../../site/src/app/services/projectAssetService';
import { ComponentAuthoring } from '../../../authoringTool/components/component-authoring.component';
import { ConfigService } from '../../../services/configService';
import { NodeService } from '../../../services/nodeService';
import { TeacherProjectService } from '../../../services/teacherProjectService';
import { UtilService } from '../../../services/utilService';
import { ConceptMapService } from '../conceptMapService';

@Component({
  selector: 'concept-map-authoring',
  templateUrl: 'concept-map-authoring.component.html',
  styleUrls: ['concept-map-authoring.component.scss']
})
export class ConceptMapAuthoring extends ComponentAuthoring {
  availableNodes: any[];
  availableLinks: any[];
  inputChange: Subject<string> = new Subject<string>();
  inputChangeSubscription: Subscription;

  constructor(
    private ConceptMapService: ConceptMapService,
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  ngOnInit() {
    super.ngOnInit();

    this.availableNodes = this.componentContent.nodes;
    this.availableLinks = this.componentContent.links;

    if (this.componentContent.showNodeLabels == null) {
      this.componentContent.showNodeLabels = true;
      this.authoringComponentContent.showNodeLabels = true;
    }
  }

  ngOnDestroy() {
    this.inputChangeSubscription.unsubscribe();
  }

  moveNodeUpButtonClicked(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.nodes, index);
    this.componentChanged();
  }

  moveNodeDownButtonClicked(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.nodes, index);
    this.componentChanged();
  }

  nodeDeleteButtonClicked(index: number): void {
    const nodes = this.authoringComponentContent.nodes;
    const node = nodes[index];
    const nodeFileName = node.fileName;
    const nodeLabel = node.label;
    if (
      confirm(
        $localize`Are you sure you want to delete this node?\n\nFile Name: ${nodeFileName}\nLabel: ${nodeLabel}`
      )
    ) {
      nodes.splice(index, 1);
      this.componentChanged();
    }
  }

  moveLinkUpButtonClicked(index: number): void {
    this.UtilService.moveObjectUp(this.authoringComponentContent.links, index);
    this.componentChanged();
  }

  moveLinkDownButtonClicked(index: number): void {
    this.UtilService.moveObjectDown(this.authoringComponentContent.links, index);
    this.componentChanged();
  }

  linkDeleteButtonClicked(index: number): void {
    const links = this.authoringComponentContent.links;
    const link = links[index];
    const linkLabel = link.label;
    if (confirm($localize`Are you sure you want to delete this link?\n\nLabel: ${linkLabel}`)) {
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

  getNewConceptMapNodeId(): string {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.nodes, 'node');
  }

  getNewConceptMapLinkId(): string {
    return this.ConceptMapService.getNextAvailableId(this.authoringComponentContent.links, 'link');
  }

  saveStarterConceptMap(): void {
    if (confirm($localize`Are you sure you want to save the starter concept map?`)) {
      this.NodeService.requestStarterState({ nodeId: this.nodeId, componentId: this.componentId });
    }
  }

  saveStarterState(starterState: any): void {
    this.authoringComponentContent.starterConceptMap = starterState;
    this.componentChanged();
  }

  deleteStarterConceptMap(): void {
    if (confirm($localize`Are you sure you want to delete the starter concept map?`)) {
      this.authoringComponentContent.starterConceptMap = null;
      this.componentChanged();
    }
  }

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

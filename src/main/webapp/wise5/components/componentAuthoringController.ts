import * as angular from 'angular';
import { ConfigService } from "../services/configService";
import { UtilService } from "../services/utilService";
import { TeacherProjectService } from "../services/teacherProjectService";
import { ProjectAssetService } from '../../site/src/app/services/projectAssetService';
import { NodeService } from '../services/nodeService';
import { NotificationService } from '../services/notificationService';

export abstract class ComponentAuthoringController {

  $translate: any;
  allowedConnectedComponentTypes: any[];
  authoringComponentContent: any;
  authoringComponentContentJSONString: string;
  authoringValidComponentContentJSONString: string;
  componentContent: any;
  componentId: string;
  idToOrder: any;
  isDirty: boolean;
  isJSONStringChanged: boolean = false;
  isPromptVisible: boolean = true;
  isSaveButtonVisible: boolean;
  isSubmitButtonVisible: boolean;
  isSubmitDirty: boolean;
  latestAnnotations: any;
  nodeId: string;
  showAdvancedAuthoring: boolean = false;
  showJSONAuthoring: boolean = false;
  submitCounter: number;
  summernoteRubricId: string;
  summernoteRubricHTML: string;
  summernoteRubricOptions: any;

  constructor(
      protected $scope: any,
      protected $filter: any,
      protected ConfigService: ConfigService,
      protected NodeService: NodeService,
      protected NotificationService: NotificationService,
      protected ProjectAssetService: ProjectAssetService,
      protected ProjectService: TeacherProjectService,
      protected UtilService: UtilService) {
    this.authoringComponentContent = this.$scope.authoringComponentContent;
    this.componentContent = this.$scope.componentContent;
    this.componentId = this.componentContent.id;
    this.idToOrder = this.ProjectService.idToOrder;
    this.nodeId = this.$scope.nodeId;
    this.$translate = $filter('translate');
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
    this.summernoteRubricHTML = this.componentContent.rubric;
    const insertAssetString = this.$translate('INSERT_ASSET');
    const InsertAssetButton = this.UtilService.createInsertAssetButton(null, this.nodeId,
        this.componentId, 'rubric', insertAssetString,
        (params: any) => { this.openAssetChooser(params); });
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      },
      dialogsInBody: true
    };
  }

  $onInit() {
    this.updateAdvancedAuthoringView();
    this.$scope.$watch(
        () => {
          return this.authoringComponentContent
        },
        (newValue, oldValue) => {
          this.handleAuthoringComponentContentChanged(newValue, oldValue);
        },
        true
    );
    this.$scope.$watch(() => {
      return this.$scope.$parent.nodeAuthoringController
        .showAdvancedComponentAuthoring[this.componentId];
    }, () => {
      this.showAdvancedAuthoring = this.$scope.$parent.nodeAuthoringController
          .showAdvancedComponentAuthoring[this.componentId];
      this.NotificationService.hideJSONValidMessage();
    }, true);
  }

  handleAuthoringComponentContentChanged(newValue, oldValue): void {
    this.componentContent = this.ProjectService.injectAssetPaths(newValue);
    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
    this.latestAnnotations = null;
    this.isDirty = false;
    this.isSubmitDirty = false;
    this.submitCounter = 0;
  }

  showJSONButtonClicked(): void {
    if (this.showJSONAuthoring) {
      if (this.isJSONValid()) {
        this.saveJSONAuthoringViewChanges();
        this.toggleJSONAuthoringView();
        this.NotificationService.hideJSONValidMessage();
      } else {
        let isRollback = confirm(this.$translate('jsonInvalidErrorMessage'));
        if (isRollback) {
          this.toggleJSONAuthoringView();
          this.NotificationService.hideJSONValidMessage();
          this.isJSONStringChanged = false;
          this.rollbackToRecentValidJSON();
          this.saveJSONAuthoringViewChanges();
        }
      }
    } else {
      this.toggleJSONAuthoringView();
      this.rememberRecentValidJSON();
    }
  }

  isJSONValid(): boolean {
    try {
      angular.fromJson(this.authoringComponentContentJSONString);
      return true;
    } catch (e) {
      return false;
    }
  }

  saveJSONAuthoringViewChanges(): void {
    try {
      const editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);
      this.componentContent = editedComponentContent;
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      this.isJSONStringChanged = false;
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
  }

  toggleJSONAuthoringView(): void {
    this.showJSONAuthoring = !this.showJSONAuthoring;
  }

  authoringJSONChanged(): void {
    this.isJSONStringChanged = true;
    if (this.isJSONValid()) {
      this.NotificationService.showJSONValidMessage();
      this.rememberRecentValidJSON();
    } else {
      this.NotificationService.showJSONInvalidMessage();
    }
  }

  rememberRecentValidJSON(): void {
    this.authoringValidComponentContentJSONString = this.authoringComponentContentJSONString;
  }

  rollbackToRecentValidJSON(): void {
    this.authoringComponentContentJSONString = this.authoringValidComponentContentJSONString;
  }

  authoringViewComponentChanged(): void {
    this.updateAdvancedAuthoringView();
    this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
  }

  updateAdvancedAuthoringView(): void {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  }

  summernoteRubricHTMLChanged(): void {
    let html = this.ConfigService.removeAbsoluteAssetPaths(this.summernoteRubricHTML);
    html = this.UtilService.insertWISELinks(html);
    this.authoringComponentContent.rubric = html;
    this.authoringViewComponentChanged();
  }

  openAssetChooser(params: any): void {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {
    if (target === 'rubric') {
      const fileName = assetItem.fileName;
      const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
  }

  setShowSubmitButtonValue(show) {
    if (show == null || show == false) {
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
      this.authoringComponentContent.showSaveButton = true;
      this.authoringComponentContent.showSubmitButton = true;
    }
    this.NodeService.broadcastComponentShowSubmitButtonValueChanged({
      nodeId: this.nodeId,
      componentId: this.componentId,
      showSubmitButton: show
    });
  }

  addTag() {
    if (this.authoringComponentContent.tags == null) {
      this.authoringComponentContent.tags = [];
    }
    this.authoringComponentContent.tags.push('');
    this.authoringViewComponentChanged();
  }

  connectedComponentTypeChanged(connectedComponent) {
    this.authoringViewComponentChanged();
  }

  connectedComponentNodeIdChanged(connectedComponent) {
    connectedComponent.componentId = null;
    connectedComponent.type = null;
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  connectedComponentComponentIdChanged(connectedComponent) {
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  isConnectedComponentTypeAllowed(componentType) {
    for (const allowedConnectedComponentType of this.allowedConnectedComponentTypes) {
      if (allowedConnectedComponentType.type === componentType) {
        return true;
      }
    }
    return false;
  }

  addConnectedComponent() {
    const connectedComponent = this.createConnectedComponent();
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(connectedComponent);
    this.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    this.authoringViewComponentChanged();
  }

  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.ProjectService.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (this.isConnectedComponentTypeAllowed(component.type) &&
          component.id != this.componentId) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
    }
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentTypeIfPossible(connectedComponent) {
    if (connectedComponent.componentId != null) {
      connectedComponent.type = 'importWork';
    }
    this.automaticallySetConnectedComponentFieldsIfPossible(connectedComponent);
  }

  automaticallySetConnectedComponentFieldsIfPossible(connectedComponent) {
  }

  createConnectedComponent() {
    return {
      nodeId: this.nodeId,
      componentId: null,
      type: null
    };
  }

  deleteConnectedComponent(index) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'))) {
      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }
      this.authoringViewComponentChanged();
    }
  }

  getNodePositionAndTitleByNodeId(nodeId) {
    return this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
  }

  isApplicationNode(nodeId) {
    return this.ProjectService.isApplicationNode(nodeId);
  }

  getComponentsByNodeId(nodeId) {
    return this.ProjectService.getComponentsByNodeId(nodeId);
  }
}

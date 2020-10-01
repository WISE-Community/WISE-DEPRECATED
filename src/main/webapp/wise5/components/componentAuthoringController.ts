import * as angular from 'angular';
import { ConfigService } from "../services/configService";
import { UtilService } from "../services/utilService";
import { TeacherProjectService } from "../services/teacherProjectService";
import { ProjectAssetService } from '../../site/src/app/services/projectAssetService';
import { NodeService } from '../services/nodeService';
import { NotificationService } from '../services/notificationService';

export abstract class ComponentAuthoringController {

  $translate: any;
  authoringComponentContent: any;
  authoringComponentContentJSONString: string;
  authoringValidComponentContentJSONString: string;
  componentContent: any;
  componentId: string;
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
        .showAdvancedAdvancedAuthoring[this.componentId];
    }, () => {
      this.showAdvancedAuthoring = this.$scope.$parent.nodeAuthoringController
          .showAdvancedAdvancedAuthoring[this.componentId];
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
}

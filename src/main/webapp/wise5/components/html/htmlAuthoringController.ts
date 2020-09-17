'use strict';

import * as angular from 'angular';
import { ProjectAssetService } from '../../../site/src/app/services/projectAssetService';
import HTMLController from './htmlController';

class HTMLAuthoringController extends HTMLController {
  ProjectAssetService: ProjectAssetService;
  summernotePromptHTML: string;
  summernotePromptOptions: any;
  summernotePromptId: string;

  static $inject = [
    '$q',
    '$rootScope',
    '$scope',
    '$state',
    '$stateParams',
    '$sce',
    '$filter',
    '$mdDialog',
    'AnnotationService',
    'ConfigService',
    'NodeService',
    'NotebookService',
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $q,
    $rootScope,
    $scope,
    $state,
    $stateParams,
    $sce,
    $filter,
    $mdDialog,
    AnnotationService,
    ConfigService,
    NodeService,
    NotebookService,
    ProjectAssetService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $q,
      $rootScope,
      $scope,
      $state,
      $stateParams,
      $sce,
      $filter,
      $mdDialog,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.ProjectAssetService = ProjectAssetService;
    this.summernotePromptHTML = '';
    this.summernotePromptOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['customButton', ['insertWISELinkButton', 'insertAssetButton']],
        ['view', ['fullscreen', 'help']],
        ['view', ['codeview']]
      ],
      minHeight: 300,
      disableDragAndDrop: true,
      buttons: {
        insertWISELinkButton: this.UtilService.createInsertWISELinkButton(
          null,
          this.nodeId,
          this.componentId,
          'prompt',
          this.$translate('INSERT_WISE_LINK'),
          this.createOpenWISELinkChooserFunction()
        ),
        insertAssetButton: this.UtilService.createInsertAssetButton(
          null,
          this.nodeId,
          this.componentId,
          'prompt',
          this.$translate('INSERT_ASSET'),
          this.createOpenAssetChooserFunction()
        )
      },
      dialogsInBody: true
    };

    this.summernotePromptId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
    this.summernotePromptHTML = this.UtilService.replaceWISELinks(this.componentContent.html);
    $scope.$watch(
      function() {
        return this.authoringComponentContent;
      }.bind(this),
      function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      }.bind(this),
      true
    );
  }

  createOpenWISELinkChooserFunction() {
    return (params: any) => {
      this.openWISELinkChooser(params).then((linkParams: any) => {
        this.createWISELink(linkParams)
      });
    }
  }

  openWISELinkChooser({ projectId, nodeId, componentId, target }) {
    const stateParams = {
      projectId: projectId,
      nodeId: nodeId,
      componentId: componentId,
      target: target
    };
    return this.$mdDialog.show({
      templateUrl: 'wise5/authoringTool/wiseLink/wiseLinkAuthoring.html',
      controller: 'WISELinkAuthoringController',
      controllerAs: 'wiseLinkAuthoringController',
      $stateParams: stateParams,
      clickOutsideToClose: true,
      escapeToClose: true
    });
  }

  createWISELink({ nodeId, componentId, wiseLinkNodeId, wiseLinkComponentId, wiseLinkType,
      wiseLinkText, target }) {
    if (nodeId === this.nodeId && componentId === this.componentId && target === 'prompt') {
      if (wiseLinkType === 'link') {
        this.injectWISELinkToPrompt(
          this.createWISELinkLinkElement(wiseLinkNodeId, wiseLinkComponentId, wiseLinkText)
        );
      } else {
        this.injectWISELinkToPrompt(
          this.createWISELinkButtonElement(wiseLinkNodeId, wiseLinkComponentId, wiseLinkText)
        );
      }
    }
  }

  createOpenAssetChooserFunction() {
    return (params: any) => {
      this.ProjectAssetService.openAssetChooser(params).then(
        (data: any) => { this.assetSelected(data) }
      );
    }
  }

  assetSelected({ nodeId, componentId, assetItem, target }) {
    const fileName = assetItem.fileName;
    const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
    if (target === 'prompt') {
      this.UtilService.insertFileInSummernoteEditor(
        `summernotePrompt_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    } else {
      this.UtilService.insertFileInSummernoteEditor(
        `summernoteRubric_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
  }

  createWISELinkLinkElement(wiseLinkNodeId, wiseLinkComponentId = '', wiseLinkText) {
    const wiseLinkElement: any = document.createElement('a');
    wiseLinkElement.innerHTML = wiseLinkText;
    wiseLinkElement.setAttribute('wiselink', true);
    wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
    if (wiseLinkComponentId != '') {
      wiseLinkElement.setAttribute('component-id', wiseLinkComponentId);
    }
    wiseLinkElement.setAttribute('type', 'link');
    wiseLinkElement.setAttribute('link-text', wiseLinkText);
    return wiseLinkElement;
  }

  createWISELinkButtonElement(wiseLinkNodeId, wiseLinkComponentId = '', wiseLinkText) {
    const wiseLinkElement: any = document.createElement('button');
    wiseLinkElement.innerHTML = wiseLinkText;
    wiseLinkElement.setAttribute('wiselink', true);
    wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
    if (wiseLinkComponentId != '') {
      wiseLinkElement.setAttribute('component-id', wiseLinkComponentId);
    }
    wiseLinkElement.setAttribute('type', 'button');
    wiseLinkElement.setAttribute('link-text', wiseLinkText);
    return wiseLinkElement;
  }

  injectWISELinkToPrompt(wiseLinkElement) {
    const summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
    angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');
    angular
      .element(document.querySelector(`#${summernoteId}`))
      .summernote('insertNode', wiseLinkElement);
    angular
      .element(document.querySelector(`#${summernoteId}`))
      .summernote('insertNode', document.createElement('br'));
  }

  summernotePromptHTMLChanged() {
    this.authoringComponentContent.html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.summernotePromptHTML)
    );
    this.authoringViewComponentChanged();
  }
}

export default HTMLAuthoringController;

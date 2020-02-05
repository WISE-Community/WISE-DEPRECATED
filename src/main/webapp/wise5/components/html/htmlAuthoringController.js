'use strict';

import HTMLController from './htmlController';

class HTMLAuthoringController extends HTMLController {
  constructor($rootScope,
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
              UtilService) {
    super($rootScope,
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
      UtilService);
    this.summernotePromptHTML = '';
    const InsertWISELinkButton =this.UtilService.createInsertWISELinkButton(
        this, null, this.nodeId, this.componentId, 'prompt', this.$translate('INSERT_WISE_LINK'));
    const InsertAssetButton = this.UtilService.createInsertAssetButton(
        this, null, this.nodeId, this.componentId, 'prompt', this.$translate('INSERT_ASSET'));
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
        insertWISELinkButton: InsertWISELinkButton,
        insertAssetButton: InsertAssetButton
      }
    };

    this.summernotePromptId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
    this.summernotePromptHTML = this.UtilService.replaceWISELinks(this.componentContent.html);
    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
    }.bind(this), true);
  }

  $onInit() {
    this.registerAssetListener();
    this.registerWISELinkListener()
  }

  registerAssetListener() {
    this.$scope.$on('assetSelected', (event, {nodeId, componentId, assetItem, target}) => {
      if (nodeId === this.nodeId && componentId === this.componentId) {
        const fileName = assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        if (target === 'prompt') {
          this.UtilService.insertFileInSummernoteEditor(
              `summernotePrompt_${this.nodeId}_${this.componentId}`, fullFilePath, fileName);
        } else {
          this.UtilService.insertFileInSummernoteEditor(
              `summernoteRubric_${this.nodeId}_${this.componentId}`, fullFilePath, fileName);
        }
      }
      this.$mdDialog.hide();
    });
  }

  registerWISELinkListener() {
    this.$scope.$on('createWISELink', (event, {nodeId, componentId, wiseLinkNodeId,
          wiseLinkComponentId, wiseLinkType, wiseLinkText, target}) => {
      if (nodeId === this.nodeId && componentId === this.componentId && target === 'prompt') {
        if (wiseLinkType === 'link') {
          this.injectWISELinkToPrompt(
              this.createWISELinkLinkElement(wiseLinkNodeId,wiseLinkComponentId, wiseLinkText));
        } else {
          this.injectWISELinkToPrompt(
              this.createWISELinkButtonElement(wiseLinkNodeId, wiseLinkComponentId, wiseLinkText));
        }
      }
      this.$mdDialog.hide();
    });
  }

  createWISELinkLinkElement(wiseLinkNodeId, wiseLinkComponentId = '', wiseLinkText) {
    const wiseLinkElement = document.createElement('a');
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
    const wiseLinkElement = document.createElement('button');
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
    angular.element(document.querySelector(`#${summernoteId}`))
        .summernote('insertNode', wiseLinkElement);
    angular.element(document.querySelector(`#${summernoteId}`))
        .summernote('insertNode', document.createElement('br'));
  }

  summernotePromptHTMLChanged() {
    this.authoringComponentContent.html = this.UtilService.insertWISELinks(
        this.ConfigService.removeAbsoluteAssetPaths(this.summernotePromptHTML));
    this.authoringViewComponentChanged();
  }
}

HTMLAuthoringController.$inject = [
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
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default HTMLAuthoringController;

'use strict';

import { Directive } from '@angular/core';
import * as angular from 'angular';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class HTMLAuthoringController extends EditComponentController {
  summernotePromptHTML: string;
  summernotePromptOptions: any;
  summernotePromptId: string;

  static $inject = [
    '$filter',
    '$mdDialog',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    $mdDialog: any,
    ConfigService,
    NodeService,
    NotificationService,
    ProjectAssetService,
    ProjectService,
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
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
          (params: any) => { this.openAssetChooser(params); }
        )
      },
      dialogsInBody: true
    };

    this.summernotePromptId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
    this.summernotePromptHTML = this.UtilService.replaceWISELinks(this.componentContent.html);
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
      this.injectWISELinkToPrompt(
        this.createWISELinkElement(wiseLinkType, wiseLinkNodeId, wiseLinkComponentId, wiseLinkText)
      );
    }
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

  /**
   * @param type Allowed values are 'link' or 'button'.
   */
  createWISELinkElement(type: string, wiseLinkNodeId: string, wiseLinkComponentId: string = '',
      wiseLinkText: string) {
    let wiseLinkElement: any;
    if (type === 'link') {
      wiseLinkElement = document.createElement('a');
    } else {
      wiseLinkElement = document.createElement('button');
    }
    wiseLinkElement.setAttribute('type', type);
    wiseLinkElement.setAttribute('wiselink', true);
    wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
    if (wiseLinkComponentId != '') {
      wiseLinkElement.setAttribute('component-id', wiseLinkComponentId);
    }
    wiseLinkElement.setAttribute('link-text', wiseLinkText);
    wiseLinkElement.innerHTML = wiseLinkText;
    return wiseLinkElement;
  }

  assetSelected({ nodeId, componentId, assetItem, target }) {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    if (target === 'prompt') {
      const fileName = assetItem.fileName;
      const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
      this.UtilService.insertFileInSummernoteEditor(
        `summernotePrompt_${this.nodeId}_${this.componentId}`,
        fullFilePath,
        fileName
      );
    }
  }

  summernotePromptHTMLChanged() {
    this.authoringComponentContent.html = this.UtilService.insertWISELinks(
      this.ConfigService.removeAbsoluteAssetPaths(this.summernotePromptHTML)
    );
    this.authoringViewComponentChanged();
  }
}

const HTMLAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: HTMLAuthoringController,
  controllerAs: 'htmlController',
  templateUrl: 'wise5/components/html/authoring.html'
}

export default HTMLAuthoring;


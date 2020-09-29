'use strict';

import { ProjectAssetService } from "../../../site/src/app/services/projectAssetService";
import EmbeddedController from "./embeddedController";

class EmbeddedAuthoringController extends EmbeddedController {
  ProjectAssetService: ProjectAssetService;
  allowedConnectedComponentTypes: any[];
  embeddedApplicationIFrameId: string;

  static $inject = [
    '$filter',
    '$injector',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$sce',
    '$timeout',
    '$window',
    'AnnotationService',
    'ConfigService',
    'EmbeddedService',
    'NodeService',
    'NotebookService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor($filter,
              $injector,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $sce,
              $timeout,
              $window,
              AnnotationService,
              ConfigService,
              EmbeddedService,
              NodeService,
              NotebookService,
              NotificationService,
              ProjectAssetService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $injector,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $sce,
      $timeout,
      $window,
      AnnotationService,
      ConfigService,
      EmbeddedService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    this.ProjectAssetService = ProjectAssetService;

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'AudioOscillator' },
      { type: 'ConceptMap' },
      { type: 'Discussion' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Match' },
      { type: 'MultipleChoice' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.setWidthAndHeight(this.componentContent.width, this.componentContent.height);
      this.setURL(this.componentContent.url);
    }.bind(this), true);
  }

  showModelFileChooserPopup() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'modelFile'
    };
    this.openAssetChooser(params);
  }

  openAssetChooser(params: any) {
    this.ProjectAssetService.openAssetChooser(params).then(
      (data: any) => { this.assetSelected(data) }
    );
  }

  assetSelected(args: any) {
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
    } else if (args.target === 'modelFile') {
      this.authoringComponentContent.url = fileName;
      this.authoringViewComponentChanged();
    }
  }

  reloadModel() {
    const iframe: any = document.getElementById(this.embeddedApplicationIFrameId);
    const src = iframe.src;
    iframe.src = '';
    iframe.src = src;
  }
}

export default EmbeddedAuthoringController;

'use strict';

import DrawController from "./drawController";
import drawingTool from '../../lib/drawingTool/drawing-tool';
import drawingToolVendor from '../../lib/drawingTool/vendor.min';
import html2canvas from 'html2canvas';

class DrawAuthoringController extends DrawController {
  constructor($filter,
              $injector,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnnotationService,
              ConfigService,
              DrawService,
              NodeService,
              NotebookService,
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
      $timeout,
      AnnotationService,
      ConfigService,
      DrawService,
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

    this.isResetButtonVisible = true;
    this.drawingToolId = 'drawingtool_' + this.nodeId + '_' + this.componentId;

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.submitCounter = 0;
      this.initializeDrawingTool();
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
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
        this.authoringViewBackgroundChanged();
      } else if (args.target === 'stamp') {
        const stampIndex = args.targetObject;
        this.setStampImage(stampIndex, fileName);
        this.authoringViewBackgroundChanged();
      }
    }
    this.$mdDialog.hide();
  }

  authoringAddStampButtonClicked() {
    this.initializeAuthoringComponentContentStampsIfNecessary();
    /*
     * create the stamp as an empty string that the author will replace
     * with a file name or url
     */
    this.authoringComponentContent.stamps.Stamps.push('');
    this.authoringViewComponentChanged();
  }

  initializeAuthoringComponentContentStampsIfNecessary() {
    if (this.authoringComponentContent != null) {
      if (this.authoringComponentContent.stamps == null) {
        this.authoringComponentContent.stamps = {};
      }
      if (this.authoringComponentContent.stamps.Stamps == null) {
        this.authoringComponentContent.stamps.Stamps = [];
      }
    }
  }

  /**
   * Move a stamp up in the authoring view
   * @param index the index of the stamp to move
   */
  authoringMoveStampUp(index) {
    if (index != 0) {
      const stamp = this.authoringComponentContent.stamps.Stamps[index];
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.authoringComponentContent.stamps.Stamps.splice(index - 1, 0, stamp);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move the stamp down in the authoring view
   * @param index the index of the stamp to move
   */
  authoringMoveStampDown(index) {
    if (index != this.authoringComponentContent.stamps.Stamps.length - 1) {
      const stamp = this.authoringComponentContent.stamps.Stamps[index];
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.authoringComponentContent.stamps.Stamps.splice(index + 1, 0, stamp);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Delete a stamp from the authoring view
   * @param index the index of the stamp
   */
  authoringDeleteStampClicked(index) {
    if (confirm(this.$translate('draw.areYouSureYouWantToDeleteThisStamp') + '\n\n' + this.authoringComponentContent.stamps.Stamps[index])) {
      this.authoringComponentContent.stamps.Stamps.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  authoringEnableAllToolsButtonClicked() {
    if (this.authoringComponentContent.tools == null) {
      this.authoringComponentContent.tools = {};
    }
    this.authoringComponentContent.tools.select = true;
    this.authoringComponentContent.tools.line = true;
    this.authoringComponentContent.tools.shape = true;
    this.authoringComponentContent.tools.freeHand = true;
    this.authoringComponentContent.tools.text = true;
    this.authoringComponentContent.tools.stamp = true;
    this.authoringComponentContent.tools.strokeColor = true;
    this.authoringComponentContent.tools.fillColor = true;
    this.authoringComponentContent.tools.clone = true;
    this.authoringComponentContent.tools.strokeWidth = true;
    this.authoringComponentContent.tools.sendBack = true;
    this.authoringComponentContent.tools.sendForward = true;
    this.authoringComponentContent.tools.undo = true;
    this.authoringComponentContent.tools.redo = true;
    this.authoringComponentContent.tools.delete = true;
    this.authoringViewComponentChanged();
  }

  authoringDisableAllToolsButtonClicked() {
    if (this.authoringComponentContent.tools == null) {
      this.authoringComponentContent.tools = {};
    }
    this.authoringComponentContent.tools.select = false;
    this.authoringComponentContent.tools.line = false;
    this.authoringComponentContent.tools.shape = false;
    this.authoringComponentContent.tools.freeHand = false;
    this.authoringComponentContent.tools.text = false;
    this.authoringComponentContent.tools.stamp = false;
    this.authoringComponentContent.tools.strokeColor = false;
    this.authoringComponentContent.tools.fillColor = false;
    this.authoringComponentContent.tools.clone = false;
    this.authoringComponentContent.tools.strokeWidth = false;
    this.authoringComponentContent.tools.sendBack = false;
    this.authoringComponentContent.tools.sendForward = false;
    this.authoringComponentContent.tools.undo = false;
    this.authoringComponentContent.tools.redo = false;
    this.authoringComponentContent.tools.delete = false;
    this.authoringViewComponentChanged();
  }

  authoringSaveStarterDrawData() {
    if (confirm(this.$translate('draw.areYouSureYouWantToSaveTheStarterDrawing'))) {
      const drawData = this.getDrawData();
      this.authoringComponentContent.starterDrawData = drawData;
      this.authoringViewComponentChanged();
    }
  }

  authoringDeleteStarterDrawData() {
    if (confirm(this.$translate('draw.areYouSureYouWantToDeleteTheStarterDrawing'))) {
      this.authoringComponentContent.starterDrawData = null;
      this.drawingTool.clear();
      this.authoringViewComponentChanged();
    }
  }

  authoringViewWidthChanged() {
    this.width = this.authoringComponentContent.width;
    this.updateStarterDrawDataWidth();
    this.authoringViewComponentChanged();
    this.authoringInitializeDrawingToolAfterTimeout();
  }

  updateStarterDrawDataWidth() {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        starterDrawDataJSONObject.dt.width = this.width;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  authoringViewHeightChanged() {
    this.height = this.authoringComponentContent.height;
    this.updateStarterDrawDataHeight();
    this.authoringViewComponentChanged();
    this.authoringInitializeDrawingToolAfterTimeout();
  }

  updateStarterDrawDataHeight() {
    if (this.authoringComponentContent.starterDrawData != null) {
      const starterDrawDataJSONObject = angular.fromJson(this.authoringComponentContent.starterDrawData);
      if (starterDrawDataJSONObject != null && starterDrawDataJSONObject.dt != null) {
        starterDrawDataJSONObject.dt.height = this.height;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSONObject);
      }
    }
  }

  authoringViewToolClicked() {
    this.authoringViewComponentChanged();
    this.authoringInitializeDrawingToolAfterTimeout();
  }

  /**
   * Show the asset popup to allow the author to choose the background image
   */
  chooseBackgroundImage() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  authoringViewBackgroundChanged() {
    this.updateStarterDrawDataBackground();
    this.authoringViewComponentChanged();
  }

  updateStarterDrawDataBackground() {
    const starterDrawData = this.authoringComponentContent.starterDrawData;
    if (starterDrawData != null) {
      const starterDrawDataJSON = angular.fromJson(starterDrawData);
      if (starterDrawDataJSON != null &&
        starterDrawDataJSON.canvas != null &&
        starterDrawDataJSON.canvas.backgroundImage != null &&
        starterDrawDataJSON.canvas.backgroundImage.src != null) {
        /*
         * get the project assets directory path
         * e.g. https://www.berkeley.edu/curriculum/25/assets
         */
        const projectAssetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath(true);
        const background = this.authoringComponentContent.background;
        /*
         * generate the absolute path to the background image
         * e.g. https://www.berkeley.edu/curriculum/25/assets/earth.png
         */
        const newSrc = projectAssetsDirectoryPath + '/' + background;
        starterDrawDataJSON.canvas.backgroundImage.src = newSrc;
        this.authoringComponentContent.starterDrawData = angular.toJson(starterDrawDataJSON);
      }
    }
  }

  /**
   * Open the asset chooser to select an image for the stamp
   * @param index the index of the stamp
   */
  chooseStampImage(index) {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'stamp',
      targetObject: index
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Set the stamp image
   * @param index the index of the stamp
   * @param fileName the file name of the image
   */
  setStampImage(index, fileName) {
    this.authoringComponentContent.stamps.Stamps[index] = fileName;
  }

  handleConnectedComponentsPostProcess() {
    if (this.componentContent != null &&
      this.componentContent.background != null) {
      this.drawingTool.setBackgroundImage(this.componentContent.background);
    }
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let components = this.getComponentsByNodeId(connectedComponent.nodeId);
    if (components != null) {
      let numberOfAllowedComponents = 0;
      let allowedComponent = null;
      for (let component of components) {
        if (component != null) {
          if (this.isConnectedComponentTypeAllowed(component.type) &&
              component.id != this.componentId) {
            // we have found a viable component we can connect to
            numberOfAllowedComponents += 1;
            allowedComponent = component;
          }
        }
      }
      if (numberOfAllowedComponents == 1) {
        /*
         * there is only one viable component to connect to so we
         * will use it
         */
        connectedComponent.componentId = allowedComponent.id;
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      }
    }
  }

  /**
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {
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
  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (componentType === 'ConceptMap' ||
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
   * @param connectedComponent The connected component associated with the checkbox.
   */
  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.authoringViewComponentChanged();
  }

  authoringInitializeDrawingToolAfterTimeout() {
    this.$timeout(angular.bind(this, this.initializeDrawingTool));
  }
}

DrawAuthoringController.$inject = [
  '$filter',
  '$injector',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConfigService',
  'DrawService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'];

export default DrawAuthoringController;

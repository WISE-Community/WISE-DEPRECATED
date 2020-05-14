'use strict';

import * as $ from 'jquery';
import LabelController from './labelController';
import * as fabric from 'fabric';
window['fabric'] = fabric.fabric
import html2canvas from 'html2canvas';

class LabelAuthoringController extends LabelController {
  $window: any;
  allowedConnectedComponentTypes: any[];

  static $inject = [
    '$filter',
    '$mdDialog',
    '$q',
    '$rootScope',
    '$scope',
    '$timeout',
    '$window',
    'AnnotationService',
    'ConfigService',
    'LabelService',
    'NodeService',
    'NotebookService',
    'OpenResponseService',
    'ProjectService',
    'StudentAssetService',
    'StudentDataService',
    'UtilService'
  ];

  constructor(
    $filter,
    $mdDialog,
    $q,
    $rootScope,
    $scope,
    $timeout,
    $window,
    AnnotationService,
    ConfigService,
    LabelService,
    NodeService,
    NotebookService,
    OpenResponseService,
    ProjectService,
    StudentAssetService,
    StudentDataService,
    UtilService
  ) {
    super(
      $filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      $window,
      AnnotationService,
      ConfigService,
      LabelService,
      NodeService,
      NotebookService,
      OpenResponseService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService
    );
    this.allowedConnectedComponentTypes = [
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    if (this.componentContent.enableCircles == null) {
      /*
       * If this component was created before enableCircles was implemented,
       * we will default it to true in the authoring so that the
       * "Enable Dots" checkbox is checked.
       */
      this.authoringComponentContent.enableCircles = true;
    }

    $scope.$watch(
      function() {
        return this.authoringComponentContent;
      }.bind(this),
      function(newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.canvasWidth = 800;
        this.canvasHeight = 600;
        this.submitCounter = 0;
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.enableCircles = this.componentContent.enableCircles;

        if (this.canvas != null) {
          $('#canvasParent_' + this.canvasId).empty();
          const canvas = $('<canvas/>');
          canvas.attr('id', this.canvasId);
          canvas.css('border', '1px solid black');
          $('#canvasParent_' + this.canvasId).append(canvas);
          // clear the background so that setupCanvas() can reapply the background
          this.backgroundImage = null;
          this.setupCanvas();
        }
        if (this.componentContent.canCreateLabels != null) {
          this.canCreateLabels = this.componentContent.canCreateLabels;
        }
        if (this.canCreateLabels) {
          this.isNewLabelButtonVisible = true;
        } else {
          this.isNewLabelButtonVisible = false;
        }
      }.bind(this),
      true
    );
    this.registerAssetListener();
  }

  registerAssetListener() {
    this.$scope.$on('assetSelected', (event, { nodeId, componentId, assetItem, target }) => {
      if (nodeId === this.nodeId && componentId === this.componentId) {
        const fileName = assetItem.fileName;
        const fullFilePath = `${this.ConfigService.getProjectAssetsDirectoryPath()}/${fileName}`;
        if (target === 'rubric') {
          this.UtilService.insertFileInSummernoteEditor(
            `summernoteRubric_${this.nodeId}_${this.componentId}`,
            fullFilePath,
            fileName
          );
        } else if (target === 'background') {
          this.authoringComponentContent.backgroundImage = fileName;
          this.authoringViewComponentChanged();
        }
      }
      this.$mdDialog.hide();
    });
  }

  authoringAddLabelClicked() {
    const newLabel = {
      text: this.$translate('label.enterTextHere'),
      color: 'blue',
      pointX: 100,
      pointY: 100,
      textX: 200,
      textY: 200,
      canEdit: false,
      canDelete: false
    };
    this.authoringComponentContent.labels.push(newLabel);
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a label in the authoring view
   * @param index the index of the label in the labels array
   */
  authoringDeleteLabelClicked(index, label) {
    const answer = confirm(
      this.$translate('label.areYouSureYouWantToDeleteThisLabel', {
        selectedLabelText: label.textString
      })
    );
    if (answer) {
      this.authoringComponentContent.labels.splice(index, 1);
      this.authoringViewComponentChanged();
    }
  }

  chooseBackgroundImage() {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  saveStarterLabels() {
    if (confirm(this.$translate('label.areYouSureYouWantToSaveTheStarterLabels'))) {
      const starterLabels = this.UtilService.makeCopyOfJSONObject(this.getLabelData());
      starterLabels.sort(this.labelTextComparator);
      this.authoringComponentContent.labels = starterLabels;
      this.authoringViewComponentChanged();
    }
  }

  /**
   * A comparator used to sort labels alphabetically
   * It should be used like labels.sort(this.labelTextComparator);
   * @param labelA a label object
   * @param labelB a label object
   * @return -1 if labelA comes before labelB
   * 1 if labelB comes after labelB
   * 0 of the labels are equal
   */
  labelTextComparator(labelA, labelB) {
    if (labelA.text < labelB.text) {
      return -1;
    } else if (labelA.text > labelB.text) {
      return 1;
    } else {
      if (labelA.color < labelB.color) {
        return -1;
      } else if (labelA.color > labelB.color) {
        return 1;
      } else {
        if (labelA.pointX < labelB.pointX) {
          return -1;
        } else if (labelA.pointX > labelB.pointX) {
          return 1;
        } else {
          if (labelA.pointY < labelB.pointY) {
            return -1;
          } else if (labelA.pointY > labelB.pointY) {
            return 1;
          } else {
            return 0;
          }
        }
      }
    }
  }

  deleteStarterLabels() {
    if (confirm(this.$translate('label.areYouSureYouWantToDeleteAllTheStarterLabels'))) {
      this.authoringComponentContent.labels = [];
      this.authoringViewComponentChanged();
    }
  }

  openColorViewer() {
    this.$window.open('http://www.javascripter.net/faq/colornam.htm');
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    let numberOfAllowedComponents = 0;
    let allowedComponent = null;
    for (const component of this.getComponentsByNodeId(connectedComponent.nodeId)) {
      if (
        this.isConnectedComponentTypeAllowed(component.type) &&
        component.id != this.componentId
      ) {
        numberOfAllowedComponents += 1;
        allowedComponent = component;
      }
    }
    if (numberOfAllowedComponents === 1) {
      connectedComponent.componentId = allowedComponent.id;
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
    }
  }

  authoringConnectedComponentComponentIdChanged(connectedComponent) {
    if (connectedComponent != null) {
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      this.authoringViewComponentChanged();
    }
  }

  /**
   * For certain component types, set the importWorkAsBackground field to true by default
   * @param connectedComponent The connected component object.
   */
  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    const componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (['ConceptMap', 'Draw', 'Embedded', 'Graph', 'Table'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (connectedComponent.importWorkAsBackground) {
      connectedComponent.charactersPerLine = 100;
      connectedComponent.spaceInbetweenLines = 40;
      connectedComponent.fontSize = 16;
    } else {
      delete connectedComponent.charactersPerLine;
      delete connectedComponent.spaceInbetweenLines;
      delete connectedComponent.fontSize;
      delete connectedComponent.importWorkAsBackground;
    }
    this.authoringViewComponentChanged();
  }
}

export default LabelAuthoringController;

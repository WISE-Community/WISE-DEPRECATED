'use strict';

import * as $ from 'jquery';
import * as fabric from 'fabric';
window['fabric'] = fabric.fabric
import html2canvas from 'html2canvas';
import { Directive } from '@angular/core';
import { EditComponentController } from '../../authoringTool/components/editComponentController';

@Directive()
class LabelAuthoringController extends EditComponentController {
  
  static $inject = [
    '$filter',
    '$window',
    'ConfigService',
    'NodeService',
    'NotificationService',
    'ProjectAssetService',
    'ProjectService',
    'UtilService'
  ];

  constructor(
    $filter,
    private $window,
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
    if (this.authoringComponentContent.enableCircles == null) {
      /*
       * If this component was created before enableCircles was implemented,
       * we will default it to true in the authoring so that the
       * "Enable Dots" checkbox is checked.
       */
      this.authoringComponentContent.enableCircles = true;
    }
  }

  addLabelClicked(): void {
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
  deleteLabelClicked(index: number, label: any): void {
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

  chooseBackgroundImage(): void {
    const params = {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: 'background'
    };
    this.openAssetChooser(params);
  }

  assetSelected({ nodeId, componentId, assetItem, target }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    const fileName = assetItem.fileName;
    if (target === 'background') {
      this.authoringComponentContent.backgroundImage = fileName;
      this.authoringViewComponentChanged();
    }
  }

  saveStarterLabels(): void {
    if (confirm(this.$translate('label.areYouSureYouWantToSaveTheStarterLabels'))) {
      this.NodeService.requestStarterState({nodeId: this.nodeId, componentId: this.componentId});
    }
  }

  saveStarterState(starterState: any): void {
    starterState.sort(this.labelTextComparator);
    this.authoringComponentContent.labels = starterState;
    this.authoringViewComponentChanged();
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
  labelTextComparator(labelA: any, labelB: any): number {
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

  deleteStarterLabels(): void {
    if (confirm(this.$translate('label.areYouSureYouWantToDeleteAllTheStarterLabels'))) {
      this.authoringComponentContent.labels = [];
      this.authoringViewComponentChanged();
    }
  }

  openColorViewer(): void {
    this.$window.open('http://www.javascripter.net/faq/colornam.htm');
  }

  /**
   * Automatically set the component id for the connected component if there
   * is only one viable option.
   * @param connectedComponent the connected component object we are authoring
   */
  automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent: any): void {
    super.automaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
    if (connectedComponent.componentId != null) {
      this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    }
  }

  connectedComponentComponentIdChanged(connectedComponent: any): void {
    this.automaticallySetConnectedComponentTypeIfPossible(connectedComponent);
    this.setImportWorkAsBackgroundIfApplicable(connectedComponent);
    this.authoringViewComponentChanged();
  }

  /**
   * For certain component types, set the importWorkAsBackground field to true by default
   * @param connectedComponent The connected component object.
   */
  setImportWorkAsBackgroundIfApplicable(connectedComponent: any): void {
    const componentType = this.getConnectedComponentType(connectedComponent);
    if (['ConceptMap', 'Draw', 'Embedded', 'Graph', 'Table'].includes(componentType)) {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  importWorkAsBackgroundClicked(connectedComponent: any): void {
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

const LabelAuthoring = {
  bindings: {
    nodeId: '@',
    componentId: '@'
  },
  controller: LabelAuthoringController,
  controllerAs: 'labelController',
  templateUrl: 'wise5/components/label/authoring.html'
}

export default LabelAuthoring;

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

@Component({
  selector: 'animation-authoring',
  templateUrl: 'animation-authoring.component.html',
  styleUrls: ['animation-authoring.component.scss']
})
export class AnimationAuthoring extends ComponentAuthoring {
  stepNodesDetails: string[];
  availableDataSourceComponentTypes = ['Graph'];
  inputChange: Subject<string> = new Subject<string>();
  inputChangeSubscription: Subscription;

  constructor(
    protected ConfigService: ConfigService,
    protected NodeService: NodeService,
    protected ProjectAssetService: ProjectAssetService,
    protected ProjectService: TeacherProjectService,
    protected UtilService: UtilService
  ) {
    super(ConfigService, NodeService, ProjectAssetService, ProjectService);
    this.stepNodesDetails = this.ProjectService.getStepNodesDetailsInOrder();
    this.inputChangeSubscription = this.inputChange
      .pipe(debounceTime(1000), distinctUntilChanged())
      .subscribe(() => {
        this.componentChanged();
      });
  }

  addObject(): void {
    if (this.authoringComponentContent.objects == null) {
      this.authoringComponentContent.objects = [];
    }
    const newObject = {
      id: this.UtilService.generateKey(10),
      type: 'image'
    };
    this.authoringComponentContent.objects.push(newObject);
    this.componentChanged();
  }

  addDataPointToObject(authoredObject: any): void {
    if (this.authoredObjectHasDataSource(authoredObject)) {
      if (this.askIfWantToDeleteDataSource()) {
        delete authoredObject.dataSource;
        this.addNewDataPoint(authoredObject);
      }
    } else {
      this.addNewDataPoint(authoredObject);
    }
    this.componentChanged();
  }

  authoredObjectHasDataSource(authoredObject: any): boolean {
    return authoredObject.dataSource != null;
  }

  askIfWantToDeleteDataSource(): boolean {
    return confirm(
      $localize`You can only have Data Points or a Data Source. If you add a Data Point, the Data Source will be deleted. Are you sure you want to add a Data Point?`
    );
  }

  initializeAuthoredObjectDataIfNecessary(authoredObject: any): void {
    if (authoredObject.data == null) {
      authoredObject.data = [];
    }
  }

  addNewDataPoint(authoredObject: any): void {
    this.initializeAuthoredObjectDataIfNecessary(authoredObject);
    const newDataPoint = {};
    authoredObject.data.push(newDataPoint);
  }

  confirmDeleteAnimationObjectDataPoint(animationObject: any, index: number): void {
    if (confirm($localize`Are you sure you want to delete this data point?`)) {
      this.deleteAnimationObjectDataPoint(animationObject, index);
    }
  }

  deleteAnimationObjectDataPoint(animationObject: any, index: number): void {
    animationObject.data.splice(index, 1);
    this.componentChanged();
  }

  moveAuthoredObjectDataPointUp(object: any, index: number): void {
    if (this.canMoveUp(index)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index - 1, 0, dataPoint);
      this.componentChanged();
    }
  }

  moveAuthoredObjectDataPointDown(object: any, index: number): void {
    if (this.canMoveDown(index, object.data.length)) {
      const dataPoint = object.data[index];
      object.data.splice(index, 1);
      object.data.splice(index + 1, 0, dataPoint);
      this.componentChanged();
    }
  }

  moveAuthoredObjectUp(index: number): void {
    if (this.canMoveUp(index)) {
      const objects = this.authoringComponentContent.objects;
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index - 1, 0, object);
      this.componentChanged();
    }
  }

  moveAuthoredObjectDown(index: number): void {
    const objects = this.authoringComponentContent.objects;
    if (this.canMoveDown(index, objects.length)) {
      const object = objects[index];
      objects.splice(index, 1);
      objects.splice(index + 1, 0, object);
      this.componentChanged();
    }
  }

  canMoveUp(index: number): boolean {
    return index > 0;
  }

  canMoveDown(index: number, length: number): boolean {
    return index < length - 1;
  }

  confirmDeleteAnimationObject(index: number): void {
    if (confirm($localize`Are you sure you want to delete this object?`)) {
      this.deleteAnimationObject(index);
    }
  }

  deleteAnimationObject(index: number): void {
    this.authoringComponentContent.objects.splice(index, 1);
    this.componentChanged();
  }

  addDataSource(authoredObject: any): void {
    if (this.authoredObjectHasData(authoredObject)) {
      if (
        confirm(
          $localize`You can only have Data Points or a Data Source. If you add a Data Source, the Data Points will be deleted. Are you sure you want to add a Data Source?`
        )
      ) {
        this.deleteDataAndAddDataSource(authoredObject);
      }
    } else {
      this.deleteDataAndAddDataSource(authoredObject);
    }
    this.componentChanged();
  }

  authoredObjectHasData(authoredObject: any): boolean {
    return authoredObject.data != null && authoredObject.data.length > 0;
  }

  deleteDataAndAddDataSource(authoredObject: any): void {
    this.deleteDataFromAuthoredObject(authoredObject);
    this.addDataSourceToAuthoredObject(authoredObject);
  }

  deleteDataFromAuthoredObject(authoredObject: any): void {
    delete authoredObject.data;
  }

  addDataSourceToAuthoredObject(authoredObject: any): void {
    authoredObject.dataSource = {};
  }

  confirmDeleteDataSource(animationObject: any): void {
    if (confirm($localize`Are you sure you want to delete the Data Source?`)) {
      this.authoringDeleteDataSource(animationObject);
    }
  }

  authoringDeleteDataSource(animationObject: any): void {
    delete animationObject.dataSource;
    this.componentChanged();
  }

  dataSourceNodeChanged(authoredObject: any): void {
    const nodeId = authoredObject.dataSource.nodeId;
    authoredObject.dataSource = {
      nodeId: nodeId
    };
    const components = this.getComponentsByNodeId(nodeId);
    const availableDataSourceComponents = components.filter((component) => {
      return this.availableDataSourceComponentTypes.includes(component.type);
    });
    if (availableDataSourceComponents.length === 1) {
      authoredObject.dataSource.componentId = availableDataSourceComponents[0].id;
      this.dataSourceComponentChanged(authoredObject);
    } else {
      this.componentChanged();
    }
  }

  dataSourceComponentChanged(authoredObject: any): void {
    const nodeId = authoredObject.dataSource.nodeId;
    const componentId = authoredObject.dataSource.componentId;
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    authoredObject.dataSource = {
      nodeId: nodeId,
      componentId: componentId
    };
    if (this.isAvailableDataSourceComponentType(component.type)) {
      this.setDefaultParamsForGraphDataSource(authoredObject);
    }
    this.componentChanged();
  }

  isAvailableDataSourceComponentType(componentType: string) {
    return this.availableDataSourceComponentTypes.includes(componentType);
  }

  setDefaultParamsForGraphDataSource(authoredObject: any): void {
    authoredObject.dataSource.trialIndex = 0;
    authoredObject.dataSource.seriesIndex = 0;
    authoredObject.dataSource.tColumnIndex = 0;
    authoredObject.dataSource.xColumnIndex = 1;
  }

  chooseImage(authoredObject: any, targetString: string = 'image'): void {
    const params = this.createOpenAssetChooserParamsObject(targetString, authoredObject);
    this.openAssetChooser(params);
  }

  /**
   * @param {string} targetString Can be 'image', 'imageMovingLeft', or 'imageMovingRight'.
   * @param {object} authoredObject
   * @returns {object}
   */
  createOpenAssetChooserParamsObject(targetString: string, authoredObject: any): any {
    return {
      isPopup: true,
      nodeId: this.nodeId,
      componentId: this.componentId,
      target: targetString,
      targetObject: authoredObject
    };
  }

  assetSelected({ nodeId, componentId, assetItem, target, targetObject }): void {
    super.assetSelected({ nodeId, componentId, assetItem, target });
    targetObject[target] = assetItem.fileName;
    this.componentChanged();
  }

  authoredObjectTypeChanged(authoredObject: any): void {
    if (authoredObject.type === 'image') {
      this.removeTextFromAuthoredObject(authoredObject);
    } else if (authoredObject.type === 'text') {
      this.removeImageFromAuthoredObject(authoredObject);
    }
    this.componentChanged();
  }

  removeTextFromAuthoredObject(authoredObject: any): void {
    delete authoredObject.text;
  }

  removeImageFromAuthoredObject(authoredObject: any): void {
    [
      'image',
      'width',
      'height',
      'imageMovingLeft',
      'imageMovingRight',
      'imageMovingUp',
      'imageMovingDown'
    ].forEach((field) => {
      delete authoredObject[field];
    });
  }

  getComponentByNodeIdAndComponentId(nodeId: string, componentId: string): any {
    if (nodeId != null && componentId != null) {
      const component = super.getComponentByNodeIdAndComponentId(nodeId, componentId);
      if (component != null) {
        return component;
      }
    }
    return {};
  }
}

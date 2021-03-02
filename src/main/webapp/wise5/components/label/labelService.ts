'use strict';

import * as angular from 'angular';
import { fabric } from 'fabric';
import SVG from 'svg.js';
import { ComponentService } from '../componentService';
import { StudentAssetService } from '../../services/studentAssetService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { UtilService } from '../../services/utilService';
import { StudentDataService } from '../../services/studentDataService';

@Injectable()
export class LabelService extends ComponentService {
  lineZIndex: number = 0;
  textZIndex: number = 1;
  circleZIndex: number = 2;
  defaultTextBackgroundColor: string = 'blue';

  constructor(
    private upgrade: UpgradeModule,
    private StudentAssetService: StudentAssetService,
    protected StudentDataService: StudentDataService,
    protected UtilService: UtilService
  ) {
    super(StudentDataService, UtilService);
    this.StudentAssetService = StudentAssetService;
  }

  getComponentTypeLabel() {
    return this.upgrade.$injector.get('$filter')('translate')('label.componentTypeLabel');
  }

  createComponent() {
    const component: any = super.createComponent();
    component.type = 'Label';
    component.backgroundImage = '';
    component.canCreateLabels = true;
    component.canEditLabels = true;
    component.canDeleteLabels = true;
    component.enableCircles = true;
    component.width = 800;
    component.height = 600;
    component.pointSize = 5;
    component.fontSize = 20;
    component.labelWidth = 20;
    component.labels = [];
    return component;
  }

  isCompleted(
    component: any,
    componentStates: any[],
    componentEvents: any[],
    nodeEvents: any[],
    node: any
  ) {
    if (!this.canEdit(component) && this.UtilService.hasNodeEnteredEvent(nodeEvents)) {
      return true;
    }
    if (componentStates != null && componentStates.length > 0) {
      if (this.isSubmitRequired(node, component)) {
        for (let i = componentStates.length - 1; i >= 0; i--) {
          if (this.componentStateHasSubmitWithLabel(componentStates[i])) {
            return true;
          }
        }
      } else {
        return this.componentStateHasLabel(componentStates[componentStates.length - 1]);
      }
    }
    return false;
  }

  componentStateHasSubmitWithLabel(componentState: any) {
    return componentState.isSubmit && this.componentStateHasLabel(componentState);
  }

  componentStateHasLabel(componentState: any) {
    if (componentState != null) {
      const studentData = componentState.studentData;
      return studentData != null && studentData.labels != null && studentData.labels.length > 0;
    }
    return false;
  }

  /**
   * Determine if the student can perform any work on this component.
   * @param component The component content.
   * @return Whether the student can perform any work on this component.
   */
  canEdit(component: any) {
    return !this.UtilService.hasShowWorkConnectedComponent(component);
  }

  componentStateHasStudentWork(componentState: any, componentContent: any): boolean {
    if (componentContent == null) {
      return this.componentStateHasLabel(componentState);
    } else {
      if (this.componentHasStarterLabel(componentContent)) {
        return (
          componentState != null &&
          !this.labelArraysAreTheSame(componentState.studentData.labels, componentContent.labels)
        );
      } else {
        return this.componentStateHasLabel(componentState);
      }
    }
  }

  componentHasStarterLabel(componentContent: any) {
    return componentContent.labels != null && componentContent.labels.length > 0;
  }

  /**
   * Check if the component state has the exact same labels as the starter
   * labels.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has the exact same labels as the
   * starter labels
   */
  componentStateIsSameAsStarter(componentState: any, componentContent: any) {
    if (componentState != null) {
      if (this.componentHasStarterLabel(componentContent)) {
        return this.labelArraysAreTheSame(
          componentState.studentData.labels,
          componentContent.labels
        );
      } else {
        return !this.componentStateHasLabel(componentState);
      }
    }
    return false;
  }

  /**
   * Check if the two arrays of labels contain the same values
   * @param labels1 an array of label objects
   * @param labels2 an array of label objects
   * @return whether the labels contain the same values
   */
  labelArraysAreTheSame(labels1: any[], labels2: any[]) {
    if (this.bothObjectsAreNull(labels1, labels2)) {
      return true;
    } else if (this.oneObjIsNullAndOtherIsNotNull(labels1, labels2)) {
      return false;
    } else {
      return this.labelArrayContentsAreTheSame(labels1, labels2);
    }
  }

  labelArrayContentsAreTheSame(labels1: any[], labels2: any[]) {
    if (labels1.length != labels2.length) {
      return false;
    } else {
      for (let l = 0; l < labels1.length; l++) {
        if (!this.labelsAreTheSame(labels1[l], labels2[l])) {
          return false;
        }
      }
    }
    return true;
  }

  bothObjectsAreNull(obj1: any, obj2: any) {
    return obj1 == null && obj2 == null;
  }

  oneObjIsNullAndOtherIsNotNull(obj1: any, obj2: any) {
    return (obj1 == null && obj2 != null) || (obj1 != null && obj2 == null);
  }

  /**
   * Check if two labels contain the same values
   * @param label1 a label object
   * @param label2 a label object
   * @return whether the labels contain the same values
   */
  labelsAreTheSame(label1: any, label2: any) {
    if (this.bothObjectsAreNull(label1, label2)) {
      return true;
    } else if (this.oneObjIsNullAndOtherIsNotNull(label1, label2)) {
      return false;
    } else {
      return this.labelFieldsAreTheSame(label1, label2);
    }
  }

  labelFieldsAreTheSame(label1: any, label2: any) {
    return (
      label1.text === label2.text &&
      label1.pointX === label2.pointX &&
      label1.pointY === label2.pointY &&
      label1.textX === label2.textX &&
      label1.textY === label2.textY &&
      label1.color === label2.color
    );
  }

  /**
   * Create an image from the text string.
   * @param text A text string.
   * @param width The width of the image we will create.
   * @param height The height of the image we will create.
   * @param maxCharactersPerLine The max number of characters per line.
   * @param xPositionOfText The x position of the text in the image.
   * @param spaceInbetweenLines The amount of space inbetween each line.
   * @param fontSize The font size.
   */
  createImageFromText(
    text: string,
    width: any,
    height: any,
    maxCharactersPerLine: any,
    xPositionOfText: any,
    spaceInbetweenLines: any,
    fontSize: any
  ) {
    if (width == null || width === '') {
      width = 800;
    }
    if (height == null || height === '') {
      height = 600;
    }
    if (maxCharactersPerLine == null || maxCharactersPerLine === '') {
      maxCharactersPerLine = 100;
    }
    if (xPositionOfText == null || xPositionOfText === '') {
      xPositionOfText = 10;
    }
    if (spaceInbetweenLines == null || spaceInbetweenLines === '') {
      spaceInbetweenLines = 40;
    }
    if (fontSize == null || fontSize === '') {
      fontSize = 16;
    }

    /*
     * Line wrap the text so that each line does not exceed the max number of
     * characters.
     */
    const textWrapped = this.UtilService.wordWrap(text, maxCharactersPerLine);

    // create a div to draw the SVG in
    const svgElement = document.createElement('div');
    const draw = SVG(svgElement);
    draw.width(width);
    draw.height(height);

    /*
     * We will create a tspan for each line.
     * Example
     * <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     * <tspan x="10" dy="40">and ham.</tspan>
     */
    const tspans = this.getTSpans(textWrapped, xPositionOfText, spaceInbetweenLines);

    /*
     * Wrap the tspans in a text element.
     * Example
     * <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
     *   <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     *   <tspan x="10" dy="40">and ham.</tspan>
     * </text>
     */
    const svgTextElementString = this.getSVGTextElementString(fontSize, tspans);

    /*
     * Insert the text element into the svg.
     * Example
     * <svg id="SvgjsSvg1010" width="800" height="600" xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" xmlns:svgjs="http://svgjs.com/svgjs">
     *   <defs id="SvgjsDefs1011"></defs>
     *   <text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="16">
     *     <tspan x="10" dy="40">The quick brown fox jumps over the lazy dog. One fish, two fish, red fish, blue fish. Green eggs</tspan>
     *     <tspan x="10" dy="40">and ham.</tspan>
     *   </text>
     * </svg>
     */
    const svgString = svgElement.innerHTML.replace('</svg>', svgTextElementString + '</svg>');

    return this.generateImage(svgString);
  }

  generateImage(svgString: string) {
    // create a canvas to draw the image on
    const myCanvas = document.createElement('canvas');
    const ctx = myCanvas.getContext('2d');

    // create an svg blob
    const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const domURL = self.URL || (self as any).webkitURL || self;
    const url = domURL.createObjectURL(svg);
    const image = new Image();
    const thisUtilService = this.UtilService;
    return new Promise((resolve, reject) => {
      image.onload = (event) => {
        const image: any = event.target;
        myCanvas.width = image.width;
        myCanvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        const base64Image = myCanvas.toDataURL('image/png');
        const imageObject = thisUtilService.getImageObjectFromBase64String(base64Image);

        // create a student asset image
        this.StudentAssetService.uploadAsset(imageObject).then((unreferencedAsset) => {
          /*
           * make a copy of the unreferenced asset so that we
           * get a referenced asset
           */
          this.StudentAssetService.copyAssetForReference(unreferencedAsset).then(
            (referencedAsset) => {
              if (referencedAsset != null) {
                /*
                 * get the asset url
                 * for example
                 * /wise/studentuploads/11261/297478/referenced/picture_1494016652542.png
                 * if we are in preview mode this url will be a base64 string instead
                 */
                const referencedAssetUrl = referencedAsset.url;

                // remove the unreferenced asset
                this.StudentAssetService.deleteAsset(unreferencedAsset);

                // resolve the promise with the image url
                resolve(referencedAssetUrl);
              }
            }
          );
        });
      };

      // set the src of the image so that the image gets loaded
      image.src = url;
    });
  }

  getTSpans(textWrapped: string, xPositionOfText: any, spaceInbetweenLines: any) {
    let tspans = '';
    const textLines = textWrapped.split('\n');
    for (const textLine of textLines) {
      tspans += `<tspan x="${xPositionOfText}" dy="${spaceInbetweenLines}">${textLine}</tspan>`;
    }
    return tspans;
  }

  getSVGTextElementString(fontSize: any, tspans: string) {
    return (
      `<text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" font-size="` +
      `${fontSize}">${tspans}</text>`
    );
  }

  /**
   * The component state has been rendered in a <component></component> element
   * and now we want to take a snapshot of the work.
   * @param componentState The component state that has been rendered.
   * @return A promise that will return an image object.
   */
  generateImageFromRenderedComponentState(componentState: any) {
    return new Promise((resolve, reject) => {
      const canvas = this.getCanvas(componentState.nodeId, componentState.componentId);
      const img_b64 = canvas.toDataURL('image/png');
      const imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);
      this.StudentAssetService.uploadAsset(imageObject).then((asset: any) => {
        resolve(asset);
      });
    });
  }

  getCanvas(nodeId: string, componentId: string) {
    const canvas = angular.element(document.querySelector('#canvas_' + nodeId + '_' + componentId));
    if (canvas != null && canvas.length > 0) {
      return canvas[0];
    } else {
      return null;
    }
  }

  initializeCanvas(canvasId: string, width: number, height: number, isDisabled: boolean): any {
    let canvas: any = null;
    if (isDisabled) {
      canvas = new fabric.StaticCanvas(canvasId);
    } else {
      canvas = new fabric.Canvas(canvasId);
    }
    canvas.selection = false;
    canvas.hoverCursor = 'pointer';
    this.setCanvasDimension(canvas, width, height);
    $('#canvasParent_' + canvasId).css('height', height + 2);
    return canvas;
  }

  setCanvasDimension(canvas: any, width: number, height: number): void {
    canvas.setWidth(width);
    canvas.setHeight(height);
  }

  isStudentDataVersion(componentState: any, studentDataVersion: number): boolean {
    return componentState.studentData.version === studentDataVersion;
  }

  addLabelsToCanvas(
    canvas: any,
    labels: any[],
    width: number,
    height: number,
    pointSize: number,
    fontSize: number,
    labelWidth: number,
    enableCircles: boolean,
    studentDataVersion: number
  ): any[] {
    const fabricLabels: any[] = [];
    labels.forEach((label) => {
      const fabricLabel = this.createLabel(
        label.pointX,
        label.pointY,
        label.textX,
        label.textY,
        label.text,
        label.color,
        label.canEdit,
        label.canDelete,
        width,
        height,
        pointSize,
        fontSize,
        labelWidth,
        studentDataVersion
      );
      this.addLabelToCanvas(canvas, fabricLabel, enableCircles);
      fabricLabels.push(fabricLabel);
    });
    return fabricLabels;
  }

  createLabel(
    pointX: number,
    pointY: number,
    textX: number,
    textY: number,
    textString: string,
    color: string = this.defaultTextBackgroundColor,
    canEdit: boolean = true,
    canDelete: boolean = true,
    canvasWidth: number,
    canvasHeight: number,
    pointSize: number = 5,
    fontSize: number = 20,
    labelWidth: number,
    studentDataVersion: number = 2
  ): any {
    // get the position of the point
    let x1: number = pointX;
    let y1: number = pointY;
    let x2: number = null;
    let y2: number = null;

    if (studentDataVersion === 1) {
      // get the absolute position of the text
      x2 = pointX + textX;
      y2 = pointY + textY;
    } else {
      x2 = textX;
      y2 = textY;
    }

    /*
     * Make sure all the positions are within the bounds of the canvas. If there
     * are any positions that are outside the bounds, we will change the
     * position to be within the bounds.
     */
    x1 = this.makeSureValueIsWithinLimit(x1, canvasWidth);
    y1 = this.makeSureValueIsWithinLimit(y1, canvasHeight);
    x2 = this.makeSureValueIsWithinLimit(x2, canvasWidth);
    y2 = this.makeSureValueIsWithinLimit(y2, canvasHeight);

    const circle: any = new fabric.Circle({
      radius: pointSize,
      left: x1,
      top: y1,
      originX: 'center',
      originY: 'center',
      hasControls: false,
      borderColor: 'red',
      hasBorders: true,
      selectable: true
    });

    const line: any = new fabric.Line([x1, y1, x2, y2], {
      fill: 'black',
      stroke: 'black',
      strokeWidth: 3,
      selectable: false
    });

    let wrappedTextString = textString;
    if (labelWidth != null) {
      wrappedTextString = this.UtilService.wordWrap(textString, labelWidth);
    }

    // create an editable text element
    const text: any = new fabric.IText(wrappedTextString, {
      left: x2,
      top: y2,
      originX: 'center',
      originY: 'center',
      fontSize: fontSize,
      fill: 'white',
      backgroundColor: color,
      width: 100,
      hasControls: false,
      hasBorders: true,
      borderColor: 'red',
      borderDashArray: [8, 8],
      borderScaleFactor: 3,
      borderOpacityWhenMoving: 1,
      selectable: true,
      cursorWidth: 0,
      editable: false,
      padding: 16
    });

    // give the circle a reference to the line and text elements
    circle.line = line;
    circle.text = text;

    // give the text element a reference to the line and circle elements
    text.line = line;
    text.circle = circle;

    return {
      circle: circle,
      line: line,
      text: text,
      textString: textString,
      canEdit: canEdit,
      canDelete: canDelete
    };
  }

  addLabelToCanvas(canvas: any, label: any, enableCircles: boolean): void {
    const circle: any = label.circle;
    const line: any = label.line;
    const text: any = label.text;
    if (enableCircles) {
      canvas.add(circle, line, text);
      canvas.moveTo(line, this.lineZIndex);
      canvas.moveTo(text, this.textZIndex);
      canvas.moveTo(circle, this.circleZIndex);
    } else {
      canvas.add(text);
      canvas.moveTo(text, this.textZIndex);
    }
    canvas.renderAll();
  }

  makeSureValueIsWithinLimit(value: number, limit: number): number {
    if (value < 0) {
      value = 0;
    } else if (value > limit) {
      value = limit;
    }
    return value;
  }

  setBackgroundImage(canvas: any, backgroundPath: string): void {
    canvas.setBackgroundImage(backgroundPath, canvas.renderAll.bind(canvas));
  }
}

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { UtilService } from '../../../../wise5/services/utilService';
import { LabelService } from '../../../../wise5/components/label/labelService';
import { TestBed } from '@angular/core/testing';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: LabelService;
let utilService: UtilService;
let label1: any;
let label2: any;
let label1Text: any = 'Label 1';
let label2Text: any = 'Label 2';
let label1PointX: number = 1;
let label1PointY: number = 11;
let label1TextX: number = 111;
let label1TextY: number = 1111;
let label2PointX: number = 2;
let label2PointY: number = 22;
let label2TextX: number = 222;
let label2TextY: number = 2222;
let color1: string = 'blue';
let color2: string = 'red';
let width: number = 400;
let height: number = 400;
let pointSize: number = 5;
let fontSize: number = 12;
let labelWidth: number = 20;
let enableCircles: boolean = true;
let studentDataVersion: number = 2;
let canEditBoolean: boolean = true;
let canDeleteBoolean: boolean = true;

describe('LabelService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        LabelService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(LabelService);
    utilService = TestBed.get(UtilService);
    label1 = createLabel(label1Text, label1PointX, label1PointY, label1TextX, label1TextY, color1);
    label2 = createLabel(label2Text, label2PointX, label2PointY, label2TextX, label2TextY, color2);
  });
  createComponent();
  isCompleted();
  componentStateHasSubmitWithLabel();
  componentStateHasLabel();
  canEdit();
  componentStateHasStudentWork();
  componentStateIsSameAsStarter();
  labelArraysAreTheSame();
  labelsAreTheSame();
  getTSpans();
  getSVGTextElementString();
  initializeCanvas();
  addLabelsToCanvas();
  addLabelToCanvas();
  createLabelServiceFunction();
  makeSureValueIsWithinLimit();
});

function createComponentState(labels: any[], isSubmit: boolean = false) {
  return {
    studentData: createObjectWithLabels(labels),
    isSubmit: isSubmit
  };
}

function createComponentContent(labels: any[]) {
  return createObjectWithLabels(labels);
}

function createObjectWithLabels(labels: any[]) {
  return {
    labels: labels
  };
}

function createLabel(
  text: string = '',
  pointX: number = 100,
  pointY: number = 100,
  textX: number = 200,
  textY: number = 200,
  color: string = color1,
  canEdit: boolean = true,
  canDelete: boolean = true
): any {
  return {
    text: text,
    color: color,
    pointX: pointX,
    pointY: pointY,
    textX: textX,
    textY: textY,
    canEdit: canEdit,
    canDelete: canDelete
  };
}

function createFabricLabel() {
  const pointX: number = 100;
  const pointY: number = 100;
  const textX: number = 200;
  const textY: number = 200;
  const textString: string = label1Text;
  const color: string = color1;
  const canEdit: boolean = true;
  const canDelete: boolean = true;
  return service.createLabel(
    pointX,
    pointY,
    textX,
    textY,
    textString,
    color,
    canEdit,
    canDelete,
    width,
    height,
    pointSize,
    fontSize,
    labelWidth,
    studentDataVersion
  );
}

function createComponent() {
  it('should create a label component', () => {
    const component: any = service.createComponent();
    expect(component.type).toEqual('Label');
    expect(component.backgroundImage).toEqual('');
    expect(component.canCreateLabels).toEqual(true);
    expect(component.canEditLabels).toEqual(true);
    expect(component.canDeleteLabels).toEqual(true);
    expect(component.enableCircles).toEqual(true);
    expect(component.width).toEqual(800);
    expect(component.height).toEqual(600);
    expect(component.pointSize).toEqual(5);
    expect(component.fontSize).toEqual(20);
    expect(component.labelWidth).toEqual(20);
    expect(component.labels).toEqual([]);
  });
}

function isCompleted() {
  let component: any;
  let componentStates: any[];
  let node: any;
  beforeEach(() => {
    component = createComponentContent([]);
    componentStates = [];
    node = {};
  });
  function expectIsCompleted(
    component: any,
    componentStates: any[],
    node: any,
    expectedResult: boolean
  ) {
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(expectedResult);
  }
  it('should check if is completed when submit is not required and there are no labels', () => {
    expectIsCompleted(component, componentStates, node, false);
  });
  it('should check if is completed when submit is not required and there are labels', () => {
    componentStates.push(createComponentState([label1]));
    expectIsCompleted(component, componentStates, node, true);
  });
  it(`should check if is completed when submit is required and there are labels but not
      submitted`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState([label1]));
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when submit is required and there are labels submitted`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState([label1], true));
    expectIsCompleted(component, componentStates, node, true);
  });
}

function componentStateHasSubmitWithLabel() {
  let componentState: any;
  beforeEach(() => {
    componentState = createComponentState([]);
  });
  it(`should check if a component state has a submit with label when it does not have any
      labels`, () => {
    expect(service.componentStateHasSubmitWithLabel(componentState)).toEqual(false);
  });
  it(`should check if a component state has a submit with label when it has a label but no
      submit`, () => {
    componentState.studentData.labels.push(label1);
    expect(service.componentStateHasSubmitWithLabel(componentState)).toEqual(false);
  });
  it(`should check if a component state has a submit with label when it has a label and
      submit`, () => {
    componentState.studentData.labels.push(label1);
    componentState.isSubmit = true;
    expect(service.componentStateHasSubmitWithLabel(componentState)).toEqual(true);
  });
}

function componentStateHasLabel() {
  let componentState: any;
  beforeEach(() => {
    componentState = createComponentState([]);
  });
  it('should check if a component state has a label when it does not have any labels', () => {
    expect(service.componentStateHasLabel(componentState)).toEqual(false);
  });
  it('should check if a component state has a label when it has a label', () => {
    componentState.studentData.labels.push(label1);
    expect(service.componentStateHasLabel(componentState)).toEqual(true);
  });
}

function canEdit() {
  it(`should check if the component can be edited when it does not have a show work connected
      component`, () => {
    spyOn(utilService, 'hasShowWorkConnectedComponent').and.returnValue(false);
    expect(service.canEdit({})).toEqual(true);
  });
  it(`should check if the component can be edited when it does have a show work connected
      component`, () => {
    spyOn(utilService, 'hasShowWorkConnectedComponent').and.returnValue(true);
    expect(service.canEdit({})).toEqual(false);
  });
}

function componentStateHasStudentWork() {
  let componentState: any;
  let componentContent: any;
  beforeEach(() => {
    componentState = createComponentState([]);
    componentContent = createComponentContent([]);
  });
  function expectComponentStateHasStudentWork(
    componentState: any,
    componentContent: any,
    expectedResult: boolean
  ) {
    expect(service.componentStateHasStudentWork(componentState, componentContent)).toEqual(
      expectedResult
    );
  }
  it('should check if a component state has work when it has no labels', () => {
    expectComponentStateHasStudentWork(componentState, componentContent, false);
  });
  it(`should check if a component state has work when it has labels that are the same as the starter
      labels`, () => {
    componentState.studentData.labels.push(label1);
    componentContent.labels.push(label1);
    expectComponentStateHasStudentWork(componentState, componentContent, false);
  });
  it(`should check if a component state has work when it has labels that are different from the
      the starter labels`, () => {
    componentState.studentData.labels.push(label1);
    componentContent.labels.push(label2);
    expectComponentStateHasStudentWork(componentState, componentContent, true);
  });
}

function componentStateIsSameAsStarter() {
  let componentState: any;
  let componentContent: any;
  beforeEach(() => {
    componentState = createComponentState([]);
    componentContent = createComponentContent([]);
  });
  function expectComponentStateIsSameAsStarter(
    componentState: any,
    componentContent: any,
    expectedResult: boolean
  ) {
    expect(service.componentStateIsSameAsStarter(componentState, componentContent)).toEqual(
      expectedResult
    );
  }
  it(`should check if component state is the same as starter when component state has no labels and
      there are no starter labels`, () => {
    expectComponentStateIsSameAsStarter(componentState, componentContent, true);
  });
  it(`should check if component state is the same as starter when component state has labels and
      there are no starter labels`, () => {
    componentState.studentData.labels.push(label1);
    expectComponentStateIsSameAsStarter(componentState, componentContent, false);
  });
  it(`should check if component state is the same as starter when component state has no labels and
      there are starter labels`, () => {
    componentContent.labels.push(label1);
    expectComponentStateIsSameAsStarter(componentState, componentContent, false);
  });
  it(`should check if component state is the same as starter when component state has labels and
      there are starter labels but they are not the same`, () => {
    componentState.studentData.labels.push(label1);
    componentContent.labels.push(label2);
    expectComponentStateIsSameAsStarter(componentState, componentContent, false);
  });
  it(`should check if component state is the same as starter when component state has labels and
      there are starter labels but they are the same`, () => {
    componentState.studentData.labels.push(label1);
    componentContent.labels.push(label1);
    expectComponentStateIsSameAsStarter(componentState, componentContent, true);
  });
}

function labelArraysAreTheSame() {
  function expectLabelArraysAreTheSame(labels1: any[], labels2: any[], expectedResult) {
    expect(service.labelArraysAreTheSame(labels1, labels2)).toEqual(expectedResult);
  }
  it('should check if label arrays are the same when they are both null', () => {
    expectLabelArraysAreTheSame(null, null, true);
  });
  it('should check if label arrays are the same when one is null and the other is not null', () => {
    expectLabelArraysAreTheSame([label1], null, false);
  });
  it(`should check if label arrays are the same when both are not null and contain different
      labels`, () => {
    expectLabelArraysAreTheSame([label1], [label2], false);
  });
  it(`should check if label arrays are the same when both are not null and contain the same
      labels`, () => {
    expectLabelArraysAreTheSame([label1, label2], [label1, label2], true);
  });
}

function labelsAreTheSame() {
  function expectLabelsAreTheSame(label1: any, label2: any, expectedResult: any) {
    expect(service.labelsAreTheSame(label1, label2)).toEqual(expectedResult);
  }
  it('should check if labels are the same when they are both null', () => {
    expectLabelsAreTheSame(null, null, true);
  });
  it('should check if labels are the same when one is null and one is not null', () => {
    expectLabelsAreTheSame({}, null, false);
  });
  it(`should check if labels are the same when both are not null and do not have the same
      values`, () => {
    expectLabelsAreTheSame(label1, label2, false);
  });
  it(`should check if labels are the same when both are not null and do have the same
      values`, () => {
    const label3 = createLabel(
      label1Text,
      label1PointX,
      label1PointY,
      label1TextX,
      label1TextY,
      color1
    );
    expectLabelsAreTheSame(label1, label3, true);
  });
}

function getTSpans() {
  it('should get TSpans for the text', () => {
    const textWrapped = 'The quick brown fox\njumps over\nthe lazy dog.';
    const xPositionOfText = 10;
    const spaceInbetweenLines = 40;
    const tspans = service.getTSpans(textWrapped, xPositionOfText, spaceInbetweenLines);
    const expectedResult =
      `<tspan x="${xPositionOfText}" dy="${spaceInbetweenLines}">The quick brown fox</tspan>` +
      `<tspan x="${xPositionOfText}" dy="${spaceInbetweenLines}">jumps over</tspan>` +
      `<tspan x="${xPositionOfText}" dy="${spaceInbetweenLines}">the lazy dog.</tspan>`;
    expect(tspans).toEqual(expectedResult);
  });
}

function getSVGTextElementString() {
  it('should get svg text element string', () => {
    const fontSize = 16;
    const tspans = '<tspan x="10" dy="40">The quick brown fox</tspan>';
    const textElementString = service.getSVGTextElementString(fontSize, tspans);
    const expectedResult =
      `<text id="SvgjsText1008" font-family="Helvetica, Arial, sans-serif" ` +
      `font-size="${fontSize}">${tspans}</text>`;
    expect(textElementString).toEqual(expectedResult);
  });
}

function createCanvas() {
  return service.initializeCanvas('label-canvas', 400, 300, false);
}

function initializeCanvas() {
  it('should initialize the canvas', () => {
    const canvas: any = createCanvas();
    expect(canvas).not.toBeNull();
  });
}

function addLabelsToCanvas() {
  it('should add labels to canvas', () => {
    const canvas: any = createCanvas();
    const labels: any[] = [label1, label2];
    const fabricLabels: any = service.addLabelsToCanvas(
      canvas,
      labels,
      width,
      height,
      pointSize,
      fontSize,
      labelWidth,
      enableCircles,
      studentDataVersion
    );
    const canvasTextObjects = getCanvasTextObjects(canvas);
    expect(fabricLabels.length).toEqual(2);
    expect(fabricLabels[0].text.text).toEqual(label1Text);
    expect(fabricLabels[1].text.text).toEqual(label2Text);
    // sort the canvas text objects because their order is not guaranteed to be in the same order
    // we added them
    canvasTextObjects.sort(sortByTextField);
    expect(canvasTextObjects.length).toEqual(2);
    expect(canvasTextObjects[0].text).toMatch('Label 1');
    expect(canvasTextObjects[1].text).toMatch('Label 2');
  });
}

function addLabelToCanvas() {
  it('should add label to canvas', () => {
    const canvas: any = createCanvas();
    const label: any = createFabricLabel();
    const enableCircles: boolean = true;
    service.addLabelToCanvas(canvas, label, enableCircles);
    const canvasTextObjects = getCanvasTextObjects(canvas);
    expect(canvasTextObjects.length).toEqual(1);
    expect(canvasTextObjects[0].text).toMatch(label1Text);
  });
}

function getCanvasTextObjects(canvas: any): any[] {
  return canvas.getObjects().filter((obj: any) => {
    return typeof obj.text === 'string';
  });
}

function sortByTextField(a: any, b: any): number {
  const aText: string = a.text;
  const bText: string = b.text;
  if (aText > bText) {
    return 1;
  } else if (aText < bText) {
    return -1;
  } else {
    return 0;
  }
}

function createLabelServiceFunction() {
  it('shoud create a label', () => {
    const label: any = createFabricLabel();
    expect(label.circle).not.toBeNull();
    expect(label.line).not.toBeNull();
    expect(label.text).not.toBeNull();
    expect(label.text.text).toEqual(label1Text);
    expect(label.canEdit).toEqual(canEditBoolean);
    expect(label.canDelete).toEqual(canDeleteBoolean);
  });
}

function makeSureValueIsWithinLimit() {
  const limit: number = 100;
  it('should make sure value is within limit when it is negative', () => {
    expectMakeSureValueIsWithinLimit(-1, limit, 0);
  });
  it('should make sure value is within limit when it is between zero and limit', () => {
    expectMakeSureValueIsWithinLimit(50, limit, 50);
  });
  it('should make sure value is within limit when it is greater than limit', () => {
    expectMakeSureValueIsWithinLimit(101, limit, 100);
  });
}

function expectMakeSureValueIsWithinLimit(x: number, width: number, expectedValue: number) {
  expect(service.makeSureValueIsWithinLimit(x, width)).toEqual(expectedValue);
}

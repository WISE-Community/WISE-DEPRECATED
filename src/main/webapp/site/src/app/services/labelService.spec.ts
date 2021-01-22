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

describe('LabelServiceService', () => {
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
    label1 = createLabel('Label 1', 1, 11, 111, 1111, 'blue');
    label2 = createLabel('Label 2', 2, 22, 222, 2222, 'red');
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
  text: string,
  pointX: number,
  pointY: number,
  textX: number,
  textY: number,
  color: string
) {
  return {
    text: text,
    pointX: pointX,
    pointY: pointY,
    textX: textX,
    textY: textY,
    color: color
  };
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
  it(`should check if is completed when submit is required and there are labels but not submitted`, () => {
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
  it('should check if a component state has a submit with label when it does not have any labels', () => {
    expect(service.componentStateHasSubmitWithLabel(componentState)).toEqual(false);
  });
  it('should check if a component state has a submit with label when it has a label but no submit', () => {
    componentState.studentData.labels.push(label1);
    expect(service.componentStateHasSubmitWithLabel(componentState)).toEqual(false);
  });
  it('should check if a component state has a submit with label when it has a label and submit', () => {
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
  it(`should check if labels are the same when both are not null and do not have the same values`, () => {
    expectLabelsAreTheSame(label1, label2, false);
  });
  it(`should check if labels are the same when both are not null and do have the same values`, () => {
    const label3 = createLabel('Label 1', 1, 11, 111, 1111, 'blue');
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

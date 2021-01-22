import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { OpenResponseService } from '../../../../wise5/components/openResponse/openResponseService';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: OpenResponseService;
let studentDataService: StudentDataService;

describe('OpenResponseService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        OpenResponseService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(OpenResponseService);
    studentDataService = TestBed.get(StudentDataService);
  });
  createComponent();
  isCompleted();
  displayAnnotation();
  getStudentDataString();
  componentStatehasStudentWork();
  hasComponentState();
  hasStarterSentence();
  hasResponse();
  isAnyComponentStateHasResponse();
  isAnyComponentStateHasResponseAndIsSubmit();
});

function createComponentContent() {
  return {
    type: 'OpenResponse',
    starterSentence: null,
    isStudentAttachmentEnabled: false,
    showSubmitButton: false
  };
}

function createNode() {
  return {
    showSaveButton: false,
    showSubmitButton: false
  };
}

function createComponentState(response: string, isSubmit: boolean = false) {
  return {
    studentData: {
      response: response,
      attachments: []
    },
    isSubmit: isSubmit
  };
}

function createAnnotation(type: string, displayToStudent: boolean) {
  return {
    type: type,
    displayToStudent: displayToStudent
  };
}

function createComponent() {
  it('should create an open response component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('OpenResponse');
    expect(component.starterSentence).toEqual(null);
    expect(component.isStudentAttachmentEnabled).toEqual(false);
  });
}

function isCompleted() {
  let component: any;
  let componentStates: any[] = [];
  let componentEvents: any[] = [];
  let nodeEvents: any[] = [];
  let node: any;
  beforeEach(() => {
    component = createComponentContent();
    componentStates = [];
    node = createNode();
  });
  function expectIsCompleted(
    component: any,
    componentStates: any,
    node: any,
    expectedResult: boolean
  ) {
    expect(
      service.isCompleted(component, componentStates, componentEvents, nodeEvents, node)
    ).toEqual(expectedResult);
  }
  it('should check if a component is completed when there are no component states', () => {
    expectIsCompleted(component, componentStates, node, false);
  });
  it('should check if a component is completed when there are component states', () => {
    expectIsCompleted(component, [createComponentState('Hello World')], node, true);
  });
  it(`should check if a component is completed when submit is required but there are no
      submits`, () => {
    component.showSubmitButton = true;
    expectIsCompleted(component, [createComponentState('Hello World', false)], node, false);
  });
  it(`should check if a component is completed when submit is required and there is a
      submit`, () => {
    component.showSubmitButton = true;
    expectIsCompleted(component, [createComponentState('Hello World', true)], node, true);
  });
  it(`should check if a component is completed when it has a completion criteria it has not
      satisfied`, () => {
    component.completionCriteria = {};
    spyOn(studentDataService, 'isCompletionCriteriaSatisfied').and.returnValue(false);
    expectIsCompleted(component, [createComponentState('Hello World', false)], node, false);
  });
  it(`should check if a component is completed when it has a completion criteria it has
      satisfied`, () => {
    component.completionCriteria = {};
    spyOn(studentDataService, 'isCompletionCriteriaSatisfied').and.returnValue(true);
    expectIsCompleted(component, [createComponentState('Hello World', false)], node, true);
  });
}

function displayAnnotation() {
  let component: any;
  let annotation: any;
  beforeEach(() => {
    component = createComponentContent();
    annotation = createAnnotation('score', true);
  });
  function createAutoScoreAnnotation() {
    return createAnnotation('autoScore', true);
  }
  function createAutoCommentAnnotation() {
    return createAnnotation('autoComment', true);
  }
  function expectDisplayAnnotation(component: any, annotation: any, expectedResult: boolean) {
    expect(service.displayAnnotation(component, annotation)).toEqual(expectedResult);
  }
  it('should check if annotation should be displayed when display to student is false', () => {
    expectDisplayAnnotation(component, createAnnotation('score', false), false);
  });
  it('should check if annotation should be displayed when type is score', () => {
    expectDisplayAnnotation(component, createAnnotation('score', true), true);
  });
  it('should check if annotation should be displayed when type is comment', () => {
    expectDisplayAnnotation(component, createAnnotation('comment', true), true);
  });
  it('should check if annotation should be displayed when type is autoScore', () => {
    expectDisplayAnnotation(component, createAutoScoreAnnotation(), true);
  });
  it(`should check if annotation should be displayed when type is autoScore and CRater is set to not
      show score`, () => {
    component.cRater = { showScore: false };
    expectDisplayAnnotation(component, createAutoScoreAnnotation(), false);
  });
  it(`should check if annotation should be displayed when type is autoScore and CRater is set to
      show score`, () => {
    component.cRater = { showScore: true };
    expectDisplayAnnotation(component, createAutoScoreAnnotation(), true);
  });
  it(`should check if annotation should be displayed when type is autoScore and show auto score is
      set to false`, () => {
    component.showAutoScore = false;
    expectDisplayAnnotation(component, createAutoScoreAnnotation(), false);
  });
  it('should check if annotation should be displayed when type is autoComment', () => {
    expectDisplayAnnotation(component, createAutoCommentAnnotation(), true);
  });
  it(`should check if annotation should be displayed when type is autoComment and CRater is set to
      not show feedback`, () => {
    component.cRater = { showFeedback: false };
    expectDisplayAnnotation(component, createAutoCommentAnnotation(), false);
  });
  it(`should check if annotation should be displayed when type is autoComment and CRater is set to
      show feedback`, () => {
    component.cRater = { showFeedback: true };
    expectDisplayAnnotation(component, createAutoCommentAnnotation(), true);
  });
  it(`should check if annotation should be displayed when type is autoComment and show auto comment
      is set to false`, () => {
    component.showAutoFeedback = false;
    expectDisplayAnnotation(component, createAutoCommentAnnotation(), false);
  });
}

function getStudentDataString() {
  it('should get the student data string', () => {
    const response = 'Hello World';
    const componentState = createComponentState(response);
    expect(service.getStudentDataString(componentState)).toEqual(response);
  });
}

function componentStatehasStudentWork() {
  let componentState: any;
  let component: any;
  beforeEach(() => {
    componentState = createComponentState('');
    component = createComponentContent();
    component.starterSentence = 'I think...';
  });
  function expectComponentStateHasStudentWork(
    componentState: any,
    component: any,
    expectedResult: boolean
  ) {
    expect(service.componentStateHasStudentWork(componentState, component)).toEqual(expectedResult);
  }
  it('should check if a component state has student work when it does not have work', () => {
    expectComponentStateHasStudentWork(componentState, component, false);
  });
  it('should check if a component state has student work when it does have work', () => {
    componentState.studentData.response = 'Hello World';
    expectComponentStateHasStudentWork(componentState, component, true);
  });
  it(`should check if a component state has student work when it has work equal to the starter
      sentence`, () => {
    componentState.studentData.response = 'I think...';
    expectComponentStateHasStudentWork(componentState, component, false);
  });
}

function hasComponentState() {
  it('should check if there are any component states when there are none', () => {
    expect(service.hasComponentState([])).toEqual(false);
  });
  it('should check if there are any component states when there are component states', () => {
    expect(service.hasComponentState([createComponentState('Hello World')])).toEqual(true);
  });
}

function hasStarterSentence() {
  let component: any;
  beforeEach(() => {
    component = createComponentContent();
  });
  it('should check if a component has a starter sentence when it is false', () => {
    expect(service.hasStarterSentence(component)).toEqual(false);
  });
  it('should check if a component has a starter sentence when it is true', () => {
    component.starterSentence = 'I think...';
    expect(service.hasStarterSentence(component)).toEqual(true);
  });
}

function hasResponse() {
  let componentState: any;
  beforeEach(() => {
    componentState = createComponentState('');
  });
  it('should check if a component state has a response when there is no text response', () => {
    expect(service.hasResponse(componentState)).toEqual(false);
  });
  it('should check if a component state has a response when there is a text response', () => {
    componentState.studentData.response = 'Hello World';
    expect(service.hasResponse(componentState)).toEqual(true);
  });
  it(`should check if a component state has a response when there is  an attachment but no text
      response`, () => {
    componentState.studentData.attachments.push({});
    expect(service.hasResponse(componentState)).toEqual(true);
  });
}

function isAnyComponentStateHasResponse() {
  it('should check if any component state has a response when there are none', () => {
    expect(service.isAnyComponentStateHasResponse([createComponentState('')])).toEqual(false);
  });
  it('should check if any component state has a response when there is a response', () => {
    expect(service.isAnyComponentStateHasResponse([createComponentState('Hello World')])).toEqual(
      true
    );
  });
}

function isAnyComponentStateHasResponseAndIsSubmit() {
  it('should check if any component state has a response and submit when there are none', () => {
    const componentStates = [createComponentState('Hello World', false)];
    expect(service.isAnyComponentStateHasResponseAndIsSubmit(componentStates)).toEqual(false);
  });
  it(`should check if any component state has a response and submit when there is a submit
      response`, () => {
    const componentStates = [createComponentState('Hello World', true)];
    expect(service.isAnyComponentStateHasResponseAndIsSubmit(componentStates)).toEqual(true);
  });
}

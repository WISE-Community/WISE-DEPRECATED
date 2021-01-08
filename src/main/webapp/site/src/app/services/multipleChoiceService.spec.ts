import { MultipleChoiceService } from '../../../../wise5/components/multipleChoice/multipleChoiceService';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { TestBed } from '@angular/core/testing';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: MultipleChoiceService;
let studentDataService: StudentDataService;
let choiceId1: string = 'aaaaaaaaaa';
let choiceId2: string = 'bbbbbbbbbb';
let choiceId3: string = 'cccccccccc';
let choiceText1: string = 'Apple';
let choiceText2: string = 'Banana';
let choice1: any;
let choice2: any;
let nodeId1: string = 'node1';
let componentId1: string = 'abcdefghij';

describe('MultipleChoiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        MultipleChoiceService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(MultipleChoiceService);
    studentDataService = TestBed.get(StudentDataService);
    choice1 = createChoice(choiceId1, choiceText1, '', false);
    choice2 = createChoice(choiceId2, choiceText2, '', false);
  });
  createComponent();
  choiceChosen();
  isChoicesSelected();
  getStudentChoiceIdsFromStudentChoiceObjects();
  isCompleted();
  getStudentDataString();
  componentStateHasStudentWork();
  componentHasCorrectAnswer();
});

function createComponent() {
  it('should create a multiple choice component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('MultipleChoice');
    expect(component.choiceType).toEqual('radio');
    expect(component.choices).toEqual([]);
    expect(component.showFeedback).toEqual(true);
  });
}

function createCriteria(nodeId: string, componentId: string, choiceIds: string[]) {
  return {
    params: {
      nodeId: nodeId,
      componentId: componentId,
      choiceIds: choiceIds
    }
  };
}

function createComponentState(studentChoices: any[], isSubmit: boolean = false) {
  return {
    studentData: {
      studentChoices: studentChoices
    },
    isSubmit: isSubmit
  };
}

function createMultipleChoiceComponent(choices: any[]) {
  return {
    choices: choices
  };
}

function createChoice(id: string, text: string, feedback: string, isCorrect: boolean) {
  return {
    id: id,
    text: text,
    feedback: feedback,
    isCorrect: isCorrect
  };
}

function choiceChosen() {
  function expectChoiceChosen(criteria: any, componentState: any, expectedResult: boolean) {
    spyOn(studentDataService, 'getLatestComponentStateByNodeIdAndComponentId').and.returnValue(
      componentState
    );
    expect(service.choiceChosen(criteria)).toEqual(expectedResult);
  }
  it(`should check if the student chose the choice in the criteria when the student does not have
      any component states`, () => {
    const criteria = createCriteria(nodeId1, componentId1, [choiceId3]);
    const componentState = null;
    expectChoiceChosen(criteria, componentState, false);
  });
  it(`should check if the student chose the choice in the criteria when they did not choose the
      choice`, () => {
    const criteria = createCriteria(nodeId1, componentId1, [choiceId3]);
    const componentState = createComponentState([choice1, choice2], false);
    expectChoiceChosen(criteria, componentState, false);
  });
  it(`should check if the student chose the choice in the criteria when they did choose the
      choice`, () => {
    const criteria = createCriteria(nodeId1, componentId1, [choiceId1]);
    const componentState = createComponentState([choice1], false);
    expectChoiceChosen(criteria, componentState, true);
  });
  it(`should check if the student chose the choice in the criteria when they did choose all the
      choices`, () => {
    const criteria = createCriteria(nodeId1, componentId1, [choiceId1, choiceId2]);
    const componentState = createComponentState([choice1, choice2], false);
    expectChoiceChosen(criteria, componentState, true);
  });
}

function isChoicesSelected() {
  function expectIsChoicesSelected(
    studentChoiceIds: any[],
    constraintChoiceIds: any,
    expectedResult: boolean
  ) {
    expect(service.isChoicesSelected(studentChoiceIds, constraintChoiceIds)).toEqual(
      expectedResult
    );
  }
  it(`should check if choices are selected when constraint choice ids is a string and the constraint
      choice id is not selected`, () => {
    expectIsChoicesSelected([choiceId1, choiceId2], choiceId3, false);
  });
  it(`should check if choices are selected when constraint choice ids is a string and the constraint
      choice id is selected along with another choice`, () => {
    expectIsChoicesSelected([choiceId1, choiceId3], choiceId3, false);
  });
  it(`should check if choices are selected when constraint choice ids is a string and only the
      constraint choice id is selected`, () => {
    expectIsChoicesSelected([choiceId3], choiceId3, true);
  });
  it(`should check if choices are selected when constraint choice ids is a string array and the
      constraint choice id is not selected`, () => {
    expectIsChoicesSelected([choiceId1, choiceId2], [choiceId3], false);
  });
  it(`should check if choices are selected when constraint choice ids is a string array and the
      constraint choice id is selected along with another choice`, () => {
    expectIsChoicesSelected([choiceId1, choiceId3], [choiceId3], false);
  });
  it(`should check if choices are selected when constraint choice ids is a string array and the
      constraint choice id is selected`, () => {
    expectIsChoicesSelected([choiceId3], [choiceId3], true);
  });
  it(`should check if choices are selected when constraint choice ids is a string array and the
      constraint choice ids are selected`, () => {
    expectIsChoicesSelected([choiceId1, choiceId2], [choiceId1, choiceId2], true);
  });
}

function getStudentChoiceIdsFromStudentChoiceObjects() {
  function expectGetStudentChoiceIdsFromStudentChoiceObjects(
    studentChoices: any[],
    expectedResult: any[]
  ) {
    expect(service.getStudentChoiceIdsFromStudentChoiceObjects(studentChoices)).toEqual(
      expectedResult
    );
  }
  it('should get student choice ids when there are none', () => {
    const studentChoices = [];
    expectGetStudentChoiceIdsFromStudentChoiceObjects(studentChoices, []);
  });
  it('should get student choice ids when there are multiple student choices', () => {
    const studentChoices = [choice1, choice2];
    expectGetStudentChoiceIdsFromStudentChoiceObjects(studentChoices, [choice1.id, choice2.id]);
  });
}

function isCompleted() {
  function expectIsCompleted(
    component: any,
    componentStates: any[],
    node: any,
    expectedResult: boolean
  ) {
    expect(service.isCompleted(component, componentStates, [], [], node)).toEqual(expectedResult);
  }
  it('should check if a component is completed when there are no component states', () => {
    expectIsCompleted({}, [], {}, false);
  });
  it(`should check if a component is completed when submit is not required and there are component
      states`, () => {
    const componentState = createComponentState([choice1]);
    expectIsCompleted({}, [componentState], { showSubmitButton: false }, true);
  });
  it(`should check if a component is completed when submit is required and there are no submit
      component states`, () => {
    const componentState = createComponentState([choice1]);
    expectIsCompleted({}, [componentState], { showSubmitButton: true }, false);
  });
  it(`should check if a component is completed when submit is required and there are submit
      component states`, () => {
    const componentState = createComponentState([choice1], true);
    expectIsCompleted({}, [componentState], { showSubmitButton: true }, true);
  });
}

function getStudentDataString() {
  function expectGetStudentDataString(choices: any[], dataString: string) {
    const componentState = createComponentState(choices);
    expect(service.getStudentDataString(componentState)).toEqual(dataString);
  }
  it('should get the student data string when the student chose no choices', () => {
    expectGetStudentDataString([], '');
  });
  it('should get the student data string when the student chose one choice', () => {
    expectGetStudentDataString([choice1], choiceText1);
  });
  it('should get the student data string when the student chose multiple choices', () => {
    const choices = [choice1, choice2];
    expectGetStudentDataString(choices, `${choiceText1}, ${choiceText2}`);
  });
}

function componentStateHasStudentWork() {
  function expectComponentStateHasStudentWork(componentState: any, expectedResult: boolean) {
    expect(service.componentStateHasStudentWork(componentState, {})).toEqual(expectedResult);
  }
  it('should check if component state has student work when it is false', () => {
    expectComponentStateHasStudentWork(createComponentState([]), false);
  });
  it('should check if component state has student work when it is true', () => {
    const choice = createChoice(choiceId1, choiceText1, '', true);
    expectComponentStateHasStudentWork(createComponentState([choice]), true);
  });
}

function componentHasCorrectAnswer() {
  function expectComponentHasCorrectAnswer(expectedResult: boolean) {
    const component = createMultipleChoiceComponent([
      createChoice(choiceId1, choiceText1, '', expectedResult)
    ]);
    expect(service.componentHasCorrectAnswer(component)).toEqual(expectedResult);
  }
  it('should check if component has correct answer when it is false', () => {
    expectComponentHasCorrectAnswer(false);
  });
  it('should check if component has correct answer when it is true', () => {
    expectComponentHasCorrectAnswer(true);
  });
}

import { MatchService } from '../../../../wise5/components/match/matchService';
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { UpgradeModule } from '@angular/upgrade/static';
import { AnnotationService } from '../../../../wise5/services/annotationService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { StudentAssetService } from '../../../../wise5/services/studentAssetService';
import { StudentDataService } from '../../../../wise5/services/studentDataService';
import { TagService } from '../../../../wise5/services/tagService';
import { UtilService } from '../../../../wise5/services/utilService';
import { SessionService } from '../../../../wise5/services/sessionService';

let service: MatchService;
let componentStateBucketWithItem: any;

describe('MatchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, UpgradeModule],
      providers: [
        AnnotationService,
        ConfigService,
        MatchService,
        ProjectService,
        SessionService,
        StudentAssetService,
        StudentDataService,
        TagService,
        UtilService
      ]
    });
    service = TestBed.get(MatchService);
    componentStateBucketWithItem = createComponentStateBucket('bucket1', 'Bucket 1', [
      createChoice('choice1', 'Choice 1')
    ]);
  });
  createComponent();
  isCompleted();
  componentStateHasStudentWork();
  hasCorrectAnswer();
  getItemById();
});

function createMatchComponent(choices: any[], buckets: any[], feedback: any[]) {
  return {
    choices: choices,
    buckets: buckets,
    feedback: feedback
  };
}

function createComponentState(buckets: any[], isSubmit: boolean = false) {
  return {
    studentData: {
      buckets: buckets
    },
    isSubmit: isSubmit
  };
}

function createComponentStateBucket(id: string, value: string, items: any[]) {
  const bucket: any = createBucket(id, value);
  bucket.items = items;
  return bucket;
}

function createChoice(id: string, value: string) {
  return {
    id: id,
    value: value,
    type: 'choice'
  };
}

function createBucket(id: string, value: string) {
  return {
    id: id,
    value: value,
    type: 'bucket'
  };
}

function createFeedbackForBucket(bucketId: string, choices: any[]) {
  return {
    bucketId: bucketId,
    choices: choices
  };
}

function createFeedbackForChoice(choiceId: string, feedback: string, isCorrect: boolean = false) {
  return {
    choiceId: choiceId,
    feedback: feedback,
    isCorrect: isCorrect,
    position: null,
    incorrectPositionFeedback: null
  };
}

function createComponent() {
  it('should create a component', () => {
    const component = service.createComponent();
    expect(component.type).toEqual('Match');
    expect(component.choices).toEqual([]);
    expect(component.buckets).toEqual([]);
    expect(component.feedback).toEqual([{ bucketId: '0', choices: [] }]);
    expect(component.ordered).toEqual(false);
  });
}

function isCompleted() {
  let component: any;
  let componentStates: any[];
  let node: any;
  beforeEach(() => {
    component = {};
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
  it(`should check if is completed when submit is not required and there are no component states`, () => {
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when submit is not required and there are component states`, () => {
    componentStates.push(createComponentState([componentStateBucketWithItem]));
    expectIsCompleted(component, componentStates, node, true);
  });
  it(`should check if is completed when submit is required and there are no component states`, () => {
    node.showSubmitButton = true;
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when when submit is required and there are component states but
      none with submit`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState([componentStateBucketWithItem]));
    expectIsCompleted(component, componentStates, node, false);
  });
  it(`should check if is completed when when submit is required and there are component states with
      submit`, () => {
    node.showSubmitButton = true;
    componentStates.push(createComponentState([componentStateBucketWithItem], true));
    expectIsCompleted(component, componentStates, node, true);
  });
}

function componentStateHasStudentWork() {
  let componentState: any;
  beforeEach(() => {
    componentState = createComponentState([]);
  });
  function expectComponentStateHasStudentWork(componentState: any, expectedResult: boolean) {
    expect(service.componentStateHasStudentWork(componentState, {})).toEqual(expectedResult);
  }
  it('should check if a component state has student work when it does not have work', () => {
    expectComponentStateHasStudentWork(componentState, false);
  });
  it('should check if a component state has student work when it does have work', () => {
    componentState.studentData.buckets.push(componentStateBucketWithItem);
    expectComponentStateHasStudentWork(componentState, true);
  });
}

function hasCorrectAnswer() {
  let component: any;
  beforeEach(() => {
    const choices = [
      createFeedbackForChoice('choice1', 'Choice 1', false),
      createFeedbackForChoice('choice2', 'Choice 2', false)
    ];
    const feedback = [createFeedbackForBucket('bucket1', choices)];
    component = createMatchComponent([], [], feedback);
  });
  function expectHasCorrectAnswer(component: any, expectedResult: boolean) {
    expect(service.hasCorrectAnswer(component)).toEqual(expectedResult);
  }
  it('should check if there is a correct answer when there is none', () => {
    expectHasCorrectAnswer(component, false);
  });
  it('should check if there is a correct answer when there is one', () => {
    component.feedback[0].choices[1].isCorrect = true;
    expectHasCorrectAnswer(component, true);
  });
}

function getItemById() {
  const item1 = createChoice('item1', 'Item 1');
  const item2 = createChoice('item2', 'Item 2');
  const items: any[] = [item1, item2];
  it('should get the item by id when the id exists', () => {
    expect(service.getItemById('item1', items)).toEqual(item1);
  });
  it('should return null when the item id does not exist', () => {
    expect(service.getItemById('item3', items)).toEqual(null);
  });
}

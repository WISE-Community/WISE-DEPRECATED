import vleModule from '../../../vle/vle';

let $controller;
let $rootScope;
let $scope;
let summaryController;
let component;

const multipleChoiceComponent = {
  id: '87df23g4l7',
  type: 'MultipleChoice',
  prompt: 'What is your favorite color?',
  showSaveButton: true,
  showSubmitButton: true,
  choices: [
    {
      feedback: '',
      id: 'hpke1oyd25',
      text: 'Red',
      isCorrect: false
    },
    {
      feedback: '',
      id: 'e7qc47iktb',
      text: 'Blue',
      isCorrect: false
    },
    {
      feedback: '',
      id: 'ju4eh3e7jx',
      text: 'Green',
      isCorrect: true
    }
  ]
};

const displayMultipleChoiceSummaryComponent = {
  id: 'z87vj05pjh',
  type: 'Summary',
  prompt: '',
  showSaveButton: true,
  showSubmitButton: true,
  summaryNodeId: 'node1',
  summaryComponentId: '87df23g4l7',
  source: 'period',
  studentDataType: 'responses',
  chartType: 'column',
  requirementToSeeSummary: 'none',
  highlightCorrectAnswer: false
};

const openResponseComponent = {
  id: '4j4en745m7',
  type: 'OpenResponse',
  prompt: 'Explain the best toppings on a pizza.',
  showSaveButton: true,
  showSubmitButton: true
};

const mockStudentDataService = {
  getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
    const componentStates = [];
    if (componentId === '87df23g4l7') {
      const componentState = {
        componentType: 'MultipleChoice',
        studentData: {
          studentChoices: [{ id: 'e7qc47iktb', text: 'Blue' }]
        }
      };
      componentStates.push(componentState);
    } else if (componentId === '4j4en745m7') {
      const componentState = {
        componentType: 'OpenResponse',
        studentData: {
          response: 'Add pepperoni.'
        },
        isSubmit: true
      };
      componentStates.push(componentState);
    }
    return componentStates;
  },
  isCompleted(nodeId, componentId) {
    return componentId === '87df23g4l7' || componentId === '4j4en745m7';
  }
};

const mockProjectService = {
  getComponentByNodeIdAndComponentId(nodeId, componentId) {
    if (componentId === '87df23g4l7') {
      return multipleChoiceComponent;
    } else if (componentId === '4j4en745m7') {
      return openResponseComponent;
    }
  }
};

describe('SummaryController', () => {
  beforeEach(angular.mock.module(vleModule.name));

  beforeEach(inject((_$controller_, _$rootScope_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = displayMultipleChoiceSummaryComponent;
    loadComponent();
  }));

  shouldGetThePromptFromTheOtherComponent();
  shouldCheckIfTheStudentHasWork();
  shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsSubmitWork();
  shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsCompleteComponent();
  shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsNone();
  shouldSetThePeriodId();
});

function loadComponent() {
  $scope = $rootScope.$new();
  $scope.componentContent = JSON.parse(JSON.stringify(component));
  summaryController = $controller('SummaryController', {
    $scope: $scope,
    ProjectService: mockProjectService,
    StudentDataService: mockStudentDataService
  });
  summaryController.nodeId = 'node1';
}

function shouldGetThePromptFromTheOtherComponent() {
  it('should get the prompt from the other component', () => {
    const prompt1 = summaryController.getOtherPrompt('node1', '87df23g4l7');
    expect(prompt1).toEqual('What is your favorite color?');
    const prompt2 = summaryController.getOtherPrompt('node1', '4j4en745m7');
    expect(prompt2).toEqual('Explain the best toppings on a pizza.');
  });
}

function shouldCheckIfTheStudentHasWork() {
  it('should check if the student has work', () => {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    expect(summaryController.isStudentHasWork()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '87df23g4l7';
    expect(summaryController.isStudentHasWork()).toBeTruthy();
  });
}

function shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsSubmitWork() {
  it('should calculate if the display should be shown when the requirement is submit work', () => {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '87df23g4l7';
    summaryController.componentContent.requirementToSeeSummary = 'submitWork';
    expect(summaryController.calculateIsShowDisplay()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'submitWork';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
}

function shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsCompleteComponent() {
  it('should calculate if the display should be shown when the requirement is complete component', () => {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    summaryController.componentContent.requirementToSeeSummary = 'completeComponent';
    expect(summaryController.calculateIsShowDisplay()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'completeComponent';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
}

function shouldCalculateIfTheDisplayShouldBeShownWhenTheRequirementIsNone() {
  it('should calculate if the display should be shown when the requirement is none', () => {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    summaryController.componentContent.requirementToSeeSummary = 'none';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'none';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
}

function shouldSetThePeriodId() {
  it('should set the period id', () => {
    spyOn(summaryController.ConfigService, 'isStudentRun').and.returnValue(true);
    spyOn(summaryController.ConfigService, 'getPeriodId').and.returnValue(123456);
    summaryController.componentContent.source = 'period';
    summaryController.setPeriodIdIfNecessary();
    expect(summaryController.periodId).toEqual(123456);
    summaryController.componentContent.source = 'allPeriods';
    summaryController.setPeriodIdIfNecessary();
    expect(summaryController.periodId).toEqual(null);
  });
}

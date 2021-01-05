import authoringToolModule from '../../../authoringTool/authoringTool';

let $controller;
let $rootScope;
let $scope;
let summaryAuthoringController;
let ProjectService;
let component = {
  id: '0ib10ikexr',
  type: 'Summary',
  prompt: '',
  showSaveButton: false,
  showSubmitButton: false,
  summaryNodeId: 'node1',
  summaryComponentId: 'zptq1ndv4h',
  source: 'period',
  studentDataType: 'responses',
  chartType: 'column',
  requirementToSeeSummary: 'none',
  highlightCorrectAnswer: true,
  showAddToNotebookButton: true,
  showPromptFromOtherComponent: true
};

describe('SummaryAuthoringController', () => {
  beforeEach(angular.mock.module(authoringToolModule.name));

  beforeEach(inject((_$controller_, _$rootScope_, _ProjectService_) => {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    ProjectService = _ProjectService_;
    loadComponent();
  }));

  shouldCheckIfTheSummaryIsAllowedForAComponentType();
  shouldCheckThatTheComponentIdIsNotAutomaticallySetWhenNoComponents();
  shouldCheckThatTheComponentIdIsNotAutomaticallySetWhenMultipleComponents();
  shouldCheckThatTheComponentIdIsAutomaticallySet();
  shouldUpdateTheOtherPrompt();
  shouldCheckIfStudentDataTypeIsAvailableForAComponentWhenTrue();
  shouldCheckIfStudentDataTypeIsAvailableForAComponentWhenFalse();
  shouldCheckIfAComponentHasACorrectAnswerWhenTheComponentTypeDoesNotHaveCorrectness();
  shouldCheckIfAComponentTypeThatAllowsCorrectAnswersHasACorrectAnswerWhenItShouldBeFalse();
  shouldCheckIfAComponentThatAllowsCorrectAnswersHasACorrectAnswerWhenItShouldBeTrue();
});

function loadComponent() {
  $scope = $rootScope.$new();
  $scope.componentContent = JSON.parse(JSON.stringify(component));
  $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
  summaryAuthoringController = $controller('SummaryAuthoringController', {
    $scope: $scope,
    ProjectService: ProjectService
  });
}

function shouldCheckIfTheSummaryIsAllowedForAComponentType() {
  it('should check if the summary is allowed for a component type', () => {
    expect(summaryAuthoringController.isComponentTypeAllowed('HTML')).toBeFalsy();
    expect(summaryAuthoringController.isComponentTypeAllowed('OutsideURL')).toBeFalsy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Summary')).toBeFalsy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Animation')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('AudioOscillator')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('ConceptMap')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Discussion')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Draw')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Embedded')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Graph')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Label')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Match')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('MultipleChoice')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('OpenResponse')).toBeTruthy();
    expect(summaryAuthoringController.isComponentTypeAllowed('Table')).toBeTruthy();
  });
}

function shouldCheckThatTheComponentIdIsNotAutomaticallySetWhenNoComponents() {
  it(`should check that the component id is not automatically set when the node id is changed if
  there are no allowed components`, () => {
    spyOn(summaryAuthoringController, 'componentChanged');
    const components = [{ id: '4ty89q3hj0', type: 'HTML' }];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual(
      'zptq1ndv4h'
    );
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.summaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe(null);
  });
}

function shouldCheckThatTheComponentIdIsNotAutomaticallySetWhenMultipleComponents() {
  it(`should check that the component id is not automatically set when the node id is changed if
  there are multiple allowed components`, () => {
    spyOn(summaryAuthoringController, 'componentChanged');
    const components = [
      { id: '34j45u9w4j', type: 'OpenResponse' },
      { id: 'dghm45su45', type: 'MultipleChoice' }
    ];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual(
      'zptq1ndv4h'
    );
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.summaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe(null);
  });
}

function shouldCheckThatTheComponentIdIsAutomaticallySet() {
  it(`should check that the component id is automatically set when the node id is changed if there
  is one allowed component`, () => {
    spyOn(summaryAuthoringController, 'componentChanged');
    const components = [
      { id: '34j45u9w4j', type: 'HTML' },
      { id: 'dghm45su45', type: 'MultipleChoice' }
    ];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual(
      'zptq1ndv4h'
    );
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.summaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe(
      'dghm45su45'
    );
  });
}

function shouldUpdateTheOtherPrompt() {
  it('should update the other prompt', () => {
    expect(summaryAuthoringController.otherPrompt).toEqual(null);
    const otherComponent = { id: 'hxh43zj46j', prompt: 'This is hxh43zj46j' };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(otherComponent);
    summaryAuthoringController.updateOtherPrompt();
    expect(summaryAuthoringController.otherPrompt).toEqual('This is hxh43zj46j');
  });
}

function shouldCheckIfStudentDataTypeIsAvailableForAComponentWhenTrue() {
  it('should check if student data type is available for a component when true', () => {
    const component = { id: 'hxh43zj46j', prompt: 'This is hxh43zj46j', type: 'OpenResponse' };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    const isAvailable = summaryAuthoringController.isStudentDataTypeAvailableForComponent(
      'node1',
      'hxh43zj46j',
      'scores'
    );
    expect(isAvailable).toBeTruthy();
  });
}

function shouldCheckIfStudentDataTypeIsAvailableForAComponentWhenFalse() {
  it('should check if student data type is available for a component when false', () => {
    const component = { id: 'hxh43zj46j', prompt: 'This is hxh43zj46j', type: 'OpenResponse' };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    const isAvailable = summaryAuthoringController.isStudentDataTypeAvailableForComponent(
      'node1',
      'hxh43zj46j',
      'responses'
    );
    expect(isAvailable).toBeFalsy();
  });
}

function shouldCheckIfAComponentHasACorrectAnswerWhenTheComponentTypeDoesNotHaveCorrectness() {
  it(`should check if a component has a correct answer when the component type does not have
  correctness`, () => {
    const component = { id: 'hxh43zj46j', prompt: 'This is hxh43zj46j', type: 'OpenResponse' };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    const hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeFalsy();
  });
}

function shouldCheckIfAComponentTypeThatAllowsCorrectAnswersHasACorrectAnswerWhenItShouldBeFalse() {
  it(`should check if a component type that allows correct answers has a correct answer when it
  should be false`, () => {
    const component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'MultipleChoice',
      choices: [
        { id: 1, text: 'red', isCorrect: false },
        { id: 1, text: 'blue', isCorrect: false },
        { id: 1, text: 'green', isCorrect: false }
      ]
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    const hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeFalsy();
  });
}

function shouldCheckIfAComponentThatAllowsCorrectAnswersHasACorrectAnswerWhenItShouldBeTrue() {
  it(`should check if a component that allows correct answers has a correct answer when it should be
  true`, () => {
    const component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'MultipleChoice',
      choices: [
        { id: 1, text: 'red', isCorrect: false },
        { id: 1, text: 'blue', isCorrect: true },
        { id: 1, text: 'green', isCorrect: false }
      ]
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    const hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeTruthy();
  });
}

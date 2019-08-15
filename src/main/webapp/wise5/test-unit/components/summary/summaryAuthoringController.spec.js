"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("authoringTool/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

describe('SummaryAuthoringController', function () {
  var $controller;
  var $rootScope;
  var $scope;
  var summaryAuthoringController;
  var ProjectService;
  var component = {
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

  var loadComponent = function loadComponent() {
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    $scope.authoringComponentContent = JSON.parse(JSON.stringify(component));
    summaryAuthoringController = $controller('SummaryAuthoringController', {
      $scope: $scope,
      ProjectService: ProjectService
    });
  };

  beforeEach(_angular["default"].mock.module(_main["default"].name));
  beforeEach(inject(function (_$controller_, _$rootScope_, _ProjectService_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    ProjectService = _ProjectService_;
    loadComponent();
  }));
  it('should check if the summary is allowed for a component type', function () {
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
  it("should check that the component id is not automatically set when the node id is changed if \n      there are no allowed components", function () {
    spyOn(summaryAuthoringController, 'authoringViewComponentChanged');
    var components = [{
      id: '4ty89q3hj0',
      type: 'HTML'
    }];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual('zptq1ndv4h');
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.authoringSummaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe(null);
  });
  it("should check that the component id is not automatically set when the node id is changed if \n      there are mutiple allowed components", function () {
    spyOn(summaryAuthoringController, 'authoringViewComponentChanged');
    var components = [{
      id: '34j45u9w4j',
      type: 'OpenResponse'
    }, {
      id: 'dghm45su45',
      type: 'MultipleChoice'
    }];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual('zptq1ndv4h');
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.authoringSummaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe(null);
  });
  it("should check that the component id is automatically set when the node id is changed if there \n      is one allowed component", function () {
    spyOn(summaryAuthoringController, 'authoringViewComponentChanged');
    var components = [{
      id: '34j45u9w4j',
      type: 'HTML'
    }, {
      id: 'dghm45su45',
      type: 'MultipleChoice'
    }];
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toEqual('zptq1ndv4h');
    spyOn(summaryAuthoringController, 'getComponentsByNodeId').and.returnValue(components);
    summaryAuthoringController.authoringSummaryNodeIdChanged();
    expect(summaryAuthoringController.authoringComponentContent.summaryComponentId).toBe('dghm45su45');
  });
  it('should update the other prompt', function () {
    expect(summaryAuthoringController.otherPrompt).toEqual(null);
    var otherComponent = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j'
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(otherComponent);
    summaryAuthoringController.updateOtherPrompt();
    expect(summaryAuthoringController.otherPrompt).toEqual('This is hxh43zj46j');
  });
  it('should check if student data type is available for a component when it should be true', function () {
    var component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'OpenResponse'
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    var isAvailable = summaryAuthoringController.isStudentDataTypeAvailableForComponent('node1', 'hxh43zj46j', 'scores');
    expect(isAvailable).toBeTruthy();
  });
  it('should check if student data type is available for a component when it should be false', function () {
    var component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'OpenResponse'
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    var isAvailable = summaryAuthoringController.isStudentDataTypeAvailableForComponent('node1', 'hxh43zj46j', 'responses');
    expect(isAvailable).toBeFalsy();
  });
  it("should check if a component has a correct answer when the component type does not have \n      correctness", function () {
    var component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'OpenResponse'
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    var hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeFalsy();
  });
  it("should check if a component type that allows correct answers has a correct answer when it \n      should be false", function () {
    var component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'MultipleChoice',
      choices: [{
        id: 1,
        text: 'red',
        isCorrect: false
      }, {
        id: 1,
        text: 'blue',
        isCorrect: false
      }, {
        id: 1,
        text: 'green',
        isCorrect: false
      }]
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    var hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeFalsy();
  });
  it("should check if a component that allows correct answers has a correct answer when it should be\n      true", function () {
    var component = {
      id: 'hxh43zj46j',
      prompt: 'This is hxh43zj46j',
      type: 'MultipleChoice',
      choices: [{
        id: 1,
        text: 'red',
        isCorrect: false
      }, {
        id: 1,
        text: 'blue',
        isCorrect: true
      }, {
        id: 1,
        text: 'green',
        isCorrect: false
      }]
    };
    spyOn(ProjectService, 'getComponentByNodeIdAndComponentId').and.returnValue(component);
    var hasCorrectAnswer = summaryAuthoringController.componentHasCorrectAnswer();
    expect(hasCorrectAnswer).toBeTruthy();
  });
});
//# sourceMappingURL=summaryAuthoringController.spec.js.map

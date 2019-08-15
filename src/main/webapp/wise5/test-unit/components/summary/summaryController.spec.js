"use strict";

var _angular = _interopRequireDefault(require("angular"));

var _main = _interopRequireDefault(require("vle/main"));

require("angular-mocks");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var multipleChoiceComponent = {
  id: '87df23g4l7',
  type: 'MultipleChoice',
  prompt: 'What is your favorite color?',
  showSaveButton: true,
  showSubmitButton: true,
  choices: [{
    feedback: '',
    id: 'hpke1oyd25',
    text: 'Red',
    isCorrect: false
  }, {
    feedback: '',
    id: 'e7qc47iktb',
    text: 'Blue',
    isCorrect: false
  }, {
    feedback: '',
    id: 'ju4eh3e7jx',
    text: 'Green',
    isCorrect: true
  }]
};
var displayMultipleChoiceSummaryComponent = {
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
var openResponseComponent = {
  id: '4j4en745m7',
  type: 'OpenResponse',
  prompt: 'Explain the best toppings on a pizza.',
  showSaveButton: true,
  showSubmitButton: true
};
var mockStudentDataService = {
  getComponentStatesByNodeIdAndComponentId: function getComponentStatesByNodeIdAndComponentId(nodeId, componentId) {
    var componentStates = [];

    if (componentId === '87df23g4l7') {
      var componentState = {
        componentType: 'MultipleChoice',
        studentData: {
          studentChoices: [{
            id: 'e7qc47iktb',
            text: 'Blue'
          }]
        }
      };
      componentStates.push(componentState);
    } else if (componentId === '4j4en745m7') {
      var _componentState = {
        componentType: 'OpenResponse',
        studentData: {
          response: 'Add pepperoni.'
        },
        isSubmit: true
      };
      componentStates.push(_componentState);
    }

    return componentStates;
  },
  isCompleted: function isCompleted(nodeId, componentId) {
    return componentId === '87df23g4l7' || componentId === '4j4en745m7';
  }
};
var mockProjectService = {
  getComponentByNodeIdAndComponentId: function getComponentByNodeIdAndComponentId(nodeId, componentId) {
    if (componentId === '87df23g4l7') {
      return multipleChoiceComponent;
    } else if (componentId === '4j4en745m7') {
      return openResponseComponent;
    }
  }
};
describe('SummaryController', function () {
  var $controller;
  var $rootScope;
  var $scope;
  var summaryController;
  var component;

  var loadComponent = function loadComponent() {
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    summaryController = $controller('SummaryController', {
      $scope: $scope,
      ProjectService: mockProjectService,
      StudentDataService: mockStudentDataService
    });
    summaryController.nodeId = 'node1';
  };

  beforeEach(_angular["default"].mock.module(_main["default"].name));
  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = displayMultipleChoiceSummaryComponent;
    loadComponent();
  }));
  it('should get the prompt from the other component', function () {
    var prompt1 = summaryController.getOtherPrompt('node1', '87df23g4l7');
    expect(prompt1).toEqual('What is your favorite color?');
    var prompt2 = summaryController.getOtherPrompt('node1', '4j4en745m7');
    expect(prompt2).toEqual('Explain the best toppings on a pizza.');
  });
  it('should check if the student has work', function () {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    expect(summaryController.isStudentHasWork()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '87df23g4l7';
    expect(summaryController.isStudentHasWork()).toBeTruthy();
  });
  it('should calculate if the display should be shown when the requirement is submit work', function () {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '87df23g4l7';
    summaryController.componentContent.requirementToSeeSummary = 'submitWork';
    expect(summaryController.calculateIsShowDisplay()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'submitWork';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
  it('should calculate if the display should be shown when the requirement is save work', function () {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    summaryController.componentContent.requirementToSeeSummary = 'saveWork';
    expect(summaryController.calculateIsShowDisplay()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'saveWork';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
  it('should calculate if the display should be shown when the requirement is complete component', function () {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    summaryController.componentContent.requirementToSeeSummary = 'completeComponent';
    expect(summaryController.calculateIsShowDisplay()).toBeFalsy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'completeComponent';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
    summaryController.componentContent.requirementToSeeSummary = 'saveWork';
  });
  it('should calculate if the display should be shown when the requirement is none', function () {
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '1111111111';
    summaryController.componentContent.requirementToSeeSummary = 'none';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
    summaryController.summaryNodeId = 'node1';
    summaryController.summaryComponentId = '4j4en745m7';
    summaryController.componentContent.requirementToSeeSummary = 'none';
    expect(summaryController.calculateIsShowDisplay()).toBeTruthy();
  });
  it('should set the period id', function () {
    spyOn(summaryController.ConfigService, 'isStudentRun').and.returnValue(true);
    spyOn(summaryController.ConfigService, 'getPeriodId').and.returnValue(123456);
    summaryController.componentContent.source = 'period';
    summaryController.setPeriodIdIfNecessary();
    expect(summaryController.periodId).toEqual(123456);
    summaryController.componentContent.source = 'allPeriods';
    summaryController.setPeriodIdIfNecessary();
    expect(summaryController.periodId).toEqual(null);
  });
});
//# sourceMappingURL=summaryController.spec.js.map

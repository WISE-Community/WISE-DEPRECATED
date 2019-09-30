'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mockMultipleChoiceService = {};

var mockStudentDataService = {
  saveComponentEvent: function saveComponentEvent(component, category, event, data) {}
};

describe('MultipleChoiceController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var multipleChoiceController = void 0;
  var component = void 0;

  var singleAnswerSingleCorrectAnswerComponent = {
    "id": "z87vj05pjh",
    "type": "MultipleChoice",
    "prompt": "",
    "showSaveButton": true,
    "showSubmitButton": true,
    "choiceType": "radio",
    "choices": [{
      "id": "y82sng5vqp",
      "text": "A",
      "feedback": "A Feedback",
      "isCorrect": false
    }, {
      "id": "37krqrcvxs",
      "text": "B",
      "feedback": "B Feedback",
      "isCorrect": false
    }, {
      "id": "gbttermlrq",
      "text": "C",
      "feedback": "C Feedback",
      "isCorrect": true
    }],
    "showFeedback": true,
    "showAddToNotebookButton": true
  };

  var singleAnswerMultipleCorrectAnswersComponent = {
    "id": "z87vj05pjh",
    "type": "MultipleChoice",
    "prompt": "",
    "showSaveButton": true,
    "showSubmitButton": true,
    "choiceType": "radio",
    "choices": [{
      "id": "y82sng5vqp",
      "text": "A",
      "feedback": "A Feedback",
      "isCorrect": false
    }, {
      "id": "37krqrcvxs",
      "text": "B",
      "feedback": "B Feedback",
      "isCorrect": true
    }, {
      "id": "gbttermlrq",
      "text": "C",
      "feedback": "C Feedback",
      "isCorrect": true
    }],
    "showFeedback": true,
    "showAddToNotebookButton": true
  };

  var multipleAnswerComponent = {
    "id": "z87vj05pjh",
    "type": "MultipleChoice",
    "prompt": "",
    "showSaveButton": true,
    "showSubmitButton": true,
    "choiceType": "checkbox",
    "choices": [{
      "id": "y82sng5vqp",
      "text": "A",
      "feedback": "A Feedback",
      "isCorrect": false
    }, {
      "id": "37krqrcvxs",
      "text": "B",
      "feedback": "B Feedback",
      "isCorrect": true
    }, {
      "id": "gbttermlrq",
      "text": "C",
      "feedback": "C Feedback",
      "isCorrect": true
    }],
    "showFeedback": true,
    "showAddToNotebookButton": true
  };

  var loadSingleAnswerSingleCorrectAnswerComponent = function loadSingleAnswerSingleCorrectAnswerComponent() {
    component = singleAnswerSingleCorrectAnswerComponent;
    loadComponent();
  };

  var loadSingleAnswerMultipleCorrectAnswersComponent = function loadSingleAnswerMultipleCorrectAnswersComponent() {
    component = singleAnswerMultipleCorrectAnswersComponent;
    loadComponent();
  };

  var loadMultipleAnswerComponent = function loadMultipleAnswerComponent() {
    component = multipleAnswerComponent;
    loadComponent();
  };

  var loadComponent = function loadComponent() {
    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    multipleChoiceController = $controller('MultipleChoiceController', { $scope: $scope, MultipleChoiceService: mockMultipleChoiceService, StudentDataService: mockStudentDataService });
    multipleChoiceController.nodeId = 'node1';
  };

  var selectSingleAnswerChoice = function selectSingleAnswerChoice(choiceId) {
    multipleChoiceController.radioChoiceSelected(choiceId);
    multipleChoiceController.studentChoices = choiceId;
  };

  var selectMultipleAnswerChoice = function selectMultipleAnswerChoice(choiceId) {
    multipleChoiceController.toggleSelection(choiceId);
    multipleChoiceController.studentChoices.push(choiceId);
  };

  var checkAnswer = function checkAnswer() {
    multipleChoiceController.checkAnswer();
  };

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
  }));

  it('single answer component should show the feedback on the submitted choice', function () {
    loadSingleAnswerSingleCorrectAnswerComponent();
    selectSingleAnswerChoice('y82sng5vqp');
    checkAnswer();
    var choice1 = multipleChoiceController.getChoiceById('y82sng5vqp');
    var choice2 = multipleChoiceController.getChoiceById('37krqrcvxs');
    var choice3 = multipleChoiceController.getChoiceById('gbttermlrq');
    expect(choice1.showFeedback).toBeTruthy();
    expect(choice1.feedbackToShow).toEqual('A Feedback');
    expect(choice2.showFeedback).toBeFalsy();
    expect(choice2.feedbackToShow).toBeFalsy();
    expect(choice3.showFeedback).toBeFalsy();
    expect(choice3.feedbackToShow).toBeFalsy();
  });

  it('single answer single correct answer component should show incorrect when the incorrect answer is submitted', function () {
    loadSingleAnswerSingleCorrectAnswerComponent();
    selectSingleAnswerChoice('y82sng5vqp');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeFalsy();
  });

  it('single answer single correct answer component should show correct when the correct answer is submitted', function () {
    loadSingleAnswerSingleCorrectAnswerComponent();
    selectSingleAnswerChoice('gbttermlrq');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeTruthy();
  });

  it('single answer multiple correct answers component should show correct when one of the multiple correct answers is submitted', function () {
    loadSingleAnswerMultipleCorrectAnswersComponent();
    selectSingleAnswerChoice('37krqrcvxs');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeTruthy();
    selectSingleAnswerChoice('gbttermlrq');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeTruthy();
  });

  it('multiple answer component should show the feedback on the submitted choices', function () {
    loadMultipleAnswerComponent();
    selectMultipleAnswerChoice('y82sng5vqp');
    selectMultipleAnswerChoice('37krqrcvxs');
    selectMultipleAnswerChoice('gbttermlrq');
    checkAnswer();
    var choice1 = multipleChoiceController.getChoiceById('y82sng5vqp');
    var choice2 = multipleChoiceController.getChoiceById('37krqrcvxs');
    var choice3 = multipleChoiceController.getChoiceById('gbttermlrq');
    expect(choice1.showFeedback).toBeTruthy();
    expect(choice1.feedbackToShow).toEqual('A Feedback');
    expect(choice2.showFeedback).toBeTruthy();
    expect(choice2.feedbackToShow).toEqual('B Feedback');
    expect(choice3.showFeedback).toBeTruthy();
    expect(choice3.feedbackToShow).toEqual('C Feedback');
  });

  it('multiple answer component should show incorrect when the incorrect answer is submitted', function () {
    loadMultipleAnswerComponent();
    selectMultipleAnswerChoice('y82sng5vqp');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeFalsy();
  });

  it('multiple answer component should show incorrect when not just the correct answers are submitted', function () {
    loadMultipleAnswerComponent();
    selectMultipleAnswerChoice('y82sng5vqp');
    selectMultipleAnswerChoice('37krqrcvxs');
    selectMultipleAnswerChoice('gbttermlrq');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeFalsy();
  });

  it('multiple answer component should show incorrect when not all the correct answers are submitted', function () {
    loadMultipleAnswerComponent();
    selectMultipleAnswerChoice('37krqrcvxs');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeFalsy();
  });

  it('multiple answer component should show correct when only the correct answers are submitted', function () {
    loadMultipleAnswerComponent();
    selectMultipleAnswerChoice('37krqrcvxs');
    selectMultipleAnswerChoice('gbttermlrq');
    checkAnswer();
    expect(multipleChoiceController.isCorrect).toBeTruthy();
  });
});
//# sourceMappingURL=multipleChoiceController.spec.js.map

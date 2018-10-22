'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AudioOscillatorController', function () {

  var $controller = void 0;
  var $rootScope = void 0;
  var $scope = void 0;
  var audioOscillatorController = void 0;
  var component = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_$controller_, _$rootScope_) {
    $controller = _$controller_;
    $rootScope = _$rootScope_;
    component = {
      "id": "q4024mds8j",
      "type": "AudioOscillator",
      "prompt": "",
      "showSaveButton": false,
      "showSubmitButton": true,
      "oscillatorTypes": ["sine", "triangle", "sawtooth"],
      "startingFrequency": 440,
      "oscilloscopeWidth": 800,
      "oscilloscopeHeight": 400,
      "gridCellSize": 50,
      "stopAfterGoodDraw": false,
      "showAddToNotebookButton": true
    };

    $scope = $rootScope.$new();
    $scope.componentContent = JSON.parse(JSON.stringify(component));
    window.AudioContext = function () {};
    audioOscillatorController = $controller('AudioOscillatorController', { $scope: $scope });
    audioOscillatorController.nodeId = 'node1';
  }));

  it('should set the parameters from the component content', function () {
    expect(audioOscillatorController.frequency).toEqual(component.startingFrequency);
    expect(audioOscillatorController.oscilloscopeWidth).toEqual(component.oscilloscopeWidth);
    expect(audioOscillatorController.oscilloscopeHeight).toEqual(component.oscilloscopeHeight);
    expect(audioOscillatorController.gridCellSize).toEqual(component.gridCellSize);
    expect(audioOscillatorController.oscillatorTypes.length).toEqual(3);
  });

  it('should add a frequency played to the student data', function () {
    audioOscillatorController.addFrequencyPlayed(440);
    expect(audioOscillatorController.frequenciesPlayed.length).toEqual(1);
    expect(audioOscillatorController.frequenciesPlayed[0]).toEqual(440);
  });

  it('should call play when the toggle play is called', function () {
    var playSpy = spyOn(audioOscillatorController, 'play');
    audioOscillatorController.togglePlay();
    expect(playSpy).toHaveBeenCalled();
  });

  it('should repopulate student work', function () {
    var componentState = {
      studentData: {
        frequenciesPlayed: [440, 880]
      }
    };
    audioOscillatorController.setStudentWork(componentState);
    expect(audioOscillatorController.frequenciesPlayed.length).toEqual(2);
    expect(audioOscillatorController.frequenciesPlayed[0]).toEqual(440);
    expect(audioOscillatorController.frequenciesPlayed[1]).toEqual(880);
  });

  // it('should create a component state', () => {
  //   console.log('hello1');
  //   audioOscillatorController.createComponentState().then((componentState) => {
  //     console.log('hello2');
  //     expect(componentState.studentData).not.toBeNull();
  //     console.log('hello3');
  //   });
  // });
});
//# sourceMappingURL=audioOscillatorController.spec.js.map

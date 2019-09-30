'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('AudioOscillatorService', function () {

  var AudioOscillatorService = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_AudioOscillatorService_) {
    AudioOscillatorService = _AudioOscillatorService_;
  }));

  it('should detect that a component state has student work', function () {
    var componentState = {
      studentData: {
        frequenciesPlayed: [440]
      }
    };
    var hasStudentWork = AudioOscillatorService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(true);
  });

  it('should detect that a component state does not have student work', function () {
    var componentState = {
      studentData: {
        frequenciesPlayed: []
      }
    };
    var hasStudentWork = AudioOscillatorService.componentStateHasStudentWork(componentState);
    expect(hasStudentWork).toEqual(false);
  });
});
//# sourceMappingURL=audioOscillatorService.spec.js.map

'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('EmbeddedService', function () {

  var EmbeddedService = void 0;

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  beforeEach(inject(function (_EmbeddedService_) {
    EmbeddedService = _EmbeddedService_;
  }));

  it('should check that a component is not completed', function () {
    var component = {};
    var componentStates = [];
    var isCompleted = EmbeddedService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(false);
  });

  it('should check that a component is completed', function () {
    var component = {};
    var componentStates = [{
      studentData: {
        isCompleted: true
      }
    }];
    var isCompleted = EmbeddedService.isCompleted(component, componentStates);
    expect(isCompleted).toEqual(true);
  });
});
//# sourceMappingURL=embeddedService.spec.js.map

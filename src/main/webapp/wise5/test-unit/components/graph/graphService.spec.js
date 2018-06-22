'use strict';

var _angular = require('angular');

var _angular2 = _interopRequireDefault(_angular);

var _main = require('vle/main');

var _main2 = _interopRequireDefault(_main);

require('angular-mocks');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('GraphService', function () {

  beforeEach(_angular2.default.mock.module(_main2.default.name));

  var GraphService = void 0;

  beforeEach(inject(function (_GraphService_) {
    GraphService = _GraphService_;
  }));

  describe('hasTrialData()', function () {
    var studentDataWithTrial = {};
    beforeEach(function () {
      studentDataWithTrial = {
        trials: [{
          series: [{
            data: [[1, 5], [2, 10]]
          }]
        }]
      };
    });

    it('should return false when trials is null', function () {
      studentDataWithTrial.trials = null;
      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeFalsy();
    });

    it('should return false when there is no series in any trial', function () {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = studentDataWithTrial.trials[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var trial = _step.value;

          trial.series = [];
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeFalsy();
    });

    it('should return true when there is a series in a trial with data', function () {
      expect(GraphService.hasTrialData(studentDataWithTrial)).toBeTruthy();
    });
  });
});
//# sourceMappingURL=graphService.spec.js.map

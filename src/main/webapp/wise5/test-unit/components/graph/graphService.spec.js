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

  describe('hasSeriesData()', function () {
    it('should return false when series is null', function () {
      var studentData = {};
      expect(GraphService.hasSeriesData(studentData)).toBeFalsy();
    });

    it('should return false when series data is empty', function () {
      var studentData = {
        series: [{}]
      };
      expect(GraphService.hasSeriesData(studentData)).toBeFalsy();
    });

    it('should return true when series has data', function () {
      var studentData = {
        series: [{
          data: [[0, 10]]
        }]
      };
      expect(GraphService.hasSeriesData(studentData)).toBeTruthy();
    });
  });

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

  describe('componentStateHasStudentWork()', function () {
    it('should return false when the component state does not have student work', function () {
      var componentState = {
        studentData: {
          trials: [{
            series: [{
              data: []
            }]
          }]
        }
      };
      var componentContent = {};
      expect(GraphService.componentStateHasStudentWork(componentState, componentContent)).toBeFalsy();
    });

    it('should return true when the component state has student work', function () {
      var componentState = {
        studentData: {
          trials: [{
            series: [{
              data: [[0, 10]]
            }]
          }]
        }
      };
      var componentContent = {};
      expect(GraphService.componentStateHasStudentWork(componentState, componentContent)).toBeTruthy();
    });
  });

  describe('isStudentChangedAxisLimit()', function () {
    it('should return false when the student has not changed the axis limit', function () {
      var componentState = {
        studentData: {
          xAxis: {
            min: 0,
            max: 10
          },
          yAxis: {
            min: 0,
            max: 10
          }
        }
      };
      var componentContent = {
        xAxis: {
          min: 0,
          max: 10
        },
        yAxis: {
          min: 0,
          max: 10
        }
      };
      expect(GraphService.isStudentChangedAxisLimit(componentState, componentContent)).toBeFalsy();
    });

    it('should return true when the student has changed the axis limit', function () {
      var componentState = {
        studentData: {
          xAxis: {
            min: 0,
            max: 20
          },
          yAxis: {
            min: 0,
            max: 20
          }
        }
      };
      var componentContent = {
        xAxis: {
          min: 0,
          max: 10
        },
        yAxis: {
          min: 0,
          max: 10
        }
      };
      expect(GraphService.isStudentChangedAxisLimit(componentState, componentContent)).toBeTruthy();
    });
  });
});
//# sourceMappingURL=graphService.spec.js.map

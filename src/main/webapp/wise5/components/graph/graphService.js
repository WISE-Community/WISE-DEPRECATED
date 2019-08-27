'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _componentService = require('../componentService');

var _componentService2 = _interopRequireDefault(_componentService);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphService = function (_ComponentService) {
  _inherits(GraphService, _ComponentService);

  function GraphService($filter, $q, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, GraphService);

    var _this = _possibleConstructorReturn(this, (GraphService.__proto__ || Object.getPrototypeOf(GraphService)).call(this, $filter, StudentDataService, UtilService));

    _this.$q = $q;
    _this.StudentAssetService = StudentAssetService;
    return _this;
  }

  _createClass(GraphService, [{
    key: 'getComponentTypeLabel',
    value: function getComponentTypeLabel() {
      return this.$translate('graph.componentTypeLabel');
    }

    /**
     * Create a Graph component object
     * @returns a new Graph component object
     */

  }, {
    key: 'createComponent',
    value: function createComponent() {
      var component = _get(GraphService.prototype.__proto__ || Object.getPrototypeOf(GraphService.prototype), 'createComponent', this).call(this);
      component.type = 'Graph';
      component.title = '';
      component.width = 800;
      component.height = 500;
      component.enableTrials = false;
      component.canCreateNewTrials = false;
      component.canDeleteTrials = false;
      component.hideAllTrialsOnNewTrial = false;
      component.canStudentHideSeriesOnLegendClick = false;
      component.roundValuesTo = 'integer';
      component.graphType = 'line';
      component.xAxis = {
        title: {
          text: this.$translate('graph.timeSeconds')
        },
        min: 0,
        max: 100,
        units: this.$translate('graph.secondsUnit'),
        locked: true,
        type: 'limits'
      };
      component.yAxis = {
        title: {
          text: this.$translate('graph.positionMeters')
        },
        min: 0,
        max: 100,
        units: this.$translate('graph.metersUnit'),
        locked: true
      };
      component.series = [{
        name: this.$translate('graph.prediction'),
        data: [],
        color: 'blue',
        dashStyle: 'Solid',
        marker: {
          symbol: 'circle'
        },
        canEdit: true,
        type: 'line'
      }];
      return component;
    }
  }, {
    key: 'isCompleted',
    value: function isCompleted(component, componentStates, componentEvents, nodeEvents, node) {
      if (this.canEdit(component)) {
        if (this.hasComponentStates(componentStates)) {
          if (this.isSubmitRequired(node, component)) {
            return this.hasSubmitComponentState(componentStates);
          } else {
            var componentState = componentStates[componentStates.length - 1];
            return this.componentStateHasStudentWork(componentState);
          }
        }
      } else {
        return this.UtilService.hasNodeEnteredEvent(nodeEvents);
      }
      return false;
    }
  }, {
    key: 'hasComponentStates',
    value: function hasComponentStates(componentStates) {
      return componentStates != null && componentStates.length > 0;
    }
  }, {
    key: 'isSubmitRequired',
    value: function isSubmitRequired(node, component) {
      return node.showSubmitButton || component.showSubmitButton && !node.showSaveButton;
    }
  }, {
    key: 'hasSubmitComponentState',
    value: function hasSubmitComponentState(componentStates) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var componentState = _step.value;

          if (componentState.isSubmit && this.componentStateHasStudentWork(componentState)) {
            return true;
          }
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

      return false;
    }

    /**
     * Determine if the student can perform any work on this component.
     * @param component The component content.
     * @return Whether the student can perform any work on this component.
     */

  }, {
    key: 'canEdit',
    value: function canEdit(component) {
      var series = component.series;
      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = series[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var singleSeries = _step2.value;

          if (singleSeries.canEdit) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2.return) {
            _iterator2.return();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      if (this.UtilService.hasImportWorkConnectedComponent(component)) {
        return true;
      }
      return false;
    }
  }, {
    key: 'hasSeriesData',
    value: function hasSeriesData(studentData) {
      var series = studentData.series;
      if (series != null) {
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = series[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var singleSeries = _step3.value;

            if (singleSeries.data != null && singleSeries.data.length > 0) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'hasTrialData',
    value: function hasTrialData(studentData) {
      var trials = studentData.trials;
      if (trials != null) {
        var _iteratorNormalCompletion4 = true;
        var _didIteratorError4 = false;
        var _iteratorError4 = undefined;

        try {
          for (var _iterator4 = trials[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
            var trial = _step4.value;
            var _iteratorNormalCompletion5 = true;
            var _didIteratorError5 = false;
            var _iteratorError5 = undefined;

            try {
              for (var _iterator5 = trial.series[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                var singleSeries = _step5.value;

                var seriesData = singleSeries.data;
                if (seriesData.length > 0) {
                  return true;
                }
              }
            } catch (err) {
              _didIteratorError5 = true;
              _iteratorError5 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion5 && _iterator5.return) {
                  _iterator5.return();
                }
              } finally {
                if (_didIteratorError5) {
                  throw _iteratorError5;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError4 = true;
          _iteratorError4 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion4 && _iterator4.return) {
              _iterator4.return();
            }
          } finally {
            if (_didIteratorError4) {
              throw _iteratorError4;
            }
          }
        }
      }
      return false;
    }
  }, {
    key: 'componentStateHasStudentWork',
    value: function componentStateHasStudentWork(componentState, componentContent) {
      if (componentState != null) {
        var studentData = componentState.studentData;
        if (studentData != null) {
          if (studentData.version == 1) {
            /*
             * this is the old graph student data format where the
             * student data can contain multiple series.
             */
            if (this.anySeriesHasDataPoint(studentData.series)) {
              return true;
            }
          } else {
            /*
             * this is the new graph student data format where the
             * student data can contain multiple trials and each trial
             * can contain multiple series.
             */
            if (this.anyTrialHasDataPoint(studentData.trials)) {
              return true;
            }
          }
        }
        if (this.isStudentChangedAxisLimit(componentState, componentContent)) {
          return true;
        }
      }
      return false;
    }

    /**
     * Check if the student has changed any of the axis limits
     * @param componentState the component state
     * @param componentContent the component content
     * @return whether the student has changed any of the axis limits
     */

  }, {
    key: 'isStudentChangedAxisLimit',
    value: function isStudentChangedAxisLimit(componentState, componentContent) {
      if (componentState != null && componentState.studentData != null && componentContent != null) {
        if (componentState.studentData.xAxis != null && componentContent.xAxis != null) {
          if (componentState.studentData.xAxis.min != componentContent.xAxis.min) {
            return true;
          } else if (componentState.studentData.xAxis.max != componentContent.xAxis.max) {
            return true;
          }
        }
        if (componentState.studentData.yAxis != null && componentContent.yAxis != null) {
          if (componentState.studentData.yAxis.min != componentContent.yAxis.min) {
            return true;
          } else if (componentState.studentData.yAxis.max != componentContent.yAxis.max) {
            return true;
          }
        }
      }
      return false;
    }

    /**
     * Check if any of the trials contains a data point
     * @param trials an array of trials
     * @return whether any of the trials contains a data point
     */

  }, {
    key: 'anyTrialHasDataPoint',
    value: function anyTrialHasDataPoint(trials) {
      var _iteratorNormalCompletion6 = true;
      var _didIteratorError6 = false;
      var _iteratorError6 = undefined;

      try {
        for (var _iterator6 = trials[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
          var trial = _step6.value;

          if (this.trialHasDataPoint(trial)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError6 = true;
        _iteratorError6 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion6 && _iterator6.return) {
            _iterator6.return();
          }
        } finally {
          if (_didIteratorError6) {
            throw _iteratorError6;
          }
        }
      }

      return false;
    }

    /**
     * Check if a trial has a data point
     * @param trial a trial object which can contain multiple series
     * @return whether the trial contains a data point
     */

  }, {
    key: 'trialHasDataPoint',
    value: function trialHasDataPoint(trial) {
      var _iteratorNormalCompletion7 = true;
      var _didIteratorError7 = false;
      var _iteratorError7 = undefined;

      try {
        for (var _iterator7 = trial.series[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
          var singleSeries = _step7.value;

          if (this.seriesHasDataPoint(singleSeries)) {
            return true;
          }
        }
      } catch (err) {
        _didIteratorError7 = true;
        _iteratorError7 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion7 && _iterator7.return) {
            _iterator7.return();
          }
        } finally {
          if (_didIteratorError7) {
            throw _iteratorError7;
          }
        }
      }

      return false;
    }

    /**
     * Check if an array of series has any data point
     * @param multipleSeries an array of series
     * @return whether any of the series has a data point
     */

  }, {
    key: 'anySeriesHasDataPoint',
    value: function anySeriesHasDataPoint(multipleSeries) {
      if (multipleSeries != null) {
        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = multipleSeries[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var singleSeries = _step8.value;

            if (this.seriesHasDataPoint(singleSeries)) {
              return true;
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }
      }
      return false;
    }

    /**
     * Check if a series has a data point
     * @param singleSeries a series object
     * @return whether the series object has any data points
     */

  }, {
    key: 'seriesHasDataPoint',
    value: function seriesHasDataPoint(singleSeries) {
      return singleSeries.data.length > 0;
    }

    /**
     * The component state has been rendered in a <component></component> element
     * and now we want to take a snapshot of the work.
     * @param componentState The component state that has been rendered.
     * @return A promise that will return an image object.
     */

  }, {
    key: 'generateImageFromRenderedComponentState',
    value: function generateImageFromRenderedComponentState(componentState) {
      var _this2 = this;

      var deferred = this.$q.defer();
      var componentId = componentState.componentId;
      var highchartsDiv = angular.element('#chart_' + componentId).find('.highcharts-container');
      if (highchartsDiv != null && highchartsDiv.length > 0) {
        highchartsDiv = highchartsDiv[0];
        (0, _html2canvas2.default)(highchartsDiv).then(function (canvas) {
          var base64Image = canvas.toDataURL('image/png');
          var imageObject = _this2.UtilService.getImageObjectFromBase64String(base64Image);
          _this2.StudentAssetService.uploadAsset(imageObject).then(function (asset) {
            deferred.resolve(asset);
          });
        });
      }
      return deferred.promise;
    }
  }]);

  return GraphService;
}(_componentService2.default);

GraphService.$inject = ['$filter', '$q', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = GraphService;
//# sourceMappingURL=graphService.js.map

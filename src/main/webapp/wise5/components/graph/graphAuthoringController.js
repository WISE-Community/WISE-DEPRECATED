'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _graphController = require('./graphController');

var _graphController2 = _interopRequireDefault(_graphController);

var _html2canvas = require('html2canvas');

var _html2canvas2 = _interopRequireDefault(_html2canvas);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GraphAuthoringController = function (_GraphController) {
  _inherits(GraphAuthoringController, _GraphController);

  function GraphAuthoringController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, GraphService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, GraphAuthoringController);

    var _this = _possibleConstructorReturn(this, (GraphAuthoringController.__proto__ || Object.getPrototypeOf(GraphAuthoringController)).call(this, $filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConfigService, GraphService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.availableGraphTypes = [{
      value: 'line',
      text: _this.$translate('graph.linePlot')
    }, {
      value: 'column',
      text: _this.$translate('graph.columnPlot')
    }, {
      value: 'scatter',
      text: _this.$translate('graph.scatterPlot')
    }];

    _this.availableRoundingOptions = [{
      value: null,
      text: _this.$translate('graph.noRounding')
    }, {
      value: 'integer',
      text: _this.$translate('graph.roundToInteger')
    }, {
      value: 'tenth',
      text: _this.$translate('graph.roundToTenth')
    }, {
      value: 'hundredth',
      text: _this.$translate('graph.roundToHundredth')
    }];

    _this.availableSymbols = [{
      value: 'circle',
      text: _this.$translate('graph.circle')
    }, {
      value: 'square',
      text: _this.$translate('graph.square')
    }, {
      value: 'triangle',
      text: _this.$translate('graph.triangle')
    }, {
      value: 'triangle-down',
      text: _this.$translate('graph.triangleDown')
    }, {
      value: 'diamond',
      text: _this.$translate('graph.diamond')
    }];

    _this.availableSeriesTypes = [{
      value: 'line',
      text: _this.$translate('graph.line')
    }, {
      value: 'scatter',
      text: _this.$translate('graph.point')
    }];

    _this.availableLineTypes = [{
      value: 'Solid',
      text: _this.$translate('graph.solid')
    }, {
      value: 'Dash',
      text: _this.$translate('graph.dash')
    }, {
      value: 'Dot',
      text: _this.$translate('graph.dot')
    }, {
      value: 'ShortDash',
      text: _this.$translate('graph.shortDash')
    }, {
      value: 'ShortDot',
      text: _this.$translate('graph.shortDot')
    }];

    _this.availableXAxisTypes = [{
      value: 'limits',
      text: 'Limits'
    }, {
      value: 'categories',
      text: 'Categories'
    }];

    _this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    _this.isResetSeriesButtonVisible = true;
    _this.isSelectSeriesVisible = true;
    _this.backgroundImage = _this.componentContent.backgroundImage;

    $scope.$watch(function () {
      return _this.authoringComponentContent;
    }, function (newValue, oldValue) {
      _this.componentContent = _this.ProjectService.injectAssetPaths(newValue);
      _this.series = null;
      _this.xAxis = null;
      _this.yAxis = null;
      _this.submitCounter = 0;
      _this.backgroundImage = _this.componentContent.backgroundImage;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.graphType = _this.componentContent.graphType;
      _this.isResetSeriesButtonVisible = true;
      _this.isSelectSeriesVisible = true;
      _this.legendEnabled = !_this.componentContent.hideLegend;
      _this.showTrialSelect = !_this.componentContent.hideTrialSelect;
      _this.setSeries(_this.UtilService.makeCopyOfJSONObject(_this.componentContent.series));
      _this.setDefaultActiveSeries();
      _this.trials = [];
      _this.newTrial();
      _this.clearPlotLines();
      _this.drawGraph();
    }, true);
    return _this;
  }

  _createClass(GraphAuthoringController, [{
    key: 'assetSelected',
    value: function assetSelected(event, args) {
      if (this.isEventTargetThisComponent(args)) {
        var fileName = args.assetItem.fileName;
        if (args.target === 'rubric') {
          var summernoteId = this.getSummernoteId(args);
          this.restoreSummernoteCursorPosition(summernoteId);
          var fullAssetPath = this.getFullAssetPath(fileName);
          if (this.UtilService.isImage(fileName)) {
            this.insertImageIntoSummernote(summernoteId, fullAssetPath, fileName);
          } else if (this.UtilService.isVideo(fileName)) {
            this.insertVideoIntoSummernote(summernoteId, fullAssetPath);
          }
        } else if (args.target === 'background') {
          this.authoringComponentContent.backgroundImage = fileName;
          this.authoringViewComponentChanged();
        }
      }
      this.$mdDialog.hide();
    }
  }, {
    key: 'authoringAddSeriesClicked',
    value: function authoringAddSeriesClicked() {
      var newSeries = this.createNewSeries();
      if (this.authoringComponentContent.graphType === 'line') {
        newSeries.type = 'line';
        newSeries.dashStyle = 'Solid';
      } else if (this.authoringComponentContent.graphType === 'scatter') {
        newSeries.type = 'scatter';
      }
      this.authoringComponentContent.series.push(newSeries);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringDeleteSeriesClicked',
    value: function authoringDeleteSeriesClicked(index) {
      var message = '';
      var seriesName = '';
      if (this.authoringComponentContent.series != null) {
        var series = this.authoringComponentContent.series[index];
        if (series != null && series.name != null) {
          seriesName = series.name;
        }
      }
      if (seriesName == null || seriesName === '') {
        message = this.$translate('graph.areYouSureYouWantToDeleteTheSeries');
      } else {
        message = this.$translate('graph.areYouSureYouWantToDeleteTheNamedSeries', { seriesName: seriesName });
      }
      if (confirm(message)) {
        this.authoringComponentContent.series.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringViewEnableTrialsClicked',
    value: function authoringViewEnableTrialsClicked() {
      if (this.authoringComponentContent.enableTrials) {
        this.authoringComponentContent.canCreateNewTrials = true;
        this.authoringComponentContent.canDeleteTrials = true;
      } else {
        this.authoringComponentContent.canCreateNewTrials = false;
        this.authoringComponentContent.canDeleteTrials = false;
        this.authoringComponentContent.hideAllTrialsOnNewTrial = true;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'showChooseBackgroundImagePopup',
    value: function showChooseBackgroundImagePopup() {
      var params = {
        isPopup: true,
        nodeId: this.nodeId,
        componentId: this.componentId,
        target: 'background'
      };
      this.$rootScope.$broadcast('openAssetChooser', params);
    }
  }, {
    key: 'authoringAddXAxisCategory',
    value: function authoringAddXAxisCategory() {
      this.authoringComponentContent.xAxis.categories.push('');
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringDeleteXAxisCategory',
    value: function authoringDeleteXAxisCategory(index) {
      var confirmMessage = '';
      var categoryName = '';
      if (this.authoringComponentContent.xAxis != null && this.authoringComponentContent.xAxis.categories != null) {
        categoryName = this.authoringComponentContent.xAxis.categories[index];
      }
      if (categoryName == null || categoryName === '') {
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheCategory');
      } else {
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedCategory', { categoryName: categoryName });
      }
      if (confirm(confirmMessage)) {
        this.authoringComponentContent.xAxis.categories.splice(index, 1);
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringAddSeriesDataPoint',
    value: function authoringAddSeriesDataPoint(series) {
      if (series != null && series.data != null) {
        if (this.authoringComponentContent.xAxis.type == null || this.authoringComponentContent.xAxis.type === 'limits') {
          series.data.push([]);
        } else if (this.authoringComponentContent.xAxis.type === 'categories') {
          series.data.push(null);
        }
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringDeleteSeriesDataPoint',
    value: function authoringDeleteSeriesDataPoint(series, index) {
      if (series != null && series.data != null) {
        if (confirm(this.$translate('graph.areYouSureYouWantToDeleteTheDataPoint'))) {
          series.data.splice(index, 1);
          this.authoringViewComponentChanged();
        }
      }
    }
  }, {
    key: 'authoringMoveSeriesDataPointUp',
    value: function authoringMoveSeriesDataPointUp(series, index) {
      if (index > 0) {
        var dataPoint = series.data[index];
        series.data.splice(index, 1);
        series.data.splice(index - 1, 0, dataPoint);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringMoveSeriesDataPointDown',
    value: function authoringMoveSeriesDataPointDown(series, index) {
      if (index < series.data.length - 1) {
        var dataPoint = series.data[index];
        series.data.splice(index, 1);
        series.data.splice(index + 1, 0, dataPoint);
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringViewXAxisTypeChanged',
    value: function authoringViewXAxisTypeChanged(newValue, oldValue) {
      if (confirm(this.$translate('graph.areYouSureYouWantToChangeTheXAxisType'))) {
        if (oldValue === 'categories' && newValue === 'limits') {
          delete this.authoringComponentContent.xAxis.categories;
          this.authoringComponentContent.xAxis.min = 0;
          this.authoringComponentContent.xAxis.max = 10;
          this.authoringConvertAllSeriesDataPoints(newValue);
        } else if ((oldValue === 'limits' || oldValue === '' || oldValue == null) && newValue === 'categories') {
          delete this.authoringComponentContent.xAxis.min;
          delete this.authoringComponentContent.xAxis.max;
          delete this.authoringComponentContent.xAxis.units;
          delete this.authoringComponentContent.yAxis.units;
          this.authoringComponentContent.xAxis.categories = [];
          this.authoringConvertAllSeriesDataPoints(newValue);
        }
      } else {
        this.authoringComponentContent.xAxis.type = oldValue;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringConvertAllSeriesDataPoints',
    value: function authoringConvertAllSeriesDataPoints(xAxisType) {
      var series = this.authoringComponentContent.series;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = series[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var singleSeries = _step.value;

          this.convertSeriesDataPoints(singleSeries, xAxisType);
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
    }
  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {
      var newConnectedComponent = {
        nodeId: this.nodeId,
        componentId: null,
        type: null
      };
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);
      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }
      this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
      if (this.authoringComponentContent.connectedComponents.length > 1 || this.authoringComponentContent.series.length > 0) {
        /*
         * there is more than one connected component so we will enable
         * trials so that each connected component can put work in a
         * different trial
         */
        this.authoringComponentContent.enableTrials = true;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      var components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        var numberOfAllowedComponents = 0;
        var allowedComponent = null;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = components[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var component = _step2.value;

            if (this.isConnectedComponentTypeAllowed(component.type) && component.id !== this.componentId) {
              numberOfAllowedComponents += 1;
              allowedComponent = component;
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

        if (numberOfAllowedComponents === 1) {
          // there is only one viable component to connect to so we will use it
          connectedComponent.componentId = allowedComponent.id;
          connectedComponent.type = 'importWork';
          this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
        }
      }
    }
  }, {
    key: 'authoringAddConnectedComponentSeriesNumber',
    value: function authoringAddConnectedComponentSeriesNumber(connectedComponent) {
      if (connectedComponent.seriesNumbers == null) {
        connectedComponent.seriesNumbers = [];
      }
      connectedComponent.seriesNumbers.push(null);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringDeleteConnectedComponentSeriesNumber',
    value: function authoringDeleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {
      if (connectedComponent.seriesNumbers == null) {
        connectedComponent.seriesNumbers = [];
      }
      connectedComponent.seriesNumbers.splice(seriesNumberIndex, 1);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringConnectedComponentSeriesNumberChanged',
    value: function authoringConnectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {
      if (connectedComponent.seriesNumbers == null) {
        connectedComponent.seriesNumbers = [];
      }
      if (seriesNumberIndex < connectedComponent.seriesNumbers.length) {
        connectedComponent.seriesNumbers[seriesNumberIndex] = value;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {
      var connectedComponentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (connectedComponentType !== 'Embedded') {
        /*
         * the component type is not Embedded so we will remove the
         * seriesNumbers field
         */
        delete connectedComponent.seriesNumbers;
      }
      if (connectedComponentType !== 'Table') {
        /*
         * the component type is not Table so we will remove the
         * skipFirstRow, xColumn, and yColumn fields
         */
        delete connectedComponent.skipFirstRow;
        delete connectedComponent.xColumn;
        delete connectedComponent.yColumn;
      }
      if (connectedComponentType !== 'Graph') {
        /*
         * the component type is not Graph so we will remove the
         * show classmate work fields
         */
        delete connectedComponent.showClassmateWorkSource;
      }
      if (connectedComponentType === 'Table') {
        // set default values for the connected component params
        connectedComponent.skipFirstRow = true;
        connectedComponent.xColumn = 0;
        connectedComponent.yColumn = 1;
      }
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'connectedComponentShowClassmateWorkChanged',
    value: function connectedComponentShowClassmateWorkChanged(connectedComponent) {
      if (connectedComponent.showClassmateWork) {
        /*
         * show classmate work was enabled so we will default the
         * show classmate work source to period
         */
        connectedComponent.showClassmateWorkSource = 'period';
      } else {
        /*
         * the show classmate work was disabled so we will remove
         * the show classmate work fields
         */
        delete connectedComponent.showClassmateWork;
        delete connectedComponent.showClassmateWorkSource;
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType === 'ConceptMap' || componentType === 'Draw' || componentType === 'Label') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }
  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {
      if (connectedComponent.type === 'importWork') {
        delete connectedComponent.showClassmateWorkSource;
      } else if (connectedComponent.type === 'showWork') {
        delete connectedComponent.showClassmateWorkSource;
      } else if (connectedComponent.type === 'showClassmateWork') {
        /*
         * the type has changed to show classmate work so we will enable
         * trials so that each classmate work will show up in a
         * different trial
         */
        this.authoringComponentContent.enableTrials = true;
        if (connectedComponent.showClassmateWorkSource == null) {
          connectedComponent.showClassmateWorkSource = 'period';
        }
      }
      this.authoringViewComponentChanged();
    }
  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }]);

  return GraphAuthoringController;
}(_graphController2.default);

GraphAuthoringController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConfigService', 'GraphService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = GraphAuthoringController;
//# sourceMappingURL=graphAuthoringController.js.map

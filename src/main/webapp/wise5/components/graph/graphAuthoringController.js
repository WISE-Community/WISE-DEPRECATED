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

    // the available graph types
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

    // the options for rounding data point values
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

    // the options for data point symbols
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

    // the options for line types
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

    // the options for the x axis types
    _this.availableXAxisTypes = [{
      value: 'limits',
      text: 'Limits'
    }, {
      value: 'categories',
      text: 'Categories'
    }];

    // the options for when to update this component from a connected component
    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: _this.$translate('change')
    }, {
      value: 'save',
      text: _this.$translate('SAVE')
    }, {
      value: 'submit',
      text: _this.$translate('SUBMIT')
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{ type: 'Animation' }, { type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
    _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
    _this.isResetSeriesButtonVisible = true;
    _this.isSelectSeriesVisible = true;

    // generate the summernote rubric element id
    _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

    // set the component rubric into the summernote rubric
    _this.summernoteRubricHTML = _this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = _this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    _this.summernoteRubricOptions = {
      toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    _this.backgroundImage = _this.componentContent.backgroundImage;
    _this.updateAdvancedAuthoringView();

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.series = null;
      this.xAxis = null;
      this.yAxis = null;
      this.submitCounter = 0;
      this.backgroundImage = this.componentContent.backgroundImage;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.graphType = this.componentContent.graphType;
      this.isResetSeriesButtonVisible = true;
      this.isSelectSeriesVisible = true;
      this.legendEnabled = !this.componentContent.hideLegend;
      this.showTrialSelect = !this.componentContent.hideTrialSelect;
      this.setSeries(this.UtilService.makeCopyOfJSONObject(this.componentContent.series));
      this.setDefaultActiveSeries();
      this.trials = [];
      this.newTrial();
      this.clearPlotLines();
      this.setupGraph();
    }.bind(_this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    _this.$scope.$on('assetSelected', function (event, args) {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {
          // the asset was selected for this component
          var assetItem = args.assetItem;

          if (assetItem != null) {
            var fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              var assetsDirectoryPath = _this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;
              } else if (args.target == 'background') {
                // the target is the background image

                // set the background file name
                _this.authoringComponentContent.backgroundImage = fileName;

                // the authoring component content has changed so we will save the project
                _this.authoringViewComponentChanged();
              }

              if (summernoteId != '') {
                if (_this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (_this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // insert the video element
                  var videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  $('#' + summernoteId).summernote('insertNode', videoElement);
                }
              }
            }
          }
        }
      }

      // close the popup
      _this.$mdDialog.hide();
    });

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    _this.$scope.$on('componentAdvancedButtonClicked', function (event, args) {
      if (args != null) {
        var componentId = args.componentId;
        if (_this.componentId === componentId) {
          _this.showAdvancedAuthoring = !_this.showAdvancedAuthoring;
        }
      }
    });
    return _this;
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */


  _createClass(GraphAuthoringController, [{
    key: 'authoringViewComponentChanged',
    value: function authoringViewComponentChanged() {

      // update the JSON string in the advanced authoring view textarea
      this.updateAdvancedAuthoringView();

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    }
  }, {
    key: 'advancedAuthoringViewComponentChanged',


    /**
     * The component has changed in the advanced authoring view so we will update
     * the component and save the project.
     */
    value: function advancedAuthoringViewComponentChanged() {

      try {
        /*
         * create a new component by converting the JSON string in the advanced
         * authoring view into a JSON object
         */
        var authoringComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        // replace the component in the project
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, authoringComponentContent);

        // set the new authoring component content
        this.authoringComponentContent = authoringComponentContent;

        // set the new component into the controller
        this.componentContent = authoringComponentContent;

        /*
         * notify the parent node that the content has changed which will save
         * the project to the server
         */
        this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
      } catch (e) {
        this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
      }
    }
  }, {
    key: 'updateAdvancedAuthoringView',


    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'authoringAddSeriesClicked',


    /**
     * Add a series in the authoring view
     */
    value: function authoringAddSeriesClicked() {

      // create a new series
      var newSeries = this.createNewSeries();

      // add the new series
      this.authoringComponentContent.series.push(newSeries);

      // save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a series in the authoring view
     * @param the index of the series in the series array
     */

  }, {
    key: 'authoringDeleteSeriesClicked',
    value: function authoringDeleteSeriesClicked(index) {

      var confirmMessage = '';
      var seriesName = '';

      if (this.authoringComponentContent.series != null) {

        // get the series
        var series = this.authoringComponentContent.series[index];

        if (series != null && series.name != null) {

          // get the series name
          seriesName = series.name;
        }
      }

      if (seriesName == null || seriesName == '') {
        // the series does not have a name
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheSeries');
      } else {
        // the series has a name
        confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedSeries', { seriesName: seriesName });
      }

      // ask the author if they are sure they want to delete the series
      var answer = confirm(confirmMessage);

      if (answer) {
        // remove the series from the series array
        this.authoringComponentContent.series.splice(index, 1);

        // save the project
        this.authoringViewComponentChanged();
      }
    }
  }, {
    key: 'authoringViewEnableTrialsClicked',


    /**
     * The "Enable Trials" checkbox was clicked
     */
    value: function authoringViewEnableTrialsClicked() {

      if (this.authoringComponentContent.enableTrials) {
        // trials are now enabled
        this.authoringComponentContent.canCreateNewTrials = true;
        this.authoringComponentContent.canDeleteTrials = true;
      } else {
        // trials are now disabled
        this.authoringComponentContent.canCreateNewTrials = false;
        this.authoringComponentContent.canDeleteTrials = false;
        this.authoringComponentContent.hideAllTrialsOnNewTrial = true;
      }

      this.authoringViewComponentChanged();
    }

    /**
     * The author has changed the rubric
     */

  }, {
    key: 'summernoteRubricHTMLChanged',
    value: function summernoteRubricHTMLChanged() {

      // get the summernote rubric html
      var html = this.summernoteRubricHTML;

      /*
       * remove the absolute asset paths
       * e.g.
       * <img src='https://wise.berkeley.edu/curriculum/3/assets/sun.png'/>
       * will be changed to
       * <img src='sun.png'/>
       */
      html = this.ConfigService.removeAbsoluteAssetPaths(html);

      /*
       * replace <a> and <button> elements with <wiselink> elements when
       * applicable
       */
      html = this.UtilService.insertWISELinks(html);

      // update the component rubric
      this.authoringComponentContent.rubric = html;

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Show the asset popup to allow the author to choose the background image
     */

  }, {
    key: 'chooseBackgroundImage',
    value: function chooseBackgroundImage() {

      // generate the parameters
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = 'background';

      // display the asset chooser
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Add an x axis category
     */

  }, {
    key: 'authoringAddXAxisCategory',
    value: function authoringAddXAxisCategory() {

      // add an empty string as a new category
      this.authoringComponentContent.xAxis.categories.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete an x axis category
     * @param index the index of the category to delete
     */

  }, {
    key: 'authoringDeleteXAxisCategory',
    value: function authoringDeleteXAxisCategory(index) {

      if (index != null) {

        var confirmMessage = '';

        var categoryName = '';

        if (this.authoringComponentContent.xAxis != null && this.authoringComponentContent.xAxis.categories != null) {

          // get the category name
          categoryName = this.authoringComponentContent.xAxis.categories[index];
        }

        if (categoryName == null || categoryName == '') {
          // there category does not have a name
          confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheCategory');
        } else {
          // the category has a name
          confirmMessage = this.$translate('graph.areYouSureYouWantToDeleteTheNamedCategory', { categoryName: categoryName });
        }

        // ask the author if they are sure they want to delete the category
        var answer = confirm(confirmMessage);

        if (answer) {
          // remove the category at the given index
          this.authoringComponentContent.xAxis.categories.splice(index, 1);

          // the authoring component content has changed so we will save the project
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Add an empty data point to the series
     * @param series the series to add the empty data point to
     */

  }, {
    key: 'authoringAddSeriesDataPoint',
    value: function authoringAddSeriesDataPoint(series) {

      if (series != null && series.data != null) {

        if (this.authoringComponentContent.xAxis.type == null || this.authoringComponentContent.xAxis.type === 'limits') {
          // add an empty data point to the series
          series.data.push([]);
        } else if (this.authoringComponentContent.xAxis.type === 'categories') {
          // add an empty data point to the series
          series.data.push(null);
        }
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a data point from a series
     * @param series the series to delete a data point from
     * @param index the index of the data point to delete
     */

  }, {
    key: 'authoringDeleteSeriesDataPoint',
    value: function authoringDeleteSeriesDataPoint(series, index) {

      if (series != null && series.data != null) {

        // ask the author if they are sure they want to delete the point
        var answer = confirm(this.$translate('graph.areYouSureYouWantToDeleteTheDataPoint'));

        if (answer) {
          // delete the data point at the given index
          series.data.splice(index, 1);

          // the authoring component content has changed so we will save the project
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a data point up
     * @param series the series the data point belongs to
     * @param index the index of the data point in the series
     */

  }, {
    key: 'authoringMoveSeriesDataPointUp',
    value: function authoringMoveSeriesDataPointUp(series, index) {
      if (series != null && series.data != null) {

        if (index > 0) {
          // the data point is not at the top so we can move it up

          // remember the data point we are moving
          var dataPoint = series.data[index];

          // remove the data point at the given index
          series.data.splice(index, 1);

          // insert the data point back in at one index back
          series.data.splice(index - 1, 0, dataPoint);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Move a data point down
     * @param series the series the data point belongs to
     * @param index the index of the data point in the series
     */

  }, {
    key: 'authoringMoveSeriesDataPointDown',
    value: function authoringMoveSeriesDataPointDown(series, index) {
      if (series != null && series.data != null) {

        if (index < series.data.length - 1) {
          // the data point is not at the bottom so we can move it down

          // remember the data point we are moving
          var dataPoint = series.data[index];

          // remove the data point at the given index
          series.data.splice(index, 1);

          // insert the data point back in at one index back
          series.data.splice(index + 1, 0, dataPoint);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The graph type changed so we will handle updating the series data points
     * @param newValue the new value of the graph type
     * @param oldValue the old value of the graph type
     */

  }, {
    key: 'authoringViewGraphTypeChanged',
    value: function authoringViewGraphTypeChanged(newValue, oldValue) {

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The author has changed the x axis type
     * @param newValue the new x axis type
     * @param oldValue the old x axis type
     */

  }, {
    key: 'authoringViewXAxisTypeChanged',
    value: function authoringViewXAxisTypeChanged(newValue, oldValue) {
      // ask the author if they are sure they want to change the x axis type
      var answer = confirm(this.$translate('graph.areYouSureYouWantToChangeTheXAxisType'));

      if (answer) {
        // the author answered yes to change the type
        if (newValue === 'limits') {
          if (oldValue === 'categories') {
            // the graph type is changing from categories to limits
            delete this.authoringComponentContent.xAxis.categories;
            this.authoringComponentContent.xAxis.min = 0;
            this.authoringComponentContent.xAxis.max = 10;
            this.authoringConvertAllSeriesDataPoints(newValue);
          }
        } else if (newValue === 'categories') {
          if (oldValue === 'limits' || oldValue === '' || oldValue == null) {
            // the graph type is changing from limits to categories
            delete this.authoringComponentContent.xAxis.min;
            delete this.authoringComponentContent.xAxis.max;
            delete this.authoringComponentContent.xAxis.units;
            delete this.authoringComponentContent.yAxis.units;
            this.authoringComponentContent.xAxis.categories = [];
            this.authoringConvertAllSeriesDataPoints(newValue);
          }
        }
      } else {
        // the author answered no so we will not change the type
        // revert the x axis type
        this.authoringComponentContent.xAxis.type = oldValue;
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add symbols to all the series
     */

  }, {
    key: 'authoringAddSymbolsToSeries',
    value: function authoringAddSymbolsToSeries() {

      // get all the series
      var series = this.authoringComponentContent.series;

      if (series != null) {

        // loop through all the series
        for (var s = 0; s < series.length; s++) {

          // get a series
          var tempSeries = series[s];

          if (tempSeries != null) {
            // set the symbol to circle
            tempSeries.marker = {};
            tempSeries.marker.symbol = 'circle';
          }
        }
      }
    }

    /**
     * Convert the data points in all the series
     * @param graphType the x axis type to convert the data points to
     */

  }, {
    key: 'authoringConvertAllSeriesDataPoints',
    value: function authoringConvertAllSeriesDataPoints(xAxisType) {

      // get all the series
      var series = this.authoringComponentContent.series;

      if (series != null) {

        // loop through all the series
        for (var s = 0; s < series.length; s++) {

          // get a series
          var tempSeries = series[s];

          // convert the data points in the series
          this.convertSeriesDataPoints(tempSeries, xAxisType);
        }
      }
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

      /*
       * create the new connected component object that will contain a
       * node id and component id
       */
      var newConnectedComponent = {};
      newConnectedComponent.nodeId = this.nodeId;
      newConnectedComponent.componentId = null;
      newConnectedComponent.type = null;
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(newConnectedComponent);

      // initialize the array of connected components if it does not exist yet
      if (this.authoringComponentContent.connectedComponents == null) {
        this.authoringComponentContent.connectedComponents = [];
      }

      // add the connected component
      this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

      if (this.authoringComponentContent.connectedComponents.length > 1) {
        /*
         * there is more than one connected component so we will enable
         * trials so that each connected component can put work in a
         * different trial
         */
        this.authoringComponentContent.enableTrials = true;
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Automatically set the component id for the connected component if there
     * is only one viable option.
     * @param connectedComponent the connected component object we are authoring
     */

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var component = _step.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
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

          if (numberOfAllowedComponents == 1) {
            /*
             * there is only one viable component to connect to so we
             * will use it
             */
            connectedComponent.componentId = allowedComponent.id;
            connectedComponent.type = 'importWork';
            this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);
          }
        }
      }
    }

    /**
     * Delete a connected component
     * @param index the index of the component to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

      if (answer) {
        // the author answered yes to delete

        if (this.authoringComponentContent.connectedComponents != null) {
          this.authoringComponentContent.connectedComponents.splice(index, 1);
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Set the show submit button value
     * @param show whether to show the submit button
     */

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

      if (show == null || show == false) {
        // we are hiding the submit button
        this.authoringComponentContent.showSaveButton = false;
        this.authoringComponentContent.showSubmitButton = false;
      } else {
        // we are showing the submit button
        this.authoringComponentContent.showSaveButton = true;
        this.authoringComponentContent.showSubmitButton = true;
      }

      /*
       * notify the parent node that this component is changing its
       * showSubmitButton value so that it can show save buttons on the
       * step or sibling components accordingly
       */
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a connected component series number
     * @param connectedComponent the connected component object
     */

  }, {
    key: 'authoringAddConnectedComponentSeriesNumber',
    value: function authoringAddConnectedComponentSeriesNumber(connectedComponent) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // add an empty value into the series numbers
        connectedComponent.seriesNumbers.push(null);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Delete a connected component series number
     * @param connectedComponent the connected component object
     * @param seriesNumberIndex the series number index to delete
     */

  }, {
    key: 'authoringDeleteConnectedComponentSeriesNumber',
    value: function authoringDeleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // remove the element at the given index
        connectedComponent.seriesNumbers.splice(seriesNumberIndex, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The author has changed a series number
     * @param connectedComponent the connected component object
     * @param seriesNumberIndex the series number index to update
     * @param value the new series number value
     */

  }, {
    key: 'authoringConnectedComponentSeriesNumberChanged',
    value: function authoringConnectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {

      if (connectedComponent != null) {

        // initialize the series numbers if necessary
        if (connectedComponent.seriesNumbers == null) {
          connectedComponent.seriesNumbers = [];
        }

        // make sure the index is in the range of acceptable indexes
        if (seriesNumberIndex < connectedComponent.seriesNumbers.length) {

          // update the series number at the given index
          connectedComponent.seriesNumbers[seriesNumberIndex] = value;
        }

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Get the connected component type
     * @param connectedComponent get the component type of this connected component
     * @return the connected component type
     */

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

      var connectedComponentType = null;

      if (connectedComponent != null) {

        // get the node id and component id of the connected component
        var nodeId = connectedComponent.nodeId;
        var componentId = connectedComponent.componentId;

        // get the component
        var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

        if (component != null) {
          // get the component type
          connectedComponentType = component.type;
        }
      }

      return connectedComponentType;
    }

    /**
     * The connected component node id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
      if (connectedComponent != null) {
        connectedComponent.componentId = null;
        connectedComponent.type = null;
        delete connectedComponent.importWorkAsBackground;
        this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The connected component component id has changed
     * @param connectedComponent the connected component that has changed
     */

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

      if (connectedComponent != null) {

        // get the new component type
        var connectedComponentType = this.authoringGetConnectedComponentType(connectedComponent);

        if (connectedComponentType != 'Embedded') {
          /*
           * the component type is not Embedded so we will remove the
           * seriesNumbers field
           */
          delete connectedComponent.seriesNumbers;
        }

        if (connectedComponentType != 'Table') {
          /*
           * the component type is not Table so we will remove the
           * skipFirstRow, xColumn, and yColumn fields
           */
          delete connectedComponent.skipFirstRow;
          delete connectedComponent.xColumn;
          delete connectedComponent.yColumn;
        }

        if (connectedComponentType != 'Graph') {
          /*
           * the component type is not Graph so we will remove the
           * show classmate work fields
           */
          delete connectedComponent.showClassmateWorkSource;
        }

        if (connectedComponentType == 'Table') {
          // set default values for the connected component params
          connectedComponent.skipFirstRow = true;
          connectedComponent.xColumn = 0;
          connectedComponent.yColumn = 1;
        }

        // default the type to import work
        connectedComponent.type = 'importWork';
        this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * The showClassmateWork value has changed in a connected component
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'connectedComponentShowClassmateWorkChanged',
    value: function connectedComponentShowClassmateWorkChanged(connectedComponent) {

      if (connectedComponent != null) {

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

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * If the component type is a certain type, we will set the importWorkAsBackground
     * field to true.
     * @param connectedComponent The connected component object.
     */

  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType == 'ConceptMap' || componentType == 'Draw' || componentType == 'Label') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }

    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
          delete connectedComponent.showClassmateWorkSource;
        } else if (connectedComponent.type == 'showWork') {
          /*
           * the type has changed to show work
           */
          delete connectedComponent.showClassmateWorkSource;
        } else if (connectedComponent.type == 'showClassmateWork') {
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

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

      if (this.authoringComponentContent.tags == null) {
        // initialize the tags array
        this.authoringComponentContent.tags = [];
      }

      // add a tag
      this.authoringComponentContent.tags.push('');

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag up
     * @param index the index of the tag to move up
     */

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index back
        this.authoringComponentContent.tags.splice(index - 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Move a tag down
     * @param index the index of the tag to move down
     */

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);

        // insert the tag one index forward
        this.authoringComponentContent.tags.splice(index + 1, 0, tag);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a tag
     * @param index the index of the tag to delete
     */

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

          if (allowedConnectedComponentType != null) {
            if (componentType == allowedConnectedComponentType.type) {
              // the component type is allowed
              return true;
            }
          }
        }
      }

      return false;
    }

    /**
     * The show JSON button was clicked to show or hide the JSON authoring
     */

  }, {
    key: 'showJSONButtonClicked',
    value: function showJSONButtonClicked() {
      // toggle the JSON authoring textarea
      this.showJSONAuthoring = !this.showJSONAuthoring;

      if (this.jsonStringChanged && !this.showJSONAuthoring) {
        /*
         * the author has changed the JSON and has just closed the JSON
         * authoring view so we will save the component
         */
        this.advancedAuthoringViewComponentChanged();

        // scroll to the top of the component
        this.$rootScope.$broadcast('scrollToComponent', { componentId: this.componentId });

        this.jsonStringChanged = false;
      }
    }

    /**
     * The author has changed the JSON manually in the advanced view
     */

  }, {
    key: 'authoringJSONChanged',
    value: function authoringJSONChanged() {
      this.jsonStringChanged = true;
    }

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the
     * checkbox.
     */

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

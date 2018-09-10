'use strict';

import GraphController from "./graphController";
import html2canvas from 'html2canvas';

class GraphAuthoringController extends GraphController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              AnnotationService,
              ConfigService,
              GraphService,
              NodeService,
              NotebookService,
              ProjectService,
              StudentAssetService,
              StudentDataService,
              UtilService) {
    super($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConfigService,
      GraphService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

    // the available graph types
    this.availableGraphTypes = [
      {
        value: 'line',
        text: this.$translate('graph.linePlot')
      },
      {
        value: 'column',
        text: this.$translate('graph.columnPlot')
      },
      {
        value: 'scatter',
        text: this.$translate('graph.scatterPlot')
      }
    ];

    // the options for rounding data point values
    this.availableRoundingOptions = [
      {
        value: null,
        text: this.$translate('graph.noRounding')
      },
      {
        value: 'integer',
        text: this.$translate('graph.roundToInteger')
      },
      {
        value: 'tenth',
        text: this.$translate('graph.roundToTenth')
      },
      {
        value: 'hundredth',
        text: this.$translate('graph.roundToHundredth')
      }
    ];

    // the options for data point symbols
    this.availableSymbols = [
      {
        value: 'circle',
        text: this.$translate('graph.circle')
      },
      {
        value: 'square',
        text: this.$translate('graph.square')
      },
      {
        value: 'triangle',
        text: this.$translate('graph.triangle')
      },
      {
        value: 'triangle-down',
        text: this.$translate('graph.triangleDown')
      },
      {
        value: 'diamond',
        text: this.$translate('graph.diamond')
      }
    ];

    // the options for line types
    this.availableLineTypes = [
      {
        value: 'Solid',
        text: this.$translate('graph.solid')
      },
      {
        value: 'Dash',
        text: this.$translate('graph.dash')
      },
      {
        value: 'Dot',
        text: this.$translate('graph.dot')
      },
      {
        value: 'ShortDash',
        text: this.$translate('graph.shortDash')
      },
      {
        value: 'ShortDot',
        text: this.$translate('graph.shortDot')
      }
    ];

    // the options for the x axis types
    this.availableXAxisTypes = [
      {
        value: 'limits',
        text: 'Limits'
      },
      {
        value: 'categories',
        text: 'Categories'
      }
    ]

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Table' }
    ];

    this.isResetSeriesButtonVisible = true;
    this.isSelectSeriesVisible = true;

    this.backgroundImage = this.componentContent.backgroundImage;

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
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
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
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
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;

              var summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'background') {
                // the target is the background image

                // set the background file name
                this.authoringComponentContent.backgroundImage = fileName;

                // the authoring component content has changed so we will save the project
                this.authoringViewComponentChanged();
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

                  // add the image html
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
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
      this.$mdDialog.hide();
    });
  }

  /**
   * Add a series in the authoring view
   */
  authoringAddSeriesClicked() {

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
  authoringDeleteSeriesClicked(index) {

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
  };

  /**
   * The "Enable Trials" checkbox was clicked
   */
  authoringViewEnableTrialsClicked() {

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
   * Show the asset popup to allow the author to choose the background image
   */
  chooseBackgroundImage() {

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
  authoringAddXAxisCategory() {

    // add an empty string as a new category
    this.authoringComponentContent.xAxis.categories.push('');

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete an x axis category
   * @param index the index of the category to delete
   */
  authoringDeleteXAxisCategory(index) {

    if (index != null) {

      var confirmMessage = '';

      var categoryName = '';

      if (this.authoringComponentContent.xAxis != null &&
        this.authoringComponentContent.xAxis.categories != null) {

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
  authoringAddSeriesDataPoint(series) {

    if (series != null && series.data != null) {

      if (this.authoringComponentContent.xAxis.type == null ||
        this.authoringComponentContent.xAxis.type === 'limits') {
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
  authoringDeleteSeriesDataPoint(series, index) {

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
  authoringMoveSeriesDataPointUp(series, index) {
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
  authoringMoveSeriesDataPointDown(series, index) {
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
  authoringViewGraphTypeChanged(newValue, oldValue) {

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The author has changed the x axis type
   * @param newValue the new x axis type
   * @param oldValue the old x axis type
   */
  authoringViewXAxisTypeChanged(newValue, oldValue) {
    // ask the author if they are sure they want to change the x axis type
    let answer = confirm(this.$translate('graph.areYouSureYouWantToChangeTheXAxisType'));

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
  authoringAddSymbolsToSeries() {

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
  authoringConvertAllSeriesDataPoints(xAxisType) {

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
  authoringAddConnectedComponent() {

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
  authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
    if (connectedComponent != null) {
      let components = this.getComponentsByNodeId(connectedComponent.nodeId);
      if (components != null) {
        let numberOfAllowedComponents = 0;
        let allowedComponent = null;
        for (let component of components) {
          if (component != null) {
            if (this.isConnectedComponentTypeAllowed(component.type) &&
              component.id != this.componentId) {
              // we have found a viable component we can connect to
              numberOfAllowedComponents += 1;
              allowedComponent = component;
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
   * Add a connected component series number
   * @param connectedComponent the connected component object
   */
  authoringAddConnectedComponentSeriesNumber(connectedComponent) {

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
  authoringDeleteConnectedComponentSeriesNumber(connectedComponent, seriesNumberIndex) {

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
  authoringConnectedComponentSeriesNumberChanged(connectedComponent, seriesNumberIndex, value) {

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
   * The connected component component id has changed
   * @param connectedComponent the connected component that has changed
   */
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

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
  connectedComponentShowClassmateWorkChanged(connectedComponent) {

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
  authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
    let componentType = this.authoringGetConnectedComponentType(connectedComponent);
    if (componentType == 'ConceptMap' ||
      componentType == 'Draw' ||
      componentType == 'Label') {
      connectedComponent.importWorkAsBackground = true;
    } else {
      delete connectedComponent.importWorkAsBackground;
    }
  }

  /**
   * The connected component type has changed
   * @param connectedComponent the connected component that changed
   */
  authoringConnectedComponentTypeChanged(connectedComponent) {

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
   * The "Import Work As Background" checkbox was clicked.
   * @param connectedComponent The connected component associated with the
   * checkbox.
   */
  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (!connectedComponent.importWorkAsBackground) {
      delete connectedComponent.importWorkAsBackground;
    }
    this.authoringViewComponentChanged();
  }
}


GraphAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConfigService',
  'GraphService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default GraphAuthoringController;

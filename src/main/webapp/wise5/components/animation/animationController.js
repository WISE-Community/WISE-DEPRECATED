'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

require('svg.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AnimationController = function (_ComponentController) {
  _inherits(AnimationController, _ComponentController);

  function AnimationController($filter, $mdDialog, $q, $rootScope, $scope, $timeout, AnimationService, AnnotationService, ConfigService, CRaterService, NodeService, NotebookService, NotificationService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, AnimationController);

    var _this = _possibleConstructorReturn(this, (AnimationController.__proto__ || Object.getPrototypeOf(AnimationController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.AnimationService = AnimationService;
    _this.CRaterService = CRaterService;
    _this.NotificationService = NotificationService;

    // whether we're only showing the student work
    // TODO: refactor. do we need this?
    _this.onlyShowWork = false;

    // the latest annotations
    _this.latestAnnotations = null;

    // mapping from object id to svg object
    _this.idToSVGObject = {};

    // the default width and height
    _this.width = 800;
    _this.height = 600;

    // the default pixels per unit
    _this.pixelsPerXUnit = 1;
    _this.pixelsPerYUnit = 1;

    // the default data origin in pixels
    _this.dataXOriginInPixels = 0;
    _this.dataYOriginInPixels = 0;

    // the current state of the animation ('playing', 'paused', or 'stopped')
    _this.animationState = 'stopped';

    // the coordinate system to use ('screen' or 'cartesian')
    _this.coordinateSystem = 'screen';

    // mapping from id to whether the object is animating
    _this.idToAnimationState = {};

    /*
     * milliseconds per data time
     * example
     * The data time can be labelled with any unit of time such as seconds,
     * minutes, hours, days, years, etc.
     * If realTimePerDataTime is 100, that means for 1 data time, 100
     * milliseconds will pass in real time.
     */
    _this.realTimePerDataTime = 100;

    // the speed slider value
    _this.speedSliderValue = 3;

    // get the component state from the scope
    var componentState = _this.$scope.componentState;

    // get the svg id
    _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId;

    // initialize all the coordinates
    _this.initializeCoordinates();

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading') {

      // get the svg id
      if (componentState != null) {
        _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId + '_' + componentState.id;
      } else {

        _this.svgId = 'svg_' + _this.nodeId + '_' + _this.componentId + '_' + _this.workgroupId;
      }

      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'onlyShowWork') {
      _this.onlyShowWork = true;
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'authoring') {}

    if (_this.mode == 'student') {
      if (_this.UtilService.hasShowWorkConnectedComponent(_this.componentContent)) {
        // we will show work from another component
        _this.handleConnectedComponents();
      } else if (_this.AnimationService.componentStateHasStudentWork(componentState, _this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        _this.setStudentWork(componentState);
      } else if (_this.UtilService.hasConnectedComponent(_this.componentContent)) {
        // we will import work from another component
        _this.handleConnectedComponents();
      }
    } else {
      // populate the student work into this component
      _this.setStudentWork(componentState);
    }

    // check if the student has used up all of their submits
    if (_this.componentContent.maxSubmitCount != null && _this.submitCounter >= _this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      _this.isSubmitButtonDisabled = true;
    }

    _this.disableComponentIfNecessary();

    if (_this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      _this.$scope.$parent.nodeController.registerComponentController(_this.$scope, _this.componentContent);
    }

    /*
     * Call the setup() function after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    _this.$timeout(angular.bind(_this, _this.setup));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    _this.$scope.isDirty = function () {
      return this.$scope.animationController.isDirty;
    }.bind(_this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    _this.$scope.getComponentState = function (isSubmit) {
      var deferred = this.$q.defer();
      var getState = false;
      var action = 'change';

      if (isSubmit) {
        if (this.$scope.animationController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.animationController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.animationController.createComponentState(action).then(function (componentState) {
          deferred.resolve(componentState);
        });
      } else {
        /*
         * the student does not have any unsaved changes in this component
         * so we don't need to save a component state for this component.
         * we will immediately resolve the promise here.
         */
        deferred.resolve();
      }

      return deferred.promise;
    }.bind(_this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', function (event, args) {}.bind(_this));

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    _this.$scope.handleConnectedComponentStudentDataChanged = function (connectedComponent, connectedComponentParams, componentState) {

      if (connectedComponent != null && componentState != null) {

        // get the component type that has changed
        var componentType = connectedComponent.type;

        if (componentType === 'Graph') {

          // update the object datas
          _this.updateObjectDatasFromDataSources(componentState);
        }
      }
    };

    // load script for this component, if any
    var script = _this.componentContent.script;
    if (script != null) {
      _this.ProjectService.retrieveScript(script).then(function (script) {
        new Function(script).call(_this);
      });
    }
    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  _createClass(AnimationController, [{
    key: 'handleNodeSubmit',
    value: function handleNodeSubmit() {
      this.submit('nodeSubmitButton');
    }

    /**
     * Initialize the coordinates of the svg div
     */

  }, {
    key: 'initializeCoordinates',
    value: function initializeCoordinates() {

      if (this.componentContent.widthInPixels != null && this.componentContent.widthInPixels != '') {
        // get the width of the canvas in pixels
        this.width = this.componentContent.widthInPixels;

        // get the ratio of pixels per x unit
        this.pixelsPerXUnit = this.componentContent.widthInPixels / this.componentContent.widthInUnits;
      }

      if (this.componentContent.heightInPixels != null && this.componentContent.heightInPixels != '') {
        // get the height of the canvas in pixels
        this.height = this.componentContent.heightInPixels;

        // get the ratio of pixels per y unit
        this.pixelsPerYUnit = this.componentContent.heightInPixels / this.componentContent.heightInUnits;
      }

      if (this.componentContent.dataXOriginInPixels != null && this.componentContent.dataXOriginInPixels != '') {
        // get the data x origin in pixels
        this.dataXOriginInPixels = this.componentContent.dataXOriginInPixels;
      }

      if (this.componentContent.dataYOriginInPixels != null && this.componentContent.dataYOriginInPixels != '') {
        // get the data y origin in pixels
        this.dataYOriginInPixels = this.componentContent.dataYOriginInPixels;
      }

      if (this.componentContent.coordinateSystem != null && this.componentContent.coordinateSystem != '') {
        // get the coordinate system
        this.coordinateSystem = this.componentContent.coordinateSystem;
      }
    }

    /**
     * Setup the objects
     */

  }, {
    key: 'setup',
    value: function setup() {
      // get the svg.js draw handle
      this.draw = SVG(this.svgId);

      // create the objects
      this.createObjects();

      // if an object uses data from another data source, update its data
      this.updateObjectDatasFromDataSources();
    }

    /**
     * Create the objects in the svg world
     */

  }, {
    key: 'createObjects',
    value: function createObjects() {

      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {
              var id = object.id;
              var type = object.type;
              var label = object.label;

              var svgObject = null;

              if (type == 'image') {
                // get the image file name
                var image = object.image;

                // get the width and the height
                var width = object.width;
                var height = object.height;

                // create the image in the svg world
                svgObject = this.draw.image(image, width, height);
              } else if (type == 'text') {

                /*
                 * if the text field is null, change it to an empty
                 * string otherwise this.draw.text(null) will return
                 * an empty string and cause problems later
                 */
                if (object.text == null) {
                  object.text = '';
                }

                // get the text
                var text = object.text;

                // create the text object in the svg world
                svgObject = this.draw.text(text);
              }

              // add an entry in our id to svg object mapping
              this.idToSVGObject[id] = svgObject;

              // add an entry in our id to animation state mapping
              this.idToAnimationState[id] = false;

              // initialize the svg object position
              this.initializeObjectPosition(object);
            }
          }
        }
      }
    }

    /**
     * Initialize the object images
     */

  }, {
    key: 'initializeObjectImages',
    value: function initializeObjectImages() {
      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            var id = object.id;
            var type = object.type;

            // get the image file name
            var image = object.image;

            if (type == 'image') {
              // the object is an image

              // get the svg object
              var svgObject = this.idToSVGObject[id];

              // load the image into the svg object
              svgObject.load(image);
            }
          }
        }
      }
    }

    /**
     * Initialize the object positions
     */

  }, {
    key: 'initializeObjectPositions',
    value: function initializeObjectPositions() {
      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            // initialize the object position
            this.initializeObjectPosition(object);
          }
        }
      }
    }

    /**
     * Convert a data x value to a pixel x value
     * @param x an x value in data units
     * @return the x value converted to a pixel coordinate
     */

  }, {
    key: 'dataXToPixelX',
    value: function dataXToPixelX(x) {

      // default the pixel x to start at the data x origin
      var pixelX = this.dataXOriginInPixels;

      if (x != null) {

        // convert the x value to pixels and shift it by the x origin
        pixelX += x * this.pixelsPerXUnit;
      }

      return pixelX;
    }

    /**
     * Convert a data y value to a pixel y value
     * @param y an y value in data units
     * @return the y value converted to a pixel coordinate
     */

  }, {
    key: 'dataYToPixelY',
    value: function dataYToPixelY(y) {

      // default the pixel y to start at the data y origin
      var pixelY = this.dataYOriginInPixels;

      if (y != null) {
        // convert the y value to pixels and shift it by the y origin
        pixelY += y * this.pixelsPerYUnit;
      }

      return pixelY;
    }

    /**
     * Initialize the object position in the svg world
     * @param object the authored object
     */

  }, {
    key: 'initializeObjectPosition',
    value: function initializeObjectPosition(object) {
      var id = object.id;
      var label = object.label;
      var data = object.data;
      var dataX = object.dataX;
      var dataY = object.dataY;
      var pixelX = object.pixelX;
      var pixelY = object.pixelY;

      var x = 0;
      var y = 0;

      if (dataX != null) {
        // the dataX position was provided

        // convert the data x value to a pixel x value
        x = this.dataXToPixelX(dataX);
      } else if (pixelX != null) {
        // the pixelX position was provided
        x = pixelX;
      }

      if (dataY != null) {
        // the dataY position was provided

        // convert the data y value to a pixel y value
        y = this.dataYToPixelY(dataY);
      } else if (pixelY != null) {
        // the pixelY position was provided
        y = pixelY;
      }

      if (this.isUsingCartesianCoordinateSystem()) {
        /*
         * we are using the cartesian coordinate system so we need to modify
         * the y value
         */
        y = this.convertToCartesianCoordinateSystem(y);
      }

      // get the svg object
      var svgObject = this.idToSVGObject[id];

      if (svgObject != null) {

        // set the x and y pixel position
        svgObject.attr({ x: x, y: y });

        if (data != null && data.length > 0) {
          // there is data for this object

          // get the first data point
          var firstDataPoint = data[0];

          if (firstDataPoint != null) {

            var firstDataPointT = firstDataPoint.t;
            var firstDataPointX = firstDataPoint.x;
            var firstDataPointY = firstDataPoint.y;

            if (firstDataPointT === 0) {
              /*
               * there is a first data point with t == 0 so we will
               * use it as the starting position
               */

              if (firstDataPointX != null && firstDataPointX != '' && typeof firstDataPointX != 'undefined') {
                // convert the data x value to a pixel x value
                var firstDataPointXInPixels = this.dataXToPixelX(firstDataPointX);
                svgObject.attr('x', firstDataPointXInPixels);
              }

              if (firstDataPointY != null && firstDataPointY != '' && typeof firstDataPointY != 'undefined') {
                // convert the data y value to a pixel y value
                var firstDataPointYInPixels = this.dataYToPixelY(firstDataPointY);

                if (this.isUsingCartesianCoordinateSystem()) {
                  /*
                   * we are using the cartesian coordinate system so we need to modify
                   * the y value
                   */
                  firstDataPointYInPixels = this.convertToCartesianCoordinateSystem(firstDataPointYInPixels);
                }

                svgObject.attr('y', firstDataPointYInPixels);
              }
            }
          }
        }
      }
    }

    /**
     * Start the animation
     */

  }, {
    key: 'startAnimation',
    value: function startAnimation() {

      // set the images back to their starting images in case they have changed
      this.initializeObjectImages();

      // put the objects in their starting positions
      this.initializeObjectPositions();

      if (this.componentContent != null) {

        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {

              // animate the object
              this.animateObject(object);
            }
          }
        }
      }
    }

    /**
     * Show the time on the svg div
     * @param t the time
     */

  }, {
    key: 'showTime',
    value: function showTime(t) {

      if (this.timerText == null) {
        // initialize the timer text
        this.timerText = this.draw.text('0').attr({ fill: '#f03' });
      }

      // get the width of the svg div
      var width = this.width;

      // set the x position near the top right of the svg div
      var x = width - 30;
      var y = 0;

      // set the text that the student will see
      this.timerText.text(t + '');

      if (t >= 10) {
        // shift the text to the left if there are two digits
        x = width - 38;
      } else if (t >= 100) {
        // shift the text to the left more if there are three digits
        x = width - 46;
      }

      // set the position of the text
      this.timerText.attr({ x: x, y: y });
    }

    /**
     * Update the object data from their data source
     * @param componentState (optional) a component state which may be the
     * data source for one of the objects
     */

  }, {
    key: 'updateObjectDatasFromDataSources',
    value: function updateObjectDatasFromDataSources(componentState) {

      if (this.componentContent != null) {

        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {

              if (object.dataSource != null) {
                // the object gets its data from a data source
                this.updateObjectDataFromDataSource(object, componentState);
              }
            }
          }
        }
      }
    }

    /**
     * Update the data from its data source
     * @param object update the data for this object
     * @param componentState (optional) The component state to get the data
     * from. If this is not provided, we will look up the latest component
     * state.
     */

  }, {
    key: 'updateObjectDataFromDataSource',
    value: function updateObjectDataFromDataSource(object, componentState) {

      if (object != null) {

        // get the data source details
        var dataSource = object.dataSource;

        if (dataSource != null) {
          var nodeId = dataSource.nodeId;
          var componentId = dataSource.componentId;

          if (componentState == null) {
            // the component state was not passed in so we will get it
            componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
          }

          if (componentState != null && nodeId == componentState.nodeId && componentId == componentState.componentId) {
            // the component state matches the data source

            if (componentState.componentType == 'Graph') {
              this.setDataFromGraphComponentState(object, componentState);
            } else if (componentState.componentType == 'Table') {
              this.setDataFromTableComponentState(object, componentState);
            }
          }
        }
      }
    }

    /**
     * Get the data from the graph component state
     * @param object set the data into this object
     * @param componentState
     */

  }, {
    key: 'setDataFromGraphComponentState',
    value: function setDataFromGraphComponentState(object, componentState) {
      if (object != null) {

        // get the data source specification
        var dataSource = object.dataSource;

        if (dataSource != null) {
          var nodeId = dataSource.nodeId;
          var componentId = dataSource.componentId;
          var trialIndex = dataSource.trialIndex;
          var seriesIndex = dataSource.seriesIndex;
          var tColumnIndex = dataSource.tColumnIndex;
          var xColumnIndex = dataSource.xColumnIndex;
          var yColumnIndex = dataSource.yColumnIndex;

          if (componentState != null && nodeId == componentState.nodeId && componentId == componentState.componentId) {
            // the component state matches the data source

            var studentData = componentState.studentData;

            if (studentData != null) {
              var trials = studentData.trials;

              if (trials != null) {

                // get the trial we ant
                var trial = trials[trialIndex];

                if (trial != null) {
                  var series = trial.series;

                  if (series != null) {

                    // get the series we want
                    var singleSeries = series[seriesIndex];

                    if (singleSeries != null) {
                      var seriesData = singleSeries.data;

                      if (seriesData != null) {

                        // array to store our animation data
                        var data = [];

                        // loop through all the points in the series
                        for (var d = 0; d < seriesData.length; d++) {
                          var seriesDataPoint = seriesData[d];

                          // create a data point
                          var animationDataPoint = {};

                          if (tColumnIndex != null) {
                            // get the t value
                            animationDataPoint.t = seriesDataPoint[tColumnIndex];
                          }

                          if (xColumnIndex != null) {
                            // get the x value
                            animationDataPoint.x = seriesDataPoint[xColumnIndex];
                          }

                          if (yColumnIndex != null) {
                            // get the y value
                            animationDataPoint.y = seriesDataPoint[yColumnIndex];
                          }

                          // add the data point to the array
                          data.push(animationDataPoint);
                        }

                        // set the data into the object
                        object.data = data;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }, {
    key: 'setDataFromTableComponentState',
    value: function setDataFromTableComponentState() {}

    /**
     * Move the object
     * @param object the authored object
     */

  }, {
    key: 'animateObject',
    value: function animateObject(object) {
      var _this2 = this;

      if (object != null) {
        (function () {
          var id = object.id;
          var data = object.data;

          if (data != null) {

            // get the svg object
            var svgObject = _this2.idToSVGObject[id];

            if (svgObject != null) {
              (function () {

                /*
                 * this will hold SVG.FX object that is returned from
                 * calling animate()
                 */
                var animateObject = null;

                var thisAnimationController = _this2;

                // loop through all the data

                var _loop = function _loop(d) {

                  // get the current point
                  var currentDataPoint = data[d];
                  var t = currentDataPoint.t;
                  var x = currentDataPoint.x;
                  var y = currentDataPoint.y;
                  var image = currentDataPoint.image;

                  // convert the data values to pixels
                  var xPixel = _this2.dataXToPixelX(x);
                  var yPixel = _this2.dataYToPixelY(y);

                  // get the next point
                  var nextDataPoint = data[d + 1];
                  var nextT = null;
                  var nextX = null;
                  var nextY = null;
                  var nextXPixel = null;
                  var nextYPixel = null;

                  if (nextDataPoint != null) {
                    nextT = nextDataPoint.t;
                    nextX = nextDataPoint.x;
                    nextY = nextDataPoint.y;

                    // convert the data values to pixels
                    nextXPixel = _this2.dataXToPixelX(nextX);
                    nextYPixel = _this2.dataYToPixelY(nextY);
                  }

                  if (_this2.isUsingCartesianCoordinateSystem()) {
                    /*
                     * we are using the cartesian coordinate system so we need to modify
                     * the y value
                     */
                    yPixel = _this2.convertToCartesianCoordinateSystem(yPixel);
                    nextYPixel = _this2.convertToCartesianCoordinateSystem(nextYPixel);
                  }

                  // set the animation state to true for the object
                  _this2.idToAnimationState[id] = true;

                  var tDiff = 0;

                  if (nextT != null && nextT != '') {
                    /*
                     * calculate the time difference so we know how long we should make
                     * it take to move to the new position
                     */
                    tDiff = nextT - t;
                  }

                  if (d == 0) {
                    // this is the first data point

                    if (t == 0) {
                      /*
                       * immediately set the position since we are at
                       * time 0
                       */

                      // set the position
                      svgObject.attr({ x: xPixel, y: yPixel });
                    } else {
                      /*
                       * the first data point is not at time 0 so we will
                       * need to wait until time t before we set the
                       * position of the object
                       */
                      animateObject = svgObject.animate(t * _this2.realTimePerDataTime).during(function (pos, morph, eased, situation) {

                        // calculate the amount of time that has elapsed
                        var elapsedTime = t * pos;

                        // display and broadcast the elapsed time
                        thisAnimationController.displayAndBroadcastTime(elapsedTime);
                      }).after(function () {
                        // set the position
                        this.attr({ x: xPixel, y: yPixel });
                      });
                    }
                  }

                  if (image != null && image != '') {
                    /*
                     * there is an image specified for this data point
                     * so we will change to that image
                     */

                    if (animateObject == null) {
                      /*
                       * there is no animateObject yet so we will
                       * change the image immediately
                       */
                      svgObject.load(image);
                    } else {
                      /*
                       * change the image after all the existing
                       * animations
                       */
                      animateObject = animateObject.after(function () {
                        this.load(image);
                      });
                    }
                  } else if (nextDataPoint != null) {
                    /*
                     * there is a next data point so we will see if we
                     * can determine what image to show based upon the
                     * movement of the object
                     */

                    // get the image to show based upon the movement
                    var dynamicallyCalculatedImage = _this2.getImageBasedOnMovement(object, currentDataPoint, nextDataPoint);

                    if (dynamicallyCalculatedImage != null) {
                      if (animateObject == null) {
                        /*
                         * there is no animateObject yet so we will
                         * change the image immediately
                         */
                        svgObject.load(dynamicallyCalculatedImage);
                      } else {
                        /*
                         * change the image after all the existing
                         * animations
                         */
                        animateObject = animateObject.after(function () {
                          this.load(dynamicallyCalculatedImage);
                        });
                      }
                    }
                  }

                  if (d != data.length - 1) {
                    // this is a data point that is not the last

                    // move the image to the next position
                    animateObject = svgObject.animate(tDiff * _this2.realTimePerDataTime).move(nextXPixel, nextYPixel).during(function (pos, morph, eased, situation) {

                      // calculate the elapsed time
                      var elapsedTime = t + tDiff * pos;

                      // display and broadcast the elapsed time
                      thisAnimationController.displayAndBroadcastTime(elapsedTime);
                    });
                  }

                  if (d == data.length - 1) {
                    // this is the last data point

                    // after all the animations are done on the object we will perform some processing
                    animateObject = animateObject.afterAll(function () {

                      /*
                       * we are done animating this object so we will
                       * set the animation state to false for the
                       * object
                       */
                      _this2.idToAnimationState[id] = false;

                      // check if all svg objects are done animating
                      _this2.checkIfAllAnimatingIsDone();
                    });
                  }
                };

                for (var d = 0; d < data.length; d++) {
                  _loop(d);
                }
              })();
            }
          }
        })();
      }
    }

    /**
     * Display and broadcast the time
     * @param t the time
     */

  }, {
    key: 'displayAndBroadcastTime',
    value: function displayAndBroadcastTime(t) {

      var currentTime = new Date().getTime();

      if (this.lastBroadcastTime == null) {
        this.lastBroadcastTime = currentTime;
      }

      if (currentTime - this.lastBroadcastTime > 100) {
        /*
         * Remove the digits after the first decimal place.
         * example
         * 12.817 will be changed to 12.8
         */
        var displayTime = parseInt(t * 10) / 10;

        // show the time on the svg div
        this.showTime(displayTime);

        // create a component state with the time in it
        var componentState = {};
        componentState.t = t;

        /*
         * broadcast the component state with the time in it
         * so other components can know the elapsed time
         */
        this.$scope.$emit('componentStudentDataChanged', { nodeId: this.nodeId, componentId: this.componentId, componentState: componentState });

        this.lastBroadcastTime = currentTime;
      }
    }

    /**
     * Get the image based upon the movement of the object
     * @param object the object that is being moved
     * @param currentDataPoint the current data point
     * @param nextDataPoint the next data point
     */

  }, {
    key: 'getImageBasedOnMovement',
    value: function getImageBasedOnMovement(object, currentDataPoint, nextDataPoint) {

      var image = null;

      if (currentDataPoint != null && nextDataPoint != null) {

        var currentX = currentDataPoint.x;
        var currentY = currentDataPoint.y;

        var _nextX = nextDataPoint.x;
        var _nextY = nextDataPoint.y;

        if (currentY == _nextY) {
          // there is no change in y

          if (currentX == _nextX) {
            // there is no change in x

            // the image is staying in place
          } else if (currentX < _nextX) {
            // x is moving to the right
            if (object.imageMovingRight != null && object.imageMovingRight != '') {
              image = object.imageMovingRight;
            }
          } else if (currentX > _nextX) {
            // x is moving to the left
            if (object.imageMovingLeft != null && object.imageMovingLeft != '') {
              image = object.imageMovingLeft;
            }
          }
        } else if (currentX == _nextX) {
          // there is no change in x

          if (currentY == _nextY) {
            // there is no change in y

            // the image is staying in place
          } else if (currentY < _nextY) {
            // y is getting larger

            if (this.isUsingCartesianCoordinateSystem()) {
              // y is moving up
              if (object.imageMovingUp != null && object.imageMovingUp != '') {
                image = object.imageMovingUp;
              }
            } else {
              // y is moving down
              if (object.imageMovingDown != null && object.imageMovingDown != '') {
                image = object.imageMovingDown;
              }
            }
          } else if (currentY > _nextY) {
            // y is getting smaller

            if (this.isUsingCartesianCoordinateSystem()) {
              // y is moving down
              if (object.imageMovingDown != null && object.imageMovingDown != '') {
                image = object.imageMovingDown;
              }
            } else {
              // y is moving up
              if (object.imageMovingUp != null && object.imageMovingUp != '') {
                image = object.imageMovingUp;
              }
            }
          }
        } else {
          // there is a change in x and y

          // TODO: fill out these if/else cases by setting the appropriate image

          if (currentX < _nextX && currentY < _nextY) {
            // x is getting larger and y is getting larger

            if (this.isUsingCartesianCoordinateSystem()) {
              // the image is moving up to the right
            } else {
                // the image is moving down to the right
              }
          } else if (currentX < _nextX && currentY > _nextY) {
            // x is getting larger and y is getting smaller

            if (this.isUsingCartesianCoordinateSystem()) {
              // the image is moving down to the right
            } else {
                // the image is moving up to the right
              }
          } else if (currentX > _nextX && currentY > _nextY) {
            // x is getting smaller and y is getting smaller

            if (this.isUsingCartesianCoordinateSystem()) {
              // the image is moving down to the left
            } else {
                // the image is moving up to the left
              }
          } else if (currentX > _nextX && currentY < _nextY) {
            // x is getting smaller and y is getting larger

            if (this.isUsingCartesianCoordinateSystem()) {
              // the image is moving up to the right
            } else {
                // the image is moving down to the right
              }
          }
        }
      }

      return image;
    }

    /**
     * Check if all svg objects are done animating. If there are not svg objects
     * animating, we will set the animationState to 'stopped'.
     */

  }, {
    key: 'checkIfAllAnimatingIsDone',
    value: function checkIfAllAnimatingIsDone() {
      var _this3 = this;

      // check if there are any other objects that are still animating
      if (!this.areAnyObjectsAnimating()) {
        // there are no objects animating

        // set the animation state to 'stopped'
        this.animationState = 'stopped';

        // perform a digest after a timeout so that the buttons update
        this.$timeout(function () {
          _this3.$scope.$digest();
        });
      }
    }

    /**
     * Populate the student work into the component
     * @param componentState the component state to populate into the component
     */

  }, {
    key: 'setStudentWork',
    value: function setStudentWork(componentState) {

      if (componentState != null) {
        var studentData = componentState.studentData;

        if (studentData != null) {
          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
          }

          this.processLatestSubmit();
        }
      }
    }
  }, {
    key: 'processLatestSubmit',


    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */
    value: function processLatestSubmit() {
      var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestState) {
        var serverSaveTime = latestState.serverSaveTime;
        var clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
        if (latestState.isSubmit) {
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
        }
      }
    }
  }, {
    key: 'submit',


    /**
     * A submit was triggered by the component submit button or node submit button
     * @param submitTriggeredBy what triggered the submit
     * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
     */
    value: function submit(submitTriggeredBy) {

      if (this.isSubmitDirty) {
        // the student has unsubmitted work

        var performSubmit = true;

        if (this.componentContent.maxSubmitCount != null) {
          // there is a max submit count

          // calculate the number of submits this student has left
          var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

          var message = '';

          if (numberOfSubmitsLeft <= 0) {

            // the student does not have any more chances to submit
            alert(this.$translate('animation.youHaveNoMoreChances'));
            performSubmit = false;
          } else if (numberOfSubmitsLeft == 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('animation.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            //message = 'You have ' + numberOfSubmitsLeft + ' chance to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
            performSubmit = confirm(message);
          } else if (numberOfSubmitsLeft > 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('animation.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            //message = 'You have ' + numberOfSubmitsLeft + ' chances to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
            performSubmit = confirm(message);
          }
        }

        if (performSubmit) {

          /*
           * set isSubmit to true so that when the component state is
           * created, it will know that is a submit component state
           * instead of just a save component state
           */
          this.isSubmit = true;
          this.incrementSubmitCounter();

          // check if the student has used up all of their submits
          if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
            /*
             * the student has used up all of their submits so we will
             * disable the submit button
             */
            this.isSubmitButtonDisabled = true;
          }

          if (this.mode === 'authoring') {
            /*
             * we are in authoring mode so we will set values appropriately
             * here because the 'componentSubmitTriggered' event won't
             * work in authoring mode
             */
            this.isDirty = false;
            this.isSubmitDirty = false;
            this.createComponentState('submit');
          }

          if (submitTriggeredBy == null || submitTriggeredBy === 'componentSubmitButton') {
            // tell the parent node that this component wants to submit
            this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
          } else if (submitTriggeredBy === 'nodeSubmitButton') {
            // nothing extra needs to be performed
          }
        } else {
          /*
           * the student has cancelled the submit so if a component state
           * is created, it will just be a regular save and not submit
           */
          this.isSubmit = false;
        }
      }
    }

    /**
     * Called when the student changes their work
     */

  }, {
    key: 'studentDataChanged',
    value: function studentDataChanged() {
      var _this4 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
      this.setSaveMessage('', null);

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {
        _this4.$scope.$emit('componentStudentDataChanged', { nodeId: _this4.nodeId, componentId: _this4.componentId, componentState: componentState });
      });
    }
  }, {
    key: 'createComponentState',


    /**
     * Create a new component state populated with the student data
     * @param action the action that is triggering creating of this component state
     * e.g. 'submit', 'save', 'change'
     * @return a promise that will return a component state
     */
    value: function createComponentState(action) {

      var deferred = this.$q.defer();

      // create a new component state
      var componentState = this.NodeService.createNewComponentState();

      var studentData = {};

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // set the flag for whether the student submitted this work
      componentState.isSubmit = this.isSubmit;

      // set the student data into the component state
      componentState.studentData = studentData;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'createAutoScoreAnnotation',


    /**
     * Create an auto score annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto score annotation
     */
    value: function createAutoScoreAnnotation(data) {

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();

      // create the auto score annotation
      var annotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

      return annotation;
    }

    /**
     * Create an auto comment annotation
     * @param runId the run id
     * @param periodId the period id
     * @param nodeId the node id
     * @param componentId the component id
     * @param toWorkgroupId the student workgroup id
     * @param data the annotation data
     * @returns the auto comment annotation
     */

  }, {
    key: 'createAutoCommentAnnotation',
    value: function createAutoCommentAnnotation(data) {

      var runId = this.ConfigService.getRunId();
      var periodId = this.ConfigService.getPeriodId();
      var nodeId = this.nodeId;
      var componentId = this.componentId;
      var toWorkgroupId = this.ConfigService.getWorkgroupId();

      // create the auto comment annotation
      var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

      return annotation;
    }

    /**
     * Returns all the revisions made by this user for the specified component
     */

  }, {
    key: 'getRevisions',
    value: function getRevisions() {
      // get the component states for this component
      return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    }
  }, {
    key: 'playButtonClicked',


    /**
     * The play button was clicked
     */
    value: function playButtonClicked() {

      // set the animation state
      this.animationState = 'playing';

      // start the animation
      this.startAnimation();
    }

    /**
     * The pause button was clicked
     */

  }, {
    key: 'pauseButtonClicked',
    value: function pauseButtonClicked() {

      // set the animation state
      this.animationState = 'paused';

      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {
              var id = object.id;

              // get the svg object
              var svgObject = this.idToSVGObject[id];

              if (svgObject != null) {

                // pause the object from animating
                svgObject.pause();
              }
            }
          }
        }
      }
    }

    /**
     * The resume button was clicked
     */

  }, {
    key: 'resumeButtonClicked',
    value: function resumeButtonClicked() {

      // set the animation state
      this.animationState = 'playing';

      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {
              var id = object.id;

              // get the svg object
              var svgObject = this.idToSVGObject[id];

              if (svgObject != null) {
                /*
                 * Check if the object still needs to be animated or
                 * if it has already finished performing all of its
                 * animation. We only need to play it if it still
                 * has more animating.
                 */
                if (this.idToAnimationState[id]) {
                  // resume playing the object animation
                  svgObject.play();
                }
              }
            }
          }
        }
      }
    }

    /**
     * The reset button was clicked
     */

  }, {
    key: 'resetButtonClicked',
    value: function resetButtonClicked() {
      var _this5 = this;

      // set the animation state
      this.animationState = 'stopped';

      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {
              var id = object.id;

              // get the svg object
              var svgObject = this.idToSVGObject[id];

              if (svgObject != null) {

                var jumpToEnd = true;
                var clearQueue = true;

                /*
                 * Check if the object still needs to be animated or
                 * if it has already finished performing all of its
                 * animation. We only need to play it if it still
                 * has more animating.
                 */
                if (this.idToAnimationState[id]) {
                  /*
                   * We need to play it in case it is currently paused.
                   * There is a minor bug in the animation library
                   * which is caused if you pause an animation and
                   * then stop the animation. Then if you try to play the
                   * animation, the animation will not play. We avoid
                   * this problem by making sure the object animation
                   * is playing when we stop it.
                   */
                  svgObject.play();
                }

                // stop the object from animating
                svgObject.stop(jumpToEnd, clearQueue);
              }
            }
          }
        }
      }

      this.$timeout(function () {
        // set the display time to 0
        _this5.displayAndBroadcastTime(0);

        // set the images back to their starting images in case they have changed
        _this5.initializeObjectImages();

        // put the objects in their starting positions
        _this5.initializeObjectPositions();
      }, 100);
    }

    /**
     * Check if any of the objects are animating
     * @return whether any of the objects are animating
     */

  }, {
    key: 'areAnyObjectsAnimating',
    value: function areAnyObjectsAnimating() {

      if (this.componentContent != null) {

        // get the objects
        var objects = this.componentContent.objects;

        if (objects != null) {

          // loop through all the objects
          for (var o = 0; o < objects.length; o++) {
            var object = objects[o];

            if (object != null) {
              var id = object.id;

              /*
               * check if the object still needs to be animated or if
               * it has already finished performing all of its
               * animating
               */
              if (this.idToAnimationState[id]) {
                // an object is animating
                return true;
              }
            }
          }
        }
      }

      return false;
    }

    /**
     * Whether we are using the cartesian coordinate system
     * @return whether we are using the cartesian coordinate system
     */

  }, {
    key: 'isUsingCartesianCoordinateSystem',
    value: function isUsingCartesianCoordinateSystem() {

      if (this.coordinateSystem == 'cartesian') {
        // we are using the cartesian coordinate system
        return true;
      }

      return false;
    }

    /**
     * Convert the y value to the cartesian coordinate system
     * @param y the pixel y value in the screen coordinate system
     * @return the pixel y value in the cartesian coordinate system
     */

  }, {
    key: 'convertToCartesianCoordinateSystem',
    value: function convertToCartesianCoordinateSystem(y) {
      return this.height - y;
    }

    /**
     * The student changed the speed slider value
     */

  }, {
    key: 'speedSliderChanged',
    value: function speedSliderChanged() {

      if (this.speedSliderValue == 1) {
        this.realTimePerDataTime = 10000;
      } else if (this.speedSliderValue == 2) {
        this.realTimePerDataTime = 1000;
      } else if (this.speedSliderValue == 3) {
        this.realTimePerDataTime = 100;
      } else if (this.speedSliderValue == 4) {
        this.realTimePerDataTime = 10;
      } else if (this.speedSliderValue == 5) {
        this.realTimePerDataTime = 1;
      }

      // reset the animation
      this.resetButtonClicked();
    }

    /**
     * Remove all the objects from the svg div
     */

  }, {
    key: 'removeAllObjects',
    value: function removeAllObjects() {

      if (this.idToSVGObject != null) {

        // get all the object ids
        var keys = Object.keys(this.idToSVGObject);

        if (keys != null) {

          // loop through all the keys
          for (var k = 0; k < keys.length; k++) {
            var key = keys[k];

            // get the svg object
            var svgObject = this.idToSVGObject[key];

            if (svgObject != null) {
              // remove the svg object from the svg div
              svgObject.remove();
            }
          }
        }
      }
    }

    /**
     * Get a component
     * @param nodeId the node id
     * @param componentId the component id
     */

  }, {
    key: 'getComponentByNodeIdAndComponentId',
    value: function getComponentByNodeIdAndComponentId(nodeId, componentId) {
      return this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
    }

    /**
     * Create a component state with the merged student data
     * @param componentStates an array of component states
     * @return a component state with the merged student data
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {
      var mergedComponentState = this.NodeService.createNewComponentState();
      if (componentStates != null) {
        var mergedResponse = '';
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];
          if (componentState != null) {
            var studentData = componentState.studentData;
            if (studentData != null) {}
          }
        }
        if (mergedResponse != null && mergedResponse != '') {
          mergedComponentState.studentData = {};
        }
      }
      return mergedComponentState;
    }
  }]);

  return AnimationController;
}(_componentController2.default);

;

AnimationController.$inject = ['$filter', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnimationService', 'AnnotationService', 'ConfigService', 'CRaterService', 'NodeService', 'NotebookService', 'NotificationService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = AnimationController;
//# sourceMappingURL=animationController.js.map

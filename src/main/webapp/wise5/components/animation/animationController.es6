'use strict';

import ComponentController from '../componentController';
import 'svg.js';

class AnimationController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnimationService,
      AnnotationService,
      ConfigService,
      CRaterService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$q = $q;
    this.$timeout = $timeout;
    this.AnimationService = AnimationService;
    this.CRaterService = CRaterService;
    this.NotificationService = NotificationService;

    // holds the text that the student has typed
    this.studentResponse = '';

    // holds student attachments like assets
    this.attachments = [];

    // whether we're only showing the student work
    // TODO: refactor. do we need this?
    this.onlyShowWork = false;

    // the latest annotations
    this.latestAnnotations = null;

    // used to hold a message dialog if we need to use one
    this.messageDialog = null;

    // mapping from object id to svg object
    this.idToSVGObject = {};

    // the default width and height
    this.width = 800;
    this.height = 600;

    // the default pixels per unit
    this.pixelsPerXUnit = 1;
    this.pixelsPerYUnit = 1;

    // the default data origin in pixels
    this.dataXOriginInPixels = 0;
    this.dataYOriginInPixels = 0;

    // the current state of the animation ('playing', 'paused', or 'stopped')
    this.animationState = 'stopped';

    // the coordinate system to use ('screen' or 'cartesian')
    this.coordinateSystem = 'screen';

    // mapping from id to whether the object is animating
    this.idToAnimationState = {};

    /*
     * milliseconds per data time
     * example
     * The data time can be labelled with any unit of time such as seconds,
     * minutes, hours, days, years, etc.
     * If realTimePerDataTime is 100, that means for 1 data time, 100
     * milliseconds will pass in real time.
     */
    this.realTimePerDataTime = 100;

    // the speed slider value
    this.speedSliderValue = 3;

    // get the component state from the scope
    var componentState = this.$scope.componentState;

    // get the svg id
    this.svgId = 'svg_' + this.nodeId + '_' + this.componentId;

    // initialize all the coordinates
    this.initializeCoordinates();

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      // get the latest annotations
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'grading') {

      // get the svg id
      if (componentState != null) {
        this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + componentState.id;
      } else {

        this.svgId = 'svg_' + this.nodeId + '_' + this.componentId + '_' + this.workgroupId;
      }

      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'onlyShowWork') {
      this.onlyShowWork = true;
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    } else if (this.mode === 'authoring') {

    }

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      }  else if (this.AnimationService.componentStateHasStudentWork(componentState, this.componentContent)) {
        /*
         * the student has work so we will populate the work into this
         * component
         */
        this.setStudentWork(componentState);
      } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
        // we will import work from another component
        this.handleConnectedComponents();
      }
    } else {
      // populate the student work into this component
      this.setStudentWork(componentState);
    }

    // check if the student has used up all of their submits
    if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
      /*
       * the student has used up all of their chances to submit so we
       * will disable the submit button
       */
      this.isSubmitButtonDisabled = true;
    }

    this.disableComponentIfNecessary();

    if (this.$scope.$parent.nodeController != null) {
      // register this component with the parent node
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

    /*
     * Call the setup() function after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    this.$timeout(angular.bind(this, this.setup));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function() {
      return this.$scope.animationController.isDirty;
    }.bind(this);

    /**
     * Get the component state from this component. The parent node will
     * call this function to obtain the component state when it needs to
     * save student data.
     * @param isSubmit boolean whether the request is coming from a submit
     * action (optional; default is false)
     * @return a promise of a component state containing the student data
     */
    this.$scope.getComponentState = function(isSubmit) {
      var deferred = this.$q.defer();
      let getState = false;
      let action = 'change';

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
        this.$scope.animationController.createComponentState(action).then((componentState) => {
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
    }.bind(this);

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    this.$scope.$on('exitNode', function(event, args) {

    }.bind(this));

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    this.$scope.handleConnectedComponentStudentDataChanged = (connectedComponent, connectedComponentParams, componentState) => {

      if (connectedComponent != null && componentState != null) {

        // get the component type that has changed
        var componentType = connectedComponent.type;

        if (componentType === 'Graph') {

          // update the object datas
          this.updateObjectDatasFromDataSources(componentState);
        }
      }
    };

    // load script for this component, if any
    let script = this.componentContent.script;
    if (script != null) {
      this.ProjectService.retrieveScript(script).then((script) => {
        new Function(script).call(this);
      });
    }
    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  /**
   * Initialize the coordinates of the svg div
   */
  initializeCoordinates() {

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
  setup() {
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
  createObjects() {

    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          if (object != null) {
            let id = object.id;
            let type = object.type;
            let label = object.label;

            let svgObject = null;

            if (type == 'image') {
              // get the image file name
              let image = object.image;

              // get the width and the height
              let width = object.width;
              let height = object.height;

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
              let text = object.text;

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
  initializeObjectImages() {
    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          let id = object.id;
          let type = object.type;

          // get the image file name
          let image = object.image;

          if (type == 'image') {
            // the object is an image

            // get the svg object
            let svgObject = this.idToSVGObject[id];

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
  initializeObjectPositions() {
    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

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
  dataXToPixelX(x) {

    // default the pixel x to start at the data x origin
    let pixelX = this.dataXOriginInPixels;

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
  dataYToPixelY(y) {

    // default the pixel y to start at the data y origin
    let pixelY = this.dataYOriginInPixels;

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
  initializeObjectPosition(object) {
    let id = object.id;
    let label = object.label;
    let data = object.data;
    let dataX = object.dataX;
    let dataY = object.dataY;
    let pixelX = object.pixelX;
    let pixelY = object.pixelY;

    let x = 0;
    let y = 0;

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
    let svgObject = this.idToSVGObject[id];

    if (svgObject != null) {

      // set the x and y pixel position
      svgObject.attr({ x: x, y: y });

      if (data != null && data.length > 0) {
        // there is data for this object

        // get the first data point
        var firstDataPoint = data[0];

        if (firstDataPoint != null) {

          let firstDataPointT = firstDataPoint.t;
          let firstDataPointX = firstDataPoint.x;
          let firstDataPointY = firstDataPoint.y;

          if (firstDataPointT === 0) {
            /*
             * there is a first data point with t == 0 so we will
             * use it as the starting position
             */

            if (firstDataPointX != null && firstDataPointX != '' && typeof firstDataPointX != 'undefined') {
              // convert the data x value to a pixel x value
              let firstDataPointXInPixels = this.dataXToPixelX(firstDataPointX);
              svgObject.attr('x', firstDataPointXInPixels);
            }

            if (firstDataPointY != null && firstDataPointY != '' && typeof firstDataPointY != 'undefined') {
              // convert the data y value to a pixel y value
              let firstDataPointYInPixels = this.dataYToPixelY(firstDataPointY);

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
  startAnimation() {

    // set the images back to their starting images in case they have changed
    this.initializeObjectImages();

    // put the objects in their starting positions
    this.initializeObjectPositions();

    if (this.componentContent != null) {

      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

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
  showTime(t) {

    if (this.timerText == null) {
      // initialize the timer text
      this.timerText = this.draw.text('0').attr({ fill: '#f03' });
    }

    // get the width of the svg div
    let width = this.width;

    // set the x position near the top right of the svg div
    let x = width - 30;
    let y = 0;

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
  updateObjectDatasFromDataSources(componentState) {

    if (this.componentContent != null) {

      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

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
  updateObjectDataFromDataSource(object, componentState) {

    if (object != null) {

      // get the data source details
      let dataSource = object.dataSource;

      if (dataSource != null) {
        let nodeId = dataSource.nodeId;
        let componentId = dataSource.componentId;

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
  setDataFromGraphComponentState(object, componentState) {
    if (object != null) {

      // get the data source specification
      let dataSource = object.dataSource;

      if (dataSource != null) {
        let nodeId = dataSource.nodeId;
        let componentId = dataSource.componentId;
        let trialIndex = dataSource.trialIndex;
        let seriesIndex = dataSource.seriesIndex;
        let tColumnIndex = dataSource.tColumnIndex;
        let xColumnIndex = dataSource.xColumnIndex;
        let yColumnIndex = dataSource.yColumnIndex;

        if (componentState != null && nodeId == componentState.nodeId && componentId == componentState.componentId) {
          // the component state matches the data source

          let studentData = componentState.studentData;

          if (studentData != null) {
            let trials = studentData.trials;

            if (trials != null) {

              // get the trial we ant
              let trial = trials[trialIndex];

              if (trial != null) {
                let series = trial.series;

                if (series != null) {

                  // get the series we want
                  let singleSeries = series[seriesIndex];

                  if (singleSeries != null) {
                    let seriesData = singleSeries.data;

                    if (seriesData != null) {

                      // array to store our animation data
                      let data = [];

                      // loop through all the points in the series
                      for (let d = 0; d < seriesData.length; d++) {
                        let seriesDataPoint = seriesData[d];

                        // create a data point
                        let animationDataPoint = {};

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

  setDataFromTableComponentState() {

  }

  /**
   * Move the object
   * @param object the authored object
   */
  animateObject(object) {

    if (object != null) {
      let id = object.id;
      let data = object.data;

      if (data != null) {

        // get the svg object
        let svgObject = this.idToSVGObject[id];

        if (svgObject != null) {

          /*
           * this will hold SVG.FX object that is returned from
           * calling animate()
           */
          let animateObject = null;

          let thisAnimationController = this;

          // loop through all the data
          for (let d = 0; d < data.length; d++) {

            // get the current point
            let currentDataPoint = data[d];
            let t = currentDataPoint.t;
            let x = currentDataPoint.x;
            let y = currentDataPoint.y;
            let image = currentDataPoint.image;

            // convert the data values to pixels
            let xPixel = this.dataXToPixelX(x);
            let yPixel = this.dataYToPixelY(y);

            // get the next point
            let nextDataPoint = data[d + 1];
            let nextT = null;
            let nextX = null;
            let nextY = null;
            let nextXPixel = null;
            let nextYPixel = null;

            if (nextDataPoint != null) {
              nextT = nextDataPoint.t;
              nextX = nextDataPoint.x;
              nextY = nextDataPoint.y;

              // convert the data values to pixels
              nextXPixel = this.dataXToPixelX(nextX);
              nextYPixel = this.dataYToPixelY(nextY);
            }

            if (this.isUsingCartesianCoordinateSystem()) {
              /*
               * we are using the cartesian coordinate system so we need to modify
               * the y value
               */
              yPixel = this.convertToCartesianCoordinateSystem(yPixel);
              nextYPixel = this.convertToCartesianCoordinateSystem(nextYPixel);
            }

            // set the animation state to true for the object
            this.idToAnimationState[id] = true;

            let tDiff = 0;

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
                animateObject = svgObject.animate(t * this.realTimePerDataTime).during(function(pos, morph, eased, situation) {

                  // calculate the amount of time that has elapsed
                  let elapsedTime = t * pos;

                  // display and broadcast the elapsed time
                  thisAnimationController.displayAndBroadcastTime(elapsedTime);
                }).after(function() {
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
                animateObject = animateObject.after(function() {
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
              let dynamicallyCalculatedImage = this.getImageBasedOnMovement(object, currentDataPoint, nextDataPoint);

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
                  animateObject = animateObject.after(function() {
                    this.load(dynamicallyCalculatedImage);
                  });
                }
              }
            }

            if (d != data.length - 1) {
              // this is a data point that is not the last

              // move the image to the next position
              animateObject = svgObject.animate(tDiff * this.realTimePerDataTime).move(nextXPixel, nextYPixel).during(function(pos, morph, eased, situation) {

                // calculate the elapsed time
                let elapsedTime = t + (tDiff * pos);

                // display and broadcast the elapsed time
                thisAnimationController.displayAndBroadcastTime(elapsedTime);
              });
            }

            if (d == data.length - 1) {
              // this is the last data point

              // after all the animations are done on the object we will perform some processing
              animateObject = animateObject.afterAll(() => {

                /*
                 * we are done animating this object so we will
                 * set the animation state to false for the
                 * object
                 */
                this.idToAnimationState[id] = false;

                // check if all svg objects are done animating
                this.checkIfAllAnimatingIsDone();
              });
            }
          }
        }
      }
    }
  }

  /**
   * Display and broadcast the time
   * @param t the time
   */
  displayAndBroadcastTime(t) {

    let currentTime = new Date().getTime();

    if (this.lastBroadcastTime == null) {
      this.lastBroadcastTime = currentTime;
    }

    if (currentTime - this.lastBroadcastTime > 100) {
      /*
       * Remove the digits after the first decimal place.
       * example
       * 12.817 will be changed to 12.8
       */
      let displayTime = parseInt(t * 10) / 10;

      // show the time on the svg div
      this.showTime(displayTime);

      // create a component state with the time in it
      let componentState = {};
      componentState.t = t;

      /*
       * broadcast the component state with the time in it
       * so other components can know the elapsed time
       */
      this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});

      this.lastBroadcastTime = currentTime;
    }
  }

  /**
   * Get the image based upon the movement of the object
   * @param object the object that is being moved
   * @param currentDataPoint the current data point
   * @param nextDataPoint the next data point
   */
  getImageBasedOnMovement(object, currentDataPoint, nextDataPoint) {

    let image = null;

    if (currentDataPoint != null && nextDataPoint != null) {

      let currentX = currentDataPoint.x;
      let currentY = currentDataPoint.y;

      let nextX = nextDataPoint.x;
      let nextY = nextDataPoint.y;

      if (currentY == nextY) {
        // there is no change in y

        if (currentX == nextX) {
          // there is no change in x

          // the image is staying in place
        } else if (currentX < nextX) {
          // x is moving to the right
          if (object.imageMovingRight != null && object.imageMovingRight != '') {
            image = object.imageMovingRight;
          }
        } else if (currentX > nextX) {
          // x is moving to the left
          if (object.imageMovingLeft != null && object.imageMovingLeft != '') {
            image = object.imageMovingLeft;
          }
        }
      } else if (currentX == nextX) {
        // there is no change in x

        if (currentY == nextY) {
          // there is no change in y

          // the image is staying in place
        } else if (currentY < nextY) {
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
        } else if (currentY > nextY) {
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

        if (currentX < nextX && currentY < nextY) {
          // x is getting larger and y is getting larger

          if (this.isUsingCartesianCoordinateSystem()) {
            // the image is moving up to the right
          } else {
            // the image is moving down to the right
          }
        } else if (currentX < nextX && currentY > nextY) {
          // x is getting larger and y is getting smaller

          if (this.isUsingCartesianCoordinateSystem()) {
            // the image is moving down to the right
          } else {
            // the image is moving up to the right
          }
        } else if (currentX > nextX && currentY > nextY) {
          // x is getting smaller and y is getting smaller

          if (this.isUsingCartesianCoordinateSystem()) {
            // the image is moving down to the left
          } else {
            // the image is moving up to the left
          }
        } else if (currentX > nextX && currentY < nextY) {
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
  checkIfAllAnimatingIsDone() {

    // check if there are any other objects that are still animating
    if (!this.areAnyObjectsAnimating()) {
      // there are no objects animating

      // set the animation state to 'stopped'
      this.animationState = 'stopped';

      // perform a digest after a timeout so that the buttons update
      this.$timeout(() => {
        this.$scope.$digest();
      });
    }
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {

    if (componentState != null) {
      var studentData = componentState.studentData;

      if (studentData != null) {
        var response = studentData.response;

        if (response != null) {
          // populate the text the student previously typed
          this.studentResponse = response;
        }

        var submitCounter = studentData.submitCounter;

        if (submitCounter != null) {
          // populate the submit counter
          this.submitCounter = submitCounter;
        }

        var attachments = studentData.attachments;

        if (attachments != null) {
          this.attachments = attachments;
        }

        this.processLatestSubmit();
      }
    }
  };

  /**
   * Check if latest component state is a submission and set isSubmitDirty accordingly
   */
  processLatestSubmit() {
    let latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

    if (latestState) {
      let serverSaveTime = latestState.serverSaveTime;
      let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestState.isSubmit) {
        // latest state is a submission, so set isSubmitDirty to false and notify node
        this.isSubmitDirty = false;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
      } else {
        // latest state is not a submission, so set isSubmitDirty to true and notify node
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
      }
    }
  };

  /**
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

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
          message = this.$translate('animation.youHaveOneChance', {numberOfSubmitsLeft: numberOfSubmitsLeft});
          //message = 'You have ' + numberOfSubmitsLeft + ' chance to receive feedback on your answer so this this should be your best work.\n\nAre you ready to receive feedback on this answer?';
          performSubmit = confirm(message);
        } else if (numberOfSubmitsLeft > 1) {

          // ask the student if they are sure they want to submit
          message = this.$translate('animation.youHaveMultipleChances', {numberOfSubmitsLeft: numberOfSubmitsLeft});
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
          this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
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
  studentDataChanged() {
    /*
     * set the dirty flags so we will know we need to save or submit the
     * student work later
     */
    this.isDirty = true;
    this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: true});

    this.isSubmitDirty = true;
    this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
    this.setSaveMessage('', null);

    /*
     * the student work in this component has changed so we will tell
     * the parent node that the student data will need to be saved.
     * this will also notify connected parts that this component's student
     * data has changed.
     */
    var action = 'change';

    // create a component state populated with the student data
    this.createComponentState(action).then((componentState) => {
      this.$scope.$emit('componentStudentDataChanged', {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
    });
  };

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {

    var deferred = this.$q.defer();

    // create a new component state
    var componentState = this.NodeService.createNewComponentState();

    // set the response into the component state
    var studentData = {};

    studentData.attachments = angular.copy(this.attachments);  // create a copy without reference to original array

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
  };

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
  createAutoScoreAnnotation(data) {

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
  createAutoCommentAnnotation(data) {

    var runId = this.ConfigService.getRunId();
    var periodId = this.ConfigService.getPeriodId();
    var nodeId = this.nodeId;
    var componentId = this.componentId;
    var toWorkgroupId = this.ConfigService.getWorkgroupId();

    // create the auto comment annotation
    var annotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

    return annotation;
  }

  // TODO: remove attachments. not used in this component
  removeAttachment(attachment) {
    if (this.attachments.indexOf(attachment) != -1) {
      this.attachments.splice(this.attachments.indexOf(attachment), 1);
      this.studentDataChanged();
      // YOU ARE NOW FREEEEEEEEE!
    }
  };

  /**
   * Attach student asset to this Component's attachments
   * @param studentAsset
   */
  attachStudentAsset(studentAsset) {
    if (studentAsset != null) {
      this.StudentAssetService.copyAssetForReference(studentAsset).then( (copiedAsset) => {
        if (copiedAsset != null) {
          var attachment = {
            studentAssetId: copiedAsset.id,
            iconURL: copiedAsset.iconURL
          };

          this.attachments.push(attachment);
          this.studentDataChanged();
        }
      });
    }
  };

  /**
   * Get the number of rows for the textarea
   */
  getNumRows() {
    var numRows = null;

    if (this.componentContent != null) {
      numRows = this.componentContent.numRows;
    }

    return numRows;
  };

  /**
   * Get the number of columns for the textarea
   */
  getNumColumns() {
    var numColumns = null;

    if (this.componentContent != null) {
      numColumns = this.componentContent.numColumns;
    }

    return numColumns;
  };

  /**
   * Get the text the student typed
   */
  getResponse() {
    var response = null;

    if (this.studentResponse != null) {
      response = this.studentResponse;
    }

    return response;
  };

  /**
   * Check if CRater is enabled for this component
   * @returns whether CRater is enabled for this component
   */
  // TODO: remove CRater
  isCRaterEnabled() {
    var result = false;

    if (this.CRaterService.isCRaterEnabled(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score on save
   * @returns whether CRater is set to score on save
   */
  isCRaterScoreOnSave() {
    var result = false;

    if (this.CRaterService.isCRaterScoreOnSave(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score on submit
   * @returns whether CRater is set to score on submit
   */
  isCRaterScoreOnSubmit() {
    var result = false;

    if (this.CRaterService.isCRaterScoreOnSubmit(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score on change
   * @returns whether CRater is set to score on change
   */
  isCRaterScoreOnChange() {
    var result = false;

    if (this.CRaterService.isCRaterScoreOnChange(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Check if CRater is set to score when the student exits the step
   * @returns whether CRater is set to score when the student exits the step
   */
  isCRaterScoreOnExit() {
    var result = false;

    if (this.CRaterService.isCRaterScoreOnExit(this.componentContent)) {
      result = true;
    }

    return result;
  }

  /**
   * Register the the listener that will listen for the exit event
   * so that we can perform saving before exiting.
   */
  registerExitListener() {

    /*
     * Listen for the 'exit' event which is fired when the student exits
     * the VLE. This will perform saving before the VLE exits.
     */
    this.exitListener = this.$scope.$on('exit', (event, args) => {

    });
  };

  /**
   * Returns all the revisions made by this user for the specified component
   */
  getRevisions() {
    // get the component states for this component
    return this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
  };

  /**
   * The play button was clicked
   */
  playButtonClicked() {

    // set the animation state
    this.animationState = 'playing';

    // start the animation
    this.startAnimation();
  }

  /**
   * The pause button was clicked
   */
  pauseButtonClicked() {

    // set the animation state
    this.animationState = 'paused';

    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          if (object != null) {
            let id = object.id;

            // get the svg object
            let svgObject = this.idToSVGObject[id];

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
  resumeButtonClicked() {

    // set the animation state
    this.animationState = 'playing';

    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          if (object != null) {
            let id = object.id;

            // get the svg object
            let svgObject = this.idToSVGObject[id];

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
  resetButtonClicked() {

    // set the animation state
    this.animationState = 'stopped';

    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          if (object != null) {
            let id = object.id;

            // get the svg object
            let svgObject = this.idToSVGObject[id];

            if (svgObject != null) {

              let jumpToEnd = true;
              let clearQueue = true;

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

    this.$timeout(() => {
      // set the display time to 0
      this.displayAndBroadcastTime(0);

      // set the images back to their starting images in case they have changed
      this.initializeObjectImages();

      // put the objects in their starting positions
      this.initializeObjectPositions();
    }, 100);
  }

  /**
   * Check if any of the objects are animating
   * @return whether any of the objects are animating
   */
  areAnyObjectsAnimating() {

    if (this.componentContent != null) {

      // get the objects
      let objects = this.componentContent.objects;

      if (objects != null) {

        // loop through all the objects
        for (let o = 0; o < objects.length; o++) {
          let object = objects[o];

          if (object != null) {
            let id = object.id;

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
  isUsingCartesianCoordinateSystem() {

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
  convertToCartesianCoordinateSystem(y) {
    return this.height - y;
  }

  /**
   * The student changed the speed slider value
   */
  speedSliderChanged() {

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
  removeAllObjects() {

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
  getComponentByNodeIdAndComponentId(nodeId, componentId) {
    return this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
  }

  /**
   * Create a component state with the merged student data
   * @param componentStates an array of component states
   * @return a component state with the merged student data
   */
  createMergedComponentState(componentStates) {
    let mergedComponentState = this.NodeService.createNewComponentState();
    if (componentStates != null) {
      let mergedResponse = '';
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];
        if (componentState != null) {
          let studentData = componentState.studentData;
          if (studentData != null) {

          }
        }
      }
      if (mergedResponse != null && mergedResponse != '') {
        mergedComponentState.studentData = {};
      }
    }
    return mergedComponentState;
  }
};

AnimationController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnimationService',
  'AnnotationService',
  'ConfigService',
  'CRaterService',
  'NodeService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default AnimationController;

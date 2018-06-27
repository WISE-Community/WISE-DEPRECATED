'use strict';

import AnimationController from './animationController';

class AnimationAuthoringController extends AnimationController {
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
    super($filter,
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
      UtilService);

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      {
        type: 'Animation'
      },
      {
        type: 'Graph'
      }
    ];

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      // inject the asset paths into the new component content
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);

      /*
       * reset the values so that the preview is refreshed with
       * the new content
       */
      this.submitCounter = 0;
      this.studentResponse = '';
      this.latestAnnotations = null;
      this.isDirty = false;
      this.isSubmitDirty = false;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

      if (this.componentContent.starterSentence != null) {
        /*
         * the student has not done any work and there is a starter sentence
         * so we will populate the textarea with the starter sentence
         */
        this.studentResponse = this.componentContent.starterSentence;
      }

      // remove all the old objects
      this.removeAllObjects();

      // initialize all the coordinates
      this.initializeCoordinates();

      // re-render the svg div
      this.setup();
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
              } else if (args.target == 'image') {
                // the target is the image
                if (args.targetObject != null) {
                  args.targetObject.image = fileName;
                }
              } else if (args.target == 'imageMovingLeft') {
                // the target is the image moving left
                if (args.targetObject != null) {
                  args.targetObject.imageMovingLeft = fileName;
                }
              } else if (args.target == 'imageMovingRight') {
                // the target is the image moving right
                if (args.targetObject != null) {
                  args.targetObject.imageMovingRight = fileName;
                }
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

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();

      // close the popup
      this.$mdDialog.hide();
    });
  }

  /**
   * Add a new object
   */
  authoringAddObjectClicked() {

    // initialize the objects array if necessary
    if (this.authoringComponentContent.objects == null) {
      this.authoringComponentContent.objects = [];
    }

    // create a new object
    var newObject = {};
    newObject.id = this.UtilService.generateKey(10);
    newObject.type = 'image';

    // add the object to our array of objects
    this.authoringComponentContent.objects.push(newObject);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Add a data point to an object
   * @param object add a data point to this object
   */
  authoringAddDataPointClicked(object) {
    if (object != null) {

      if (object.dataSource != null) {
        // the object already has a data source

        // ask the user if they are sure they want to delete the data source
        var answer = confirm('You can only have Data Points or a Data Source. If you add a Data Point, the Data Source will be deleted. Are you sure you want to add a Data Point?');

        if (answer) {
          // the author answered yes to delete the data source
          delete object.dataSource;

          // initialize the data array if necessary
          if (object.data == null) {
            object.data = [];
          }

          // create a new data point
          var newDataPoint = {};

          // add the new data point
          object.data.push(newDataPoint);
        }
      } else {
        // the object does not have a data source so we can add a data point

        // initialize the data array if necessary
        if (object.data == null) {
          object.data = [];
        }

        // create a new data point
        var newDataPoint = {};

        // add the new data point
        object.data.push(newDataPoint);
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a data point from an object
   * @param object the object to delete a data point from
   * @param index the index of the data point to delete
   */
  authoringDeleteObjectDataPointClicked(object, index) {

    if (object != null && object.data != null) {

      // ask the author if they are sure they want to delete the point
      var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisDataPoint'));

      if (answer) {
        // delete the data point at the given index
        object.data.splice(index, 1);

        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }
  }

  /**
   * Move a data point up
   * @param object the object the data point belongs to
   * @param index the index of the data point in the object
   */
  authoringMoveObjectDataPointUpClicked(object, index) {
    if (object != null && object.data != null) {

      if (index > 0) {
        // the data point is not at the top so we can move it up

        // remember the data point we are moving
        var dataPoint = object.data[index];

        // remove the data point at the given index
        object.data.splice(index, 1);

        // insert the data point back in at one index back
        object.data.splice(index - 1, 0, dataPoint);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move a data point down
   * @param object the object the data point belongs to
   * @param index the index of the data point in the object
   */
  authoringMoveObjectDataPointDownClicked(object, index) {
    if (object != null && object.data != null) {

      if (index < object.data.length - 1) {
        // the data point is not at the bottom so we can move it down

        // remember the data point we are moving
        var dataPoint = object.data[index];

        // remove the data point at the given index
        object.data.splice(index, 1);

        // insert the data point back in at one index forward
        object.data.splice(index + 1, 0, dataPoint);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Move an object up
   * @param index the index of the object
   */
  authoringMoveObjectUpClicked(index) {

    if (this.authoringComponentContent != null) {

      var objects = this.authoringComponentContent.objects;

      if (objects != null) {

        if (index > 0) {
          // the object is not at the top so we can move it up

          // remember the object we are moving
          var object = objects[index];

          // remove the object
          objects.splice(index, 1);

          // insert the object back in at one index back
          objects.splice(index - 1, 0, object);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Move an object down
   * @param index the index of the object
   */
  authoringMoveObjectDownClicked(index) {

    if (this.authoringComponentContent != null) {

      var objects = this.authoringComponentContent.objects;

      if (objects != null) {

        if (index < objects.length - 1) {
          // the object is not at the bottom so we can move it down

          // remember the object we are moving
          var object = objects[index];

          // remove the object
          objects.splice(index, 1);

          // insert the object back in at one index forward
          objects.splice(index + 1, 0, object);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete an object
   * @param index the index of the object
   */
  authoringDeleteObjectClicked(index) {

    if (this.authoringComponentContent != null) {

      var answer = confirm(this.$translate('animation.areYouSureYouWantToDeleteThisObject'));

      if (answer) {
        var objects = this.authoringComponentContent.objects;

        if (objects != null) {
          // remove the object from the array of objects
          objects.splice(index, 1);
        }
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The add data source button was clicked
   * @param object the object we will add the data source to
   */
  authoringAddDataSourceClicked(object) {

    if (object != null && object.data != null && object.data.length > 0) {
      /*
       * the object has data so we will ask the author if they are sure
       * they want to add a data source which will remove the data
       */

      var answer = confirm('You can only have Data Points or a Data Source. If you add a Data Source, the Data Points will be deleted. Are you sure you want to add a Data Source?');

      if (answer) {
        // the author answered yes to delete the data points

        // delete the data points
        delete object.data;

        // add the data source
        object.dataSource = {};
      }
    } else {
      // there are no data points so we can add the data source

      // delete the data points
      delete object.data;

      // add the data source
      object.dataSource = {};
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The delete data source button was clicked
   * @param object the object to delete the data source from
   */
  authoringDeleteDataSourceClicked(object) {

    // ask the author if they are sure they want to delete the data source
    var answer = confirm('Are you sure you want to delete the Data Source?');

    if (answer) {
      // the author answered yes to delete the data source
      delete object.dataSource;
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The data source node has changed
   * @param object the object that has changed
   */
  dataSourceNodeChanged(object) {

    if (object != null) {

      // remember the node id
      var nodeId = object.dataSource.nodeId;

      // clear the dataSource object except for the node id
      object.dataSource = {
        nodeId: nodeId
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The data source component has changed
   * @param object the object that has changed
   */
  dataSourceComponentChanged(object) {

    if (object != null) {

      // remember the node id and component id
      var nodeId = object.dataSource.nodeId;
      var componentId = object.dataSource.componentId;

      // get the component
      var component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);

      // clear the dataSource object except for the node id and component id
      object.dataSource = {
        nodeId: nodeId,
        componentId: componentId
      };

      if (component != null && component.type == 'Graph') {
        // set the default parameters for a graph data source
        object.dataSource.trialIndex = 0;
        object.dataSource.seriesIndex = 0;
        object.dataSource.tColumnIndex = 0;
        object.dataSource.xColumnIndex = 1;
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Show the asset popup to allow the author to choose the image
   */
  chooseImage(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'image';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose the image moving left
   * @param object the object to set the image moving left
   */
  chooseImageMovingLeft(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'imageMovingLeft';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * Show the asset popup to allow the author to choose the image moving right
   * @param object the object to set the image moving right
   */
  chooseImageMovingRight(object) {

    // generate the parameters
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'imageMovingRight';
    params.targetObject = object;

    // display the asset chooser
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

  /**
   * The type for an object changed
   * @param object the object that changed
   */
  authoringObjectTypeChanged(object) {

    if (object != null) {
      if (object.type == 'image') {
        // the type changed to an image so we will delete the text field
        delete object.text;
      } else if (object.type == 'text') {
        // the type changed to text so we will delete the image fields
        delete object.image;
        delete object.width;
        delete object.height;
        delete object.imageMovingLeft;
        delete object.imageMovingRight;
        delete object.imageMovingUp;
        delete object.imageMovingDown;
      }
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }
}

AnimationAuthoringController.$inject = [
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

export default AnimationAuthoringController;

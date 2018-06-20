'use strict';

import LabelController from "./labelController";
import Fabric from 'fabric';
import html2canvas from 'html2canvas';

class LabelAuthoringController extends LabelController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $timeout,
              $window,
              AnnotationService,
              ConfigService,
              LabelService,
              NodeService,
              NotebookService,
              OpenResponseService,
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
      $window,
      AnnotationService,
      ConfigService,
      LabelService,
      NodeService,
      NotebookService,
      OpenResponseService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);
    // the options for when to update this component from a connected component
    this.connectedComponentUpdateOnOptions = [
      {
        value: 'change',
        text: 'Change'
      },
      {
        value: 'submit',
        text: 'Submit'
      }
    ];

    // the component types we are allowed to connect to
    this.allowedConnectedComponentTypes = [
      { type: 'ConceptMap' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    this.authoringComponentContentJSONString = this.$scope.authoringComponentContentJSONString;

    this.isSaveButtonVisible = this.componentContent.showSaveButton;
    this.isSubmitButtonVisible = this.componentContent.showSubmitButton;

    // generate the summernote rubric element id
    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

    // set the component rubric into the summernote rubric
    this.summernoteRubricHTML = this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = this.$translate('INSERT_ASSET');

    /*
     * create the custom button for inserting WISE assets into
     * summernote
     */
    var InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

    /*
     * the options that specifies the tools to display in the
     * summernote prompt
     */
    this.summernoteRubricOptions = {
      toolbar: [
        ['style', ['style']],
        ['font', ['bold', 'underline', 'clear']],
        ['fontname', ['fontname']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['para', ['ul', 'ol', 'paragraph']],
        ['table', ['table']],
        ['insert', ['link', 'video']],
        ['view', ['fullscreen', 'codeview', 'help']],
        ['customButton', ['insertAssetButton']]
      ],
      height: 300,
      disableDragAndDrop: true,
      buttons: {
        insertAssetButton: InsertAssetButton
      }
    };

    if (this.componentContent.enableCircles == null) {
      /*
       * If this component was created before enableCircles was implemented,
       * we will default it to true in the authoring so that the
       * "Enable Dots" checkbox is checked.
       */
      this.authoringComponentContent.enableCircles = true;
    }

    this.updateAdvancedAuthoringView();

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);

      // the canvas width
      this.canvasWidth = 800;

      // the canvas height
      this.canvasHeight = 600;

      this.submitCounter = 0;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.enableCircles = this.componentContent.enableCircles;

      if (this.canvas != null) {

        // clear the parent to remove the canvas
        $('#canvasParent_' + this.canvasId).empty();

        // create a new canvas
        var canvas = $('<canvas/>');
        canvas.attr('id', this.canvasId);
        canvas.css('border', '1px solid black');

        // add the new canvas
        $('#canvasParent_' + this.canvasId).append(canvas);

        /*
         * clear the background so that setupCanvas() can
         * reapply the background
         */
        this.backgroundImage = null;

        // setup the new canvas
        this.setupCanvas();
      }

      if (this.componentContent.canCreateLabels != null) {
        this.canCreateLabels = this.componentContent.canCreateLabels;
      }

      if (this.canCreateLabels) {
        this.isNewLabelButtonVisible = true;
      } else {
        this.isNewLabelButtonVisible = false;
      }
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

    /*
     * The advanced button for a component was clicked. If the button was
     * for this component, we will show the advanced authoring.
     */
    this.$scope.$on('componentAdvancedButtonClicked', (event, args) => {
      if (args != null) {
        let componentId = args.componentId;
        if (this.componentId === componentId) {
          this.showAdvancedAuthoring = !this.showAdvancedAuthoring;
        }
      }
    });
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */
  authoringViewComponentChanged() {

    // update the JSON string in the advanced authoring view textarea
    this.updateAdvancedAuthoringView();

    /*
     * notify the parent node that the content has changed which will save
     * the project to the server
     */
    this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
  };

  /**
   * The component has changed in the advanced authoring view so we will update
   * the component and save the project.
   */
  advancedAuthoringViewComponentChanged() {

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

      // set the component content
      this.componentContent = this.ProjectService.injectAssetPaths(authoringComponentContent);

      /*
       * notify the parent node that the content has changed which will save
       * the project to the server
       */
      this.$scope.$parent.nodeAuthoringController.authoringViewNodeChanged();
    } catch(e) {
      this.$scope.$parent.nodeAuthoringController.showSaveErrorAdvancedAuthoring();
    }
  };

  /**
   * Update the component JSON string that will be displayed in the advanced authoring view textarea
   */
  updateAdvancedAuthoringView() {
    this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
  };

  /**
   * Add a label in the authoring view
   */
  authoringAddLabelClicked() {

    // create the new label
    var newLabel = {};
    newLabel.text = this.$translate('label.enterTextHere');
    newLabel.color = 'blue';
    newLabel.pointX = 100;
    newLabel.pointY = 100;
    newLabel.textX = 200;
    newLabel.textY = 200;
    newLabel.canEdit = false;
    newLabel.canDelete = false;

    // add the label to the array of labels
    this.authoringComponentContent.labels.push(newLabel);

    // save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a label in the authoring view
   * @param index the index of the label in the labels array
   */
  authoringDeleteLabelClicked(index, label) {

    // get the label text
    var selectedLabelText = label.textString;

    // ask the author if they are sure they want to delete this label
    var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteThisLabel', { selectedLabelText: selectedLabelText }));

    if (answer) {
      // the author answered yes to delete the label

      // delete the label from the array
      this.authoringComponentContent.labels.splice(index, 1);

      // save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {

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
   * Add a connected component
   */
  addConnectedComponent() {

    /*
     * create the new connected component object that will contain a
     * node id and component id
     */
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.updateOn = 'change';

    // initialize the array of connected components if it does not exist yet
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }

    // add the connected component
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  deleteConnectedComponent(index) {

    if (this.authoringComponentContent.connectedComponents != null) {
      this.authoringComponentContent.connectedComponents.splice(index, 1);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Set the show submit button value
   * @param show whether to show the submit button
   */
  setShowSubmitButtonValue(show) {

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
    this.$scope.$emit('componentShowSubmitButtonValueChanged', {nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show});
  }

  /**
   * The showSubmitButton value has changed
   */
  showSubmitButtonValueChanged() {

    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * Save the starter labels from the component authoring preview
   */
  saveStarterLabels() {

    // ask the author if they are sure they want to save the starter labels
    var answer = confirm(this.$translate('label.areYouSureYouWantToSaveTheStarterLabels'));

    if (answer) {
      // the author answered yes to save the starter labels

      // get the labels in the component authoring preview
      var labels = this.getLabelData();

      /*
       * make a copy of the labels so we don't run into any referencing issues
       * later
       */
      var starterLabels = this.UtilService.makeCopyOfJSONObject(labels);

      // sort the labels alphabetically by their text
      starterLabels.sort(this.labelTextComparator);

      // set the labels
      this.authoringComponentContent.labels = starterLabels;

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * A comparator used to sort labels alphabetically
   * It should be used like labels.sort(this.labelTextComparator);
   * @param labelA a label object
   * @param labelB a label object
   * @return -1 if labelA comes before labelB
   * 1 if labelB comes after labelB
   * 0 of the labels are equal
   */
  labelTextComparator(labelA, labelB) {

    if (labelA.text < labelB.text) {
      // the labelA text comes before the labelB text alphabetically
      return -1;
    } else if (labelA.text > labelB.text) {
      // the labelA text comes after the labelB text alphabetically
      return 1;
    } else {
      /*
       * the labelA text is the same as the labelB text so we will
       * try to break the tie by looking at the color
       */

      if (labelA.color < labelB.color) {
        // the labelA color text comes before the labelB color text alphabetically
        return -1;
      } else if (labelA.color > labelB.color) {
        // the labelA color text comes after the labelB color text alphabetically
        return 1;
      } else {
        /*
         * the labelA color text is the same as the labelB color text so
         * we will try to break the tie by looking at the pointX
         */

        if (labelA.pointX < labelB.pointX) {
          // the labelA pointX is smaller than the labelB pointX
          return -1;
        } else if (labelA.pointX > labelB.pointX) {
          // the labelA pointX is larger than the labelB pointX
          return 1;
        } else {
          /*
           * the labelA pointX is the same as the labelB pointX so
           * we will try to break the tie by looking at the pointY
           */

          if (labelA.pointY < labelB.pointY) {
            // the labelA pointY is smaller than the labelB pointY
            return -1;
          } else if (labelA.pointY > labelB.pointY) {
            // the labelA pointY is larger than the labelB pointY
            return 1;
          } else {
            /*
             * all the label values are the same between labelA
             * and labelB
             */
            return 0;
          }
        }
      }
    }
  }

  /**
   * Delete all the starter labels
   */
  deleteStarterLabels() {

    /*
     * ask the author if they are sure they want to delete all the starter
     * labels
     */
    var answer = confirm(this.$translate('label.areYouSureYouWantToDeleteAllTheStarterLabels'));

    if (answer) {
      // the author answered yes to delete

      // clear the labels array
      this.authoringComponentContent.labels = [];

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Open a webpage in a new tab that shows a lot of the javascript colors
   */
  openColorViewer() {

    // open the webpage in a new tab
    this.$window.open('http://www.javascripter.net/faq/colornam.htm');
  }

  /**
   * Add a tag
   */
  addTag() {

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
  moveTagUp(index) {

    if (index > 0) {
      // the index is not at the top so we can move it up

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

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
  moveTagDown(index) {

    if (index < this.authoringComponentContent.tags.length - 1) {
      // the index is not at the bottom so we can move it down

      // remember the tag
      let tag = this.authoringComponentContent.tags[index];

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
  deleteTag(index) {

    // ask the author if they are sure they want to delete the tag
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

    if (answer) {
      // the author answered yes to delete the tag

      // remove the tag
      this.authoringComponentContent.tags.splice(index, 1);
    }

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
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
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {

    // ask the author if they are sure they want to delete the connected component
    let answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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
   * Get the connected component type
   * @param connectedComponent get the component type of this connected component
   * @return the connected component type
   */
  authoringGetConnectedComponentType(connectedComponent) {

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
  authoringConnectedComponentNodeIdChanged(connectedComponent) {
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
  authoringConnectedComponentComponentIdChanged(connectedComponent) {

    if (connectedComponent != null) {

      // default the type to import work
      connectedComponent.type = 'importWork';
      this.authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent);

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
      componentType == 'Embedded' ||
      componentType == 'Graph' ||
      componentType == 'Table') {
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
      } else if (connectedComponent.type == 'showWork') {
        /*
         * the type has changed to show work
         */
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }
  }

  /**
   * Check if we are allowed to connect to this component type
   * @param componentType the component type
   * @return whether we can connect to the component type
   */
  isConnectedComponentTypeAllowed(componentType) {

    if (componentType != null) {

      let allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

      // loop through the allowed connected component types
      for (let a = 0; a < allowedConnectedComponentTypes.length; a++) {
        let allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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
  showJSONButtonClicked() {
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
  authoringJSONChanged() {
    this.jsonStringChanged = true;
  }

  /**
   * The "Import Work As Background" checkbox was clicked.
   * @param connectedComponent The connected component associated with the
   * checkbox.
   */
  authoringImportWorkAsBackgroundClicked(connectedComponent) {
    if (connectedComponent.importWorkAsBackground) {
      // the checkbox is checked
      connectedComponent.charactersPerLine = 100;
      connectedComponent.spaceInbetweenLines = 40;
      connectedComponent.fontSize = 16;
    } else {
      // the checkbox is not checked
      delete connectedComponent.charactersPerLine;
      delete connectedComponent.spaceInbetweenLines;
      delete connectedComponent.fontSize;
      delete connectedComponent.importWorkAsBackground;
    }

    this.authoringViewComponentChanged();
  }
}

LabelAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  '$window',
  'AnnotationService',
  'ConfigService',
  'LabelService',
  'NodeService',
  'NotebookService',
  'OpenResponseService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default LabelAuthoringController;

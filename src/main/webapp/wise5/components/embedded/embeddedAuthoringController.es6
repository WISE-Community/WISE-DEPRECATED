'use strict';

import EmbeddedController from "./embeddedController";
import html2canvas from 'html2canvas';
import iframeResizer from 'iframe-resizer';

class EmbeddedAuthoringController extends EmbeddedController {
  constructor($filter,
              $mdDialog,
              $q,
              $rootScope,
              $scope,
              $sce,
              $timeout,
              $window,
              AnnotationService,
              ConfigService,
              EmbeddedService,
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
      $sce,
      $timeout,
      $window,
      AnnotationService,
      ConfigService,
      EmbeddedService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService);

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

    this.allowedConnectedComponentTypes = [
      { type: 'Animation' },
      { type: 'AudioOscillator' },
      { type: 'ConceptMap' },
      { type: 'Discussion' },
      { type: 'Draw' },
      { type: 'Embedded' },
      { type: 'Graph' },
      { type: 'Label' },
      { type: 'Match' },
      { type: 'MultipleChoice' },
      { type: 'OpenResponse' },
      { type: 'Table' }
    ];

    this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
    this.summernoteRubricHTML = this.componentContent.rubric;

    // the tooltip text for the insert WISE asset button
    var insertAssetString = this.$translate('INSERT_ASSET');

    // create the custom button for inserting WISE assets into summernote
    var InsertAssetButton = this.UtilService
      .createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

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

    this.updateAdvancedAuthoringView();

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.width = this.componentContent.width ? this.componentContent.width : '100%';
      this.height = this.componentContent.height ? this.componentContent.height : '100%';
      this.setURL(this.componentContent.url);
    }.bind(this), true);

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null) {
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              // get the assets directory path, e.g. /wise/curriculum/3/
              var assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              var fullAssetPath = assetsDirectoryPath + '/' + fileName;
              var summernoteId = '';

              if (args.target == 'prompt') {
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                summernoteId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;
              }

              if (summernoteId != '') {
                if (this.UtilService.isImage(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');
                  $('#' + summernoteId).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  $('#' + summernoteId).summernote('editor.restoreRange');
                  $('#' + summernoteId).summernote('editor.focus');

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

      this.$mdDialog.hide();
    });

    /* TODO geoffreykwan we're listening to assetSelected twice?
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {
      if (args != null) {
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          var assetItem = args.assetItem;
          if (assetItem != null) {
            var fileName = assetItem.fileName;
            if (fileName != null) {
              if (args.target == 'modelFile') {
                this.authoringComponentContent.url = fileName;
                this.authoringViewComponentChanged();
              }
            }
          }
        }
      }
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
      var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

      this.componentContent = editedComponentContent;

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

  summernoteRubricHTMLChanged() {
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

    this.authoringComponentContent.rubric = html;
    this.authoringViewComponentChanged();
  }

  addConnectedComponent() {
    var newConnectedComponent = {};
    newConnectedComponent.nodeId = this.nodeId;
    newConnectedComponent.componentId = null;
    newConnectedComponent.updateOn = 'change';
    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
    this.authoringViewComponentChanged();
  }

  deleteConnectedComponent(indexOfComponentToDelete) {
    if (this.authoringComponentContent.connectedComponents != null) {
      this.authoringComponentContent.connectedComponents.splice(indexOfComponentToDelete, 1);
    }
    this.authoringViewComponentChanged();
  }

  setShowSubmitButtonValue(show) {
    if (show == null || show == false) {
      this.authoringComponentContent.showSaveButton = false;
      this.authoringComponentContent.showSubmitButton = false;
    } else {
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

  showSubmitButtonValueChanged() {
    /*
     * perform additional processing for when we change the showSubmitButton
     * value
     */
    this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);
    this.authoringViewComponentChanged();
  }

  /**
   * Show the asset popup to allow the author to choose the model file
   */
  chooseModelFile() {
    var params = {};
    params.isPopup = true;
    params.nodeId = this.nodeId;
    params.componentId = this.componentId;
    params.target = 'modelFile';
    this.$rootScope.$broadcast('openAssetChooser', params);
  }

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

    if (this.authoringComponentContent.connectedComponents == null) {
      this.authoringComponentContent.connectedComponents = [];
    }
    this.authoringComponentContent.connectedComponents.push(newConnectedComponent);
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
        }
      }
    }
  }

  /**
   * Delete a connected component
   * @param index the index of the component to delete
   */
  authoringDeleteConnectedComponent(index) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'))) {
      if (this.authoringComponentContent.connectedComponents != null) {
        this.authoringComponentContent.connectedComponents.splice(index, 1);
      }
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
      var nodeId = connectedComponent.nodeId;
      var componentId = connectedComponent.componentId;
      var component = this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

      if (component != null) {
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
      this.authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent);
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
      this.authoringViewComponentChanged();
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
      for (let allowedConnectedComponentType of allowedConnectedComponentTypes) {
        if (allowedConnectedComponentType != null) {
          if (componentType == allowedConnectedComponentType.type) {
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
    this.showJSONAuthoring = !this.showJSONAuthoring;
    if (this.jsonStringChanged && !this.showJSONAuthoring) {
      /*
       * the author has changed the JSON and has just closed the JSON
       * authoring view so we will save the component
       */
      this.advancedAuthoringViewComponentChanged();

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
}

EmbeddedAuthoringController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$sce',
  '$timeout',
  '$window',
  'AnnotationService',
  'ConfigService',
  'EmbeddedService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default EmbeddedAuthoringController;

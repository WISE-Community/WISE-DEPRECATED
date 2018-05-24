import ComponentController from '../componentController';

class HTMLController extends ComponentController {
  constructor($rootScope,
      $scope,
      $state,
      $stateParams,
      $sce,
      $filter,
      $mdDialog,
      AnnotationService,
      ConfigService,
      NodeService,
      NotebookService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      UtilService) {
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$state = $state;
    this.$stateParams = $stateParams;
    this.$sce = $sce;

    // the node id of the current node
    this.nodeId = null;

    // the component id
    this.componentId = null;

    // field that will hold the component content
    this.componentContent = null;

    // field that will hold the authoring component content
    this.authoringComponentContent = null;

    // whether this part is showing previous work
    this.isShowPreviousWork = false;

    // flag for whether to show the advanced authoring
    this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    this.showJSONAuthoring = false;

    // the summernote prompt element id
    this.summernotePromptId = '';

    // the summernote prompt html
    this.summernotePromptHTML = '';

    this.mode = this.$scope.mode;

    // perform setup of this component

    this.nodeId = this.$scope.nodeId;

    // get the component content from the scope
    this.componentContent = this.$scope.componentContent;

    // get the authoring component content
    this.authoringComponentContent = this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;

    if (this.componentContent != null) {

      // get the component id
      this.componentId = this.componentContent.id;

      if (this.mode === 'authoring') {
        let thisController = this;

        // the tooltip text for the the WISE Link authoring button
        let insertWISELinkString = this.$translate('INSERT_WISE_LINK');

        /*
         * create the custom button for inserting a WISE Link into
         * summernote
         */
        let InsertWISELinkButton = this.UtilService.createInsertWISELinkButton(this, null, this.nodeId, this.componentId, 'prompt', insertWISELinkString);

        // the tooltip text for the insert WISE asset button
        let insertAssetString = this.$translate('INSERT_ASSET');

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        let InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'prompt', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        this.summernotePromptOptions = {
          toolbar: [
            ['style', ['style']],
            ['font', ['bold', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['fontsize', ['fontsize']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['table', ['table']],
            ['insert', ['link', 'video']],
            ['customButton', ['insertWISELinkButton', 'insertAssetButton']],
            ['view', ['fullscreen', 'help']],
            ['view', ['codeview']]
          ],
          minHeight: 300,
          disableDragAndDrop: true,
          buttons: {
            insertWISELinkButton: InsertWISELinkButton,
            insertAssetButton: InsertAssetButton
          }
        };

        // get the id of the summernote prompt element
        this.summernotePromptId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;

        // replace all <wiselink> elements with <a> or <button> elements
        this.summernotePromptHTML = this.UtilService.replaceWISELinks(this.componentContent.html);

        // generate the summernote rubric element id
        this.summernoteRubricId = 'summernoteRubric_' + this.nodeId + '_' + this.componentId;

        // set the component rubric into the summernote rubric
        this.summernoteRubricHTML = this.componentContent.rubric;

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        let InsertAssetButtonRubric = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'rubric', insertAssetString);

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
            insertAssetButton: InsertAssetButtonRubric
          }
        };

        this.updateAdvancedAuthoringView();

        $scope.$watch(function() {
          return this.authoringComponentContent;
        }.bind(this), function(newValue, oldValue) {
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        }.bind(this), true);
      } else if (this.mode === 'grading') {

      } else if (this.mode === 'student') {
        if (this.componentContent != null) {
          this.html = this.componentContent.html;
        }

        if ($scope.$parent.registerComponentController != null) {
          // register this component with the parent node
          $scope.$parent.registerComponentController($scope, this.componentContent);
        }
      }
    }

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    this.$scope.$on('requestImage', (event, args) => {
      // get the node id and component id from the args
      let nodeId = args.nodeId;
      let componentId = args.componentId;

      // check if the image is being requested from this component
      if (this.nodeId === nodeId && this.componentId === componentId) {

        // obtain the image objects
        let imageObjects = this.getImageObjects();

        if (imageObjects != null) {
          let args = {};
          args.nodeId = nodeId;
          args.componentId = componentId;
          args.imageObjects = imageObjects;

          // fire an event that contains the image objects
          this.$scope.$emit('requestImageCallback', args);
        }
      }
    });

    /*
     * Listen for the assetSelected event which occurs when the user
     * selects an asset from the choose asset popup
     */
    this.$scope.$on('assetSelected', (event, args) => {

      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {
          // the asset was selected for this component
          let assetItem = args.assetItem;

          if (assetItem != null) {
            let fileName = assetItem.fileName;

            if (fileName != null) {
              /*
               * get the assets directory path
               * e.g.
               * /wise/curriculum/3/
               */
              let assetsDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
              let fullAssetPath = assetsDirectoryPath + '/' + fileName;

              let summernoteId = '';

              if (args.target == 'prompt') {
                // the target is the summernote prompt element
                summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
              } else if (args.target == 'rubric') {
                // the target is the summernote rubric element
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
                  let videoElement = document.createElement('video');
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
     * Listen for the createWISELink event so that we can insert a WISE Link
     * in the summernote rich text editor
     */
    this.$scope.$on('createWISELink', (event, args) => {
      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == this.nodeId && args.componentId == this.componentId) {

          // get the WISE Link parameters
          let wiseLinkNodeId = args.wiseLinkNodeId;
          let wiseLinkComponentId = args.wiseLinkComponentId;
          let wiseLinkType = args.wiseLinkType;
          let wiseLinkText = args.wiseLinkText;
          let wiseLinkClass = args.wiseLinkClass;
          let target = args.target;

          let wiseLinkElement = null;

          if (wiseLinkType == 'link') {
            // we are creating a link
            wiseLinkElement = document.createElement('a');
            wiseLinkElement.innerHTML = wiseLinkText;
            wiseLinkElement.setAttribute('wiselink', true);
            wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
            if (wiseLinkComponentId != null && wiseLinkComponentId != '') {
              wiseLinkElement.setAttribute('component-id', wiseLinkComponentId);
            }
            wiseLinkElement.setAttribute('type', wiseLinkType);
            wiseLinkElement.setAttribute('link-text', wiseLinkText);
          } else if (wiseLinkType == 'button') {
            // we are creating a button
            wiseLinkElement = document.createElement('button');
            wiseLinkElement.innerHTML = wiseLinkText;
            wiseLinkElement.setAttribute('wiselink', true);
            wiseLinkElement.setAttribute('node-id', wiseLinkNodeId);
            if (wiseLinkComponentId != null && wiseLinkComponentId != '') {
              wiseLinkElement.setAttribute('component-id', wiseLinkComponentId);
            }
            wiseLinkElement.setAttribute('type', wiseLinkType);
            wiseLinkElement.setAttribute('link-text', wiseLinkText);
          }

          let summernoteId = '';

          if (target == 'prompt') {
            // get the id for the summernote prompt
            summernoteId = 'summernotePrompt_' + this.nodeId + '_' + this.componentId;
          }

          if (summernoteId != '') {
            /*
             * move the cursor back to its position when the asset chooser
             * popup was clicked so that the element gets inserted in the
             * correct location
             */
            $('#' + summernoteId).summernote('editor.restoreRange');
            $('#' + summernoteId).summernote('editor.focus');

            if (wiseLinkElement != null) {
              // insert the element
              $('#' + summernoteId).summernote('insertNode', wiseLinkElement);

              // add a new line after the element we have just inserted
              let br = document.createElement('br');
              $('#' + summernoteId).summernote('insertNode', br);
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

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
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
      let editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

      // replace the component in the project
      this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

      // set the new component into the controller
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

  /**
   * Get the image object representation of the student data
   * @returns an image object
   */
  getImageObjects() {
    let imageObjects = [];

    // get the image elements in the scope
    let componentId = this.componentId;
    let imageElements = angular.element('#' + componentId + ' img');

    if (imageElements != null) {

      // loop through all the image elements
      for (let i = 0; i < imageElements.length; i++) {
        let imageElement = imageElements[i];

        if (imageElement != null) {

          // create an image object
          let imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
          imageObjects.push(imageObject);
        }
      }
    }

    return imageObjects;
  }

  /**
   * The summernote prompt html has changed so we will update the authoring
   * component content
   */
  summernotePromptHTMLChanged() {

    // get the summernote prompt html
    let html = this.summernotePromptHTML;

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

    // update the authoring component content
    this.authoringComponentContent.html = html;

    // the authoring component content has changed so we will save the project
    this.authoringViewComponentChanged();
  }

  /**
   * The author has changed the rubric
   */
  summernoteRubricHTMLChanged() {

    // get the summernote rubric html
    let html = this.summernoteRubricHTML;

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
}

HTMLController.$inject = [
  '$rootScope',
  '$scope',
  '$state',
  '$stateParams',
  '$sce',
  '$filter',
  '$mdDialog',
  'AnnotationService',
  'ConfigService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default HTMLController;

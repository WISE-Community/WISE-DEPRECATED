'use strict';

import HTMLController from './htmlController';

class HTMLAuthoringController extends HTMLController {
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
    super($rootScope,
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
      UtilService);

    // the summernote prompt html
    this.summernotePromptHTML = '';

    let thisController = this;

    // the tooltip text for the the WISE Link authoring button
    let insertWISELinkString = this.$translate('INSERT_WISE_LINK');

    /*
     * create the custom button for inserting a WISE Link into
     * summernote
     */
    let InsertWISELinkButton = this.UtilService.createInsertWISELinkButton(this, null, this.nodeId, this.componentId, 'prompt', insertWISELinkString);

    const insertAssetString = this.$translate('INSERT_ASSET');
    const InsertAssetButton = this.UtilService.createInsertAssetButton(this, null, this.nodeId, this.componentId, 'prompt', insertAssetString);

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

    $scope.$watch(function() {
      return this.authoringComponentContent;
    }.bind(this), function(newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
    }.bind(this), true);
  }

  $onInit() {

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
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // add the image html
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertImage', fullAssetPath, fileName);
                } else if (this.UtilService.isVideo(fileName)) {
                  /*
                   * move the cursor back to its position when the asset chooser
                   * popup was clicked
                   */
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

                  // insert the video element
                  let videoElement = document.createElement('video');
                  videoElement.controls = 'true';
                  videoElement.innerHTML = '<source ng-src="' + fullAssetPath + '" type="video/mp4">';
                  angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', videoElement);
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
            angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.restoreRange');
            angular.element(document.querySelector(`#${summernoteId}`)).summernote('editor.focus');

            if (wiseLinkElement != null) {
              // insert the element
              angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', wiseLinkElement);

              // add a new line after the element we have just inserted
              let br = document.createElement('br');
              angular.element(document.querySelector(`#${summernoteId}`)).summernote('insertNode', br);
            }
          }
        }
      }

      // close the popup
      this.$mdDialog.hide();
    });
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
}

HTMLAuthoringController.$inject = [
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

export default HTMLAuthoringController;

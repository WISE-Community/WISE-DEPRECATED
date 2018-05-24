'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTMLController = function (_ComponentController) {
  _inherits(HTMLController, _ComponentController);

  function HTMLController($rootScope, $scope, $state, $stateParams, $sce, $filter, $mdDialog, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, HTMLController);

    var _this = _possibleConstructorReturn(this, (HTMLController.__proto__ || Object.getPrototypeOf(HTMLController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$state = $state;
    _this.$stateParams = $stateParams;
    _this.$sce = $sce;

    // the node id of the current node
    _this.nodeId = null;

    // the component id
    _this.componentId = null;

    // field that will hold the component content
    _this.componentContent = null;

    // field that will hold the authoring component content
    _this.authoringComponentContent = null;

    // whether this part is showing previous work
    _this.isShowPreviousWork = false;

    // flag for whether to show the advanced authoring
    _this.showAdvancedAuthoring = false;

    // whether the JSON authoring is displayed
    _this.showJSONAuthoring = false;

    // the summernote prompt element id
    _this.summernotePromptId = '';

    // the summernote prompt html
    _this.summernotePromptHTML = '';

    _this.mode = _this.$scope.mode;

    // perform setup of this component

    _this.nodeId = _this.$scope.nodeId;

    // get the component content from the scope
    _this.componentContent = _this.$scope.componentContent;

    // get the authoring component content
    _this.authoringComponentContent = _this.$scope.authoringComponentContent;

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    if (_this.componentContent != null) {

      // get the component id
      _this.componentId = _this.componentContent.id;

      if (_this.mode === 'authoring') {
        var thisController = _this;

        // the tooltip text for the the WISE Link authoring button
        var insertWISELinkString = _this.$translate('INSERT_WISE_LINK');

        /*
         * create the custom button for inserting a WISE Link into
         * summernote
         */
        var InsertWISELinkButton = _this.UtilService.createInsertWISELinkButton(_this, null, _this.nodeId, _this.componentId, 'prompt', insertWISELinkString);

        // the tooltip text for the insert WISE asset button
        var insertAssetString = _this.$translate('INSERT_ASSET');

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'prompt', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        _this.summernotePromptOptions = {
          toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['customButton', ['insertWISELinkButton', 'insertAssetButton']], ['view', ['fullscreen', 'help']], ['view', ['codeview']]],
          minHeight: 300,
          disableDragAndDrop: true,
          buttons: {
            insertWISELinkButton: InsertWISELinkButton,
            insertAssetButton: InsertAssetButton
          }
        };

        // get the id of the summernote prompt element
        _this.summernotePromptId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;

        // replace all <wiselink> elements with <a> or <button> elements
        _this.summernotePromptHTML = _this.UtilService.replaceWISELinks(_this.componentContent.html);

        // generate the summernote rubric element id
        _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

        // set the component rubric into the summernote rubric
        _this.summernoteRubricHTML = _this.componentContent.rubric;

        /*
         * create the custom button for inserting WISE assets into
         * summernote
         */
        var InsertAssetButtonRubric = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

        /*
         * the options that specifies the tools to display in the
         * summernote prompt
         */
        _this.summernoteRubricOptions = {
          toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
          height: 300,
          disableDragAndDrop: true,
          buttons: {
            insertAssetButton: InsertAssetButtonRubric
          }
        };

        _this.updateAdvancedAuthoringView();

        $scope.$watch(function () {
          return this.authoringComponentContent;
        }.bind(_this), function (newValue, oldValue) {
          this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        }.bind(_this), true);
      } else if (_this.mode === 'grading') {} else if (_this.mode === 'student') {
        if (_this.componentContent != null) {
          _this.html = _this.componentContent.html;
        }

        if ($scope.$parent.registerComponentController != null) {
          // register this component with the parent node
          $scope.$parent.registerComponentController($scope, _this.componentContent);
        }
      }
    }

    /*
     * Listen for the requestImage event which is fired when something needs
     * an image representation of the student data from a specific
     * component.
     */
    _this.$scope.$on('requestImage', function (event, args) {
      // get the node id and component id from the args
      var nodeId = args.nodeId;
      var componentId = args.componentId;

      // check if the image is being requested from this component
      if (_this.nodeId === nodeId && _this.componentId === componentId) {

        // obtain the image objects
        var imageObjects = _this.getImageObjects();

        if (imageObjects != null) {
          var _args = {};
          _args.nodeId = nodeId;
          _args.componentId = componentId;
          _args.imageObjects = imageObjects;

          // fire an event that contains the image objects
          _this.$scope.$emit('requestImageCallback', _args);
        }
      }
    });

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
     * Listen for the createWISELink event so that we can insert a WISE Link
     * in the summernote rich text editor
     */
    _this.$scope.$on('createWISELink', function (event, args) {
      if (args != null) {

        // make sure the event was fired for this component
        if (args.nodeId == _this.nodeId && args.componentId == _this.componentId) {

          // get the WISE Link parameters
          var wiseLinkNodeId = args.wiseLinkNodeId;
          var wiseLinkComponentId = args.wiseLinkComponentId;
          var wiseLinkType = args.wiseLinkType;
          var wiseLinkText = args.wiseLinkText;
          var wiseLinkClass = args.wiseLinkClass;
          var target = args.target;

          var wiseLinkElement = null;

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

          var summernoteId = '';

          if (target == 'prompt') {
            // get the id for the summernote prompt
            summernoteId = 'summernotePrompt_' + _this.nodeId + '_' + _this.componentId;
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
              var br = document.createElement('br');
              $('#' + summernoteId).summernote('insertNode', br);
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

    _this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: _this.nodeId, componentId: _this.componentId });
    return _this;
  }

  /**
   * The component has changed in the regular authoring view so we will save the project
   */


  _createClass(HTMLController, [{
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
        var editedComponentContent = angular.fromJson(this.authoringComponentContentJSONString);

        // replace the component in the project
        this.ProjectService.replaceComponent(this.nodeId, this.componentId, editedComponentContent);

        // set the new component into the controller
        this.componentContent = editedComponentContent;

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
    key: 'getImageObjects',


    /**
     * Get the image object representation of the student data
     * @returns an image object
     */
    value: function getImageObjects() {
      var imageObjects = [];

      // get the image elements in the scope
      var componentId = this.componentId;
      var imageElements = angular.element('#' + componentId + ' img');

      if (imageElements != null) {

        // loop through all the image elements
        for (var i = 0; i < imageElements.length; i++) {
          var imageElement = imageElements[i];

          if (imageElement != null) {

            // create an image object
            var imageObject = this.UtilService.getImageObjectFromImageElement(imageElement);
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

  }, {
    key: 'summernotePromptHTMLChanged',
    value: function summernotePromptHTMLChanged() {

      // get the summernote prompt html
      var html = this.summernotePromptHTML;

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
  }]);

  return HTMLController;
}(_componentController2.default);

HTMLController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = HTMLController;
//# sourceMappingURL=htmlController.js.map

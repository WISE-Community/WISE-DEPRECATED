'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _htmlController = require('./htmlController');

var _htmlController2 = _interopRequireDefault(_htmlController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTMLAuthoringController = function (_HTMLController) {
  _inherits(HTMLAuthoringController, _HTMLController);

  function HTMLAuthoringController($rootScope, $scope, $state, $stateParams, $sce, $filter, $mdDialog, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, HTMLAuthoringController);

    // the summernote prompt element id
    var _this = _possibleConstructorReturn(this, (HTMLAuthoringController.__proto__ || Object.getPrototypeOf(HTMLAuthoringController)).call(this, $rootScope, $scope, $state, $stateParams, $sce, $filter, $mdDialog, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.summernotePromptId = '';

    // the summernote prompt html
    _this.summernotePromptHTML = '';

    var thisController = _this;

    // the tooltip text for the the WISE Link authoring button
    var insertWISELinkString = _this.$translate('INSERT_WISE_LINK');

    /*
     * create the custom button for inserting a WISE Link into
     * summernote
     */
    var InsertWISELinkButton = _this.UtilService.createInsertWISELinkButton(_this, null, _this.nodeId, _this.componentId, 'prompt', insertWISELinkString);

    var insertAssetString = _this.$translate('INSERT_ASSET');
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

    $scope.$watch(function () {
      return this.authoringComponentContent;
    }.bind(_this), function (newValue, oldValue) {
      this.componentContent = this.ProjectService.injectAssetPaths(newValue);
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
    return _this;
  }

  /**
   * The summernote prompt html has changed so we will update the authoring
   * component content
   */


  _createClass(HTMLAuthoringController, [{
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
  }]);

  return HTMLAuthoringController;
}(_htmlController2.default);

HTMLAuthoringController.$inject = ['$rootScope', '$scope', '$state', '$stateParams', '$sce', '$filter', '$mdDialog', 'AnnotationService', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = HTMLAuthoringController;
//# sourceMappingURL=htmlAuthoringController.js.map

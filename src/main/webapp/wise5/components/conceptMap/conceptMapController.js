'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('svg.js');

require('svg.draggable.js');

var _componentController = require('../componentController');

var _componentController2 = _interopRequireDefault(_componentController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ConceptMapController = function (_ComponentController) {
  _inherits(ConceptMapController, _ComponentController);

  function ConceptMapController($anchorScroll, $filter, $location, $mdDialog, $q, $rootScope, $scope, $timeout, AnnotationService, ConceptMapService, ConfigService, CRaterService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService) {
    _classCallCheck(this, ConceptMapController);

    var _this = _possibleConstructorReturn(this, (ConceptMapController.__proto__ || Object.getPrototypeOf(ConceptMapController)).call(this, $filter, $mdDialog, $rootScope, $scope, AnnotationService, ConfigService, NodeService, NotebookService, ProjectService, StudentAssetService, StudentDataService, UtilService));

    _this.$anchorScroll = $anchorScroll;
    _this.$location = $location;
    _this.$q = $q;
    _this.$timeout = $timeout;
    _this.ConceptMapService = ConceptMapService;
    _this.CRaterService = CRaterService;

    // holds the text that the student has typed
    _this.studentResponse = '';

    // holds student attachments like assets
    _this.attachments = [];

    // whether rich text editing is enabled
    _this.isRichTextEnabled = false;

    // the latest annotations
    _this.latestAnnotations = null;

    // used to hold a message dialog if we need to use one
    _this.messageDialog = null;

    // default width and height for the svg
    _this.width = 800;
    _this.height = 600;

    // the available nodes the students can choose
    _this.availableNodes = [];

    // the available links the students can choose
    _this.availableLinks = [];

    // the node instances the students create
    _this.nodes = [];

    // the link instances the students create
    _this.links = [];

    // flag to display the link type chooser
    _this.displayLinkTypeChooser = false;

    // flag to display the modal overlay for the link type chooser
    _this.displayLinkTypeChooserModalOverlay = false;

    // the selected link type
    _this.selectedLinkType = null;

    // flag for whether we have initialized the link type modal overlay
    _this.initializedDisplayLinkTypeChooserModalOverlay = false;

    // default values for the modal width and height
    _this.modalWidth = 800;
    _this.modalHeight = 600;

    /*
     * used to remember the node the student has started dragging to create
     * so that we know what node to create once they let go off the mouse
     * on the svg element
     */
    _this.selectedNode = null;

    /*
     * used to remember the offset of the mouse relative to the upper left
     * of the node image the student started dragging to create a new node
     * instance
     */
    _this.tempOffsetX = 0;
    _this.tempOffsetY = 0;

    var themePath = _this.ProjectService.getThemePath();

    // the options for when to update this component from a connected component
    _this.connectedComponentUpdateOnOptions = [{
      value: 'change',
      text: 'Change'
    }, {
      value: 'submit',
      text: 'Submit'
    }];

    // the component types we are allowed to connect to
    _this.allowedConnectedComponentTypes = [{ type: 'ConceptMap' }, { type: 'Draw' }, { type: 'Embedded' }, { type: 'Graph' }, { type: 'Label' }, { type: 'Table' }];

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    _this.originalComponentContent = _this.$scope.originalComponentContent;

    // the options for authoring the should or should not value in rules
    _this.shouldOptions = [{
      value: false, label: _this.$translate('conceptMap.should')
    }, {
      value: true, label: _this.$translate('conceptMap.shouldNot')
    }];

    // the auto feedback string
    _this.autoFeedbackString = '';

    _this.setBackgroundImage(_this.componentContent.background, _this.componentContent.stretchBackground);

    // set the id of the svg and other display elements
    _this.svgId = 'svg_' + _this.$scope.nodeId + '_' + _this.componentId;
    _this.conceptMapContainerId = 'conceptMapContainer_' + _this.$scope.nodeId + '_' + _this.componentId;
    _this.selectNodeBarId = 'selectNodeBar_' + _this.$scope.nodeId + '_' + _this.componentId;
    _this.feedbackContainerId = 'feedbackContainer_' + _this.$scope.nodeId + '_' + _this.componentId;

    if (_this.componentContent.width != null) {
      _this.width = _this.componentContent.width;
    }

    if (_this.componentContent.height != null) {
      _this.height = _this.componentContent.height;
    }

    if (_this.mode === 'student') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.availableNodes = _this.componentContent.nodes;
      _this.availableLinks = _this.componentContent.links;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
    } else if (_this.mode === 'grading' || _this.mode === 'gradingRevision') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isDisabled = true;

      // get the latest annotations
      _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);

      var _componentState = _this.$scope.componentState;

      if (_componentState) {
        // set ids for the svg and other display elements using the componentStateId (so we have unique ids when showing revisions)
        /*
         * the student has work for this component so we will use
         * the node id, component id, and workgroup id, and
         * componentStateId for the svg id
         */
        var idInfo = _this.nodeId + '_' + _this.componentId + '_' + _this.workgroupId + '_' + _componentState.id;
        if (_this.mode === 'gradingRevision') {
          idInfo = '_gradingRevision_' + idInfo;
          _this.svgId = 'svg_' + idInfo;
          _this.conceptMapContainerId = 'conceptMapContainer_' + idInfo;
          _this.selectNodeBarId = 'selectNodeBar_' + idInfo;
          _this.feedbackContainerId = 'feedbackContainer_' + idInfo;
        } else {
          _this.svgId = 'svg_' + idInfo;
          _this.conceptMapContainerId = 'conceptMapContainer_' + idInfo;
          _this.selectNodeBarId = 'selectNodeBar_' + idInfo;
          _this.feedbackContainerId = 'feedbackContainer_' + idInfo;
        }
      } else {
        /*
         * the student does not have any work for this component so
         * we will use the node id, component id, and workgroup id
         * for the svg id
         */
        var _idInfo = _this.nodeId + '_' + _this.componentId + '_' + _this.workgroupId;
        _this.svgId = 'svg_' + _idInfo;
        _this.conceptMapContainerId = 'conceptMapContainer_' + _idInfo;
        _this.selectNodeBarId = 'selectNodeBar_' + _idInfo;
        _this.feedbackContainerId = 'feedbackContainer_' + _idInfo;
      }
    } else if (_this.mode === 'onlyShowWork') {
      _this.isPromptVisible = false;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isSnipButtonVisible = false;
      _this.isDisabled = true;

      var componentState = _this.$scope.componentState;

      if (componentState == null) {
        /*
         * the student does not have any work for this component so
         * we will use the node id, component id, and workgroup id
         * for the svg id
         */
        _this.svgId = 'svgOnlyShowWork_' + _this.nodeId + '_' + _this.componentId + '_' + _this.workgroupId;
      } else {
        /*
         * the student has work for this component so we will use
         * the node id, component id, and component state id
         * for the svg id
         */
        _this.svgId = 'svgOnlyShowWork_' + _this.nodeId + '_' + _this.componentId + '_' + componentState.id;
      }
    } else if (_this.mode === 'showPreviousWork') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = false;
      _this.isSubmitButtonVisible = false;
      _this.isSnipButtonVisible = false;
      _this.isDisabled = true;
    } else if (_this.mode === 'authoring') {
      _this.isPromptVisible = true;
      _this.isSaveButtonVisible = _this.componentContent.showSaveButton;
      _this.isSubmitButtonVisible = _this.componentContent.showSubmitButton;
      _this.availableNodes = _this.componentContent.nodes;
      _this.availableLinks = _this.componentContent.links;

      // generate the summernote rubric element id
      _this.summernoteRubricId = 'summernoteRubric_' + _this.nodeId + '_' + _this.componentId;

      // set the component rubric into the summernote rubric
      _this.summernoteRubricHTML = _this.componentContent.rubric;

      // the tooltip text for the insert WISE asset button
      var insertAssetString = _this.$translate('INSERT_ASSET');

      /*
       * create the custom button for inserting WISE assets into
       * summernote
       */
      var InsertAssetButton = _this.UtilService.createInsertAssetButton(_this, null, _this.nodeId, _this.componentId, 'rubric', insertAssetString);

      /*
       * the options that specifies the tools to display in the
       * summernote prompt
       */
      _this.summernoteRubricOptions = {
        toolbar: [['style', ['style']], ['font', ['bold', 'underline', 'clear']], ['fontname', ['fontname']], ['fontsize', ['fontsize']], ['color', ['color']], ['para', ['ul', 'ol', 'paragraph']], ['table', ['table']], ['insert', ['link', 'video']], ['view', ['fullscreen', 'codeview', 'help']], ['customButton', ['insertAssetButton']]],
        height: 300,
        disableDragAndDrop: true,
        buttons: {
          insertAssetButton: InsertAssetButton
        }
      };

      _this.updateAdvancedAuthoringView();

      $scope.$watch(function () {
        return this.authoringComponentContent;
      }.bind(_this), function (newValue, oldValue) {
        this.componentContent = this.ProjectService.injectAssetPaths(newValue);
        this.isSaveButtonVisible = this.componentContent.showSaveButton;
        this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
        this.availableNodes = this.componentContent.nodes;
        this.availableLinks = this.componentContent.links;
        this.width = this.componentContent.width;
        this.height = this.componentContent.height;
        this.setBackgroundImage(this.componentContent.background, this.componentContent.stretchBackground);

        /*
         * make sure the SVG element can be accessed. we need to
         * perform this check because this watch is getting fired
         * before angular sets the svgId on the svg element. if
         * setupSVG() is called before the svgId is set on the svg
         * element, we will get an error.
         */
        if (document.getElementById(this.svgId) != null) {
          this.setupSVG();
        }
      }.bind(_this), true);
    }

    /*
     * Call the initializeSVG() after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    _this.$timeout(angular.bind(_this, _this.initializeSVG));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    _this.$scope.isDirty = function () {
      return this.$scope.conceptMapController.isDirty;
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
        if (this.$scope.conceptMapController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.conceptMapController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        // create a component state populated with the student data
        this.$scope.conceptMapController.createComponentState(action).then(function (componentState) {
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
     * The parent node submit button was clicked
     */
    _this.$scope.$on('nodeSubmitClicked', function (event, args) {

      // get the node id of the node
      var nodeId = args.nodeId;

      // make sure the node id matches our parent node
      if (this.nodeId === nodeId) {

        // trigger the submit
        var submitTriggeredBy = 'nodeSubmitButton';
        this.submit(submitTriggeredBy);
      }
    }.bind(_this));

    /**
     * Listen for the 'studentWorkSavedToServer' event which is fired when
     * we receive the response from saving a component state to the server
     */
    _this.$scope.$on('studentWorkSavedToServer', angular.bind(_this, function (event, args) {

      var componentState = args.studentWork;

      // check that the component state is for this component
      if (componentState && this.nodeId === componentState.nodeId && this.componentId === componentState.componentId) {

        // set isDirty to false because the component state was just saved and notify node
        this.isDirty = false;
        this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: false });

        var isAutoSave = componentState.isAutoSave;
        var isSubmit = componentState.isSubmit;
        var clientSaveTime = componentState.clientSaveTime;

        // set save message
        if (isSubmit) {
          this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);

          this.lockIfNecessary();

          // set isSubmitDirty to false because the component state was just submitted and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
        } else if (isAutoSave) {
          this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
        } else {
          this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
        }
      }
    }));

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    _this.$scope.$on('annotationSavedToServer', function (event, args) {

      if (args != null) {

        // get the annotation that was saved to the server
        var annotation = args.annotation;

        if (annotation != null) {

          // get the node id and component id of the annotation
          var annotationNodeId = annotation.nodeId;
          var annotationComponentId = annotation.componentId;

          // make sure the annotation was for this component
          if (_this.nodeId === annotationNodeId && _this.componentId === annotationComponentId) {

            // get latest score and comment annotations for this component
            _this.latestAnnotations = _this.AnnotationService.getLatestComponentAnnotations(_this.nodeId, _this.componentId, _this.workgroupId);
          }
        }
      }
    });

    /**
     * Listen for the 'exitNode' event which is fired when the student
     * exits the parent node. This will perform any necessary cleanup
     * when the student exits the parent node.
     */
    _this.$scope.$on('exitNode', function (event, args) {}.bind(_this));

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
              } else if (args.target == 'background') {
                // the target is the background image

                // set the background file name
                _this.authoringComponentContent.background = fileName;

                // the authoring component content has changed so we will save the project
                _this.authoringViewComponentChanged();
              } else if (args.target != null && args.target.indexOf('node') == 0) {
                // the target is a node image

                // get the concept map node
                var node = _this.authoringViewGetNodeById(args.target);

                if (node != null) {
                  // set the file name of the node
                  node.fileName = fileName;
                }

                // the authoring component content has changed so we will save the project
                _this.authoringViewComponentChanged();
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
    return _this;
  }

  /**
   * Initialize the SVG
   */


  _createClass(ConceptMapController, [{
    key: 'initializeSVG',
    value: function initializeSVG() {

      // setup the svg
      this.setupSVG();

      var componentState = null;

      // set whether rich text is enabled
      this.isRichTextEnabled = this.componentContent.isRichTextEnabled;

      // set whether studentAttachment is enabled
      this.isStudentAttachmentEnabled = this.componentContent.isStudentAttachmentEnabled;

      // get the component state from the scope
      componentState = this.$scope.componentState;

      if (this.mode == 'student') {
        if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
          // we will show work from another component
          this.handleConnectedComponents();
        } else if (this.ConceptMapService.componentStateHasStudentWork(componentState, this.componentContent)) {
          /*
           * the student has work so we will populate the work into this
           * component
           */

          /*
           * inject the asset path so that the file name is changed to
           * a relative path
           * e.g.
           * "Sun.png"
           * will be changed to
           * "/wise/curriculum/108/assets/Sun.png"
           */
          componentState = this.ProjectService.injectAssetPaths(componentState);

          this.setStudentWork(componentState);
        } else if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // we will import work from another component
          this.handleConnectedComponents();
        } else if (componentState == null) {
          /*
           * only import work if the student does not already have
           * work for this component
           */

          // check if we need to import work
          var importPreviousWorkNodeId = this.componentContent.importPreviousWorkNodeId;
          var importPreviousWorkComponentId = this.componentContent.importPreviousWorkComponentId;

          if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {
            /*
             * check if the node id is in the field that we used to store
             * the import previous work node id in
             */
            importPreviousWorkNodeId = this.componentContent.importWorkNodeId;
          }

          if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {
            /*
             * check if the component id is in the field that we used to store
             * the import previous work component id in
             */
            importPreviousWorkComponentId = this.componentContent.importWorkComponentId;
          }

          if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {
            // import the work from the other component
            this.importWork();
          } else if (this.componentContent.starterConceptMap != null) {
            /*
             * the student has not done any work and there is a starter
             * concept map so we will populate the concept map with
             * the starter
             */

            // get the starter concept map
            var conceptMapData = this.componentContent.starterConceptMap;

            // populate the concept map data into the component
            this.populateConceptMapData(conceptMapData);
          }
        }
      } else {
        /*
         * inject the asset path so that the file name is changed to
         * a relative path
         * e.g.
         * 'Sun.png'
         * will be changed to
         * '/wise/curriculum/108/assets/Sun.png'
         */
        componentState = this.ProjectService.injectAssetPaths(componentState);

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

      // populate the previous feedback
      if (this.latestAnnotations != null) {

        var autoFeedbackString = '';

        // obtain the previous score annotation if any
        if (this.latestAnnotations.score != null) {

          // get the annotation data
          var data = this.latestAnnotations.score.data;

          if (data != null) {

            // get the score and max auto score
            var score = data.value;
            var maxAutoScore = data.maxAutoScore;

            autoFeedbackString += this.$translate('SCORE') + ': ' + score;

            if (maxAutoScore != null && maxAutoScore != '') {
              // show the max score as the denominator
              autoFeedbackString += '/' + maxAutoScore;
            }
          }
        }

        // obtain the previous comment annotation if any
        if (this.latestAnnotations.comment != null) {

          // get the annotation data
          var data = this.latestAnnotations.comment.data;

          if (data != null) {
            if (autoFeedbackString != '') {
              // add a new line if the result string is not empty
              autoFeedbackString += '<br/>';
            }

            // get the comment
            var comment = data.value;
            autoFeedbackString += this.$translate('FEEDBACK') + ': ' + comment;
          }
        }

        /*
         * set the previous auto feedback into the field that is used
         * to display the auto feedback to the student when they click
         * on the show feedback button
         */
        this.autoFeedbackString = autoFeedbackString;
      }

      // make the nodes draggable
      this.enableNodeDragging();

      // check if we need to lock this component
      this.calculateDisabled();

      if (this.$scope.$parent.nodeController != null) {
        // register this component with the parent node
        this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
      }

      this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
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
          var conceptMapData = studentData.conceptMapData;

          var submitCounter = studentData.submitCounter;

          if (submitCounter != null) {
            // populate the submit counter
            this.submitCounter = submitCounter;
          }

          if (conceptMapData != null) {

            // populate the concept map data into the component
            this.populateConceptMapData(conceptMapData);
          }

          var attachments = studentData.attachments;

          if (attachments != null) {
            this.attachments = attachments;
          }

          this.processLatestSubmit();
        }
      }
    }
  }, {
    key: 'populateConceptMapData',


    /**
     * Populate the concept map data into the component
     * @param conceptMapData the concept map data which contains an array
     * of nodes and an array of links
     */
    value: function populateConceptMapData(conceptMapData) {
      var _this2 = this;

      if (conceptMapData != null) {

        // clear the existing nodes in the student view
        this.nodes = [];

        var nodes = conceptMapData.nodes;

        if (nodes != null) {

          // loop through all the nodes
          for (var n = 0; n < nodes.length; n++) {
            var node = nodes[n];

            var instanceId = node.instanceId;
            var originalId = node.originalId;
            var filePath = node.fileName;
            var label = node.label;
            var x = node.x;
            var y = node.y;
            var width = node.width;
            var height = node.height;

            // create a ConceptMapNode
            var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, instanceId, originalId, filePath, label, x, y, width, height);

            // add the node to our array of nodes
            this.addNode(conceptMapNode);

            // set the mouse events on the node
            this.setNodeMouseEvents(conceptMapNode);
          }
        }

        // clear the existing links in the student view
        this.links = [];

        var links = conceptMapData.links;

        if (links != null) {

          // loop through all the links
          for (var l = 0; l < links.length; l++) {
            var link = links[l];

            var instanceId = link.instanceId;
            var originalId = link.originalId;
            var sourceNodeId = link.sourceNodeInstanceId;
            var destinationNodeId = link.destinationNodeInstanceId;
            var label = link.label;
            var color = link.color;
            var curvature = link.curvature;
            var startCurveUp = link.startCurveUp;
            var endCurveUp = link.endCurveUp;
            var sourceNode = null;
            var destinationNode = null;

            if (sourceNodeId != null) {
              sourceNode = this.getNodeById(sourceNodeId);
            }

            if (destinationNodeId != null) {
              destinationNode = this.getNodeById(destinationNodeId);
            }

            // create a ConceptMapLink
            var conceptMapLink = this.ConceptMapService.newConceptMapLink(this.draw, instanceId, originalId, sourceNode, destinationNode, label, color, curvature, startCurveUp, endCurveUp);

            // add the link to our array of links
            this.addLink(conceptMapLink);

            // set the mouse events on the link
            this.setLinkMouseEvents(conceptMapLink);
          }
        }

        if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath != '') {
          this.setBackgroundImage(conceptMapData.backgroundPath, conceptMapData.stretchBackground);
        }

        /*
         * move the link text group to the front so that they are on top
         * of links
         */
        this.moveLinkTextToFront();

        // move the nodes to the front so that they are on top of links
        this.moveNodesToFront();

        /*
         * set a timeout to refresh the link labels so that the rectangles
         * around the labels are properly resized
         */
        this.$timeout(function () {
          _this2.refreshLinkLabels();
        });
      }
    }

    /**
     * Refresh the link labels so that the rectangles around the text
     * labels are resized to fit the text properly. This is required because
     * the rectangles are not properly sized when the ConceptMapLinks are
     * initialized. The rectangles need to be rendered first and then the
     * labels need to be set in order for the rectangles to be resized properly.
     * This is why this function is called in a $timeout.
     */

  }, {
    key: 'refreshLinkLabels',
    value: function refreshLinkLabels() {

      if (this.nodes != null) {

        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
          var node = this.nodes[n];

          if (node != null) {
            // get the label from the node
            var label = node.getLabel();

            /*
             * set the label back into the node so that the rectangle
             * around the text label is resized to the text
             */
            node.setLabel(label);
          }
        }
      }

      if (this.links != null) {

        // loop throgh all the links
        for (var l = 0; l < this.links.length; l++) {
          var link = this.links[l];

          if (link != null) {
            // get the label from the link
            var label = link.getLabel();

            /*
             * set the label back into the link so that the rectangle
             * around the text label is resized to the text
             */
            link.setLabel(label);
          }
        }
      }
    }

    /**
     * Check if latest component state is a submission and set isSubmitDirty accordingly
     */

  }, {
    key: 'processLatestSubmit',
    value: function processLatestSubmit() {
      var latestState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

      if (latestState) {
        if (latestState.isSubmit) {
          // latest state is a submission, so set isSubmitDirty to false and notify node
          this.isSubmitDirty = false;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: false });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SUBMITTED'), latestState.clientSaveTime);
        } else {
          // latest state is not a submission, so set isSubmitDirty to true and notify node
          this.isSubmitDirty = true;
          this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });
          // set save message
          this.setSaveMessage(this.$translate('LAST_SAVED'), latestState.clientSaveTime);
        }
      }
    }
  }, {
    key: 'saveButtonClicked',


    /**
     * Called when the student clicks the save button
     */
    value: function saveButtonClicked() {
      this.isSubmit = false;

      if (this.mode === 'authoring') {
        /*
         * we are in authoring mode so we will set isDirty to false here
         * because the 'componentSaveTriggered' event won't work in
         * authoring mode
         */
        this.isDirty = false;
      }

      // tell the parent node that this component wants to save
      this.$scope.$emit('componentSaveTriggered', { nodeId: this.nodeId, componentId: this.componentId });
    }
  }, {
    key: 'submitButtonClicked',


    /**
     * Called when the student clicks the submit button
     */
    value: function submitButtonClicked() {
      // trigger the submit
      var submitTriggeredBy = 'componentSubmitButton';
      this.submit(submitTriggeredBy);
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

        var performSubmit = true;

        if (this.componentContent.maxSubmitCount != null) {
          // there is a max submit count

          // calculate the number of submits this student has left
          var numberOfSubmitsLeft = this.componentContent.maxSubmitCount - this.submitCounter;

          var message = '';

          if (numberOfSubmitsLeft <= 0) {

            // the student does not have any more chances to submit
            alert(this.$translate('conceptMap.youHaveNoMoreChances'));
            performSubmit = false;
          } else if (numberOfSubmitsLeft == 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('conceptMap.youHaveOneChance', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            performSubmit = confirm(message);
          } else if (numberOfSubmitsLeft > 1) {

            // ask the student if they are sure they want to submit
            message = this.$translate('conceptMap.youHaveMultipleChances', { numberOfSubmitsLeft: numberOfSubmitsLeft });
            performSubmit = confirm(message);
          }
        }

        if (performSubmit) {
          // increment the submit counter
          this.submitCounter++;

          // check if the student has used up all of their submits
          if (this.componentContent.maxSubmitCount != null && this.submitCounter >= this.componentContent.maxSubmitCount) {
            /*
             * the student has used up all of their submits so we will
             * disable the submit button
             */
            //this.isDisabled = true;
            this.isSubmitButtonDisabled = true;
          }

          // get the custom rule evaluator code that was authored
          var customRuleEvaluator = this.componentContent.customRuleEvaluator;

          // get the component content
          var componentContent = this.componentContent;

          // get the student concept map
          var conceptMapData = this.getConceptMapData();

          var thisConceptMapService = this.ConceptMapService;

          // the result will be stored in this variable
          var thisResult = {};

          /*
           * create the any function that can be called in the custom rule
           * evaluator code. the arguments to the any function are rule names.
           * for example if we are looking for any of the links below
           * Sun (Infrared Radiation) Space
           * Sun (Heat) Space
           * Sun (Solar Radiation) Space
           * we will call the any function like this
           * any("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
           * these dynamic arguments will be placed in the arguments variable
           */
          var any = function any() {
            return thisConceptMapService.any(componentContent, conceptMapData, arguments);
          };

          /*
           * create the all function that can be called in the custom rule
           * evaluator code. the arguments to the all function are rule names.
           * for example if we are looking for all of the links below
           * Sun (Infrared Radiation) Space
           * Sun (Heat) Space
           * Sun (Solar Radiation) Space
           * we will call the any function like this
           * all("Sun (Infrared Radiation) Space", "Sun (Heat) Space", "Sun (Solar Radiation) Space")
           * these dynamic arguments will be placed in the arguments variable
           */
          var all = function all() {
            return thisConceptMapService.all(componentContent, conceptMapData, arguments);
          };

          /*
           * create the setResult function that can be called in the custom rule
           * evaluator code
           */
          var setResult = function setResult(result) {
            thisResult = result;
          };

          // run the custom rule evaluator
          eval(customRuleEvaluator);

          // remember the auto feedback result
          this.autoFeedbackResult = thisResult;

          var resultString = '';

          if (this.componentContent.showAutoScore && thisResult.score != null) {
            // display the score
            resultString += this.$translate('SCORE') + ': ' + thisResult.score;

            if (this.componentContent.maxScore != null && this.componentContent.maxScore != '') {
              // show the max score as the denominator
              resultString += '/' + this.componentContent.maxScore;
            }
          }

          if (this.componentContent.showAutoFeedback && thisResult.feedback != null) {
            if (resultString != '') {
              // add a new line if the result string is not empty
              resultString += '<br/>';
            }

            // display the feedback
            resultString += this.$translate('FEEDBACK') + ': ' + thisResult.feedback;
          }

          if (resultString != '') {
            // show the auto feedback in a modal dialog
            this.$mdDialog.show(this.$mdDialog.alert().clickOutsideToClose(true).title(this.$translate('FEEDBACK')).htmlContent(resultString).ariaLabel(this.$translate('FEEDBACK')).ok(this.$translate('CLOSE')));
          }

          // remember the feedback string
          this.autoFeedbackString = resultString;

          this.isSubmit = true;

          if (this.mode === 'authoring') {
            /*
             * we are in the authoring view so we will set the
             * latest score and comment annotations manually
             */

            this.isDirty = false;
            this.isSubmitDirty = false;
            this.createComponentState('submit');
          }

          // tell the parent node that this component wants to submit
          this.$scope.$emit('componentSubmitTriggered', { nodeId: this.nodeId, componentId: this.componentId });
        } else {
          /*
           * the student has cancelled the submit so if a component state
           * is created, it will just be a regular save and not submit
           */
          this.isSubmit = false;
        }
      }
    }
  }, {
    key: 'lockIfNecessary',
    value: function lockIfNecessary() {
      // check if we need to lock the component after the student submits
      if (this.isLockAfterSubmit()) {
        this.isDisabled = true;
      }
    }
  }, {
    key: 'studentDataChanged',


    /**
     * Called when the student changes their work
     */
    value: function studentDataChanged() {
      var _this3 = this;

      /*
       * set the dirty flags so we will know we need to save or submit the
       * student work later
       */
      this.isDirty = true;
      this.$scope.$emit('componentDirty', { componentId: this.componentId, isDirty: true });

      this.isSubmitDirty = true;
      this.$scope.$emit('componentSubmitDirty', { componentId: this.componentId, isDirty: true });

      // clear out the save message
      this.setSaveMessage('', null);

      // get this part id
      var componentId = this.getComponentId();

      /*
       * the student work in this component has changed so we will tell
       * the parent node that the student data will need to be saved.
       * this will also notify connected parts that this component's student
       * data has changed.
       */
      var action = 'change';

      // create a component state populated with the student data
      this.createComponentState(action).then(function (componentState) {
        _this3.$scope.$emit('componentStudentDataChanged', { nodeId: _this3.nodeId, componentId: componentId, componentState: componentState });
      });
    }
  }, {
    key: 'getStudentResponse',


    /**
     * Get the student response
     */
    value: function getStudentResponse() {
      return this.studentResponse;
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

      // get the text the student typed
      var response = this.getStudentResponse();

      // set the response into the component state
      var studentData = {};
      var conceptMapData = this.getConceptMapData();
      studentData.conceptMapData = conceptMapData;

      // the student submitted this work
      componentState.isSubmit = this.isSubmit;

      if (this.isSubmit) {

        /*
         * reset the isSubmit value so that the next component state
         * doesn't maintain the same value
         */
        this.isSubmit = false;

        if (this.autoFeedbackResult != null) {
          // there is auto feedback

          if (this.autoFeedbackResult.score != null || this.autoFeedbackResult.feedback != null) {
            // there is an auto score or auto feedback

            // get the values used to create an annotation
            var runId = this.ConfigService.getRunId();
            var periodId = this.ConfigService.getPeriodId();
            var nodeId = this.nodeId;
            var componentId = this.componentId;
            var toWorkgroupId = this.ConfigService.getWorkgroupId();

            // create an array of annotations to be saved with the component state
            componentState.annotations = [];

            if (this.autoFeedbackResult.score != null) {
              // there is an auto score

              // create the data object for the annotation
              var data = {};
              data.value = parseFloat(this.autoFeedbackResult.score);
              data.autoGrader = 'conceptMap';

              if (this.componentContent.maxScore != null) {
                data.maxAutoScore = parseFloat(this.componentContent.maxScore);
              }

              // create the auto score annotation
              var scoreAnnotation = this.AnnotationService.createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

              // add the annotation to the component state
              componentState.annotations.push(scoreAnnotation);

              if (this.mode === 'authoring') {
                if (this.latestAnnotations == null) {
                  this.latestAnnotations = {};
                }

                /*
                 * we are in the authoring view so we will set the
                 * latest score annotation manually
                 */
                this.latestAnnotations.score = scoreAnnotation;
              }
            }

            if (this.autoFeedbackResult.feedback != null) {
              // there is auto feedback

              // create the data object for the annotation
              var data = {};
              data.value = this.autoFeedbackResult.feedback;
              data.autoGrader = 'conceptMap';

              // create the auto score annotation
              var commentAnnotation = this.AnnotationService.createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data);

              // add the annotation to the component state
              componentState.annotations.push(commentAnnotation);

              if (this.mode === 'authoring') {
                if (this.latestAnnotations == null) {
                  this.latestAnnotations = {};
                }

                /*
                 * we are in the authoring view so we will set the
                 * latest comment annotation manually
                 */
                this.latestAnnotations.comment = commentAnnotation;
              }
            }
          }
        }
      }

      // set the submit counter
      studentData.submitCounter = this.submitCounter;

      // set the student data into the component state
      componentState.studentData = studentData;

      // set the component type
      componentState.componentType = 'ConceptMap';

      // set the node id
      componentState.nodeId = this.nodeId;

      // set the component id
      componentState.componentId = this.componentId;

      /*
       * perform any additional processing that is required before returning
       * the component state
       */
      this.createComponentStateAdditionalProcessing(deferred, componentState, action);

      return deferred.promise;
    }
  }, {
    key: 'getConceptMapData',


    /**
     * Get the concept map data
     * @returns an object containing a array of nodes and an array of links
     */
    value: function getConceptMapData() {
      var studentData = {};
      studentData.nodes = [];
      studentData.links = [];

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var node = this.nodes[n];

        // get the JSON representation of the node
        var nodeJSON = node.toJSONObject();

        studentData.nodes.push(nodeJSON);
      }

      // loop through all the links
      for (var l = 0; l < this.links.length; l++) {
        var link = this.links[l];

        // get the JSON representation of the link
        var linkJSON = link.toJSONObject();

        studentData.links.push(linkJSON);
      }

      // set the background data into the student data
      if (this.background != null) {
        var background = this.background;

        // this is the background file name e.g. background.png
        studentData.background = background.substring(background.lastIndexOf('/') + 1);

        // this is the background path e.g. /wise/curriculum/108/assets/background.png
        studentData.backgroundPath = background;

        // whether to stretch the background to fill the svg element
        studentData.stretchBackground = this.stretchBackground;
      }

      return studentData;
    }

    /**
     * Perform any additional processing that is required before returning the
     * component state
     * Note: this function must call deferred.resolve() otherwise student work
     * will not be saved
     * @param deferred a deferred object
     * @param componentState the component state
     * @param action the action that we are creating the component state for
     * e.g. 'submit', 'save', 'change'
     */

  }, {
    key: 'createComponentStateAdditionalProcessing',
    value: function createComponentStateAdditionalProcessing(deferred, componentState, action) {

      /*
       * we don't need to perform any additional processing so we can resolve
       * the promise immediately
       */
      deferred.resolve(componentState);
    }

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

  }, {
    key: 'createAutoScoreAnnotation',
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
     * Check if we need to lock the component
     */

  }, {
    key: 'calculateDisabled',
    value: function calculateDisabled() {

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // check if the parent has set this component to disabled
        if (componentContent.isDisabled) {
          this.isDisabled = true;
        } else if (componentContent.lockAfterSubmit) {
          // we need to lock the component after the student has submitted

          // get the component states for this component
          var componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);

          // check if any of the component states were submitted
          var isSubmitted = this.NodeService.isWorkSubmitted(componentStates);

          if (isSubmitted) {
            // the student has submitted work for this component
            this.isDisabled = true;
          }
        }
      }
    }
  }, {
    key: 'isLockAfterSubmit',


    /**
     * Check whether we need to lock the component after the student
     * submits an answer.
     */
    value: function isLockAfterSubmit() {
      var result = false;

      if (this.componentContent != null) {

        // check the lockAfterSubmit field in the component content
        if (this.componentContent.lockAfterSubmit) {
          result = true;
        }
      }

      return result;
    }
  }, {
    key: 'removeAttachment',
    value: function removeAttachment(attachment) {
      if (this.attachments.indexOf(attachment) != -1) {
        this.attachments.splice(this.attachments.indexOf(attachment), 1);
        this.studentDataChanged();
        // YOU ARE NOW FREEEEEEEEE!
      }
    }
  }, {
    key: 'attachStudentAsset',


    /**
     * Attach student asset to this Component's attachments
     * @param studentAsset
     */
    value: function attachStudentAsset(studentAsset) {
      var _this4 = this;

      if (studentAsset != null) {
        this.StudentAssetService.copyAssetForReference(studentAsset).then(function (copiedAsset) {
          if (copiedAsset != null) {
            var attachment = {
              studentAssetId: copiedAsset.id,
              iconURL: copiedAsset.iconURL
            };

            _this4.attachments.push(attachment);
            _this4.studentDataChanged();
          }
        });
      }
    }
  }, {
    key: 'getPrompt',


    /**
     * Get the prompt to show to the student
     */
    value: function getPrompt() {
      var prompt = null;

      if (this.originalComponentContent != null) {
        // this is a show previous work component

        if (this.originalComponentContent.showPreviousWorkPrompt) {
          // show the prompt from the previous work component
          prompt = this.componentContent.prompt;
        } else {
          // show the prompt from the original component
          prompt = this.originalComponentContent.prompt;
        }
      } else if (this.componentContent != null) {
        prompt = this.componentContent.prompt;
      }

      return prompt;
    }
  }, {
    key: 'getNumRows',


    /**
     * Get the number of rows for the textarea
     */
    value: function getNumRows() {
      var numRows = null;

      if (this.componentContent != null) {
        numRows = this.componentContent.numRows;
      }

      return numRows;
    }
  }, {
    key: 'getNumColumns',


    /**
     * Get the number of columns for the textarea
     */
    value: function getNumColumns() {
      var numColumns = null;

      if (this.componentContent != null) {
        numColumns = this.componentContent.numColumns;
      }

      return numColumns;
    }
  }, {
    key: 'getResponse',


    /**
     * Get the text the student typed
     */
    value: function getResponse() {
      var response = null;

      if (this.studentResponse != null) {
        response = this.studentResponse;
      }

      return response;
    }
  }, {
    key: 'importWork',


    /**
     * Import work from another component
     */
    value: function importWork() {

      // get the component content
      var componentContent = this.componentContent;

      if (componentContent != null) {

        // get the import previous work node id and component id
        var importPreviousWorkNodeId = componentContent.importPreviousWorkNodeId;
        var importPreviousWorkComponentId = componentContent.importPreviousWorkComponentId;

        if (importPreviousWorkNodeId == null || importPreviousWorkNodeId == '') {

          /*
           * check if the node id is in the field that we used to store
           * the import previous work node id in
           */
          if (componentContent.importWorkNodeId != null && componentContent.importWorkNodeId != '') {
            importPreviousWorkNodeId = componentContent.importWorkNodeId;
          }
        }

        if (importPreviousWorkComponentId == null || importPreviousWorkComponentId == '') {

          /*
           * check if the component id is in the field that we used to store
           * the import previous work component id in
           */
          if (componentContent.importWorkComponentId != null && componentContent.importWorkComponentId != '') {
            importPreviousWorkComponentId = componentContent.importWorkComponentId;
          }
        }

        if (importPreviousWorkNodeId != null && importPreviousWorkComponentId != null) {

          // get the latest component state for this component
          var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);

          /*
           * we will only import work into this component if the student
           * has not done any work for this component
           */
          if (componentState == null) {
            // the student has not done any work for this component

            // get the latest component state from the component we are importing from
            var importWorkComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(importPreviousWorkNodeId, importPreviousWorkComponentId);

            if (importWorkComponentState != null) {
              /*
               * populate a new component state with the work from the
               * imported component state
               */
              var populatedComponentState = this.ConceptMapService.populateComponentState(importWorkComponentState);

              /*
               * inject the asset paths so that the node file names change from
               * 'Sun.png' to '/wise/curriculum/129/assets/Sun.png'
               */
              populatedComponentState = this.ProjectService.injectAssetPaths(populatedComponentState);

              // populate the component state into this component
              this.setStudentWork(populatedComponentState);

              // make the work dirty so that it gets saved
              this.studentDataChanged();
            }
          }
        }
      }
    }
  }, {
    key: 'getComponentId',


    /**
     * Get the component id
     * @return the component id
     */
    value: function getComponentId() {
      return this.componentContent.id;
    }
  }, {
    key: 'authoringViewComponentChanged',


    /**
     * The component has changed in the regular authoring view so we will save the project
     */
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
    key: 'authoringViewNodeUpButtonClicked',


    /**
     * A node up button was clicked in the authoring tool so we will move the
     * node up
     * @param index the index of the node that we will move
     */
    value: function authoringViewNodeUpButtonClicked(index) {

      // check if the node is at the top
      if (index != 0) {
        // the node is not at the top so we can move it up

        // get the nodes
        var nodes = this.authoringComponentContent.nodes;

        if (nodes != null) {

          // get the node at the given index
          var node = nodes[index];

          // remove the node
          nodes.splice(index, 1);

          // insert the node back in one index back
          nodes.splice(index - 1, 0, node);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * A node down button was clicked in the authoring tool so we will move the
     * node down
     * @param index the index of the node that we will move
     */

  }, {
    key: 'authoringViewNodeDownButtonClicked',
    value: function authoringViewNodeDownButtonClicked(index) {

      // get the nodes
      var nodes = this.authoringComponentContent.nodes;

      // check if the node is at the bottom
      if (nodes != null && index != nodes.length - 1) {
        // the node is not at the bottom so we can move it down

        // get the node at the given index
        var node = nodes[index];

        // remove the node
        nodes.splice(index, 1);

        // insert the node back in one index ahead
        nodes.splice(index + 1, 0, node);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * A node delete button was clicked in the authoring tool so we will remove
     * the node
     * @param index the index of the node that we will delete
     */

  }, {
    key: 'authoringViewNodeDeleteButtonClicked',
    value: function authoringViewNodeDeleteButtonClicked(index) {

      // get the nodes
      var nodes = this.authoringComponentContent.nodes;

      if (nodes != null) {

        // get the node
        var node = nodes[index];

        if (node != null) {

          // get the file name and label
          var nodeFileName = node.fileName;
          var nodeLabel = node.label;

          // confirm with the author that they really want to delete the node
          var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisNode', { nodeFileName: nodeFileName, nodeLabel: nodeLabel }));

          if (answer) {
            /*
             * the author is sure they want to delete the node so we
             * will remove it from the array
             */
            nodes.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * A link up button was clicked in the authoring tool so we will move the
     * link up
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewLinkUpButtonClicked',
    value: function authoringViewLinkUpButtonClicked(index) {

      // check if the link is at the top
      if (index != 0) {

        // get the links
        var links = this.authoringComponentContent.links;

        if (links != null) {

          // get a link
          var link = links[index];

          if (link != null) {

            // remove the link
            links.splice(index, 1);

            // add the link back in one index back
            links.splice(index - 1, 0, link);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * A link down button was clicked in the authoring tool so we will move the
     * link down
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewLinkDownButtonClicked',
    value: function authoringViewLinkDownButtonClicked(index) {

      // get the links
      var links = this.authoringComponentContent.links;

      // check if the link is at the bottom
      if (links != null && index != links.length - 1) {
        // the node is not at the bottom so we can move it down

        if (links != null) {

          // get the link
          var link = links[index];

          if (link != null) {

            // remove the link
            links.splice(index, 1);

            // add the link back in one index ahead
            links.splice(index + 1, 0, link);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * A link delete button was clicked in the authoring tool so we remove the
     * link
     * @param index the index of the link
     */

  }, {
    key: 'authoringViewLinkDeleteButtonClicked',
    value: function authoringViewLinkDeleteButtonClicked(index) {

      // get the links
      var links = this.authoringComponentContent.links;

      if (links != null) {

        // get a link
        var link = links[index];

        if (link != null) {

          // get the link label
          var linkLabel = link.label;

          // confirm with the author that they really want to delete the link
          var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisLink', { linkLabel: linkLabel }));

          if (answer) {
            /*
             * the author is sure they want to delete the link so we
             * will remove it from the array
             */
            links.splice(index, 1);

            /*
             * the author has made changes so we will save the component
             * content
             */
            this.authoringViewComponentChanged();
          }
        }
      }
    }

    /**
     * Add a node in the authoring tool
     */

  }, {
    key: 'authoringViewAddNode',
    value: function authoringViewAddNode() {

      // get a new node id
      var id = this.authoringGetNewConceptMapNodeId();

      // create the new node
      var newNode = {};
      newNode.id = id;
      newNode.label = '';
      newNode.fileName = '';
      newNode.width = 100;
      newNode.height = 100;

      // get the nodes
      var nodes = this.authoringComponentContent.nodes;

      // add the new node
      nodes.push(newNode);

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * Get the concept map node with the given id
     * @param nodeId the concept map node id
     * @return the concept map node with the given node id
     */

  }, {
    key: 'authoringViewGetNodeById',
    value: function authoringViewGetNodeById(nodeId) {

      if (nodeId != null && this.authoringComponentContent != null && this.authoringComponentContent.nodes != null) {

        // loop through all the concept map nodes
        for (var n = 0; n < this.authoringComponentContent.nodes.length; n++) {
          var node = this.authoringComponentContent.nodes[n];

          if (node != null) {
            if (nodeId === node.id) {
              // we have found the concept map node that we want
              return node;
            }
          }
        }
      }

      return null;
    }

    /**
     * Add a link in the authoring tool
     */

  }, {
    key: 'authoringViewAddLink',
    value: function authoringViewAddLink() {

      // get a new link id
      var id = this.authoringGetNewConceptMapLinkId();

      // create a new link
      var newLink = {};
      newLink.id = id;
      newLink.label = '';
      newLink.color = '';

      // get the links
      var links = this.authoringComponentContent.links;

      // add the new link
      links.push(newLink);

      /*
       * the author has made changes so we will save the component
       * content
       */
      this.authoringViewComponentChanged();
    }

    /**
     * Get a new ConceptMapNode id that isn't being used
     * @returns a new ConceptMapNode id e.g. 'node3'
     */

  }, {
    key: 'authoringGetNewConceptMapNodeId',
    value: function authoringGetNewConceptMapNodeId() {

      var nextAvailableNodeIdNumber = 1;

      // array to remember the numbers that have been used in node ids already
      var usedNumbers = [];

      // loop through all the nodes
      for (var x = 0; x < this.authoringComponentContent.nodes.length; x++) {
        var node = this.authoringComponentContent.nodes[x];

        if (node != null) {

          // get the node id
          var nodeId = node.id;

          if (nodeId != null) {

            // get the number from the node id
            var nodeIdNumber = parseInt(nodeId.replace('node', ''));

            if (nodeIdNumber != null) {
              // add the number to the array of used numbers
              usedNumbers.push(nodeIdNumber);
            }
          }
        }
      }

      if (usedNumbers.length > 0) {
        // get the max number used
        var maxNumberUsed = Math.max.apply(Math, usedNumbers);

        if (!isNaN(maxNumberUsed)) {
          // increment the number by 1 to get the next available number
          nextAvailableNodeIdNumber = maxNumberUsed + 1;
        }
      }

      var newId = 'node' + nextAvailableNodeIdNumber;

      return newId;
    }

    /**
     * Get a new ConceptMapLink id that isn't being used
     * @returns a new ConceptMapLink id e.g. 'link3'
     */

  }, {
    key: 'authoringGetNewConceptMapLinkId',
    value: function authoringGetNewConceptMapLinkId() {

      var nextAvailableLinkIdNumber = 1;

      // array to remember the numbers that have been used in link ids already
      var usedNumbers = [];

      // loop through all the nodes
      for (var x = 0; x < this.authoringComponentContent.links.length; x++) {
        var link = this.authoringComponentContent.links[x];

        if (link != null) {

          // get the node id
          var nodeId = link.id;

          if (nodeId != null) {

            // get the number from the node id
            var nodeIdNumber = parseInt(nodeId.replace('link', ''));

            if (nodeIdNumber != null) {
              // add the number to the array of used numbers
              usedNumbers.push(nodeIdNumber);
            }
          }
        }
      }

      if (usedNumbers.length > 0) {
        // get the max number used
        var maxNumberUsed = Math.max.apply(Math, usedNumbers);

        if (!isNaN(maxNumberUsed)) {
          // increment the number by 1 to get the next available number
          nextAvailableLinkIdNumber = maxNumberUsed + 1;
        }
      }

      var newId = 'link' + nextAvailableLinkIdNumber;

      return newId;
    }

    /**
     * A "with link" checkbox was checked
     * @param ruleIndex the index of the rule
     */

  }, {
    key: 'authoringRuleLinkCheckboxClicked',
    value: function authoringRuleLinkCheckboxClicked(ruleIndex) {

      // get the rule that was checked
      var rule = this.authoringComponentContent.rules[ruleIndex];

      if (rule != null) {
        if (rule.type == 'node') {
          /*
           * the rule has been set to 'node' instead of 'link' so we
           * will remove the link label and other node label
           */

          delete rule.linkLabel;
          delete rule.otherNodeLabel;
        }
      }

      // perform updating and saving
      this.authoringViewComponentChanged();
    }

    /**
     * Add a new rule
     */

  }, {
    key: 'authoringAddRule',
    value: function authoringAddRule() {

      // create the new rule
      var newRule = {};
      newRule.name = '';
      newRule.type = 'node';
      newRule.categories = [];
      newRule.nodeLabel = '';
      newRule.comparison = 'exactly';
      newRule.number = 1;
      newRule.not = false;

      // add the rule to the array of rules
      this.authoringComponentContent.rules.push(newRule);

      var showSubmitButton = false;

      if (this.authoringComponentContent.rules.length > 0) {
        // there are scoring rules so we will show the submit button
        showSubmitButton = true;
      }

      // set the value of the showSubmitButton field
      this.setShowSubmitButtonValue(showSubmitButton);

      // perform updating and saving
      this.authoringViewComponentChanged();
    }

    /**
     * Move a rule up
     * @param index the index of the rule
     */

  }, {
    key: 'authoringViewRuleUpButtonClicked',
    value: function authoringViewRuleUpButtonClicked(index) {

      // check if the rule is at the top
      if (index != 0) {
        // the rule is not at the top so we can move it up

        // get the rules
        var rules = this.authoringComponentContent.rules;

        if (rules != null) {

          // get the rule at the given index
          var rule = rules[index];

          // remove the rule
          rules.splice(index, 1);

          // insert the rule back in one index back
          rules.splice(index - 1, 0, rule);

          /*
           * the author has made changes so we will save the component
           * content
           */
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Move a rule down
     * @param index the index of the rule
     */

  }, {
    key: 'authoringViewRuleDownButtonClicked',
    value: function authoringViewRuleDownButtonClicked(index) {

      // get the rules
      var rules = this.authoringComponentContent.rules;

      // check if the rule is at the bottom
      if (rules != null && index != rules.length - 1) {
        // the rule is not at the bottom so we can move it down

        // get the rule at the given index
        var rule = rules[index];

        // remove the rule
        rules.splice(index, 1);

        // insert the rule back in one index ahead
        rules.splice(index + 1, 0, rule);

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /*
     * Delete a rule
     * @param index the index of the rule to delete
     */

  }, {
    key: 'authoringViewRuleDeleteButtonClicked',
    value: function authoringViewRuleDeleteButtonClicked(index) {

      // get the rule
      var rule = this.authoringComponentContent.rules[index];

      if (rule != null) {

        // get the rule name
        var ruleName = rule.name;

        // confirm with the author that they really want to delete the rule
        var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteThisRule', { ruleName: ruleName }));

        if (answer) {
          // remove the rule at the given index
          this.authoringComponentContent.rules.splice(index, 1);

          // perform updating and saving
          this.authoringViewComponentChanged();
        }
      }

      var showSubmitButton = false;

      if (this.authoringComponentContent.rules.length > 0) {
        // there are scoring rules so we will show the submit button
        showSubmitButton = true;
      }

      // set the value of the showSubmitButton field
      this.setShowSubmitButtonValue(showSubmitButton);
    }

    /**
     * Add a category to a rule
     * @param rule the rule
     */

  }, {
    key: 'authoringViewAddCategoryClicked',
    value: function authoringViewAddCategoryClicked(rule) {

      if (rule != null) {
        // add an empty category name
        rule.categories.push('');
      }

      // perform updating and saving
      this.authoringViewComponentChanged();
    }

    /**
     * Delete a category from a rule
     * @param rule delete a category from this rule
     * @param index the index of the category
     */

  }, {
    key: 'authoringViewDeleteCategoryClicked',
    value: function authoringViewDeleteCategoryClicked(rule, index) {

      if (rule != null) {

        // get the rule name
        var ruleName = rule.name;

        // get the category name
        var categoryName = rule.categories[index];

        // confirm with the author that they really want to delete the category from the rule
        var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheCategory', { ruleName: ruleName, categoryName: categoryName }));

        if (answer) {
          // remove the category at the index
          rule.categories.splice(index, 1);

          // perform updating and saving
          this.authoringViewComponentChanged();
        }
      }
    }

    /**
     * Get all the step node ids in the project
     * @returns all the step node ids
     */

  }, {
    key: 'getStepNodeIds',
    value: function getStepNodeIds() {
      var stepNodeIds = this.ProjectService.getNodeIds();

      return stepNodeIds;
    }

    /**
     * Get the step number and title
     * @param nodeId get the step number and title for this node
     * @returns the step number and title
     */

  }, {
    key: 'getNodePositionAndTitleByNodeId',
    value: function getNodePositionAndTitleByNodeId(nodeId) {
      var nodePositionAndTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);

      return nodePositionAndTitle;
    }

    /**
     * Get the components in a step
     * @param nodeId get the components in the step
     * @returns the components in the step
     */

  }, {
    key: 'getComponentsByNodeId',
    value: function getComponentsByNodeId(nodeId) {
      var components = this.ProjectService.getComponentsByNodeId(nodeId);

      return components;
    }

    /**
     * Check if a node is a step node
     * @param nodeId the node id to check
     * @returns whether the node is an application node
     */

  }, {
    key: 'isApplicationNode',
    value: function isApplicationNode(nodeId) {
      var result = this.ProjectService.isApplicationNode(nodeId);

      return result;
    }

    /**
     * Update the component JSON string that will be displayed in the advanced authoring view textarea
     */

  }, {
    key: 'updateAdvancedAuthoringView',
    value: function updateAdvancedAuthoringView() {
      this.authoringComponentContentJSONString = angular.toJson(this.authoringComponentContent, 4);
    }
  }, {
    key: 'setSaveMessage',


    /**
     * Set the message next to the save button
     * @param message the message to display
     * @param time the time to display
     */
    value: function setSaveMessage(message, time) {
      this.saveMessage.text = message;
      this.saveMessage.time = time;
    }
  }, {
    key: 'isCRaterEnabled',


    /**
     * Check if CRater is enabled for this component
     * @returns whether CRater is enabled for this component
     */
    value: function isCRaterEnabled() {
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

  }, {
    key: 'isCRaterScoreOnSave',
    value: function isCRaterScoreOnSave() {
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

  }, {
    key: 'isCRaterScoreOnSubmit',
    value: function isCRaterScoreOnSubmit() {
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

  }, {
    key: 'isCRaterScoreOnChange',
    value: function isCRaterScoreOnChange() {
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

  }, {
    key: 'isCRaterScoreOnExit',
    value: function isCRaterScoreOnExit() {
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

  }, {
    key: 'registerExitListener',
    value: function registerExitListener() {

      /*
       * Listen for the 'exit' event which is fired when the student exits
       * the VLE. This will perform saving before the VLE exits.
       */
      exitListener = this.$scope.$on('exit', angular.bind(this, function (event, args) {}));
    }
  }, {
    key: 'linkTypeSelected',


    /**
     * A link type was selected in the link type chooser popup
     * @param linkType the authored link object that was selected
     */
    value: function linkTypeSelected(selectedLink) {

      if (this.highlightedElement != null && this.highlightedElement.constructor.name == 'ConceptMapLink') {

        /*
         * get the ConceptMapLink object that we are setting the link type
         * for
         */
        var link = this.highlightedElement;

        // get the label, color, and original id
        var label = selectedLink.label;
        var color = selectedLink.color;
        var originalId = selectedLink.id;

        // set the label, color, and original id into the link
        link.setLabel(label);
        link.setColor(color);
        link.setOriginalId(originalId);
      }

      // make the link not highlighted
      this.clearHighlightedElement();

      // handle the student data changing
      this.studentDataChanged();
    }

    /**
     * Get the links title
     * @returns the links title
     */

  }, {
    key: 'getLinksTitle',
    value: function getLinksTitle() {
      var linksTitle = '';

      if (this.componentContent != null) {
        linksTitle = this.componentContent.linksTitle;
      }

      return linksTitle;
    }

    /**
     * Show the link type chooser popup
     */

  }, {
    key: 'showLinkTypeChooser',
    value: function showLinkTypeChooser() {

      // check if we have initialized the popup
      if (!this.initializedDisplayLinkTypeChooserModalOverlay) {
        // we have not initialized the popup so we will do so now
        this.setLinkTypeChooserOverlayStyle();
        this.initializedDisplayLinkTypeChooserModalOverlay = true;
      }

      /*
       * initialize the top left of the link chooser popup to show up on
       * the top right of the svg element
       */
      this.linkTypeChooserStyle['left'] = '600px';
      this.linkTypeChooserStyle['top'] = '20px';

      this.displayLinkTypeChooser = true;
    }

    /**
     * Hide the link type chooser popup
     */

  }, {
    key: 'hideLinkTypeChooser',
    value: function hideLinkTypeChooser() {

      // hide the link type chooser
      this.displayLinkTypeChooser = false;
      this.displayLinkTypeChooserModalOverlay = false;
      this.newlyCreatedLink = null;

      if (!this.$scope.$$phase) {
        // TODO GK (from HT) this line was causing a lot of js errors ( $digest already in progress ), so I commented it out
        // and it still seems to work. Do we need this line?
        // see here: http://stackoverflow.com/questions/12729122/angularjs-prevent-error-digest-already-in-progress-when-calling-scope-apply
        //this.$scope.$apply();
      }
    }

    /**
     * Setup the svg
     */

  }, {
    key: 'setupSVG',
    value: function setupSVG() {
      var _this5 = this;

      // get the svg element in the svg.js world
      this.draw = SVG(this.svgId);
      this.draw.width(this.width);
      this.draw.height(this.height);

      this.highlightedElement = null;
      this.activeNode = null;
      this.activeLink = null;
      this.drawingLink = false;
      this.newlyCreatedLink = null;

      // set the mouse down listener
      this.draw.mousedown(function (event) {
        _this5.svgMouseDown(event);
      });

      // set the mouse up listener
      this.draw.mouseup(function (event) {
        _this5.svgMouseUp(event);
      });

      // set the mouse move listener
      this.draw.mousemove(function (event) {
        _this5.svgMouseMove(event);
      });

      // get the svg element in the angular world
      var svg = angular.element('#' + this.svgId);

      /*
       * check if we have already added the dragover listener so we don't
       * add multiple listeners for the same event. adding multiple listeners
       * to the same event may occur in the authoring tool.
       */
      if (!this.addedDragOverListener) {
        /*
         * listen for the dragover event which occurs when the user is
         * dragging a node onto the svg
         */
        svg[0].addEventListener('dragover', function (event) {
          /*
           * prevent the default because if we don't, the user won't
           * be able to drop a new node instance onto the svg in the
           * authoring mode
           */
          event.preventDefault();
        });

        this.addedDragOverListener = true;
      }

      /*
       * check if we have already added the drop listener so we don't
       * add multiple listeners for the same event. adding multiple listeners
       * to the same event may occur in the authoring tool.
       */
      if (!this.addedDropListener) {
        /*
         * listen for the drop event which occurs when the student drops
         * a new node onto the svg
         */
        svg[0].addEventListener('drop', function (event) {

          /*
           * the user has dropped a new node onto the svg to create a
           * new instance of a node
           */
          _this5.newNodeDropped(event);
        });

        this.addedDropListener = true;
      }

      // set the link type chooser style
      this.setLinkTypeChooserStyle();
    }

    /**
     * Set the link type chooser popup style
     */

  }, {
    key: 'setLinkTypeChooserStyle',
    value: function setLinkTypeChooserStyle() {

      /*
       * set the link type chooser popup to show up in the upper right of
       * the svg element
       */
      this.linkTypeChooserStyle = {
        'width': '300px',
        'position': 'absolute',
        'left': '600px',
        'top': '20px',
        'border': '1px solid black',
        'backgroundColor': 'white',
        'cursor': 'pointer',
        'z-index': 10000,
        'padding': '16px'
      };
    }

    /**
     * Set the link type chooser popup overlay style
     */

  }, {
    key: 'setLinkTypeChooserOverlayStyle',
    value: function setLinkTypeChooserOverlayStyle() {

      // calculate the modal overlay width and height
      this.modalWidth = this.getModalWidth();
      this.modalHeight = this.getModalHeight();

      //var overlayWidth = this.modalWidth + 'px';
      var overlayWidth = this.modalWidth;

      var conceptMapContainer = angular.element('#' + this.conceptMapContainerId);
      var width = conceptMapContainer.width();
      var height = conceptMapContainer.height();
      var offset = conceptMapContainer.offset();

      var offsetLeft = offset.left;
      var offsetTop = offset.top;
      offsetLeft = 0;
      offsetTop = 0;

      this.linkTypeChooserModalOverlayStyle = {
        'position': 'absolute',
        'z-index': 9999,
        'width': overlayWidth,
        'height': height,
        'background-color': '#000000',
        'opacity': 0.4
      };
    }

    /**
     * Get the width that the modal overlay should be
     * @returns the width that the modal overlay should be
     */

  }, {
    key: 'getModalWidth',
    value: function getModalWidth() {

      var selectNodeBarWidth = null;
      var svgWidth = null;

      // get the width of the left select node bar
      var selectNodeBarWidthString = angular.element(document.getElementById('#' + this.selectNodeBarId)).css('width');

      // get the width of the svg element
      var svgWidthString = angular.element(document.getElementById(this.svgId)).css('width');

      if (selectNodeBarWidthString != null && svgWidthString != null) {
        // get the integer values
        selectNodeBarWidth = parseInt(selectNodeBarWidthString.replace('px', ''));
        svgWidth = parseInt(svgWidthString.replace('px', ''));
      }

      var overlayWidth = null;

      if (selectNodeBarWidth != null && svgWidth != null) {
        // calculate the sum of the widths
        overlayWidth = selectNodeBarWidth + svgWidth;
      }

      return overlayWidth;
    }

    /**
     * Get the height that the modal overlay should be
     * @returns the height that the modal overlay should be
     */

  }, {
    key: 'getModalHeight',
    value: function getModalHeight() {

      var selectNodeBarHeight = null;
      var svgHeight = null;

      // get the height of the left select node bar
      var selectNodeBarHeightString = angular.element(document.getElementById('#' + this.selectNodeBarId)).css('height');

      // get the height of the svg element
      var svgHeightString = angular.element(document.getElementById(this.svgId)).css('height');

      if (selectNodeBarHeightString != null && svgHeightString != null) {
        // get the integer values
        selectNodeBarHeight = parseInt(selectNodeBarHeightString.replace('px', ''));
        svgHeight = parseInt(svgHeightString.replace('px', ''));
      }

      var overlayHeight = null;

      if (selectNodeBarHeight != null && svgHeight != null) {
        // get the larger of the two heights
        overlayHeight = Math.max(selectNodeBarHeight, svgHeight);
      }

      return overlayHeight;
    }

    /**
     * The cancel button on the link type chooser was clicked
     */

  }, {
    key: 'cancelLinkTypeChooser',
    value: function cancelLinkTypeChooser() {

      if (this.newlyCreatedLink != null) {
        /*
         * the student has just created this link and has not yet chosen
         * a link type so we will remove the link
         */
        this.newlyCreatedLink.remove();
        this.newlyCreatedLink = null;
      }

      // hide the link chooser
      this.hideLinkTypeChooser();

      // make the link not highlighted
      this.clearHighlightedElement();
    }

    /**
     * Called when the mouse iss clicked down on a blank spot in the svg element
     * @param event the mouse down event
     */

  }, {
    key: 'svgMouseDown',
    value: function svgMouseDown(event) {
      if (event.target.tagName == 'svg') {
        // remove highlighting from any item that was previously highlighted
        this.clearHighlightedElement();
      }
    }

    /**
     * Called when the mouse is released
     * @param event the mouse up event
     */

  }, {
    key: 'svgMouseUp',
    value: function svgMouseUp(event) {

      if (this.activeLink != null && this.activeNode == null) {
        /*
         * the student was creating a link but did not connect the link
         * to a destination node so we will just remove the link
         */
        this.activeLink.remove();
      }

      // we are no longer drawing a link
      this.drawingLink = false;

      // there is no longer an active link
      this.activeLink = null;

      // enable node draggin
      this.enableNodeDragging();
      this.moveLinkTextToFront();
      // move the nodes to the front so that they are on top of links
      this.moveNodesToFront();
    }

    /**
     * Called when the mouse is moved
     * @param event the mouse move event
     */

  }, {
    key: 'svgMouseMove',
    value: function svgMouseMove(event) {

      if (this.activeLink != null) {
        /*
         * there is an active link which means the student has created a
         * new link and is in the process of choosing the link's destination
         * node
         */

        // get the coordinates that the link should be updated to
        var coordinates = this.getRelativeCoordinatesByEvent(event);
        var x1 = null;
        var y1 = null;
        var x2 = coordinates.x;
        var y2 = coordinates.y;

        /*
         * get the location of the center of the connector that the link
         * originated from
         */
        var startX = this.activeLinkStartX;
        var startY = this.activeLinkStartY;

        /*
         * get the distance from the start to the current position of the
         * mouse
         */
        var distance = this.ConceptMapService.calculateDistance(startX, startY, x2, y2);

        /*
         * check if we have set the curvature yet and that the mouse
         * is more than 20 pixels away from the start.
         *
         * we will determine the curvature of the link based upon how
         * the user has dragged the mouse in relation to the center
         * of the connector. if they start drawing the link horizontally
         * we will create a straight line with no curvature. if they
         * start drawing the link by moving the mouse up, we will create
         * a line that curves up. if they start drawing the link by
         * moving the mouse down, we will create a line that curves down.
         */
        if (!this.linkCurvatureSet && distance > 20) {

          /*
           * get the slope of the line from the start to the location
           * of the mouse
           */
          var slope = Math.abs(this.ConceptMapService.getSlope(startX, startY, x2, y2));

          if (y2 < startY) {
            // the user has moved the mouse above the connector

            if (slope == null) {
              /*
               * the slope is infinite so we will default the
               * curvature to 0.5
               */
              this.activeLink.curvature = 0.5;
            } else if (slope < 1.0) {
              // make the link straight
              this.activeLink.curvature = 0.0;
            } else {
              // make the link curved
              this.activeLink.curvature = 0.5;
            }

            // make the link curve up
            this.activeLink.startCurveUp = true;
            this.activeLink.endCurveUp = true;
          } else if (y2 > startY) {
            // the user has moved the mouse below the connector

            if (slope == null) {
              /*
               * the slope is infinite so we will default the
               * curvature to 0.5
               */
              this.activeLink.curvature = 0.5;
            } else if (slope < 1.0) {
              // make the link straight
              this.activeLink.curvature = 0.0;
            } else {
              // make the link curved
              this.activeLink.curvature = 0.5;
            }

            // make the link curve down
            this.activeLink.startCurveUp = false;
            this.activeLink.endCurveUp = false;
          }

          // remember that we have set the curvature
          this.linkCurvatureSet = true;
        }

        var isDragging = true;

        // redraw the link with the new coordinates
        this.activeLink.updateCoordinates(x1, y1, x2, y2, isDragging);
      }
    }

    /**
     * Set the active node. This is called when the student places the mouse
     * over a node. When a node becomes active, we show the delete button and
     * the border.
     * @param node the node to make active
     */

  }, {
    key: 'setActiveNode',
    value: function setActiveNode(node) {
      if (node != null) {
        // show the delete button for the node
        node.showDeleteButton();

        // show the border for the node
        node.showBorder();

        // remember the active node
        this.activeNode = node;
      }
    }

    /**
     * Clear the active node
     */

  }, {
    key: 'clearActiveNode',
    value: function clearActiveNode() {

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var tempNode = this.nodes[n];

        if (tempNode == this.activeNode && tempNode != this.highlightedElement) {
          /*
           * we have found the node and it is not highlighted so we will
           * hide the delete button and hide the border
           */
          tempNode.hideDeleteButton();
          tempNode.hideBorder();
        }
      }

      this.activeNode = null;
    }

    /**
     * Get the coordinates of the mouse relative to the svg element
     * @param event a mouse event
     * @returns an object containing x and y values
     */

  }, {
    key: 'getRelativeCoordinatesByEvent',
    value: function getRelativeCoordinatesByEvent(event) {

      // get the offset of the mouse from its parent
      var offsetX = event.offsetX;
      var offsetY = event.offsetY;

      var parentOffsetX = 0;
      var parentOffsetY = 0;

      // get the user agent so we can determine which browser the user is using
      var userAgent = navigator.userAgent;

      if (event.target.tagName == 'svg') {
        // the target is the svg element

        if (userAgent != null && userAgent.indexOf('Chrome') != -1) {
          // the user is using Chrome
          var matrix = event.target.getCTM();
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        } else if (userAgent != null && userAgent.indexOf('Firefox') != -1) {
          // the user is using Firefox
          matrix = event.target.createSVGMatrix();
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        } else {
          // the user is using some other browser
          matrix = event.target.getCTM();
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        }
      } else if (event.target.tagName == 'circle') {
        // the target is a node connector circle or delete circle

        if (userAgent != null && userAgent.indexOf('Chrome') != -1) {
          // the user is using Chrome

        } else if (userAgent != null && userAgent.indexOf('Firefox') != -1) {
          // the user is using Firefox

          // get the matrix of the group
          var matrix = event.target.getCTM();

          // get the bounding box of the circle
          var bbox = event.target.getBBox();

          /*
           * get the bounding box of the circle so we can get the
           * coordinates of the circle within the group
           */
          var x = bbox.x;
          var y = bbox.y;

          // get the absolute coordinates of the circle
          parentOffsetX = matrix.e + bbox.x;
          parentOffsetY = matrix.f + bbox.y;
        }
      } else if (event.target.tagName == 'rect') {
        // the target is the rectangle that outlines the image

        if (userAgent != null && userAgent.indexOf('Chrome') != -1) {
          // the user is using Chrome

        } else if (userAgent != null && userAgent.indexOf('Firefox') != -1) {
          // the user is using Firefox

          // get the matrix of the group
          var matrix = event.target.getCTM();

          // get the bounding box of the rect
          var bbox = event.target.getBBox();

          /*
           * get the bounding box of the rect so we can get the
           * coordinates of the rect within the group
           */
          var x = bbox.x;
          var y = bbox.y;

          // get the absolute coordinates of the rect
          parentOffsetX = matrix.e + x;
          parentOffsetY = matrix.f + y;
        }
      } else if (event.target.tagName == 'image') {
        // the target is an image

        if (userAgent.indexOf('Chrome') != -1) {} else if (userAgent.indexOf('Firefox') != -1) {

          // get the matrix of the group
          var matrix = event.target.parentElement.getCTM();

          // get the coordinates of the upper left corner of the group
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        }
      } else if (event.target.tagName == 'path') {
        /*
         * the target is the link line. sometimes the mouse can be over the
         * link if the student is moving the mouse around quickly.
         */

        if (userAgent != null && userAgent.indexOf('Chrome') != -1) {
          // the user is using Chrome

        } else if (userAgent != null && userAgent.indexOf('Firefox') != -1) {
          // the user is using Firefox

          // get the coordinates of the head of the link
          var x2 = event.target.attributes['x2'];
          var y2 = event.target.attributes['y2'];

          if (x2 != null && y2 != null) {
            parentOffsetX = parseInt(x2.value);
            parentOffsetY = parseInt(y2.value);
          }
        }
      } else {
        // the target is something else

        if (userAgent != null && userAgent.indexOf('Chrome') != -1) {
          // the user is using Chrome

        } else if (userAgent != null && userAgent.indexOf('Firefox') != -1) {
          // the user is using Firefox

          var matrix = event.target.getCTM();
          parentOffsetX = matrix.e;
          parentOffsetY = matrix.f;
        }
      }

      /*
       * add the parent offset values to the relative offset values to obtain
       * the x and y values relative to the upper left corner of the svg
       */
      var x = parentOffsetX + offsetX;
      var y = parentOffsetY + offsetY;

      var returnObject = {};
      returnObject.x = x;
      returnObject.y = y;

      return returnObject;
    }

    /**
     * Called when the student clicks down on a node in the left node bar
     * @param $event the mouse down event
     * @param node the node the student clicked down on
     */

  }, {
    key: 'selectNode',
    value: function selectNode($event, node) {

      // remember the selected node
      this.selectedNode = node;

      /*
       * remember the offset of the mouse relative to the upper left of the
       * node's image so that we properly calculate the node position when
       * the student releases the mouse to put the node in the svg
       */
      this.tempOffsetX = $event.offsetX;
      this.tempOffsetY = $event.offsetY;
    }

    /**
     * The student has dropped a new node on the svg
     * @param event the drop event
     */

  }, {
    key: 'newNodeDropped',
    value: function newNodeDropped(event) {

      // get the selected node
      var selectedNode = this.selectedNode;

      if (selectedNode != null) {
        // get the file name
        var filePath = selectedNode.fileName;

        // get the node name
        var label = selectedNode.label;

        // get the width and height of the node
        var width = selectedNode.width;
        var height = selectedNode.height;

        // get the original authored id
        var originalId = selectedNode.id;

        // get the coordinates relative to the svg element
        var coordinates = this.getRelativeCoordinatesByEvent(event);

        // get the position we should drop the node at
        var x = coordinates.x - this.tempOffsetX;
        var y = coordinates.y - this.tempOffsetY;

        // get a new ConceptMapNodeId e.g. 'studentNode3'
        var newConceptMapNodeId = this.getNewConceptMapNodeId();

        // create a ConceptMapNode
        var conceptMapNode = this.ConceptMapService.newConceptMapNode(this.draw, newConceptMapNodeId, originalId, filePath, label, x, y, width, height);

        // add the node to our array of nodes
        this.addNode(conceptMapNode);

        // set the mouse events on the node
        this.setNodeMouseEvents(conceptMapNode);

        // make the node highlighted
        this.setHighlightedElement(conceptMapNode);

        // handle the student data changing
        this.studentDataChanged();
      }

      // enable node dragging
      this.enableNodeDragging();
    }

    /**
     * Get a new ConceptMapNode id that isn't being used
     * @returns a new ConceptMapNode id e.g. 'studentNode3'
     */

  }, {
    key: 'getNewConceptMapNodeId',
    value: function getNewConceptMapNodeId() {

      var nextAvailableNodeIdNumber = 1;

      // array to remember the numbers that have been used in node ids already
      var usedNumbers = [];

      // loop through all the nodes
      for (var x = 0; x < this.nodes.length; x++) {
        var node = this.nodes[x];

        if (node != null) {

          // get the node id
          var nodeId = node.getId();

          if (nodeId != null) {

            // get the number from the node id
            var nodeIdNumber = parseInt(nodeId.replace('studentNode', ''));

            if (nodeIdNumber != null) {
              // add the number to the array of used numbers
              usedNumbers.push(nodeIdNumber);
            }
          }
        }
      }

      if (usedNumbers.length > 0) {
        // get the max number used
        var maxNumberUsed = Math.max.apply(Math, usedNumbers);

        if (!isNaN(maxNumberUsed)) {
          // increment the number by 1 to get the next available number
          nextAvailableNodeIdNumber = maxNumberUsed + 1;
        }
      }

      var newId = 'studentNode' + nextAvailableNodeIdNumber;

      return newId;
    }

    /**
     * Get a new ConceptMapLink id that isn't being used
     * @returns a new ConceptMapLink id e.g. 'studentLink3'
     */

  }, {
    key: 'getNewConceptMapLinkId',
    value: function getNewConceptMapLinkId() {

      var nextAvailableLinkIdNumber = 1;

      // array to remember the numbers that have been used in link ids already
      var usedNumbers = [];

      // loop through all the nodes
      for (var x = 0; x < this.links.length; x++) {
        var link = this.links[x];

        if (link != null) {

          // get the node id
          var linkId = link.getId();

          if (linkId != null) {

            // get the number from the link id
            var linkIdNumber = parseInt(linkId.replace('studentLink', ''));

            if (linkIdNumber != null) {
              // add the number to the array of used numbers
              usedNumbers.push(linkIdNumber);
            }
          }
        }
      }

      if (usedNumbers.length > 0) {
        // get the max number used
        var maxNumberUsed = Math.max.apply(Math, usedNumbers);

        if (!isNaN(maxNumberUsed)) {
          // increment the number by 1 to get the next available number
          nextAvailableLinkIdNumber = maxNumberUsed + 1;
        }
      }

      var newId = 'studentLink' + nextAvailableLinkIdNumber;

      return newId;
    }

    /**
     * Set the mouse events on a newly created node
     * @param conceptMapNode the node
     */

  }, {
    key: 'setNodeMouseEvents',
    value: function setNodeMouseEvents(conceptMapNode) {
      var _this6 = this;

      // set the node mouse over event
      conceptMapNode.setNodeMouseOver(function (event) {
        _this6.nodeMouseOver(event);
      });

      // set the node mouse out event
      conceptMapNode.setNodeMouseOut(function (event) {
        _this6.nodeMouseOut(event);
      });

      // set the connector mouse down event
      conceptMapNode.setConnectorMouseDown(function (event) {
        _this6.disableNodeDragging();
        _this6.connectorMouseDown(event);
      });

      // set the node mouse down event
      conceptMapNode.setNodeMouseDown(function (event) {
        _this6.nodeMouseDown(event);
      });

      // set the node mouse up event
      conceptMapNode.setNodeMouseUp(function (event) {
        _this6.nodeMouseUp(event);
      });

      // set the delete button mouse down event
      conceptMapNode.setDeleteButtonMouseDown(function (event) {
        _this6.nodeDeleteButtonMouseDown(event);
      });

      // set the delete button mouse over event
      conceptMapNode.setDeleteButtonMouseOver(function (event) {
        _this6.nodeDeleteButtonMouseOver(event);
      });

      // set the delete button mouse out event
      conceptMapNode.setDeleteButtonMouseOut(function (event) {
        _this6.nodeDeleteButtonMouseOut(event);
      });

      // set node drag move event
      conceptMapNode.setDragMove(function (event) {
        _this6.nodeDragMove(event);
      });
    }

    /**
     * Set an element to be highlighted. The element can be a node or a link.
     * @param element a node or link
     */

  }, {
    key: 'setHighlightedElement',
    value: function setHighlightedElement(element) {

      // remove highlighting from any existing element
      this.clearHighlightedElement();

      // hide the link type chooser
      this.hideLinkTypeChooser();

      if (element != null) {

        // remember the highlighted element
        this.highlightedElement = element;

        // set the higlighted value to true for the element
        element.isHighlighted(true);

        // show the delete button for the element
        element.showDeleteButton();

        if (element.constructor.name == 'ConceptMapNode') {
          // the element is a node

          // show the border
          element.showBorder();
        } else if (element.constructor.name == 'ConceptMapLink') {
          // the element is a link

          // show the link type chooser
          this.showLinkTypeChooser();

          // select the link type that was previously chosen for the link
          this.selectedLinkType = element.getOriginalId();
        }
      }
    }

    /**
     * If an element is highlighted, make it no longer highlighted.
     */

  }, {
    key: 'clearHighlightedElement',
    value: function clearHighlightedElement() {

      if (this.highlightedElement != null) {

        if (this.highlightedElement.constructor.name == 'ConceptMapNode') {
          // the highlighted element is a node

          // hide the border
          this.highlightedElement.hideBorder();
        } else if (this.highlightedElement.constructor.name == 'ConceptMapLink') {
          // the element is a link

          // hide the link type chooser
          this.hideLinkTypeChooser();
        }

        // set the higlighted value to false for the element
        this.highlightedElement.isHighlighted(false);

        // hide the delete button
        this.highlightedElement.hideDeleteButton();

        // clear the highlighted element reference
        this.highlightedElement = null;
      }
    }

    /**
     * Enable node dragging
     */

  }, {
    key: 'enableNodeDragging',
    value: function enableNodeDragging() {

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var node = this.nodes[n];

        if (node != null) {

          // get the node group
          var group = node.getGroup();

          if (group != null) {

            /*
             * get the bounds that we will allow the node group to
             * dragged in
             */
            var options = {
              minX: 0,
              minY: 0,
              maxX: this.width,
              maxY: this.height
            };

            // make the node group draggable
            group.draggable(options);
          }
        }
      }
    }

    /**
     * Disable node dragging. This will be called when the student creates a
     * link so that they aren't dragging nodes around at the same time as
     * creating a link.
     */

  }, {
    key: 'disableNodeDragging',
    value: function disableNodeDragging() {

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var node = this.nodes[n];

        if (node != null) {

          // get a node group
          var group = node.getGroup();

          if (group != null) {
            // make the group not draggable
            group.draggable(false);
          }
        }
      }
    }

    /**
     * Move the link text group to the front
     */

  }, {
    key: 'moveLinkTextToFront',
    value: function moveLinkTextToFront() {

      // loop through all the links
      for (var l = 0; l < this.links.length; l++) {
        var link = this.links[l];

        if (link != null) {
          // move the link text group to the front
          link.moveTextGroupToFront();
        }
      }
    }

    /**
     * Move the nodes to the front so that they show up above links
     */

  }, {
    key: 'moveNodesToFront',
    value: function moveNodesToFront() {

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var node = this.nodes[n];

        if (node != null) {

          // get a node group
          var group = node.getGroup();

          if (group != null) {
            // move the node group to the front
            group.front();
          }
        }
      }
    }

    /**
     * Add a node to our array of nodes
     * @param node the node to add
     */

  }, {
    key: 'addNode',
    value: function addNode(node) {
      if (node != null) {
        this.nodes.push(node);
      }
    }

    /**
     * Remove a node from the svg and our array of nodes
     * @param node the node to remove
     */

  }, {
    key: 'removeNode',
    value: function removeNode(node) {

      if (node != null) {

        // get the outgoing links from the node
        var outgoingLinks = node.getOutgoingLinks();

        if (outgoingLinks != null) {

          // get the number of outgoing links
          var numOutgoingLinks = outgoingLinks.length;

          // loop until we have removed all the outgoing links
          while (numOutgoingLinks > 0) {
            // get an outgoing link
            var outgoingLink = outgoingLinks[0];

            // remove the link from the svg and from our array of links
            this.removeLink(outgoingLink);

            // decrement the number of outgoing links counter
            numOutgoingLinks--;
          }
        }

        // get the incoming links to the node
        var incomingLinks = node.getIncomingLinks();

        if (incomingLinks != null) {

          // get the number of incoming links
          var numIncomingLinks = incomingLinks.length;

          // loop until we have removed all the incoming links
          while (numIncomingLinks > 0) {
            // get an incoming link
            var incomingLink = incomingLinks[0];

            // remove the link from the svg and from our array of links
            this.removeLink(incomingLink);

            // decrement the number of incoming links counter
            numIncomingLinks--;
          }
        }

        // remove the node from the svg
        node.remove();

        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
          var tempNode = this.nodes[n];

          if (tempNode == node) {
            // we have found the node we want to remove
            this.nodes.splice(n, 1);
            break;
          }
        }
      }
    }

    /**
     * Remove all nodes from the svg and our array of nodes
     */

  }, {
    key: 'removeAllNodes',
    value: function removeAllNodes() {

      // loop through all the nodes
      for (var n = 0; n < this.nodes.length; n++) {
        var tempNode = this.nodes[n];

        // remove the node from the svg
        tempNode.remove();
      }

      // clear the nodes array
      this.nodes = [];
    }

    /**
     * Get a node by id.
     * @param id the node id
     * @returns the node with the given id or null
     */

  }, {
    key: 'getNodeById',
    value: function getNodeById(id) {
      var node = null;

      if (id != null) {

        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
          var tempNode = this.nodes[n];
          var tempNodeId = tempNode.getId();

          if (id == tempNodeId) {
            // we have found the node we want
            node = tempNode;
            break;
          }
        }
      }

      return node;
    }

    /**
     * Get a node by id.
     * @param groupId the svg group id
     * @returns the node with the given id or null
     */

  }, {
    key: 'getNodeByGroupId',
    value: function getNodeByGroupId(groupId) {
      var node = null;

      if (groupId != null) {

        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
          var tempNode = this.nodes[n];
          var tempNodeGroupId = tempNode.getGroupId();

          if (groupId == tempNodeGroupId) {
            // we have found the node we want
            node = tempNode;
            break;
          }
        }
      }

      return node;
    }

    /**
     * Get a link by id.
     * @param id the link id
     * @returns the link with the given id or null
     */

  }, {
    key: 'getLinkById',
    value: function getLinkById(id) {
      var link = null;

      if (id != null) {

        // loop through all the links
        for (var l = 0; l < this.links.length; l++) {
          var tempLink = this.links[l];
          var tempLinkId = tempLink.getId();

          if (groupId == tempLinkId) {
            // we have found the link we want
            link = tempLink;
            break;
          }
        }
      }

      return link;
    }

    /**
     * Get a link by group id.
     * @param groupId the svg group id
     * @returns the link with the given group id or null
     */

  }, {
    key: 'getLinkByGroupId',
    value: function getLinkByGroupId(groupId) {
      var link = null;

      if (groupId != null) {

        // loop through all the links
        for (var l = 0; l < this.links.length; l++) {
          var tempLink = this.links[l];
          var tempLinkGroupId = tempLink.getGroupId();

          if (groupId == tempLinkGroupId) {
            // we have found the link we want
            link = tempLink;
            break;
          }
        }
      }

      return link;
    }

    /**
     * Get a node by its connector id.
     * @param connectorId the svg circle id of the connector
     * @returns the node with the associated connector or null
     */

  }, {
    key: 'getNodeByConnectorId',
    value: function getNodeByConnectorId(connectorId) {
      var node = null;

      if (connectorId != null) {

        // loop through all the nodes
        for (var n = 0; n < this.nodes.length; n++) {
          var tempNode = this.nodes[n];

          // get the connector id
          var tempConnectorId = tempNode.getConnectorId();

          if (connectorId == tempConnectorId) {
            // we have found the node we want
            node = tempNode;
            break;
          }
        }
      }

      return node;
    }

    /**
     * Remove a node by id. The id of a node is the same as its svg group id.
     * @param groupId
     */

  }, {
    key: 'removeNodeById',
    value: function removeNodeById(groupId) {
      if (groupId != null) {

        // loop through all the nodse
        for (var n = 0; n < this.nodes.length; n++) {
          var tempNode = this.nodes[n];
          var tempNodeId = tempNode.getId();

          if (groupId == tempNodeId) {
            // we have found the node we want to remove
            this.nodes.splice(n, 1);
            break;
          }
        }
      }
    }

    /**
     * Add a link to our array of links
     * @param link the link to add
     */

  }, {
    key: 'addLink',
    value: function addLink(link) {
      if (link != null) {
        this.links.push(link);
      }
    }

    /**
     * Remove a link from the svg and our array of links
     * @param link the link to remove
     */

  }, {
    key: 'removeLink',
    value: function removeLink(link) {

      if (link != null) {

        // remove the link from the svg
        link.remove();

        // loop through all the links
        for (var l = 0; l < this.links.length; l++) {
          var tempLink = this.links[l];

          if (link == tempLink) {
            // we have found the link we want to remove
            this.links.splice(l, 1);
            break;
          }
        }
      }
    }

    /**
     * Remove all the links from the svg and from our array of links
     */

  }, {
    key: 'removeAllLinks',
    value: function removeAllLinks() {

      // loop through all the links
      for (var l = 0; l < this.links.length; l++) {
        var tempLink = this.links[l];

        // remove the link from the svg
        tempLink.remove();
      }

      // clear the links array
      this.links = [];
    }

    /**
     * Called when the mouse moves over a node
     * @param event the mouse over event
     */

  }, {
    key: 'nodeMouseOver',
    value: function nodeMouseOver(event) {

      // get the node group id
      var groupId = event.target.parentElement.id;

      if (groupId != null) {

        // get the node
        var node = this.getNodeByGroupId(groupId);

        if (node != null) {
          /*
           * make the node active so that the border and delete button
           * shows
           */
          this.setActiveNode(node);
        }
      }
    }

    /**
     * Called when the mouse moves out of a node
     * @param event the mouse out event
     */

  }, {
    key: 'nodeMouseOut',
    value: function nodeMouseOut(event) {

      // get the group id of the node
      var groupId = event.target.parentElement.id;

      if (groupId != null) {

        // get the node
        var node = this.getNodeByGroupId(groupId);

        if (node != null) {
          // make the node inactive by clearing the active node
          this.clearActiveNode();
        }
      }
    }

    /**
     * Called when the mouse is clicked down on a node
     * @param event the mouse down event
     */

  }, {
    key: 'nodeMouseDown',
    value: function nodeMouseDown(event) {

      if (event.target.parentElement != null) {

        // get the group id of the node
        var groupId = event.target.parentElement.id;

        if (groupId != null) {

          // get the node
          var node = this.getNodeByGroupId(groupId);

          if (node != null) {
            // make the node highlighted
            this.setHighlightedElement(node);
          }
        }
      }
    }

    /**
     * Called when the mouse is released on a node
     * @param event the mouse up event
     */

  }, {
    key: 'nodeMouseUp',
    value: function nodeMouseUp(event) {

      if (this.drawingLink && this.activeLink != null) {
        /*
         * the student is creating a link and has just released the mouse
         * over a node to connect the destination node of the link
         */

        // get the group id of the node
        var groupId = event.target.parentElement.id;

        if (groupId != null) {

          // get the node
          var node = this.getNodeByGroupId(groupId);

          if (node != null) {

            // get the source node of the link
            var sourceNode = this.activeLink.sourceNode;
            var sourceNodeGroupId = sourceNode.getGroupId();

            if (sourceNodeGroupId == groupId) {
              /*
               * if the source of the link is the same as the
               * destination node, we will not connect the link
               */
              this.activeLink.remove();
              this.activeLink = null;
            } else {
              /*
               * the source node is different than the destination
               * node so we will connect the link
               */

              // set the destination node of the link
              this.activeLink.setDestination(node);

              // make the link the active link
              this.addLink(this.activeLink);

              // highlight the link
              this.setHighlightedElement(this.activeLink);

              /*
               * set the link as a newly created link so that if the
               * student clicks the cancel button, we will remove
               * the link
               */
              this.newlyCreatedLink = this.activeLink;

              // display the modal overlay
              this.displayLinkTypeChooserModalOverlay = true;

              // handle the student data changing
              this.studentDataChanged();
            }
          }
        }
      }

      // the link has been connected so we are no longer drawing the link
      this.drawingLink = false;
    }

    /**
     * Called when a link delete button is clicked
     * @param event the mouse click event
     * @param link the link to delete
     */

  }, {
    key: 'linkDeleteButtonClicked',
    value: function linkDeleteButtonClicked(event, link) {

      if (link != null) {

        // remove the link from our array of links
        this.removeLink(link);

        // handle the student data changing
        this.studentDataChanged();
      }

      // hide the link type chooser
      this.hideLinkTypeChooser();
    }

    /**
     * Called when the mouse is clicked down on a connector. This will start
     * creating a link.
     * @param event the mouse down event
     */

  }, {
    key: 'connectorMouseDown',
    value: function connectorMouseDown(event) {

      // set the flag that we are drawing a link
      this.drawingLink = true;

      // get the connector (the svg circle)
      var connector = event.target;

      /*
       * disable node dragging so that the node isn't dragged when the
       * link head is being dragged
       */
      this.disableNodeDragging();

      // get the node
      var node = this.getNodeByConnectorId(connector.id);

      // get the center of the image
      var x = node.cx();
      var y = node.cy();

      // get a new ConceptMapLinkId e.g. 'studentLink3'
      var newConceptMapLinkId = this.getNewConceptMapLinkId();

      /*
       * we will not know what the original id is until the student has
       * selected a link type
       */
      var originalId = null;

      // create a link that comes out of the node
      var link = this.ConceptMapService.newConceptMapLink(this.draw, newConceptMapLinkId, originalId, node);

      // set the link mouse events
      this.setLinkMouseEvents(link);

      // remember the active link
      this.activeLink = link;

      // flag for determining if we have set the link curvature
      this.linkCurvatureSet = false;

      // remember the location of the center of the connector
      this.activeLinkStartX = node.connectorCX();
      this.activeLinkStartY = node.connectorCY();

      // highlight the link
      this.setHighlightedElement(link);

      // clear the active node
      this.clearActiveNode();

      // make the source node the active node
      this.setActiveNode(node);
    }

    /**
     * Set the link mouse events for a link
     * @param link the ConceptMapLink
     */

  }, {
    key: 'setLinkMouseEvents',
    value: function setLinkMouseEvents(link) {
      var _this7 = this;

      // set the link mouse down listener
      link.setLinkMouseDown(function (event) {
        _this7.linkMouseDown(event);
      });

      // set the link text mouse down listener
      link.setLinkTextMouseDown(function (event) {
        _this7.linkTextMouseDown(event);
      });

      // set the link mouse over listener
      link.setLinkMouseOver(function (event) {
        _this7.linkMouseOver(event);
      });

      // set the link mouse out listener
      link.setLinkMouseOut(function (event) {
        _this7.linkMouseOut(event);
      });

      // set the delete button clicked event for the link
      link.setDeleteButtonClicked(function (event) {
        _this7.linkDeleteButtonClicked(event, link);
      });
    }

    /**
     * Called when the mouse is clicked down on a link
     * @param event the mouse down event
     */

  }, {
    key: 'linkMouseDown',
    value: function linkMouseDown(event) {

      // get the group id
      var groupId = this.getGroupId(event.target);

      // get the link
      var link = this.getLinkByGroupId(groupId);

      if (link != null) {
        // make the link highlighted
        this.setHighlightedElement(link);
      }
    }

    /**
     * Called when the mouse is clicked down on a link text
     * @param event the mouse down event
     */

  }, {
    key: 'linkTextMouseDown',
    value: function linkTextMouseDown(event) {

      var linkGroupId = null;

      /*
       * the link group id is set into the text group in the linkGroupId
       * variable. the text group hierarchy looks like this
       * text group > text > tspan
       * text group > rect
       */
      if (event.target.nodeName == 'tspan') {
        linkGroupId = event.target.parentElement.parentElement.linkGroupId;
      } else if (event.target.nodeName == 'text') {
        linkGroupId = event.target.parentElement.linkGroupId;
      } else if (event.target.nodeName == 'rect') {
        linkGroupId = event.target.parentElement.linkGroupId;
      }

      if (linkGroupId != null) {

        // get the link
        var link = this.getLinkByGroupId(linkGroupId);

        if (link != null) {
          // make the link highlighted
          this.setHighlightedElement(link);
        }
      }
    }

    /**
     * Called when the mouse is over a link
     * @param event the mouse over event
     */

  }, {
    key: 'linkMouseOver',
    value: function linkMouseOver(event) {

      // get the group id
      var groupId = this.getGroupId(event.target);

      // get the link
      var link = this.getLinkByGroupId(groupId);

      if (link != null) {
        // show the delete button for the link
        link.showDeleteButton();
      }
    }

    /**
     * Called when the mouse moves out of a link
     * @param event the mouse out event
     */

  }, {
    key: 'linkMouseOut',
    value: function linkMouseOut(event) {

      // get the group id
      var groupId = this.getGroupId(event.target);

      // get the link
      var link = this.getLinkByGroupId(groupId);

      // hide the delete button if the link is not the highlighted link
      if (link != null && link != this.highlightedElement) {
        link.hideDeleteButton();
      }
    }

    /**
     * Called when the mouse is clicked down on the delete button of a node
     * @param event the mouse down event
     */

  }, {
    key: 'nodeDeleteButtonMouseDown',
    value: function nodeDeleteButtonMouseDown(event) {

      if (event.target.parentElement != null) {

        // get the group id
        var groupId = event.target.parentElement.parentElement.id;

        // get the node
        var node = this.getNodeByGroupId(groupId);

        if (node != null) {

          // remove the node from our array of nodes
          this.removeNode(node);

          // handle the student data changing
          this.studentDataChanged();
        }
      }
    }

    /**
     * Called when the mouse is over a node delete button
     * @param event the mouse over event
     */

  }, {
    key: 'nodeDeleteButtonMouseOver',
    value: function nodeDeleteButtonMouseOver(event) {

      // get the node group id
      var groupId = event.target.parentElement.parentElement.id;

      if (groupId != null) {

        // get the node
        var node = this.getNodeByGroupId(groupId);

        if (node != null) {
          /*
           * make the node active so that the border and delete button
           * shows
           */
          this.setActiveNode(node);
        }
      }
    }

    /**
     * Called when the mouse moves out of a node delete button
     * @param event the mouse over event
     */

  }, {
    key: 'nodeDeleteButtonMouseOut',
    value: function nodeDeleteButtonMouseOut(event) {

      // get the group id
      var groupId = event.target.parentElement.parentElement.id;

      // get the node
      var node = this.getNodeByGroupId(groupId);

      if (node != null) {
        // make the node inactive by clearing the active node
        this.clearActiveNode(node);
      }
    }

    /**
     * Called when the node is dragged
     * @param event the drag event
     */

  }, {
    key: 'nodeDragMove',
    value: function nodeDragMove(event) {

      // get the group id
      var groupId = event.target.id;

      // get the node
      var node = this.getNodeByGroupId(groupId);

      if (node != null) {
        // handle the node being dragged
        node.dragMove(event);
      }

      // handle the student data changing
      this.studentDataChanged();
    }

    /**
     * Get the group id of an element. All elements of a node or link are
     * contained in a group. These groups are the children of the main svg
     * element.
     * for example a node's image element will be located here
     * svg > group > image
     * for example a link's path element will be located here
     * svg > group > path
     *
     * @param element get the group id of this element
     * @returns the group id
     */

  }, {
    key: 'getGroupId',
    value: function getGroupId(element) {

      var groupId = null;
      var currentElement = element;
      var previousId = null;

      // loop until we have reached the svg element
      while (currentElement != null) {

        if (currentElement.tagName == 'svg') {
          // base case. we have found the svg element.

          // the group id will be the previous id we saw
          groupId = previousId;

          // set the current element to null so that the while loop ends
          currentElement = null;
        } else {
          // remember the element id
          previousId = currentElement.id;

          /*
           * set the current element to the parent to continue searching
           * up the hierarchy
           */
          currentElement = currentElement.parentElement;
        }
      }

      return groupId;
    }

    /**
     * Save the starter concept map
     */

  }, {
    key: 'saveStarterConceptMap',
    value: function saveStarterConceptMap() {

      var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToSaveTheStarterConceptMap'));

      if (answer) {
        // get the concept map data
        var conceptMapData = this.getConceptMapData();

        // set the starter concept map data
        this.authoringComponentContent.starterConceptMap = conceptMapData;

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Delete the starter concept map
     */

  }, {
    key: 'deleteStarterConceptMap',
    value: function deleteStarterConceptMap() {

      var answer = confirm(this.$translate('conceptMap.areYouSureYouWantToDeleteTheStarterConceptMap'));

      if (answer) {
        // set the starter concept map data
        this.authoringComponentContent.starterConceptMap = null;

        // clear the concept map
        this.clearConceptMap();

        /*
         * the author has made changes so we will save the component
         * content
         */
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Remove all the links and nodes
     */

  }, {
    key: 'clearConceptMap',
    value: function clearConceptMap() {

      // remove all the links from the svg and the array of links
      this.removeAllLinks();

      // remove all the nodes from the svg and the array of nodes
      this.removeAllNodes();
    }

    /**
     * Reset the concept map data. We will clear the concept map data and
     * if there is starter concept map data we will set it into the concept map.
     */

  }, {
    key: 'resetConceptMap',
    value: function resetConceptMap() {

      // ask the student if they are sure they want to reset their work
      var message = this.$translate('conceptMap.areYouSureYouWantToResetYourWork');
      var answer = confirm(message);

      if (answer) {
        // the student answered yes to reset their work

        // clear the concept map
        this.clearConceptMap();

        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // we will import work from another component
          this.handleConnectedComponents();
        } else if (this.componentContent.starterConceptMap != null) {

          // get the starter concept map
          var conceptMapData = this.componentContent.starterConceptMap;

          // populate the starter concept map data into the component
          this.populateConceptMapData(conceptMapData);
        }
      }
    }

    /**
     * Show the auto feedback that was generated when the student previously
     * clicked "Check Answer".
     */

  }, {
    key: 'showAutoFeedback',
    value: function showAutoFeedback() {

      // show the auto feedback in a modal dialog
      this.$mdDialog.show(this.$mdDialog.alert().parent(angular.element(document.querySelector('#' + this.feedbackContainerId))).clickOutsideToClose(true).title(this.$translate('FEEDBACK')).htmlContent(this.autoFeedbackString).ariaLabel(this.$translate('FEEDBACK')).ok(this.$translate('CLOSE')));
    }

    /**
     * Check if a component generates student work
     * @param component the component
     * @return whether the component generates student work
     */

  }, {
    key: 'componentHasWork',
    value: function componentHasWork(component) {
      var result = true;

      if (component != null) {
        result = this.ProjectService.componentHasWork(component);
      }

      return result;
    }

    /**
     * The authoring view show save button checkbox was clicked
     */

  }, {
    key: 'authoringViewShowSaveButtonClicked',
    value: function authoringViewShowSaveButtonClicked() {

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * The authoring view show submit button checkbox was clicked
     */

  }, {
    key: 'authoringViewShowSubmitButtonClicked',
    value: function authoringViewShowSubmitButtonClicked() {

      if (!this.authoringComponentContent.showSubmitButton) {
        /*
         * we are not showing the submit button to the student so
         * we will clear the max submit count
         */
        this.authoringComponentContent.maxSubmitCount = null;
      }

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
     * Show the asset popup to allow the author to choose the background image
     */

  }, {
    key: 'chooseBackgroundImage',
    value: function chooseBackgroundImage() {

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
     * Show the asset popup to allow the author to choose an image for the node
     * @param conceptMapNodeId the id of the node in the concept map
     */

  }, {
    key: 'chooseNodeImage',
    value: function chooseNodeImage(conceptMapNodeId) {
      // generate the parameters
      var params = {};
      params.isPopup = true;
      params.nodeId = this.nodeId;
      params.componentId = this.componentId;
      params.target = conceptMapNodeId;

      // display the asset chooser
      this.$rootScope.$broadcast('openAssetChooser', params);
    }

    /**
     * Check whether we need to show the snip button
     * @return whether to show the snip button
     */

  }, {
    key: 'showSnipButton',
    value: function showSnipButton() {
      if (this.NotebookService.isNotebookEnabled() && this.isSnipButtonVisible) {
        return true;
      } else {
        return false;
      }
    }

    /**
     * Snip the concept map by converting it to an image
     * @param $event the click event
     */

  }, {
    key: 'snip',
    value: function snip($event) {
      var _this8 = this;

      // get the svg element. this will obtain an array.
      var svgElement = angular.element('#svg_' + this.nodeId + '_' + this.componentId);

      if (svgElement != null && svgElement.length > 0) {
        // get the svg element
        svgElement = svgElement[0];

        // get the svg element as a string
        var serializer = new XMLSerializer();
        var svgString = serializer.serializeToString(svgElement);

        // find all the images in the svg and replace them with Base64 images
        this.ConceptMapService.getHrefToBase64ImageReplacements(svgString).then(function (images) {

          /*
           * Loop through all the image objects. Each object contains
           * an image href and a Base64 image.
           */
          for (var i = 0; i < images.length; i++) {

            // get an image object
            var imagePair = images[i];

            // get the image href e.g. /wise/curriculum/25/assets/Sun.png
            var imageHref = imagePair.imageHref;

            // get the Base64 image
            var base64Image = imagePair.base64Image;

            // create a regex to match the image href
            var imageRegEx = new RegExp(imageHref, 'g');

            /*
             * replace all the instances of the image href with the
             * Base64 image
             */
            svgString = svgString.replace(imageRegEx, base64Image);
          }

          // create a canvas to draw the image on
          var myCanvas = document.createElement('canvas');
          var ctx = myCanvas.getContext('2d');

          // create an svg blob
          var svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
          var domURL = self.URL || self.webkitURL || self;
          var url = domURL.createObjectURL(svg);
          var image = new Image();

          /*
           * set the UtilService in a local variable so we can access it
           * in the onload callback function
           */
          var thisUtilService = _this8.UtilService;

          // the function that is called after the image is fully loaded
          image.onload = function (event) {

            // get the image that was loaded
            var image = event.target;

            // set the dimensions of the canvas
            myCanvas.width = image.width;
            myCanvas.height = image.height;
            ctx.drawImage(image, 0, 0);

            // get the canvas as a Base64 string
            var base64Image = myCanvas.toDataURL('image/png');

            // get the image object
            var imageObject = thisUtilService.getImageObjectFromBase64String(base64Image, false);

            // create a notebook item with the image populated into it
            _this8.NotebookService.addNote($event, imageObject);
          };

          // set the src of the image so that the image gets loaded
          image.src = url;
        });
      }
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'addConnectedComponent',
    value: function addConnectedComponent() {

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

  }, {
    key: 'deleteConnectedComponent',
    value: function deleteConnectedComponent(index) {

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

  }, {
    key: 'setShowSubmitButtonValue',
    value: function setShowSubmitButtonValue(show) {

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
      this.$scope.$emit('componentShowSubmitButtonValueChanged', { nodeId: this.nodeId, componentId: this.componentId, showSubmitButton: show });
    }

    /**
     * The showSubmitButton value has changed
     */

  }, {
    key: 'showSubmitButtonValueChanged',
    value: function showSubmitButtonValueChanged() {

      /*
       * perform additional processing for when we change the showSubmitButton
       * value
       */
      this.setShowSubmitButtonValue(this.authoringComponentContent.showSubmitButton);

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Add a tag
     */

  }, {
    key: 'addTag',
    value: function addTag() {

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

  }, {
    key: 'moveTagUp',
    value: function moveTagUp(index) {

      if (index > 0) {
        // the index is not at the top so we can move it up

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'moveTagDown',
    value: function moveTagDown(index) {

      if (index < this.authoringComponentContent.tags.length - 1) {
        // the index is not at the bottom so we can move it down

        // remember the tag
        var tag = this.authoringComponentContent.tags[index];

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

  }, {
    key: 'deleteTag',
    value: function deleteTag(index) {

      // ask the author if they are sure they want to delete the tag
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisTag'));

      if (answer) {
        // the author answered yes to delete the tag

        // remove the tag
        this.authoringComponentContent.tags.splice(index, 1);
      }

      // the authoring component content has changed so we will save the project
      this.authoringViewComponentChanged();
    }

    /**
     * Import any work we need from connected components
     */

  }, {
    key: 'handleConnectedComponents',
    value: function handleConnectedComponents() {

      // get the connected components
      var connectedComponents = this.componentContent.connectedComponents;

      if (connectedComponents != null) {

        var componentStates = [];

        // loop through all the connected components
        for (var c = 0; c < connectedComponents.length; c++) {
          var connectedComponent = connectedComponents[c];

          if (connectedComponent != null) {
            var nodeId = connectedComponent.nodeId;
            var componentId = connectedComponent.componentId;
            var type = connectedComponent.type;

            if (type == 'showWork') {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }

              // we are showing work so we will not allow the student to edit it
              this.isDisabled = true;
            } else if (type == 'importWork' || type == null) {
              // we are getting the work from this student

              // get the latest component state from the component
              var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);

              if (componentState != null) {
                componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
              }
            }
          }
        }

        // merge the student responses from all the component states
        var mergedComponentState = this.createMergedComponentState(componentStates);

        // set the student work into the component
        this.setStudentWork(mergedComponentState);

        // make the work dirty so that it gets saved
        this.studentDataChanged();
      }
    }

    /**
     * Create a component state with the merged student responses
     * @param componentStates an array of component states
     * @return a component state with the merged student responses
     */

  }, {
    key: 'createMergedComponentState',
    value: function createMergedComponentState(componentStates) {

      // create a new component state
      var mergedComponentState = this.NodeService.createNewComponentState();

      if (componentStates != null) {

        var mergedNodes = [];
        var mergedLinks = [];
        var backgroundPath = null;
        var stretchBackground = null;

        // loop through all the component state
        for (var c = 0; c < componentStates.length; c++) {
          var componentState = componentStates[c];

          if (componentState.componentType == 'ConceptMap') {
            var studentData = componentState.studentData;

            if (studentData != null) {

              var conceptMapData = studentData.conceptMapData;

              if (conceptMapData != null) {
                if (conceptMapData.nodes != null) {
                  // add the nodes to our merged nodes
                  mergedNodes = mergedNodes.concat(conceptMapData.nodes);
                }

                if (conceptMapData.links != null) {
                  // add the links to our merged links
                  mergedLinks = mergedLinks.concat(conceptMapData.links);
                }

                if (conceptMapData.backgroundPath != null && conceptMapData.backgroundPath != '') {
                  backgroundPath = conceptMapData.backgroundPath;
                  stretchBackground = conceptMapData.stretchBackground;
                }
              }
            }
          } else if (componentState.componentType == 'Draw' || componentState.componentType == 'Embedded' || componentState.componentType == 'Graph' || componentState.componentType == 'Label' || componentState.componentType == 'Table') {
            var connectedComponent = this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
            if (connectedComponent.importWorkAsBackground === true) {
              this.setComponentStateAsBackgroundImage(componentState);
            }
          }
        }

        if (this.componentContent.background != null && this.componentContent.background != '') {
          // use the background from this component
          backgroundPath = this.componentContent.background;
          if (this.componentContent.stretchBackground) {
            stretchBackground = this.componentContent.stretchBackground;
          }
        }

        // set the merged nodes and links into the merged component state
        mergedComponentState.studentData = {};
        mergedComponentState.studentData.conceptMapData = {};
        mergedComponentState.studentData.conceptMapData.nodes = mergedNodes;
        mergedComponentState.studentData.conceptMapData.links = mergedLinks;
        mergedComponentState.studentData.conceptMapData.backgroundPath = backgroundPath;
        if (stretchBackground != null) {
          mergedComponentState.studentData.conceptMapData.stretchBackground = stretchBackground;
        }
      }

      /*
       * inject the asset path so that the file name is changed to
       * a relative path
       * e.g.
       * "Sun.png"
       * will be changed to
       * "/wise/curriculum/108/assets/Sun.png"
       */
      mergedComponentState = this.ProjectService.injectAssetPaths(mergedComponentState);

      return mergedComponentState;
    }

    /**
     * Create an image from a component state and set the image as the background.
     * @param componentState A component state.
     */

  }, {
    key: 'setComponentStateAsBackgroundImage',
    value: function setComponentStateAsBackgroundImage(componentState) {
      var _this9 = this;

      this.UtilService.generateImageFromComponentState(componentState).then(function (image) {
        _this9.setBackgroundImage(image.url);
      });
    }

    /**
     * Add a connected component
     */

  }, {
    key: 'authoringAddConnectedComponent',
    value: function authoringAddConnectedComponent() {

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

  }, {
    key: 'authoringAutomaticallySetConnectedComponentComponentIdIfPossible',
    value: function authoringAutomaticallySetConnectedComponentComponentIdIfPossible(connectedComponent) {
      if (connectedComponent != null) {
        var components = this.getComponentsByNodeId(connectedComponent.nodeId);
        if (components != null) {
          var numberOfAllowedComponents = 0;
          var allowedComponent = null;
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = components[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var component = _step.value;

              if (component != null) {
                if (this.isConnectedComponentTypeAllowed(component.type) && component.id != this.componentId) {
                  // we have found a viable component we can connect to
                  numberOfAllowedComponents += 1;
                  allowedComponent = component;
                }
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
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

  }, {
    key: 'authoringDeleteConnectedComponent',
    value: function authoringDeleteConnectedComponent(index) {

      // ask the author if they are sure they want to delete the connected component
      var answer = confirm(this.$translate('areYouSureYouWantToDeleteThisConnectedComponent'));

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

  }, {
    key: 'authoringGetConnectedComponentType',
    value: function authoringGetConnectedComponentType(connectedComponent) {

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

  }, {
    key: 'authoringConnectedComponentNodeIdChanged',
    value: function authoringConnectedComponentNodeIdChanged(connectedComponent) {
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

  }, {
    key: 'authoringConnectedComponentComponentIdChanged',
    value: function authoringConnectedComponentComponentIdChanged(connectedComponent) {

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

  }, {
    key: 'authoringSetImportWorkAsBackgroundIfApplicable',
    value: function authoringSetImportWorkAsBackgroundIfApplicable(connectedComponent) {
      var componentType = this.authoringGetConnectedComponentType(connectedComponent);
      if (componentType == 'Draw' || componentType == 'Embedded' || componentType == 'Graph' || componentType == 'Label' || componentType == 'Table') {
        connectedComponent.importWorkAsBackground = true;
      } else {
        delete connectedComponent.importWorkAsBackground;
      }
    }

    /**
     * The connected component type has changed
     * @param connectedComponent the connected component that changed
     */

  }, {
    key: 'authoringConnectedComponentTypeChanged',
    value: function authoringConnectedComponentTypeChanged(connectedComponent) {

      if (connectedComponent != null) {

        if (connectedComponent.type == 'importWork') {
          /*
           * the type has changed to import work
           */
        } else if (connectedComponent.type == 'showWork') {}
        /*
         * the type has changed to show work
         */


        // the authoring component content has changed so we will save the project
        this.authoringViewComponentChanged();
      }
    }

    /**
     * Check if we are allowed to connect to this component type
     * @param componentType the component type
     * @return whether we can connect to the component type
     */

  }, {
    key: 'isConnectedComponentTypeAllowed',
    value: function isConnectedComponentTypeAllowed(componentType) {

      if (componentType != null) {

        var allowedConnectedComponentTypes = this.allowedConnectedComponentTypes;

        // loop through the allowed connected component types
        for (var a = 0; a < allowedConnectedComponentTypes.length; a++) {
          var allowedConnectedComponentType = allowedConnectedComponentTypes[a];

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
     * Set the background image on the svg canvas
     * @param backgroundPath the absolute path to the background image
     * @param stretchBackground whether to stretch the background to cover the
     * whole svg background
     */

  }, {
    key: 'setBackgroundImage',
    value: function setBackgroundImage(backgroundPath, stretchBackground) {
      this.background = backgroundPath;
      this.stretchBackground = stretchBackground;

      if (stretchBackground) {
        // stretch the background to fit the whole svg element
        this.backgroundSize = '100% 100%';
      } else {
        // use the original dimensions of the background image
        this.backgroundSize = '';
      }
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

    /**
     * The "Import Work As Background" checkbox was clicked.
     * @param connectedComponent The connected component associated with the
     * checkbox.
     */

  }, {
    key: 'authoringImportWorkAsBackgroundClicked',
    value: function authoringImportWorkAsBackgroundClicked(connectedComponent) {
      if (!connectedComponent.importWorkAsBackground) {
        delete connectedComponent.importWorkAsBackground;
      }
      this.authoringViewComponentChanged();
    }
  }]);

  return ConceptMapController;
}(_componentController2.default);

;

ConceptMapController.$inject = ['$anchorScroll', '$filter', '$location', '$mdDialog', '$q', '$rootScope', '$scope', '$timeout', 'AnnotationService', 'ConceptMapService', 'ConfigService', 'CRaterService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentAssetService', 'StudentDataService', 'UtilService'];

exports.default = ConceptMapController;
//# sourceMappingURL=conceptMapController.js.map

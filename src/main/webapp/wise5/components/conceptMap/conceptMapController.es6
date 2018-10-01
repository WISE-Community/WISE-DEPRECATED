'use strict';

import 'svg.js';
import 'svg.draggable.js';
import ComponentController from '../componentController';

class ConceptMapController extends ComponentController {
  constructor($anchorScroll,
      $filter,
      $location,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      $timeout,
      AnnotationService,
      ConceptMapService,
      ConfigService,
      CRaterService,
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
    this.$anchorScroll = $anchorScroll;
    this.$location = $location;
    this.$q = $q;
    this.$timeout = $timeout;
    this.ConceptMapService = ConceptMapService;
    this.CRaterService = CRaterService;

    // holds the text that the student has typed
    this.studentResponse = '';

    // the latest annotations
    this.latestAnnotations = null;

    // used to hold a message dialog if we need to use one
    this.messageDialog = null;

    // default width and height for the svg
    this.width = 800;
    this.height = 600;

    // the available nodes the students can choose
    this.availableNodes = [];

    // the available links the students can choose
    this.availableLinks = [];

    // the node instances the students create
    this.nodes = [];

    // the link instances the students create
    this.links = [];

    // flag to display the link type chooser
    this.displayLinkTypeChooser = false;

    // flag to display the modal overlay for the link type chooser
    this.displayLinkTypeChooserModalOverlay = false;

    // the selected link type
    this.selectedLinkType = null;

    // flag for whether we have initialized the link type modal overlay
    this.initializedDisplayLinkTypeChooserModalOverlay = false;

    // default values for the modal width and height
    this.modalWidth = 800;
    this.modalHeight = 600;

    /*
     * used to remember the node the student has started dragging to create
     * so that we know what node to create once they let go off the mouse
     * on the svg element
     */
    this.selectedNode = null;

    /*
     * used to remember the offset of the mouse relative to the upper left
     * of the node image the student started dragging to create a new node
     * instance
     */
    this.tempOffsetX = 0;
    this.tempOffsetY = 0;

    let themePath = this.ProjectService.getThemePath();

    // the auto feedback string
    this.autoFeedbackString = '';

    this.setBackgroundImage(this.componentContent.background,
      this.componentContent.stretchBackground);

    // set the id of the svg and other display elements
    this.svgId = 'svg_' + this.$scope.nodeId + '_' + this.componentId;
    this.conceptMapContainerId = 'conceptMapContainer_' + this.$scope.nodeId + '_' + this.componentId;
    this.selectNodeBarId = 'selectNodeBar_' + this.$scope.nodeId + '_' + this.componentId;
    this.feedbackContainerId = 'feedbackContainer_' + this.$scope.nodeId + '_' + this.componentId;

    if (this.componentContent.width != null) {
      this.width = this.componentContent.width;
    }

    if (this.componentContent.height != null) {
      this.height = this.componentContent.height;
    }

    if (this.componentContent.showNodeLabels == null) {
      this.componentContent.showNodeLabels = true;
    }

    if (this.mode === 'student') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.availableNodes = this.componentContent.nodes;
      this.availableLinks = this.componentContent.links;
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;

      let componentState = this.$scope.componentState;

      if (componentState) {
        // set ids for the svg and other display elements using the componentStateId (so we have unique ids when showing revisions)
        /*
         * the student has work for this component so we will use
         * the node id, component id, and workgroup id, and
         * componentStateId for the svg id
         */
        let idInfo = this.nodeId + '_' + this.componentId + '_' + this.workgroupId + '_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          idInfo = '_gradingRevision_' + idInfo
          this.svgId = 'svg_' + idInfo;
          this.conceptMapContainerId = 'conceptMapContainer_' + idInfo;
          this.selectNodeBarId = 'selectNodeBar_' + idInfo;
          this.feedbackContainerId = 'feedbackContainer_' + idInfo;
        } else {
          this.svgId = 'svg_' + idInfo;
          this.conceptMapContainerId = 'conceptMapContainer_' + idInfo;
          this.selectNodeBarId = 'selectNodeBar_' + idInfo;
          this.feedbackContainerId = 'feedbackContainer_' + idInfo;
        }
      } else {
        /*
         * the student does not have any work for this component so
         * we will use the node id, component id, and workgroup id
         * for the svg id
         */
        let idInfo = this.nodeId + '_' + this.componentId + '_' + this.workgroupId;
        this.svgId = 'svg_' + idInfo;
        this.conceptMapContainerId = 'conceptMapContainer_' + idInfo;
        this.selectNodeBarId = 'selectNodeBar_' + idInfo;
        this.feedbackContainerId = 'feedbackContainer_' + idInfo;

      }
    } else if (this.mode === 'onlyShowWork') {
      this.isPromptVisible = false;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;

      var componentState = this.$scope.componentState;

      if (componentState == null) {
        /*
         * the student does not have any work for this component so
         * we will use the node id, component id, and workgroup id
         * for the svg id
         */
        this.svgId = 'svgOnlyShowWork_' + this.nodeId + '_' + this.componentId + '_' + this.workgroupId;
      } else {
        /*
         * the student has work for this component so we will use
         * the node id, component id, and component state id
         * for the svg id
         */
        this.svgId = 'svgOnlyShowWork_' + this.nodeId + '_' + this.componentId + '_' + componentState.id;
      }
    } else if (this.mode === 'showPreviousWork') {
      this.isPromptVisible = true;
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isDisabled = true;
    }

    /*
     * Call the initializeSVG() after a timeout so that angular has a
     * chance to set the svg element id before we start using it. If we
     * don't wait for the timeout, the svg id won't be set when we try
     * to start referencing the svg element.
     */
    this.$timeout(angular.bind(this, this.initializeSVG));

    /**
     * Returns true iff there is student work that hasn't been saved yet
     */
    this.$scope.isDirty = function() {
      return this.$scope.conceptMapController.isDirty;
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
        this.$scope.conceptMapController.createComponentState(action).then((componentState) => {
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
  }

  handleNodeSubmit() {
    this.submit('nodeSubmitButton');
  }

  /**
   * Initialize the SVG
   */
  initializeSVG() {

    // setup the svg
    this.setupSVG();

    var componentState = null;

    // get the component state from the scope
    componentState = this.$scope.componentState;

    if (this.mode == 'student') {
      if (this.UtilService.hasShowWorkConnectedComponent(this.componentContent)) {
        // we will show work from another component
        this.handleConnectedComponents();
      }  else if (this.ConceptMapService.componentStateHasStudentWork(componentState, this.componentContent)) {
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
        if (this.componentContent.starterConceptMap != null) {
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
      if (componentState == null) {
        this.populateStarterConceptMap();
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

    this.disableComponentIfNecessary();

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {

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

        this.processLatestStudentWork();
      }
    }
  };

  /**
   * Populate the concept map data into the component
   * @param conceptMapData the concept map data which contains an array
   * of nodes and an array of links
   */
  populateConceptMapData(conceptMapData) {

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
          var height = node.height

          // create a ConceptMapNode
          var conceptMapNode = this.ConceptMapService.newConceptMapNode(
              this.draw, instanceId, originalId, filePath, label,
              x, y, width, height, this.componentContent.showNodeLabels);

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

      if (conceptMapData.backgroundPath != null &&
          conceptMapData.backgroundPath != '') {
        this.setBackgroundImage(conceptMapData.backgroundPath,
          conceptMapData.stretchBackground);
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
      this.$timeout(() => {
        this.refreshLinkLabels();
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
  refreshLinkLabels() {
    for (let node of this.nodes) {
      if (node.showLabel) {
        var label = node.getLabel();
        /*
         * set the label back into the node so that the rectangle
         * around the text label is resized to the text
         */
        node.setLabel(label);
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
   * A submit was triggered by the component submit button or node submit button
   * @param submitTriggeredBy what triggered the submit
   * e.g. 'componentSubmitButton' or 'nodeSubmitButton'
   */
  submit(submitTriggeredBy) {

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
          message = this.$translate('conceptMap.youHaveOneChance', {numberOfSubmitsLeft: numberOfSubmitsLeft});
          performSubmit = confirm(message);
        } else if (numberOfSubmitsLeft > 1) {

          // ask the student if they are sure they want to submit
          message = this.$translate('conceptMap.youHaveMultipleChances', {numberOfSubmitsLeft: numberOfSubmitsLeft});
          performSubmit = confirm(message);
        }
      }

      if (performSubmit) {
        this.incrementSubmitCounter();

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
        var any = function() {
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
        var all = function() {
          return thisConceptMapService.all(componentContent, conceptMapData, arguments);
        }

        /*
         * create the setResult function that can be called in the custom rule
         * evaluator code
         */
        var setResult = function(result) {
          thisResult = result;
        }

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
          this.$mdDialog.show(
            this.$mdDialog.alert()
            .clickOutsideToClose(true)
            .title(this.$translate('FEEDBACK'))
            .htmlContent(resultString)
            .ariaLabel(this.$translate('FEEDBACK'))
            .ok(this.$translate('CLOSE'))
          );
        }

        // remember the feedback string
        this.autoFeedbackString = resultString;

        this.isSubmit = true;

        // tell the parent node that this component wants to submit
        this.$scope.$emit('componentSubmitTriggered', {nodeId: this.nodeId, componentId: this.componentId});
      } else {
        /*
         * the student has cancelled the submit so if a component state
         * is created, it will just be a regular save and not submit
         */
        this.isSubmit = false;
      }
    }
  };

  /**
   * Get the student response
   */
  getStudentResponse() {
    return this.studentResponse;
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
  };

  /**
   * Get the concept map data
   * @returns an object containing a array of nodes and an array of links
   */
  getConceptMapData() {
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
   * A link type was selected in the link type chooser popup
   * @param linkType the authored link object that was selected
   */
  linkTypeSelected(selectedLink) {

    if (this.highlightedElement != null &&
      this.highlightedElement.constructor.name == 'ConceptMapLink') {

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
    this.studentDataChanged();
  }

  /**
   * Get the links title
   * @returns the links title
   */
  getLinksTitle() {
    var linksTitle = '';

    if (this.componentContent != null) {
      linksTitle = this.componentContent.linksTitle;
    }

    return linksTitle;
  }

  /**
   * Show the link type chooser popup
   */
  showLinkTypeChooser() {

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
  hideLinkTypeChooser() {

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
  setupSVG() {
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
    this.draw.mousedown((event) => {
      this.svgMouseDown(event);
    });

    // set the mouse up listener
    this.draw.mouseup((event) => {
      this.svgMouseUp(event);
    });

    // set the mouse move listener
    this.draw.mousemove((event) => {
      this.svgMouseMove(event);
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
      svg[0].addEventListener('dragover', (event) => {
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
      svg[0].addEventListener('drop', (event) => {

        /*
         * the user has dropped a new node onto the svg to create a
         * new instance of a node
         */
        this.newNodeDropped(event);
      });

      this.addedDropListener = true;
    }

    // set the link type chooser style
    this.setLinkTypeChooserStyle();
  }

  /**
   * Set the link type chooser popup style
   */
  setLinkTypeChooserStyle() {

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
    }
  }

  /**
   * Set the link type chooser popup overlay style
   */
  setLinkTypeChooserOverlayStyle() {

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
    }
  }

  /**
   * Get the width that the modal overlay should be
   * @returns the width that the modal overlay should be
   */
  getModalWidth() {

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
  getModalHeight() {

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
  cancelLinkTypeChooser() {

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
  svgMouseDown(event) {
    if (event.target.tagName == 'svg') {
      // remove highlighting from any item that was previously highlighted
      this.clearHighlightedElement();
    }
  }

  /**
   * Called when the mouse is released
   * @param event the mouse up event
   */
  svgMouseUp(event) {

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
  svgMouseMove(event) {

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
  setActiveNode(node) {
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
  clearActiveNode() {

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
  getRelativeCoordinatesByEvent(event) {

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

      if (userAgent.indexOf('Chrome') != -1) {

      } else if (userAgent.indexOf('Firefox') != -1) {

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

    var returnObject = {}
    returnObject.x = x;
    returnObject.y = y;

    return returnObject;
  }

  /**
   * Called when the student clicks down on a node in the left node bar
   * @param $event the mouse down event
   * @param node the node the student clicked down on
   */
  selectNode($event, node) {

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
  newNodeDropped(event) {

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
      var conceptMapNode = this.ConceptMapService.newConceptMapNode(
          this.draw, newConceptMapNodeId, originalId, filePath, label,
          x, y, width, height, this.componentContent.showNodeLabels);

      // add the node to our array of nodes
      this.addNode(conceptMapNode);

      // set the mouse events on the node
      this.setNodeMouseEvents(conceptMapNode);

      // make the node highlighted
      this.setHighlightedElement(conceptMapNode);
      this.studentDataChanged();
    }

    // enable node dragging
    this.enableNodeDragging();
  }

  /**
   * Get a new ConceptMapNode id that isn't being used
   * @returns a new ConceptMapNode id e.g. 'studentNode3'
   */
  getNewConceptMapNodeId() {

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
  getNewConceptMapLinkId() {

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
  setNodeMouseEvents(conceptMapNode) {

    // set the node mouse over event
    conceptMapNode.setNodeMouseOver((event) => {
      this.nodeMouseOver(event);
    });

    // set the node mouse out event
    conceptMapNode.setNodeMouseOut((event) => {
      this.nodeMouseOut(event);
    });

    // set the connector mouse down event
    conceptMapNode.setConnectorMouseDown((event) => {
      this.disableNodeDragging();
      this.connectorMouseDown(event);
    });

    // set the node mouse down event
    conceptMapNode.setNodeMouseDown((event) => {
      this.nodeMouseDown(event);
    });

    // set the node mouse up event
    conceptMapNode.setNodeMouseUp((event) => {
      this.nodeMouseUp(event);
    });

    // set the delete button mouse down event
    conceptMapNode.setDeleteButtonMouseDown((event) => {
      this.nodeDeleteButtonMouseDown(event);
    });

    // set the delete button mouse over event
    conceptMapNode.setDeleteButtonMouseOver((event) => {
      this.nodeDeleteButtonMouseOver(event);
    });

    // set the delete button mouse out event
    conceptMapNode.setDeleteButtonMouseOut((event) => {
      this.nodeDeleteButtonMouseOut(event);
    });

    // set node drag move event
    conceptMapNode.setDragMove((event) => {
      this.nodeDragMove(event);
    });
  }

  /**
   * Set an element to be highlighted. The element can be a node or a link.
   * @param element a node or link
   */
  setHighlightedElement(element) {

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

      if(element.constructor.name == 'ConceptMapNode') {
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
  clearHighlightedElement() {

    if (this.highlightedElement != null) {

      if(this.highlightedElement.constructor.name == 'ConceptMapNode') {
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
  enableNodeDragging() {

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
  disableNodeDragging() {

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
  moveLinkTextToFront() {

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
  moveNodesToFront() {

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
  addNode(node) {
    if (node != null) {
      this.nodes.push(node);
    }
  }

  /**
   * Remove a node from the svg and our array of nodes
   * @param node the node to remove
   */
  removeNode(node) {

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
  removeAllNodes() {

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
  getNodeById(id) {
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
  getNodeByGroupId(groupId) {
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
  getLinkById(id) {
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
  getLinkByGroupId(groupId) {
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
  getNodeByConnectorId(connectorId) {
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
  removeNodeById(groupId) {
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
  addLink(link) {
    if (link != null) {
      this.links.push(link);
    }
  }

  /**
   * Remove a link from the svg and our array of links
   * @param link the link to remove
   */
  removeLink(link) {

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
  removeAllLinks() {

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
  nodeMouseOver(event) {

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
  nodeMouseOut(event) {

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
  nodeMouseDown(event) {

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
  nodeMouseUp(event) {

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
  linkDeleteButtonClicked(event, link) {

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
  connectorMouseDown(event) {

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
  setLinkMouseEvents(link) {

    // set the link mouse down listener
    link.setLinkMouseDown((event) => {
      this.linkMouseDown(event);
    });

    // set the link text mouse down listener
    link.setLinkTextMouseDown((event) => {
      this.linkTextMouseDown(event);
    });

    // set the link mouse over listener
    link.setLinkMouseOver((event) => {
      this.linkMouseOver(event);
    });

    // set the link mouse out listener
    link.setLinkMouseOut((event) => {
      this.linkMouseOut(event);
    });

    // set the delete button clicked event for the link
    link.setDeleteButtonClicked((event) => {
      this.linkDeleteButtonClicked(event, link);
    });
  }

  /**
   * Called when the mouse is clicked down on a link
   * @param event the mouse down event
   */
  linkMouseDown(event) {

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
  linkTextMouseDown(event) {

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
  linkMouseOver(event) {

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
  linkMouseOut(event) {

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
  nodeDeleteButtonMouseDown(event) {

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
  nodeDeleteButtonMouseOver(event) {

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
  nodeDeleteButtonMouseOut(event) {

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
  nodeDragMove(event) {

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
  getGroupId(element) {

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

  populateStarterConceptMap() {
    if (this.componentContent.starterConceptMap != null) {
      this.populateConceptMapData(this.componentContent.starterConceptMap);
    }
  }

  /**
   * Remove all the links and nodes
   */
  clearConceptMap() {

    // remove all the links from the svg and the array of links
    this.removeAllLinks();

    // remove all the nodes from the svg and the array of nodes
    this.removeAllNodes();
  }

  /**
   * Reset the concept map data. We will clear the concept map data and
   * if there is starter concept map data we will set it into the concept map.
   */
  resetConceptMap() {

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
  showAutoFeedback() {

    // show the auto feedback in a modal dialog
    this.$mdDialog.show(
      this.$mdDialog.alert()
      .parent(angular.element(document.querySelector('#' + this.feedbackContainerId)))
      .clickOutsideToClose(true)
      .title(this.$translate('FEEDBACK'))
      .htmlContent(this.autoFeedbackString)
      .ariaLabel(this.$translate('FEEDBACK'))
      .ok(this.$translate('CLOSE'))
    );
  }

  /**
   * Snip the concept map by converting it to an image
   * @param $event the click event
   */
  snip($event) {
    // get the svg element. this will obtain an array.
    var svgElement = angular.element('#svg_' + this.nodeId + '_' + this.componentId);

    if (svgElement != null && svgElement.length > 0) {
      // get the svg element
      svgElement = svgElement[0];

      // get the svg element as a string
      var serializer = new XMLSerializer();
      var svgString = serializer.serializeToString(svgElement);

      // find all the images in the svg and replace them with Base64 images
      this.ConceptMapService.getHrefToBase64ImageReplacements(svgString).then((images) => {

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
        var svg = new Blob([svgString], {type:'image/svg+xml;charset=utf-8'});
        var domURL = self.URL || self.webkitURL || self;
        var url = domURL.createObjectURL(svg);
        var image = new Image();

        /*
         * set the UtilService in a local variable so we can access it
         * in the onload callback function
         */
        var thisUtilService = this.UtilService;

        // the function that is called after the image is fully loaded
        image.onload = (event) => {

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
          this.NotebookService.addNote($event, imageObject);
        };

        // set the src of the image so that the image gets loaded
        image.src = url;
      });
    }
  }

  /**
   * Create a component state with the merged student responses
   * @param componentStates an array of component states
   * @return a component state with the merged student responses
   */
  createMergedComponentState(componentStates) {

    // create a new component state
    let mergedComponentState = this.NodeService.createNewComponentState();

    if (componentStates != null) {

      let mergedNodes = [];
      let mergedLinks = [];
      let backgroundPath = null;
      let stretchBackground = null;

      // loop through all the component state
      for (let c = 0; c < componentStates.length; c++) {
        let componentState = componentStates[c];

        if (componentState.componentType == 'ConceptMap') {
          let studentData = componentState.studentData;

          if (studentData != null) {

            let conceptMapData = studentData.conceptMapData;

            if (conceptMapData != null) {
              if (conceptMapData.nodes != null) {
                // add the nodes to our merged nodes
                mergedNodes = mergedNodes.concat(conceptMapData.nodes);
              }

              if (conceptMapData.links != null) {
                // add the links to our merged links
                mergedLinks = mergedLinks.concat(conceptMapData.links);
              }

              if (conceptMapData.backgroundPath != null &&
                  conceptMapData.backgroundPath != '') {
                backgroundPath = conceptMapData.backgroundPath;
                stretchBackground = conceptMapData.stretchBackground;
              }
            }
          }
        } else if (componentState.componentType == 'Draw' ||
            componentState.componentType == 'Embedded' ||
            componentState.componentType == 'Graph' ||
            componentState.componentType == 'Label' ||
            componentState.componentType == 'Table') {
          let connectedComponent =
              this.UtilService.getConnectedComponentByComponentState(this.componentContent, componentState);
          if (connectedComponent.importWorkAsBackground === true) {
            this.setComponentStateAsBackgroundImage(componentState);
          }
        }
      }

      if (this.componentContent.background != null &&
          this.componentContent.background != '') {
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
  setComponentStateAsBackgroundImage(componentState) {
    this.UtilService.generateImageFromComponentState(componentState).then((image) => {
      this.setBackgroundImage(image.url);
    });
  }

  /**
   * Set the background image on the svg canvas
   * @param backgroundPath the absolute path to the background image
   * @param stretchBackground whether to stretch the background to cover the
   * whole svg background
   */
  setBackgroundImage(backgroundPath, stretchBackground) {
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
}

ConceptMapController.$inject = [
  '$anchorScroll',
  '$filter',
  '$location',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  '$timeout',
  'AnnotationService',
  'ConceptMapService',
  'ConfigService',
  'CRaterService',
  'NodeService',
  'NotebookService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'UtilService'
];

export default ConceptMapController;

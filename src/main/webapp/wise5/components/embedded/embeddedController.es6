'use strict';

import ComponentController from "../componentController";
import html2canvas from 'html2canvas';
import iframeResizer from 'iframe-resizer';

class EmbeddedController extends ComponentController {
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
    super($filter, $mdDialog, $rootScope, $scope,
        AnnotationService, ConfigService, NodeService,
        NotebookService, ProjectService, StudentAssetService,
        StudentDataService, UtilService);
    this.$q = $q;
    this.$sce = $sce;
    this.$timeout = $timeout;
    this.$window = $window;
    this.EmbeddedService = EmbeddedService;
    this.componentType = null;
    this.url = null;

    // the width of the iframe (optional)
    this.width = null;

    // the height of the iframe (optional)
    this.height = null;

    // the max width of the iframe
    this.maxWidth = null;

    // the max height of the iframe
    this.maxHeight = null;

    this.isSnipModelButtonVisible = true;
    this.notebookConfig = this.NotebookService.getNotebookConfig();

    this.latestAnnotations = null;
    this.componentStateId = null;
    this.embeddedApplicationIFrameId = '';

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

    /*
     * get the original component content. this is used when showing
     * previous work from another component.
     */
    this.originalComponentContent = this.$scope.originalComponentContent;


    this.embeddedApplicationIFrameId = 'componentApp_' + this.componentId;
    this.componentType = this.componentContent.type;

    if (this.mode === 'student') {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      this.isSnipModelButtonVisible = true;
    } else if (this.mode === 'authoring') {
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
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isSnipModelButtonVisible = false;
      let componentState = this.$scope.componentState;
      if (componentState != null) {
        // create a unique id for the application iframe using this component state
        this.embeddedApplicationIFrameId = 'componentApp_' + componentState.id;
        if (this.mode === 'gradingRevision') {
          this.embeddedApplicationIFrameId = 'componentApp_gradingRevision_' + componentState.id;
        }
      }

      if (this.mode === 'grading') {
        this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
      }
    } else if (this.mode === 'onlyShowWork') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isSnipModelButtonVisible = false;
    } else if (this.mode === 'showPreviousWork') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
      this.isSnipModelButtonVisible = false;
    }

    if (this.componentContent != null) {
      this.setURL(this.componentContent.url);
    }

    this.width = this.componentContent.width ? this.componentContent.width : '100%';
    this.height = this.componentContent.height ? this.componentContent.height : '100%';

    if (this.$scope.$parent.nodeController != null) {
      this.$scope.$parent.nodeController.registerComponentController(this.$scope, this.componentContent);
    }

    /**
     * A connected component has changed its student data so we will
     * perform any necessary changes to this component
     * @param connectedComponent the connected component
     * @param connectedComponentParams the connected component params
     * @param componentState the student data from the connected
     * component that has changed
     */
    this.$scope.handleConnectedComponentStudentDataChanged =
        (connectedComponent, connectedComponentParams, componentState) => {
      var message = {};
      message.messageType = 'handleConnectedComponentStudentDataChanged';
      message.componentState = componentState;
      this.sendMessageToApplication(message);
    }

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
        if (this.$scope.embeddedController.isSubmitDirty) {
          getState = true;
          action = 'submit';
        }
      } else {
        if (this.$scope.embeddedController.isDirty) {
          getState = true;
          action = 'save';
        }
      }

      if (getState) {
        this.$scope.embeddedController.createComponentState(action).then((componentState) => {
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
    this.$scope.$on('exitNode', angular.bind(this, function(event, args) {
      this.$window.removeEventListener('message', this.messageEventListener);
    }));

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

    /*
     * Listen for the siblingComponentStudentDataChanged event which occurs
     * when the student data has changed for another component in this step
     */
    this.$scope.$on('siblingComponentStudentDataChanged', (event, args) => {
      if (this.nodeId == args.nodeId && this.componentId != args.componentId) {
        var message = {};
        message.messageType = 'siblingComponentStudentDataChanged';
        message.componentState = args.componentState;
        this.sendMessageToApplication(message);
      }
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

    this.messageEventListener = angular.bind(this, function(messageEvent) {
      var messageEventData = messageEvent.data;
      if (messageEventData.messageType === 'event') {
        var nodeId = this.nodeId;
        var componentId = this.componentId;
        var componentType = this.componentType;
        var category = messageEventData.eventCategory;
        var event = messageEventData.event;
        var eventData = messageEventData.eventData;
        this.StudentDataService.saveVLEEvent(nodeId, componentId, componentType, category, event, eventData);
      } else if (messageEventData.messageType === 'studentWork') {
        if (messageEventData.id != null) {
          //the model wants to update/overwrite an existing component state
          this.componentStateId = messageEventData.id;
        } else {
          // the model wants to create a new component state
          this.componentStateId = null;
        }

        if (messageEventData.isSubmit) {
          this.isSubmit = messageEventData.isSubmit;
        }

        this.isDirty = true;
        this.setStudentData(messageEventData.studentData);
        this.studentDataChanged();

        // tell the parent node that this component wants to save
        this.$scope.$emit('componentSaveTriggered', {nodeId: this.nodeId, componentId: this.componentId});
      } else if (messageEventData.messageType === 'applicationInitialized') {
        this.sendLatestWorkToApplication();
        this.processLatestSubmit();

        // activate iframe-resizer on the embedded app's iframe
        $('#' + this.embeddedApplicationIFrameId).iFrameResize({scrolling: true});
      } else if (messageEventData.messageType === 'componentDirty') {
        let isDirty = messageEventData.isDirty;
        this.isDirty = isDirty;
        this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: isDirty});
      } else if (messageEventData.messageType === 'componentSubmitDirty') {
        let isSubmitDirty = messageEventData.isDirty;
        this.isSubmitDirty = isSubmitDirty;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: isDirty});
      } else if (messageEventData.messageType === 'studentDataChanged') {
        this.setStudentData(messageEventData.studentData);
        this.studentDataChanged();
      } else if (messageEventData.messageType === 'getStudentWork') {
        var getStudentWorkParams = messageEventData.getStudentWorkParams;
        var studentWork = this.getStudentWork(messageEventData.getStudentWorkParams);
        var message = studentWork;
        message.messageType = 'studentWork';
        message.getStudentWorkParams = getStudentWorkParams;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getLatestStudentWork') {
        var latestComponentState = this.getLatestStudentWork();
        var message = {};
        message.messageType = 'latestStudentWork';
        message.latestStudentWork = latestComponentState;
        this.sendMessageToApplication(message);
      } else if (messageEventData.messageType === 'getParameters') {
        var message = {};
        message.messageType = 'parameters';
        let parameters = {};
        if (this.componentContent.parameters != null) {
          parameters = this.UtilService.makeCopyOfJSONObject(this.componentContent.parameters);
        }
        parameters.nodeId = this.nodeId;
        parameters.componentId = this.componentId;
        message.parameters = parameters;
        this.sendMessageToApplication(message);
      }
    });

    this.$rootScope.$broadcast('doneRenderingComponent', { nodeId: this.nodeId, componentId: this.componentId });
  }

  registerStudentWorkSavedToServerListener() {
    this.$scope.$on('studentWorkSavedToServer', (event, args) => {
      var componentState = args.studentWork;
      if (componentState != null) {
        if (componentState.componentId === this.componentId) {
          // set isDirty to false because the component state was just saved and notify node
          this.isDirty = false;
          this.$scope.$emit('componentDirty', {componentId: this.componentId, isDirty: false});
          this.$scope.embeddedController.componentState = null;

          let isAutoSave = componentState.isAutoSave;
          let isSubmit = componentState.isSubmit;
          let serverSaveTime = componentState.serverSaveTime;
          let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);

          if (isSubmit) {
            this.setSaveMessage(this.$translate('SUBMITTED'), clientSaveTime);
            this.submit();
            this.isSubmitDirty = false;
            this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
          } else if (isAutoSave) {
            this.setSaveMessage(this.$translate('AUTO_SAVED'), clientSaveTime);
          } else {
            this.setSaveMessage(this.$translate('SAVED'), clientSaveTime);
          }

          var message = {};
          message.messageType = 'componentStateSaved';
          message.componentState = componentState;
          this.sendMessageToApplication(message);
        }
      }
    });
  }

  iframeLoaded(contentLocation) {
    window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.addEventListener('message', this.messageEventListener);
  }

  /**
   * Check if latest component state is a submission and if not, set isSubmitDirty to true
   */
  processLatestSubmit() {
    let latestState = this.$scope.componentState;
    if (latestState) {
      let serverSaveTime = latestState.serverSaveTime;
      let clientSaveTime = this.ConfigService.convertToClientTimestamp(serverSaveTime);
      if (latestState.isSubmit) {
        this.isSubmitDirty = false;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: false});
        this.setSaveMessage(this.$translate('LAST_SUBMITTED'), clientSaveTime);
      } else {
        this.isSubmitDirty = true;
        this.$scope.$emit('componentSubmitDirty', {componentId: this.componentId, isDirty: true});
        this.setSaveMessage(this.$translate('LAST_SAVED'), clientSaveTime);
      }
    }
  };

  setURL(url) {
    if (url != null) {
      this.url = this.$sce.trustAsResourceUrl(url);
    }
  };

  submit() {
    if (this.isLockAfterSubmit()) {
      this.isDisabled = true;
    }
  };

  /**
   * Create a new component state populated with the student data
   * @return the componentState after it has been populated
   */
  createComponentState(action) {
    var componentState = this.NodeService.createNewComponentState();

    if (this.componentStateId != null) {
      componentState.id = this.componentStateId;
    }

    if (this.isSubmit) {
      componentState.isSubmit = this.isSubmit;

      /*
       * reset the isSubmit value so that the next component state
       * doesn't maintain the same value
       */
      this.isSubmit = false;
    }

    componentState.studentData = this.studentData;
    componentState.componentType = 'Embedded';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;

    var deferred = this.$q.defer();

    /*
     * perform any additional processing that is required before returning
     * the component state
     */
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);
    return deferred.promise;
  };

  sendLatestWorkToApplication() {
    let componentState = this.$scope.componentState;
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      componentState = this.handleConnectedComponents();
    }
    var message = {
      messageType: 'componentState',
      componentState: componentState
    };

    this.sendMessageToApplication(message);
  };

  sendMessageToApplication(message) {
    window.document.getElementById(this.embeddedApplicationIFrameId).contentWindow.postMessage(message, '*');
  };

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

  /**
   * Snip the model by converting it to an image
   * @param $event the click event
   */
  snipModel($event) {
    var iframe = $('#' + this.embeddedApplicationIFrameId);
    if (iframe != null && iframe.length > 0) {
      var modelElement = iframe.contents().find('html');
      if (modelElement != null && modelElement.length > 0) {
        modelElement = modelElement[0];

        // convert the model element to a canvas element
        html2canvas(modelElement).then((canvas) => {
          var img_b64 = canvas.toDataURL('image/png');
          var imageObject = this.UtilService.getImageObjectFromBase64String(img_b64);
          this.NotebookService.addNote($event, imageObject);
        });
      }
    }
  }

  /**
   * Check whether we need to show the snip model button
   * @return whether to show the snip model button
   */
  showSnipModelButton() {
    return this.NotebookService.isNotebookEnabled() &&
        this.isSnipModelButtonVisible;
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
    this.exitListener = this.$scope.$on('exit', angular.bind(this, function(event, args) {

    }));
  };

  submit(submitTriggeredBy) {
    this.isSubmit = true;
    this.$scope.$emit('componentSubmitTriggered',
        {nodeId: this.nodeId, componentId: this.componentId});
  };

  getLatestStudentWork() {
    return this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
  }

  /**
   * Get the student work from the specified components/nodes
   * @param params The params for getting the student work. The possible
   * values to request are
   * getLatestStudentWorkFromThisComponent
   * getAllStudentWorkFromThisComponent
   * getLatestStudentWorkFromThisNode
   * getAllStudentWorkFromThisNode
   * getLatestStudentWorkFromOtherComponents
   * getAllStudentWorkFromOtherComponents
   * If getLatestStudentWorkFromOtherComponents or getAllStudentWorkFromOtherComponents
   * are requested, the otherComponents param must be provided. otherComponents
   * should be an array of objects. The objects should contain a nodeId and
   * componentId.
   * @return an object containing other objects that contain work from the
   * specified components/nodes
   */
  getStudentWork(params) {
    var studentWork = {};

    if (params != null && params.getLatestStudentWorkFromThisComponent) {
      studentWork.latestStudentWorkFromThisComponent = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(this.nodeId, this.componentId);
    }

    if (params != null && params.getAllStudentWorkFromThisComponent) {
      studentWork.allStudentWorkFromThisComponent = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
    }

    if (params != null && params.getLatestStudentWorkFromThisNode) {
      studentWork.latestStudentWorkFromThisNode = this.StudentDataService.getLatestComponentStatesByNodeId(this.nodeId);
    }

    if (params != null && params.getAllStudentWorkFromThisNode) {
      studentWork.allStudentWorkFromThisNode = this.StudentDataService.getComponentStatesByNodeId(this.nodeId);
    }

    if (params != null && params.getLatestStudentWorkFromOtherComponents) {
      // an array of objects that contain a nodeId and component Id
      var otherComponents = params.otherComponents;
      var latestStudentWorkFromOtherComponents = [];
      if (otherComponents != null) {
        for (var otherComponent of otherComponents) {
          if (otherComponent != null) {
            var tempNodeId = otherComponent.nodeId;
            var tempComponentId = otherComponent.componentId;

            if (tempNodeId != null && tempComponentId != null) {
              var tempComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(tempNodeId, tempComponentId);
              if (tempComponentState != null) {
                latestStudentWorkFromOtherComponents.push(tempComponentState);
              }
            }
          }
        }
      }
      studentWork.latestStudentWorkFromOtherComponents = latestStudentWorkFromOtherComponents;
    }

    if (params != null && params.getAllStudentWorkFromOtherComponents) {
      var otherComponents = params.otherComponents;
      var allStudentWorkFromOtherComponents = [];
      if (otherComponents != null) {
        for (var otherComponent of otherComponents) {
          if (otherComponent != null) {
            var tempNodeId = otherComponent.nodeId;
            var tempComponentId = otherComponent.componentId;
            if (tempNodeId != null && tempComponentId != null) {
              var tempComponentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(tempNodeId, tempComponentId);
              if (tempComponentStates != null && tempComponentStates.length > 0) {
                allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents.concat(tempComponentStates);
              }
            }
          }
        }
      }
      studentWork.allStudentWorkFromOtherComponents = allStudentWorkFromOtherComponents;
    }
    return studentWork;
  }

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

  addTag() {
    if (this.authoringComponentContent.tags == null) {
      this.authoringComponentContent.tags = [];
    }
    this.authoringComponentContent.tags.push('');
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag up
   * @param index the index of the tag to move up
   */
  moveTagUp(index) {
    if (index > 0) {
      // the index is not at the top so we can move it up
      let tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index - 1, 0, tag);
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Move a tag down
   * @param index the index of the tag to move down
   */
  moveTagDown(index) {
    if (index < this.authoringComponentContent.tags.length - 1) {
      // the index is not at the bottom so we can move it down
      let tag = this.authoringComponentContent.tags[index];
      this.authoringComponentContent.tags.splice(index, 1);
      this.authoringComponentContent.tags.splice(index + 1, 0, tag);
    }
    this.authoringViewComponentChanged();
  }

  deleteTag(indexOfTagToDelete) {
    if (confirm(this.$translate('areYouSureYouWantToDeleteThisTag'))) {
      this.authoringComponentContent.tags.splice(indexOfTagToDelete, 1);
    }
    this.authoringViewComponentChanged();
  }

  /**
   * Import any work we need from connected components
   */
  handleConnectedComponents() {
    let mergedComponentState = this.$scope.componentState;
    let firstTime = true;
    if (mergedComponentState == null) {
      mergedComponentState = this.NodeService.createNewComponentState();
      mergedComponentState.studentData = {};
    } else {
      firstTime = false;
    }
    var connectedComponents = this.componentContent.connectedComponents;
    if (connectedComponents != null) {
      var componentStates = [];
      for (var connectedComponent of connectedComponents) {
        if (connectedComponent != null) {
          var nodeId = connectedComponent.nodeId;
          var componentId = connectedComponent.componentId;
          var type = connectedComponent.type;
          var mergeFields = connectedComponent.mergeFields;
          if (type == 'showWork') {
            var componentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            if (componentState != null) {
              componentStates.push(this.UtilService.makeCopyOfJSONObject(componentState));
            }
            // we are showing work so we will not allow the student to edit it
            this.isDisabled = true;
          } else if (type == 'importWork' || type == null) {
            var connectedComponentState = this.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            if (connectedComponentState != null) {
              let fields = connectedComponent.fields;
              mergedComponentState = this.mergeComponentState(mergedComponentState, connectedComponentState, fields, firstTime);
            }
          }
        }
      }

      if (mergedComponentState != null) {
        this.setStudentWork(mergedComponentState);
        this.studentDataChanged();
      }
    }
    return mergedComponentState;
  }

  /**
   * Merge a new component state into a base component state.
   * @param baseComponentState The component state we will be merging into.
   * @param newComponentState The component state we will be merging from.
   * @param mergeFields The fields to merge.
   * @param firstTime Whether this is the first time the baseComponentState is
   * being merged into.
   */
  mergeComponentState(baseComponentState, newComponentState, mergeFields, firstTime) {
    if (mergeFields == null) {
      if (newComponentState.componentType == 'Embedded') {
        // there are no merge fields specified so we will get all of the fields
        baseComponentState.studentData = this.UtilService.makeCopyOfJSONObject(newComponentState.studentData);
      }
    } else {
      // we will merge specific fields
      for (let mergeField of mergeFields) {
        let name = mergeField.name;
        let when = mergeField.when;
        let action = mergeField.action;
        if (when == 'firstTime' && firstTime == true) {
          if (action == 'write') {
            baseComponentState.studentData[name] = newComponentState.studentData[name];
          } else if (action == 'read') {
            // TODO
          }
        } else if (when == 'always') {
          if (action == 'write') {
            baseComponentState.studentData[name] = newComponentState.studentData[name];
          } else if (action == 'read') {
            // TODO
          }
        }
      }
    }
    return baseComponentState;
  }

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentWork(componentState) {
    this.studentData = componentState.studentData;
  };

  /**
   * Populate the student work into the component
   * @param componentState the component state to populate into the component
   */
  setStudentData(studentData) {
    this.studentData = studentData;
  };

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

EmbeddedController.$inject = [
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

export default EmbeddedController;

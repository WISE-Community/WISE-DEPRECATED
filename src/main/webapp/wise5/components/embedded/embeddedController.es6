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

    this.notebookConfig = this.NotebookService.getNotebookConfig();

    this.latestAnnotations = null;
    this.componentStateId = null;
    this.embeddedApplicationIFrameId = '';


    this.embeddedApplicationIFrameId = 'componentApp_' + this.componentId;
    this.componentType = this.componentContent.type;

    if (this.mode === 'student') {
      this.isSaveButtonVisible = this.componentContent.showSaveButton;
      this.isSubmitButtonVisible = this.componentContent.showSubmitButton;
      this.latestAnnotations = this.AnnotationService.getLatestComponentAnnotations(this.nodeId, this.componentId, this.workgroupId);
    } else if (this.mode === 'grading' || this.mode === 'gradingRevision') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
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
    } else if (this.mode === 'showPreviousWork') {
      this.isSaveButtonVisible = false;
      this.isSubmitButtonVisible = false;
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

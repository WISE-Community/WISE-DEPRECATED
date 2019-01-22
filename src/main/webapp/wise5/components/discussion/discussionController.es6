'use strict';

import ComponentController from "../componentController";

class DiscussionController extends ComponentController {
  constructor($filter,
      $mdDialog,
      $q,
      $rootScope,
      $scope,
      AnnotationService,
      ConfigService,
      DiscussionService,
      NodeService,
      NotebookService,
      NotificationService,
      ProjectService,
      StudentAssetService,
      StudentDataService,
      StudentWebSocketService,
      UtilService,
      $mdMedia) {
    super($filter, $mdDialog, $rootScope, $scope,
      AnnotationService, ConfigService, NodeService,
      NotebookService, ProjectService, StudentAssetService,
      StudentDataService, UtilService);
    this.$q = $q;
    this.DiscussionService = DiscussionService;
    this.NotificationService = NotificationService;
    this.StudentWebSocketService = StudentWebSocketService;
    this.$mdMedia = $mdMedia;
    this.studentResponse = '';
    this.newResponse = '';
    this.classResponses = [];
    this.topLevelResponses = [];
    this.responsesMap = {};
    this.retrievedClassmateResponses = false;
    if (this.isStudentMode()) {
      if (this.ConfigService.isPreview()) {
        let componentStates = null;
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // assume there can only be one connected component
          const connectedComponent = this.componentContent.connectedComponents[0];
          componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
              connectedComponent.nodeId, connectedComponent.componentId);
        } else {
          componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
              this.nodeId, this.componentId);
        }
        this.setClassResponses(componentStates);
      } else {
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          // assume there can only be one connected component
          const connectedComponent = this.componentContent.connectedComponents[0];
          this.getClassmateResponses(connectedComponent.nodeId, connectedComponent.componentId);
        } else {
          if (this.isClassmateResponsesGated()) {
            const componentState = this.$scope.componentState;
            if (this.DiscussionService.componentStateHasStudentWork(componentState, this.componentContent)) {
              this.getClassmateResponses();
            }
          } else {
            this.getClassmateResponses();
          }
        }
      }
      this.disableComponentIfNecessary();
    } else if (this.isGradingMode() || this.isGradingRevisionMode()) {
      const componentStates =
          this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);
      const annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);
      this.setClassResponses(componentStates, annotations);
    }
    this.initializeScopeSubmitButtonClicked();
    this.initializeScopeGetComponentState();
    this.initializeScopeStudentDataChanged();
    this.registerWebSocketMessageReceivedListener();
    this.initializeWatchMdMedia();
    this.broadcastDoneRenderingComponent();
  }

  initializeScopeSubmitButtonClicked() {
    this.$scope.submitbuttonclicked = (componentStateReplyingTo) => {
      if (componentStateReplyingTo && componentStateReplyingTo.replyText) {
        const componentState = componentStateReplyingTo;
        const componentStateId = componentState.id;
        this.$scope.discussionController.studentResponse = componentState.replyText;
        this.$scope.discussionController.componentStateIdReplyingTo = componentStateId;
        this.$scope.discussionController.isSubmit = true;
        this.$scope.discussionController.isDirty = true;
        componentStateReplyingTo.replyText = null;
      } else {
        this.$scope.discussionController.studentResponse = this.$scope.discussionController.newResponse;
        this.$scope.discussionController.isSubmit = true;
      }
      if (this.isAuthoringMode()) {
        this.createComponentState('submit');
      }
      this.$scope.$emit('componentSubmitTriggered',
          {
            nodeId: this.$scope.discussionController.nodeId,
            componentId: this.$scope.discussionController.componentId
          }
       );
    };
  }

  initializeScopeGetComponentState() {
    this.$scope.getComponentState = () => {
      const deferred = this.$q.defer();
      if (this.$scope.discussionController.isDirty && this.$scope.discussionController.isSubmit) {
        const action = 'submit';
        this.$scope.discussionController.createComponentState(action).then((componentState) => {
          this.$scope.discussionController.clearComponentValues();
          this.$scope.discussionController.isDirty = false;
          deferred.resolve(componentState);
        });
      } else {
        deferred.resolve();
      }
      return deferred.promise;
    };
  }

  initializeScopeStudentDataChanged() {
    this.$scope.studentdatachanged = () => {
      this.$scope.discussionController.studentDataChanged();
    };
  }

  registerStudentWorkSavedToServerListener() {
    this.$scope.$on('studentWorkSavedToServer', (event, args) => {
      const componentState = args.studentWork;
      if (componentState &&
          this.nodeId === componentState.nodeId &&
          this.componentId === componentState.componentId) {
        if (this.isClassmateResponsesGated() && !this.retrievedClassmateResponses) {
          this.getClassmateResponses();
        } else {
          this.addClassResponse(componentState);
        }
        this.disableComponentIfNecessary();
        this.sendPostToClassmatesInPeriod(componentState);
        this.sendPostToStudentsInThread(componentState);
      }
      this.isSubmit = null;
    });
  }

  sendPostToClassmatesInPeriod(componentState) {
    const messageType = 'studentData';
    componentState.userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(componentState.workgroupId);
    this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, componentState);
  }

  sendPostToStudentsInThread(componentState) {
    const studentData = componentState.studentData;
    if (studentData != null && this.responsesMap != null) {
      const componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
      if (componentStateIdReplyingTo != null) {
        const fromWorkgroupId = componentState.workgroupId;
        const notificationType = 'DiscussionReply';
        const nodeId = componentState.nodeId;
        const componentId = componentState.componentId;
        const userNamesArray = this.ConfigService.getUserNamesByWorkgroupId(fromWorkgroupId);
        const userNames = userNamesArray.map((obj) => {
          return obj.name;
        }).join(', ');
        const notificationMessage = this.$translate('discussion.repliedToADiscussionYouWereIn', { userNames: userNames });
        const workgroupsNotifiedSoFar = [];
        if (this.responsesMap[componentStateIdReplyingTo] != null) {
          this.sendPostToThreadCreator(componentStateIdReplyingTo, notificationType, nodeId,
              componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar);
          this.sendPostToThreadRepliers(componentStateIdReplyingTo, notificationType, nodeId,
              componentId, fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar);
        }
      }
    }
  }

  sendPostToThreadCreator(componentStateIdReplyingTo, notificationType, nodeId, componentId,
                          fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar) {
    const originalPostComponentState = this.responsesMap[componentStateIdReplyingTo];
    const toWorkgroupId = originalPostComponentState.workgroupId;
    if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId) {
      const notification = this.NotificationService.createNewNotification(
          notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
      this.NotificationService.saveNotificationToServer(notification).then((savedNotification) => {
        const messageType = 'notification';
        this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
      });
      workgroupsNotifiedSoFar.push(toWorkgroupId);
    }
  }

  sendPostToThreadRepliers(componentStateIdReplyingTo, notificationType, nodeId, componentId,
                           fromWorkgroupId, notificationMessage, workgroupsNotifiedSoFar) {
    if (this.responsesMap[componentStateIdReplyingTo].replies != null) {
      const replies = this.responsesMap[componentStateIdReplyingTo].replies;
      for (let r = 0; r < replies.length; r++) {
        const reply = replies[r];
        const toWorkgroupId = reply.workgroupId;
        if (toWorkgroupId != null && toWorkgroupId != fromWorkgroupId &&
            workgroupsNotifiedSoFar.indexOf(toWorkgroupId) == -1) {
          const notification = this.NotificationService.createNewNotification(
              notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
          this.NotificationService.saveNotificationToServer(notification).then((savedNotification) => {
            const messageType = 'notification';
            this.StudentWebSocketService.sendStudentToClassmatesInPeriodMessage(messageType, savedNotification);
          });
          workgroupsNotifiedSoFar.push(toWorkgroupId);
        }
      }
    }
  }

  registerWebSocketMessageReceivedListener() {
    this.$rootScope.$on('webSocketMessageReceived', (event, args) => {
      const data = args.data;
      const componentState = data.data;
      if (componentState.nodeId === this.nodeId && componentState.componentId === this.componentId) {
        const componentStateWorkgroupId = componentState.workgroupId;
        const workgroupId = this.ConfigService.getWorkgroupId();
        if (workgroupId !== componentStateWorkgroupId) {
          if (this.retrievedClassmateResponses) {
            this.addClassResponse(componentState);
          }
        }
      }
    });
  }

  initializeWatchMdMedia() {
    this.$scope.$watch(() => { return this.$mdMedia('gt-sm'); }, (md) => {
      this.$scope.mdScreen = md;
    });
  }

  getClassmateResponses(nodeId = this.nodeId, componentId = this.componentId) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    this.DiscussionService.getClassmateResponses(runId, periodId, nodeId, componentId).then((result) => {
      if (result != null) {
        const componentStates = result.studentWorkList;
        const annotations = result.annotations;
        this.setClassResponses(componentStates, annotations);
      }
    });
  }

  submitButtonClicked() {
    this.isSubmit = true;
    this.disableComponentIfNecessary();
    this.$scope.submitbuttonclicked();
  }

  studentDataChanged() {
    this.isDirty = true;
    const action = 'change';
    this.createComponentState(action).then((componentState) => {
      this.$scope.$emit('componentStudentDataChanged',
          {nodeId: this.nodeId, componentId: this.componentId, componentState: componentState});
    });
  }

  /**
   * Create a new component state populated with the student data
   * @param action the action that is triggering creating of this component state
   * e.g. 'submit', 'save', 'change'
   * @return a promise that will return a component state
   */
  createComponentState(action) {
    const componentState = this.NodeService.createNewComponentState();
    const studentData = {
      response: this.studentResponse,
      attachments: this.attachments,
    };
    if (this.componentStateIdReplyingTo != null) {
      studentData.componentStateIdReplyingTo = this.componentStateIdReplyingTo;
    }
    componentState.studentData = studentData;
    componentState.componentType = 'Discussion';
    componentState.nodeId = this.nodeId;
    componentState.componentId = this.componentId;
    if ((this.ConfigService.isPreview() && !this.componentStateIdReplyingTo) || this.mode === 'authoring') {
      componentState.id = this.UtilService.generateKey();
    }
    if (this.isSubmit) {
      componentState.studentData.isSubmit = this.isSubmit;
      this.isSubmit = false;
      if (this.mode === 'authoring') {
        if (this.StudentDataService.studentData == null) {
          this.StudentDataService.studentData = {};
          this.StudentDataService.studentData.componentStates = [];
        }
        this.StudentDataService.studentData.componentStates.push(componentState);
        const componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(this.nodeId, this.componentId);
        this.setClassResponses(componentStates);
        this.clearComponentValues();
        this.isDirty = false;
      }
    }
    const deferred = this.$q.defer();
    this.createComponentStateAdditionalProcessing(deferred, componentState, action);
    return deferred.promise;
  }

  clearComponentValues() {
    this.studentResponse = '';
    this.newResponse = '';
    this.attachments = [];
    this.componentStateIdReplyingTo = null;
  }

  disableComponentIfNecessary() {
    super.disableComponentIfNecessary();
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      for (let connectedComponent of this.componentContent.connectedComponents) {
        if (connectedComponent.type == 'showWork') {
          this.isDisabled = true;
        }
      }
    }
  }

  showSaveButton() {
    return this.componentContent.showSaveButton;
  }

  showSubmitButton() {
    return this.componentContent.showSubmitButton;
  }

  isClassmateResponsesGated() {
    return this.componentContent.gateClassmateResponses;
  }

  setClassResponses(componentStates, annotations) {
    this.classResponses = [];
    for (let componentState of componentStates) {
      if (componentState.studentData.isSubmit) {
        const workgroupId = componentState.workgroupId;
        const latestInappropriateFlagAnnotation =
            this.getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, componentState.id);
        const userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
        componentState.userNames = userNames.map(function(obj) { return obj.name; }).join(', ');
        componentState.replies = [];
        if (this.isGradingMode() || this.isGradingRevisionMode()) {
          if (latestInappropriateFlagAnnotation != null) {
            /*
             * Set the inappropriate flag annotation into the component state. This is used for the
             * grading tool to determine whether to show the 'Delete' button or the 'Undo Delete'
             * button.
             */
            componentState.latestInappropriateFlagAnnotation = latestInappropriateFlagAnnotation;
          }
          this.classResponses.push(componentState);
        } else if (this.isStudentMode()) {
          if (latestInappropriateFlagAnnotation != null &&
              latestInappropriateFlagAnnotation.data != null &&
              latestInappropriateFlagAnnotation.data.action == 'Delete') {
            // do not show this post because the teacher has deleted it
          } else {
            this.classResponses.push(componentState);
          }
        }
      }
    }
    this.processResponses(this.classResponses);
    this.retrievedClassmateResponses = true;
  }

  getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, studentWorkId) {
    if (annotations != null) {
      for (let annotation of annotations) {
        if (studentWorkId == annotation.studentWorkId && annotation.type == 'inappropriateFlag') {
          return annotation;
        }
      }
    }
    return null;
  }

  processResponses(componentStates) {
    for (let componentState of componentStates) {
      this.responsesMap[componentState.id] = componentState;
    }
    for (let componentState of componentStates) {
      if (componentState && componentState.studentData) {
        const studentData = componentState.studentData;
        const componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;
        if (componentStateIdReplyingTo) {
          if (this.responsesMap[componentStateIdReplyingTo] &&
            this.responsesMap[componentStateIdReplyingTo].replies) {
            this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
          }
        }
      }
    }
    this.topLevelResponses = this.getLevel1Responses();
  }

  addClassResponse(componentState) {
    if (componentState.studentData.isSubmit) {
      const workgroupId = componentState.workgroupId;
      const userNames = this.ConfigService.getUserNamesByWorkgroupId(workgroupId);
      if (userNames.length > 0) {
        componentState.userNames = userNames.map(function(obj) { return obj.name; }).join(', ');
      } else if (componentState.userNamesArray != null) {
        componentState.userNames = componentState.userNamesArray
            .map(function(obj) { return obj.name; }).join(', ');
      }
      componentState.replies = [];
      this.classResponses.push(componentState);
      this.responsesMap[componentState.id] = componentState;
      const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
      if (componentStateIdReplyingTo != null) {
        if (this.responsesMap[componentStateIdReplyingTo] != null &&
            this.responsesMap[componentStateIdReplyingTo].replies != null) {
          this.responsesMap[componentStateIdReplyingTo].replies.push(componentState);
        }
      }
      this.topLevelResponses = this.getLevel1Responses();
    }
  }

  getClassResponses() {
    return this.classResponses;
  }

  /**
   * Get the level 1 responses which are posts that are not a
   * reply to another response.
   * @return an array of responses that are not a reply to another
   * response
   */
  getLevel1Responses() {
    const level1Responses = [];
    const classResponses = this.classResponses;
    for (let classResponse of classResponses) {
      const componentStateIdReplyingTo = classResponse.studentData.componentStateIdReplyingTo;
      if (componentStateIdReplyingTo == null) {
        /*
         * this response was not a reply to another post so it is a
         * level 1 response
         */
        level1Responses.push(classResponse);
      }
    }

    return level1Responses;
  }

  /**
   * The teacher has clicked the delete button to delete a post. We won't
   * actually delete the student work, we'll just create an inappropriate
   * flag annotation which prevents the students in the class from seeing
   * the post.
   * @param componentState the student component state the teacher wants to
   * delete.
   */
  deletebuttonclicked(componentState) {
    const toWorkgroupId = componentState.workgroupId;
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);
    const periodId = userInfo.periodId;
    const teacherUserInfo = this.ConfigService.getMyUserInfo();
    const fromWorkgroupId = teacherUserInfo.workgroupId;
    const runId = this.ConfigService.getRunId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const studentWorkId = componentState.id;
    const data = {
      action: 'Delete'
    };
    const annotation = this.AnnotationService.createInappropriateFlagAnnotation(
        runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);
    this.AnnotationService.saveAnnotation(annotation).then(() => {
      const componentStates =
          this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);
      const annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);
      this.setClassResponses(componentStates, annotations);
    });
  }

  /**
   * The teacher has clicked the 'Undo Delete' button to undo a previous
   * deletion of a post. This function will create an inappropriate flag
   * annotation with the action set to 'Undo Delete'. This will make the
   * post visible to the students.
   * @param componentState the student component state the teacher wants to
   * show again.
   */
  undodeletebuttonclicked(componentState) {
    const toWorkgroupId = componentState.workgroupId;
    const userInfo = this.ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);
    const periodId = userInfo.periodId;
    const teacherUserInfo = this.ConfigService.getMyUserInfo();
    const fromWorkgroupId = teacherUserInfo.workgroupId;
    const runId = this.ConfigService.getRunId();
    const nodeId = this.nodeId;
    const componentId = this.componentId;
    const studentWorkId = componentState.id;
    const data = {
      action: 'Undo Delete'
    };
    const annotation = this.AnnotationService.createInappropriateFlagAnnotation(runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);
    this.AnnotationService.saveAnnotation(annotation).then(() => {
      const componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupId(this.componentId, this.workgroupId);
      const annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);
      this.setClassResponses(componentStates, annotations);
    });
  }

  /**
   * Get the inappropriate flag annotations for these component states
   * @param componentStates an array of component states
   * @return an array of inappropriate flag annotations that are associated
   * with the component states
   */
  getInappropriateFlagAnnotationsByComponentStates(componentStates) {
    const annotations = [];
    if (componentStates != null) {
      for (let componentState of componentStates) {
        const latestInappropriateFlagAnnotation =
            this.AnnotationService.getLatestAnnotationByStudentWorkIdAndType(
                componentState.id, 'inappropriateFlag');
        if (latestInappropriateFlagAnnotation != null) {
          annotations.push(latestInappropriateFlagAnnotation);
        }
      }
    }
    return annotations;
  }
}

DiscussionController.$inject = [
  '$filter',
  '$mdDialog',
  '$q',
  '$rootScope',
  '$scope',
  'AnnotationService',
  'ConfigService',
  'DiscussionService',
  'NodeService',
  'NotebookService',
  'NotificationService',
  'ProjectService',
  'StudentAssetService',
  'StudentDataService',
  'StudentWebSocketService',
  'UtilService',
  '$mdMedia'
];

export default DiscussionController;

'use strict';

import ComponentController from '../componentController';

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
        let componentStates = [];
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          for (const connectedComponent of this.componentContent.connectedComponents) {
            componentStates = componentStates.concat(this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
                connectedComponent.nodeId, connectedComponent.componentId));
          }
          if (this.isConnectedComponentImportWorkMode()) {
            componentStates = componentStates.concat(this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
                this.nodeId, this.componentId));
          }
        } else {
          componentStates = this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
              this.nodeId, this.componentId);
        }
        this.setClassResponses(componentStates);
      } else {
        if (this.UtilService.hasConnectedComponent(this.componentContent)) {
          const retrieveWorkFromTheseComponents = [];
          for (const connectedComponent of this.componentContent.connectedComponents) {
            retrieveWorkFromTheseComponents.push(
                {nodeId: connectedComponent.nodeId, componentId: connectedComponent.componentId});
          }
          if (this.isConnectedComponentImportWorkMode()) {
            retrieveWorkFromTheseComponents.push({nodeId: this.nodeId, componentId: this.componentId});
          }
          this.getClassmateResponses(retrieveWorkFromTheseComponents);
        } else {
          if (this.isClassmateResponsesGated()) {
            const componentState = this.$scope.componentState;
            if (componentState != null) {
              if (this.DiscussionService.componentStateHasStudentWork(componentState, this.componentContent)) {
                this.getClassmateResponses();
              }
            }
          } else {
            this.getClassmateResponses();
          }
        }
      }
      this.disableComponentIfNecessary();
    } else if (this.isGradingMode() || this.isGradingRevisionMode()) {
      if (this.DiscussionService.workgroupHasWorkForComponent(this.workgroupId, this.componentId)) {
        const componentIds = this.getGradingComponentIds();
        const componentStates = this.DiscussionService.
            getPostsAssociatedWithComponentIdsAndWorkgroupId(componentIds, this.workgroupId);
        const annotations = this.getInappropriateFlagAnnotationsByComponentStates(componentStates);
        this.setClassResponses(componentStates, annotations);
      }
    }
    this.initializeScopeSubmitButtonClicked();
    this.initializeScopeGetComponentState();
    this.initializeScopeStudentDataChanged();
    this.registerStudentWorkReceivedListener();
    this.initializeWatchMdMedia();
    this.broadcastDoneRenderingComponent();
  }

  isConnectedComponentShowWorkMode() {
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      let isShowWorkMode = true;
      for (const connectedComponent of this.componentContent.connectedComponents) {
        isShowWorkMode = isShowWorkMode && connectedComponent.type === 'showWork';
      }
      return isShowWorkMode;
    }
    return false;
  }

  isConnectedComponentImportWorkMode() {
    if (this.UtilService.hasConnectedComponent(this.componentContent)) {
      let isImportWorkMode = true;
      for (const connectedComponent of this.componentContent.connectedComponents) {
        isImportWorkMode = isImportWorkMode && connectedComponent.type === 'importWork';
      }
      return isImportWorkMode;
    }
    return false;
  }

  getGradingComponentIds() {
    const connectedComponentIds = [this.componentId];
    if (this.componentContent.connectedComponents != null) {
      for (const connectedComponent of this.componentContent.connectedComponents) {
        connectedComponentIds.push(connectedComponent.componentId);
      }
    }
    return connectedComponentIds;
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
    this.destroyStudentWorkSavedToServerListener =
        this.$scope.$on('studentWorkSavedToServer', (event, args) => {
      const componentState = args.studentWork;
      if (this.isWorkFromThisComponent(componentState)) {
        if (this.isClassmateResponsesGated() && !this.retrievedClassmateResponses) {
          this.getClassmateResponses();
        } else {
          this.addClassResponse(componentState);
        }
        this.disableComponentIfNecessary();
        this.sendPostToStudentsInThread(componentState);
      }
      this.isSubmit = null;
    });
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
        const usernamesArray = this.ConfigService.getUsernamesByWorkgroupId(fromWorkgroupId);
        const usernames = usernamesArray.map((obj) => {
          return obj.name;
        }).join(', ');
        const notificationMessage = this.$translate('discussion.repliedToADiscussionYouWereIn', { usernames: usernames });
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
    if (toWorkgroupId != null && toWorkgroupId !== fromWorkgroupId) {
      const notification = this.NotificationService.createNewNotification(
          notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
      this.NotificationService.saveNotificationToServer(notification);
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
        if (toWorkgroupId != null && toWorkgroupId !== fromWorkgroupId &&
            workgroupsNotifiedSoFar.indexOf(toWorkgroupId) === -1) {
          const notification = this.NotificationService.createNewNotification(
              notificationType, nodeId, componentId, fromWorkgroupId, toWorkgroupId, notificationMessage);
          this.NotificationService.saveNotificationToServer(notification);
          workgroupsNotifiedSoFar.push(toWorkgroupId);
        }
      }
    }
  }

  registerStudentWorkReceivedListener() {
    this.destroyStudentWorkReceivedListener =
        this.$rootScope.$on('studentWorkReceived', (event, componentState) => {
      if ((this.isWorkFromThisComponent(componentState) ||
          this.isWorkFromConnectedComponent(componentState)) &&
          this.isWorkFromClassmate(componentState) &&
          this.retrievedClassmateResponses) {
        this.addClassResponse(componentState);
      }
    });
  }

  isWorkFromClassmate(componentState) {
    return componentState.workgroupId !== this.ConfigService.getWorkgroupId();
  }

  isWorkFromThisComponent(componentState) {
    return this.isForThisComponent(componentState);
  }

  isWorkFromConnectedComponent(componentState) {
    if (this.componentContent.connectedComponents != null) {
      for (const connectedComponent of this.componentContent.connectedComponents) {
        if (connectedComponent.nodeId === componentState.nodeId &&
          connectedComponent.componentId === componentState.componentId) {
          return true;
        }
      }
    }
    return false;
  }

  initializeWatchMdMedia() {
    this.$scope.$watch(() => { return this.$mdMedia('gt-sm'); }, (md) => {
      this.$scope.mdScreen = md;
    });
  }

  getClassmateResponses(components = [{nodeId: this.nodeId, componentId: this.componentId}]) {
    const runId = this.ConfigService.getRunId();
    const periodId = this.ConfigService.getPeriodId();
    this.DiscussionService.getClassmateResponses(runId, periodId, components).then((result) => {
      this.setClassResponses(result.studentWorkList, result.annotations);
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
        if (connectedComponent.type === 'showWork') {
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
    componentStates = componentStates.sort(this.sortByServerSaveTime);
    for (let componentState of componentStates) {
      if (componentState.studentData.isSubmit) {
        const workgroupId = componentState.workgroupId;
        const latestInappropriateFlagAnnotation =
            this.getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, componentState.id);
        const usernames = this.ConfigService.getUsernamesByWorkgroupId(workgroupId);
        if (usernames.length === 0) {
          componentState.usernames = this.getUserIdsDisplay(workgroupId);
        } else {
          componentState.usernames = usernames.map(function(obj) { return obj.name; }).join(', ');
        }
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
              latestInappropriateFlagAnnotation.data.action === 'Delete') {
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

  sortByServerSaveTime(componentState1, componentState2) {
    if (componentState1.serverSaveTime < componentState2.serverSaveTime) {
      return -1;
    } else if (componentState1.serverSaveTime > componentState2.serverSaveTime) {
      return 1;
    }
    return 0;
  }

  getUserIdsDisplay(workgroupId) {
    const userIds = this.ConfigService.getUserIdsByWorkgroupId(workgroupId);
    const userIdsDisplay = [];
    for (let userId of userIds) {
      userIdsDisplay.push(`Student ${userId}`);
    }
    return userIdsDisplay.join(', ');
  }

  getLatestInappropriateFlagAnnotationByStudentWorkId(annotations, studentWorkId) {
    if (annotations != null) {
      for (const annotation of annotations) {
        if (studentWorkId === annotation.studentWorkId && annotation.type === 'inappropriateFlag') {
          return annotation;
        }
      }
    }
    return null;
  }

  processResponses(componentStates) {
    for (const componentState of componentStates) {
      this.responsesMap[componentState.id] = componentState;
    }
    for (const componentState of componentStates) {
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
    if (this.isGradingMode() || this.isGradingRevisionMode()) {
      this.topLevelResponses =
          this.topLevelResponses.filter(this.threadHasPostFromThisComponentAndWorkgroupId());
    }
  }

  threadHasPostFromThisComponentAndWorkgroupId() {
    const thisComponentId = this.componentId;
    const thisWorkgroupId = this.workgroupId;
    return (componentState) => {
      if (componentState.componentId === thisComponentId &&
          componentState.workgroupId === thisWorkgroupId) {
        return true;
      }
      for (const replyComponentState of componentState.replies) {
        if (replyComponentState.componentId === thisComponentId &&
            replyComponentState.workgroupId === thisWorkgroupId) {
          return true;
        }
      }
      return false;
    };
  }

  addClassResponse(componentState) {
    if (componentState.studentData.isSubmit) {
      const workgroupId = componentState.workgroupId;
      const usernames = this.ConfigService.getUsernamesByWorkgroupId(workgroupId);
      if (usernames.length > 0) {
        componentState.usernames = usernames.map(function(obj) { return obj.name; }).join(', ');
      } else if (componentState.usernamesArray != null) {
        componentState.usernames = componentState.usernamesArray
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
   * Get the level 1 responses which are posts that are not a reply to
   * another response.
   * @return an array of responses that are not a reply to another response
   */
  getLevel1Responses() {
    const level1Responses = [];
    for (const classResponse of this.classResponses) {
      const componentStateIdReplyingTo = classResponse.studentData.componentStateIdReplyingTo;
      if (componentStateIdReplyingTo == null) {
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
      const componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupIds(
          this.getGradingComponentIds(), this.workgroupId);
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
    const annotation = this.AnnotationService.createInappropriateFlagAnnotation(
        runId, periodId, nodeId, componentId, fromWorkgroupId, toWorkgroupId, studentWorkId, data);
    this.AnnotationService.saveAnnotation(annotation).then(() => {
      const componentStates = this.DiscussionService.getPostsAssociatedWithWorkgroupIds(
          this.getGradingComponentIds(), this.workgroupId);
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

  cleanupBeforeExiting() {
    this.destroyStudentWorkSavedToServerListener();
    this.destroyStudentWorkReceivedListener();
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

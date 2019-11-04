import ComponentService from '../componentService';

class DiscussionService extends ComponentService {
  constructor($filter,
      $http,
      $rootScope,
      $q,
      $injector,
      ConfigService,
      StudentDataService,
      UtilService) {
    super($filter, StudentDataService, UtilService);
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$injector = $injector;
    this.ConfigService = ConfigService;
    if (this.ConfigService.getMode() === 'classroomMonitor') {
      /*
       * In the Classroom Monitor, we need access to the TeacherDataService so we can retrieve posts
       * for all students.
       */
      this.TeacherDataService = this.$injector.get('TeacherDataService');
    }
  }

  getComponentTypeLabel() {
    return this.$translate('discussion.componentTypeLabel');
  }

  createComponent() {
    const component = super.createComponent();
    component.type = 'Discussion';
    component.prompt = this.$translate('ENTER_PROMPT_HERE');
    component.isStudentAttachmentEnabled = true;
    component.gateClassmateResponses = true;
    return component;
  }

  getClassmateResponses(runId, periodId, components) {
    return this.$q((resolve, reject) => {
      const params = {
        runId: runId,
        periodId: periodId,
        components: components,
        getStudentWork: true,
        getAnnotations: true
      };
      const httpParams = {
        method: 'GET',
        url: this.ConfigService.getConfigParam('studentDataURL'),
        params: params
      };
      this.$http(httpParams).then((result) => {
        resolve(result.data);
      });
    });
  }

  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    if (this.hasShowWorkConnectedComponentThatHasWork(component)) {
      if (this.hasNodeEnteredEvent(nodeEvents)) {
        return true;
      }
    } else {
      for (let componentState of componentStates) {
        if (componentState.studentData.response != null) {
          return true;
        }
      }
    }
    return false;
  }

  hasShowWorkConnectedComponentThatHasWork(componentContent) {
    const connectedComponents = componentContent.connectedComponents;
    if (connectedComponents != null) {
      for (let connectedComponent of connectedComponents) {
        if (connectedComponent.type === 'showWork') {
          const componentStates =
              this.StudentDataService.getComponentStatesByNodeIdAndComponentId(
              connectedComponent.nodeId, connectedComponent.componentId);
          if (componentStates.length > 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

  hasNodeEnteredEvent(nodeEvents) {
    for (let nodeEvent of nodeEvents) {
      if (nodeEvent.event === 'nodeEntered') {
        return true;
      }
    }
    return false;
  }

  workgroupHasWorkForComponent(workgroupId, componentId) {
    return this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId,
        componentId).length > 0;
  }

  getPostsAssociatedWithComponentIdsAndWorkgroupId(componentIds, workgroupId) {
    let allPosts = [];
    const topLevelComponentStateIdsFound = [];
    const componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentIds(
        workgroupId, componentIds);
    for (let componentState of componentStates) {
      const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
      if (this.isTopLevelPost(componentState)) {
        if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentState.id)) {
          allPosts = allPosts.concat(this.getPostAndAllRepliesByComponentIds(componentIds, componentState.id));
          topLevelComponentStateIdsFound.push(componentState.id);
        }
      } else {
        if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentStateIdReplyingTo)) {
          allPosts = allPosts.concat(this.getPostAndAllRepliesByComponentIds(componentIds, componentStateIdReplyingTo));
          topLevelComponentStateIdsFound.push(componentStateIdReplyingTo);
        }
      }
    }
    return allPosts;
  }

  isTopLevelPost(componentState) {
    return componentState.studentData.componentStateIdReplyingTo == null;
  }

  isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentStateId) {
    return topLevelComponentStateIdsFound.indexOf(componentStateId) !== -1;
  }

  getPostAndAllRepliesByComponentIds(componentIds, componentStateId) {
    const postAndAllReplies = [];
    const componentStatesForComponentIds = this.TeacherDataService.getComponentStatesByComponentIds(componentIds);
    for (const componentState of componentStatesForComponentIds) {
      if (componentState.id === componentStateId) {
        postAndAllReplies.push(componentState);
      } else {
        const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
        if (componentStateIdReplyingTo === componentStateId) {
          postAndAllReplies.push(componentState);
        }
      }
    }
    return postAndAllReplies;
  }

  componentUsesSaveButton() {
    return false;
  }

  componentUsesSubmitButton() {
    return false;
  }

  componentStateHasStudentWork(componentState, componentContent) {
    if (this.isStudentWorkHasAttachment(componentState)) {
      return true;
    }
    if (this.isComponentHasStarterSentence(componentContent)) {
      return this.isStudentWorkHasText(componentState) &&
          this.isStudentResponseDifferentFromStarterSentence(componentState, componentContent);
    } else {
      return this.isStudentWorkHasText(componentState);
    }
  }

  isComponentHasStarterSentence(componentContent) {
    const starterSentence = componentContent.starterSentence;
    return starterSentence != null && starterSentence !== '';
  }

  isStudentResponseDifferentFromStarterSentence(componentState, componentContent) {
    const response = componentState.studentData.response;
    const starterSentence = componentContent.starterSentence;
    return response !== starterSentence;
  }

  isStudentWorkHasText(componentState) {
    const response = componentState.studentData.response;
    return response != null && response !== '';
  }

  isStudentWorkHasAttachment(componentState) {
    const attachments = componentState.studentData.attachments;
    return attachments != null && attachments.length > 0;
  }
}

DiscussionService.$inject = [
  '$filter',
  '$http',
  '$rootScope',
  '$q',
  '$injector',
  'ConfigService',
  'StudentDataService',
  'UtilService'
];

export default DiscussionService;

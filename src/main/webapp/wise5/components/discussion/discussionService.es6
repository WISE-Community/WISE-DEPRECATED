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

  getClassmateResponses(runId, periodId, nodeId, componentId) {
    return this.$q((resolve, reject) => {
      const params = {
        runId: runId,
        periodId: periodId,
        nodeId: nodeId,
        componentId: componentId,
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
        if (connectedComponent.type == 'showWork') {
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

  /**
   * Get all the posts associated with a workgroup id. This will get all the posts and replies that
   * the workgroup posted or replied to as well as all the other replies classmates made.
   * @param componentId the component id
   * @param workgroupId the workgroup id
   * @returns an array containing all the component states for top level posts and replies that are
   * associated with the workgroup
   */
  getPostsAssociatedWithWorkgroupId(componentId, workgroupId) {
    let allPosts = [];
    const topLevelComponentStateIdsFound = [];
    const componentStates =
        this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId);
    for (let componentState of componentStates) {
      const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
      if (this.isTopLevelPost(componentState)) {
        if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentState.id)) {
          allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, componentState.id));
          topLevelComponentStateIdsFound.push(componentState.id);
        }
      } else {
        if (!this.isTopLevelComponentStateIdFound(topLevelComponentStateIdsFound, componentStateIdReplyingTo)) {
          allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, componentStateIdReplyingTo));
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
    return topLevelComponentStateIdsFound.indexOf(componentStateId) != -1;
  }

  /**
   * Get the top level post and all the replies to it
   * @param componentId the component id
   * @param componentStateId the component state id
   * @returns an array containing the top level post and all the replies
   */
  getPostAndAllReplies(componentId, componentStateId) {
    const postAndAllReplies = [];
    const componentStatesForNodeId = this.TeacherDataService.getComponentStatesByComponentId(componentId);
    for (let componentState of componentStatesForNodeId) {
      if (componentStateId === componentState.id) {
        postAndAllReplies.push(componentState);
      } else {
        const componentStateIdReplyingTo = componentState.studentData.componentStateIdReplyingTo;
        if (componentStateId === componentStateIdReplyingTo) {
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
    if (componentState != null) {
      const response = componentState.studentData.response;
      if (componentContent == null) {
        if (response != null && response !== '') {
          return true;
        }
      } else {
        const starterSentence = componentContent.starterSentence;
        if (starterSentence == null || starterSentence === '') {
          if (response != null && response !== '') {
            return true;
          }
        } else {
          if (response != null && response !== '' && response !== starterSentence) {
            return true;
          }
        }
      }
    }

    return false;
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

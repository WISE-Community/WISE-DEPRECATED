import NodeService from '../../services/nodeService';

class DiscussionService extends NodeService {
  constructor($filter,
      $http,
      $rootScope,
      $q,
      $injector,
      ConfigService,
      StudentDataService,
      UtilService) {
    super();

    this.$filter = $filter;
    this.$http = $http;
    this.$rootScope = $rootScope;
    this.$q = $q;
    this.$injector = $injector;
    this.ConfigService = ConfigService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;

    this.$translate = this.$filter('translate');

    if (this.ConfigService != null && this.ConfigService.getMode() == 'classroomMonitor') {
      // in the classroom monitor, we need access to the TeacherDataService so it can retrieve posts and replies for all students
      this.TeacherDataService = this.$injector.get('TeacherDataService');
    }
  }

  /**
   * Get the component type label
   * example
   * "Discussion"
   */
  getComponentTypeLabel() {
    return this.$translate('discussion.componentTypeLabel');
  }

  /**
   * Create a Discussion component object
   * @returns a new Discussion component object
   */
  createComponent() {
    var component = {};
    component.id = this.UtilService.generateKey();
    component.type = 'Discussion';
    component.prompt = this.$translate('ENTER_PROMPT_HERE');
    component.showSaveButton = false;
    component.showSubmitButton = false;
    component.isStudentAttachmentEnabled = true;
    component.gateClassmateResponses = true;
    return component;
  }

  /**
   * Copies an existing Discussion component object
   * @returns a copied Discussion component object
   */
  copyComponent(componentToCopy) {
    var component = this.createComponent();
    component.prompt = componentToCopy.prompt;
    component.showSaveButton = componentToCopy.showSaveButton;
    component.showSubmitButton = componentToCopy.showSubmitButton;
    component.isStudentAttachmentEnabled = componentToCopy.isStudentAttachmentEnabled;
    component.gateClassmateResponses = componentToCopy.gateClassmateResponses;
    return component;
  }

  populateComponentState(componentStateFromOtherComponent, otherComponentType) {
    var componentState = null;

    if (componentStateFromOtherComponent != null && otherComponentType != null) {
      componentState = StudentDataService.createComponentState();

      if (otherComponentType === 'OpenResponse') {
        componentState.studentData = componentStateFromOtherComponent.studentData;
      }
    }

    return componentState;
  };

  getClassmateResponses(runId, periodId, nodeId, componentId) {

    if (runId != null && periodId != null && nodeId != null && componentId != null) {
      return this.$q(angular.bind(this, function(resolve, reject) {

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = this.ConfigService.getConfigParam('studentDataURL');

        var params = {};
        params.runId = runId;
        params.periodId = periodId;
        params.nodeId = nodeId;
        params.componentId = componentId;
        params.getStudentWork = true;
        params.getAnnotations = true;
        httpParams.params = params;

        this.$http(httpParams).then(angular.bind(this, function(result) {
          var classmateData = result.data;

          //console.log(classmateData);

          resolve(classmateData);
        }));
      }));
    }
  };

  /**
   * Check if the component was completed
   * @param component the component object
   * @param componentStates the component states for the specific component
   * @param componentEvents the events for the specific component
   * @param nodeEvents the events for the parent node of the component
   * @returns whether the component was completed
   */
  isCompleted(component, componentStates, componentEvents, nodeEvents) {
    var result = false;

    if (componentStates != null) {

      // loop through all the component states
      for (var c = 0; c < componentStates.length; c++) {

        // the component state
        var componentState = componentStates[c];

        // get the student data from the component state
        var studentData = componentState.studentData;

        if (studentData != null) {
          var response = studentData.response;

          if (response != null) {
            // there is a response so the component is completed
            result = true;
            break;
          }
        }
      }
    }

    return result;
  };

  /**
   * Get all the posts associated with a workgroup id. This will
   * get all the posts and replies that the workgroup posted
   * or replied to as well as all the other replies classmates made.
   * @param componentId the component id
   * @param workgroupId the workgroup id
   * @returns an array containing all the component states for
   * top level posts and replies that are associated with the
   * workgroup
   */
  getPostsAssociatedWithWorkgroupId(componentId, workgroupId) {
    var allPosts = [];

    var topLevelComponentIdsFound = [];

    // get all the component states for the workgroup id
    var componentStates = this.TeacherDataService.getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId);

    if (componentStates != null) {

      // loop through all the component states
      for (var c = 0; c < componentStates.length; c++) {

        var componentState = componentStates[c];

        if (componentState != null) {
          var studentData = componentState.studentData;

          if (studentData != null) {
            if (studentData.componentStateIdReplyingTo == null) {

              // check if we have already added the top level post
              if (topLevelComponentIdsFound.indexOf(componentState.id) == -1) {
                // we haven't found the top level post yet so

                /*
                 * the component state is a top level post so we will
                 * get the post and all the replies to the post
                 */
                allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, componentState.id));

                topLevelComponentIdsFound.push(componentState.id);
              }
            } else {

              // check if we have already added the top level post
              if (topLevelComponentIdsFound.indexOf(studentData.componentStateIdReplyingTo) == -1) {
                // we haven't found the top level post yet so

                /*
                 * the component state is a reply so we will get the
                 * top level post and all the replies to it
                 */
                allPosts = allPosts.concat(this.getPostAndAllReplies(componentId, studentData.componentStateIdReplyingTo));

                topLevelComponentIdsFound.push(studentData.componentStateIdReplyingTo);
              }
            }
          }
        }
      }
    }

    return allPosts;
  }

  /**
   * Get the top level post and all the replies to it
   * @param componentId the component id
   * @param componentStateId the component state id
   * @returns an array containing the top level post and all the replies
   */
  getPostAndAllReplies(componentId, componentStateId) {
    var postAndAllReplies = [];

    // get all the component states for the node
    var componentStatesForNodeId = this.TeacherDataService.getComponentStatesByComponentId(componentId);

    for (var c = 0; c < componentStatesForNodeId.length; c++) {
      var tempComponentState = componentStatesForNodeId[c];

      if (tempComponentState != null) {
        if (componentStateId === tempComponentState.id) {
          // we have found the top level post
          postAndAllReplies.push(tempComponentState);
        } else {
          // check if the component state is a reply to the post we are looking for
          var studentData = tempComponentState.studentData;

          if (studentData != null) {
            var componentStateIdReplyingTo = studentData.componentStateIdReplyingTo;

            if (componentStateIdReplyingTo != null) {
              if (componentStateId === componentStateIdReplyingTo) {
                // this is a reply to the post we are looking for
                postAndAllReplies.push(tempComponentState);
              }
            }
          }
        }
      }
    }

    return postAndAllReplies;
  };

  /**
   * Whether this component generates student work
   * @param component (optional) the component object. if the component object
   * is not provided, we will use the default value of whether the
   * component type usually has work.
   * @return whether this component generates student work
   */
  componentHasWork(component) {
    return true;
  }

  /**
   * Whether this component uses a save button
   * @return whether this component uses a save button
   */
  componentUsesSaveButton() {
    return false;
  }

  /**
   * Whether this component uses a submit button
   * @return whether this component uses a submit button
   */
  componentUsesSubmitButton() {
    return false;
  }

  /**
   * Check if the component state has student work. Sometimes a component
   * state may be created if the student visits a component but doesn't
   * actually perform any work. This is where we will check if the student
   * actually performed any work.
   * @param componentState the component state object
   * @param componentContent the component content
   * @return whether the component state has any work
   */
  componentStateHasStudentWork(componentState, componentContent) {

    if (componentState != null) {

      let studentData = componentState.studentData;

      if (studentData != null) {

        // get the response from the student data
        let response = studentData.response;

        if (componentContent == null) {
          // the component content was not provided

          if (response != null && response !== '') {
            // the student has work
            return true;
          }
        } else {
          // the component content was provided

          let starterSentence = componentContent.starterSentence;

          if (starterSentence == null || starterSentence === '') {
            // there is no starter sentence

            if (response != null && response !== '') {
              // the student has work
              return true;
            }
          } else {
            /*
             * there is a starter sentence so we will compare it
             * with the student response
             */

            if (response != null && response !== '' && response !== starterSentence) {
              /*
               * the student has a response that is different than
               * the starter sentence
               */
              return true;
            }
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

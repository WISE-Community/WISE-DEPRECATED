'use strict';
import ProjectService from '../services/projectService';

class VLEProjectService extends ProjectService {
  constructor($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService) {
    super($filter, $http, $injector, $q, $rootScope, ConfigService, UtilService);
  }

  /**
   * Check if a component is a connected component
   * @param nodeId the node id of the component
   * @param componentId the component that is listening for connected changes
   * @param connectedComponentId the component that is broadcasting connected changes
   * @returns whether the componentId is connected to the connectedComponentId
   */
  isConnectedComponent(nodeId, componentId, connectedComponentId) {
    const component = this.getComponentByNodeIdAndComponentId(nodeId, componentId);
    if (component != null) {
      const connectedComponents = component.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
          if (connectedComponent != null) {
            /*
             * check if the connected component id matches the one
             * we are looking for. connectedComponent.id is the old
             * field we used to store the component id in so we will
             * look for that field for the sake of backwards
             * compatibility. connectedComponent.componentId is the
             * new field we store the component id in.
             */
            if (connectedComponentId === connectedComponent.id ||
              connectedComponentId === connectedComponent.componentId) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  /**
   * Get a connected component params
   * @param componentId the connected component id
   * @returns the params for the connected component
   */
  getConnectedComponentParams(componentContent, componentId) {
    let connectedComponentParams = null;
    if (componentContent != null && componentId != null) {
      const connectedComponents = componentContent.connectedComponents;
      if (connectedComponents != null) {
        for (let connectedComponent of connectedComponents) {
          if (connectedComponent != null) {
            /*
             * check if the connected component id matches the one
             * we are looking for. connectedComponent.id is the old
             * field we used to store the component id in so we will
             * look for that field for the sake of backwards
             * compatibility. connectedComponent.componentId is the
             * new field we store the component id in.
             */
            if (componentId === connectedComponent.id ||
              componentId === connectedComponent.componentId) {
              connectedComponentParams = connectedComponent;
            }
          }
        }
      }
    }
    return connectedComponentParams;
  }

  /**
   * Check if we need to display the annotation to the student
   * @param annotation the annotation
   * @returns {boolean} whether we need to display the annotation to the student
   */
  displayAnnotation(annotation) {
    const component = this.getComponentByNodeIdAndComponentId(annotation.nodeId, annotation.componentId);
    if (component != null) {
      const componentService = this.$injector.get(component.type + 'Service');
      return componentService.displayAnnotation(component, annotation);
    }
    return true;
  }

  /**
   * Get the global annotation properties for the specified component and score, if exists.
   * @param component the component content
   * @param previousScore the previousScore we want the annotation properties for, can be null, which means we just want to look at
   * the currentScore
   * @param currentScore the currentScore we want the annotation properties for
   * @returns the annotation properties for the given score
   */
  getGlobalAnnotationGroupByScore(component, previousScore, currentScore) {
    let annotationGroup = null;
    if (component.globalAnnotationSettings != null &&
      component.globalAnnotationSettings.globalAnnotationGroups != null) {
      let globalAnnotationGroups = component.globalAnnotationSettings.globalAnnotationGroups;
      for (let globalAnnotationGroup of globalAnnotationGroups) {
        if (globalAnnotationGroup.enableCriteria != null &&
          globalAnnotationGroup.enableCriteria.scoreSequence != null) {
          let scoreSequence = globalAnnotationGroup.enableCriteria.scoreSequence;
          if (scoreSequence != null) {
            /*
             * get the expected previous score and current score
             * that will satisfy the rule
             */
            let previousScoreMatch = scoreSequence[0];
            let currentScoreMatch = scoreSequence[1];

            if (previousScore == null) {
              // just matching on the current score
              if (previousScoreMatch == "" &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                // found a match
                annotationGroup = globalAnnotationGroup;
                break;
              }
            } else {
              if (previousScore.toString().match("[" + previousScoreMatch + "]") &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                /*
                 * the previous score and current score match the
                 * expected scores so we have found the rule we want
                 */
                annotationGroup = globalAnnotationGroup;
                break;
              }
            }
          }
        }
      }
    }
    return annotationGroup;
  }

  /**
   * Get the notification for the given score, if exists.
   * @param component the component content
   * @param previousScore the previousScore we want notification for, can be null, which means we just want to look at
   * the currentScore
   * @param currentScore the currentScore we want notification for
   * @returns the notification for the given score
   */
  getNotificationByScore(component, previousScore, currentScore) {
    let notificationResult = null;
    if (component.notificationSettings != null &&
      component.notificationSettings.notifications != null) {
      let notifications = component.notificationSettings.notifications;
      for (let notification of notifications) {
        if (notification.enableCriteria != null &&
          notification.enableCriteria.scoreSequence != null) {
          let scoreSequence = notification.enableCriteria.scoreSequence;
          if (scoreSequence != null) {
            /*
             * get the expected previous score and current score
             * that will satisfy the rule
             */
            let previousScoreMatch = scoreSequence[0];
            let currentScoreMatch = scoreSequence[1];

            if (previousScore == null) {
              // just matching on the current score
              if (previousScoreMatch == "" &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                notificationResult = notification;
                break;
              }
            } else {
              if (previousScore.toString().match("[" + previousScoreMatch + "]") &&
                currentScore.toString().match("[" + currentScoreMatch + "]")) {
                /*
                 * the previous score and current score match the
                 * expected scores so we have found the rule we want
                 */
                notificationResult = notification;
                break;
              }
            }
          }
        }
      }
    }
    return notificationResult;
  }

  /**
   * Retrieve the script with the provided script filename
   * @param scriptFilename
   */
  retrieveScript(scriptFilename) {
    let assetDirectoryPath = this.ConfigService.getProjectAssetsDirectoryPath();
    let scriptPath = assetDirectoryPath + "/" + scriptFilename;
    return this.$http.get(scriptPath).then((result) => {
      return result.data;
    });
  };

  /**
   * Registers an additionalProcessingFunction for the specified node and component
   * @param nodeId the node id
   * @param componentId the component id
   * @param additionalProcessingFunction the function to register for the node and component.
   */
  addAdditionalProcessingFunction(nodeId, componentId, additionalProcessingFunction) {
    let key = nodeId + "_" + componentId;
    if (this.additionalProcessingFunctionsMap[key] == null) {
      this.additionalProcessingFunctionsMap[key] = [];
    }
    this.additionalProcessingFunctionsMap[key].push(additionalProcessingFunction);
  }
}

VLEProjectService.$inject = [
  '$filter',
  '$http',
  '$injector',
  '$q',
  '$rootScope',
  'ConfigService',
  'UtilService'
];

export default VLEProjectService;

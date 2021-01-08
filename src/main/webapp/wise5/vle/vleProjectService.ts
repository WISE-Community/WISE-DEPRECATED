'use strict';
import { ProjectService } from '../services/projectService';
import { ConfigService } from '../services/configService';
import { UtilService } from '../services/utilService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { HttpClient } from '@angular/common/http';
import { SessionService } from '../services/sessionService';

@Injectable()
export class VLEProjectService extends ProjectService {
  constructor(
    protected upgrade: UpgradeModule,
    protected http: HttpClient,
    protected ConfigService: ConfigService,
    protected SessionService: SessionService,
    protected UtilService: UtilService
  ) {
    super(upgrade, http, ConfigService, SessionService, UtilService);
  }

  /**
   * @param nodeId the node id of the component
   * @param componentId the component that is listening for connected changes
   * @param connectedComponentId the component that is broadcasting connected changes
   * @returns whether the componentId is connected to the connectedComponentId
   */
  isConnectedComponent(nodeId, componentId, connectedComponentId) {
    const connectedComponents = this.getConnectedComponentsByNodeIdAndComponentId(
      nodeId,
      componentId
    );
    for (const connectedComponent of connectedComponents) {
      if (this.isMatchingConnectedComponent(connectedComponent, connectedComponentId)) {
        return true;
      }
    }
    return false;
  }

  isMatchingConnectedComponent(connectedComponent, id) {
    return connectedComponent.id === id || connectedComponent.componentId === id;
  }

  /**
   * @param componentId the connected component id
   * @returns the params for the connected component
   */
  getConnectedComponentParams(componentContent, componentId) {
    for (const connectedComponent of componentContent.connectedComponents) {
      if (this.isMatchingConnectedComponent(connectedComponent, componentId)) {
        return connectedComponent;
      }
    }
    return null;
  }

  /**
   * Check if we need to display the annotation to the student
   * @param annotation the annotation
   * @returns {boolean} whether we need to display the annotation to the student
   */
  displayAnnotation(annotation) {
    const component = this.getComponentByNodeIdAndComponentId(
      annotation.nodeId,
      annotation.componentId
    );
    const componentService = this.upgrade.$injector.get(component.type + 'Service');
    return componentService.displayAnnotation(component, annotation);
  }

  /**
   * Get the global annotation properties for the specified component and score, if exists.
   * @param component the component content
   * @param previousScore the previousScore we want the annotation properties for, can be null,
   * which means we just want to look at the currentScore
   * @param currentScore the currentScore we want the annotation properties for
   * @returns the annotation properties for the given score
   */
  getGlobalAnnotationGroupByScore(component, previousScore, currentScore) {
    for (const globalAnnotationGroup of component.globalAnnotationSettings.globalAnnotationGroups) {
      const scoreSequence = globalAnnotationGroup.enableCriteria.scoreSequence;
      if (this.isScoreSequenceMatch(scoreSequence, previousScore, currentScore)) {
        return globalAnnotationGroup;
      }
    }
    return null;
  }

  isScoreSequenceMatch(scoreSequence, previousScore, currentScore) {
    const previousScoreMatch = this.getExpectedPreviousScore(scoreSequence);
    const currentScoreMatch = this.getExpectedCurrentScore(scoreSequence);
    if (previousScore == null) {
      if (previousScoreMatch === '' && this.isScoreMatch(currentScore, currentScoreMatch)) {
        return true;
      }
    } else if (
      this.isScoreMatch(previousScore, previousScoreMatch) &&
      this.isScoreMatch(currentScore, currentScoreMatch)
    ) {
      return true;
    }
    return false;
  }

  getExpectedPreviousScore(scoreSequence) {
    return scoreSequence[0];
  }

  getExpectedCurrentScore(scoreSequence) {
    return scoreSequence[1];
  }

  isScoreMatch(score, expectedScore) {
    return score.toString().match(`[${expectedScore}]`) != null;
  }

  /**
   * @param component the component content
   * @param previousScore the previousScore we want notification for, can be null, which means we
   * just want to look at the currentScore
   * @param currentScore the currentScore we want notification for
   * @returns the notification for the given score
   */
  getNotificationByScore(component, previousScore, currentScore) {
    for (const notification of component.notificationSettings.notifications) {
      const scoreSequence = notification.enableCriteria.scoreSequence;
      if (this.isScoreSequenceMatch(scoreSequence, previousScore, currentScore)) {
        return notification;
      }
    }
    return null;
  }

  retrieveScript(scriptFilename) {
    return this.upgrade.$injector
      .get('$http')
      .get(`${this.ConfigService.getProjectAssetsDirectoryPath()}/${scriptFilename}`)
      .then((result) => {
        return result.data;
      });
  }

  /**
   * @param nodeId the node id
   * @param componentId the component id
   * @param additionalProcessingFunction the function to register for the node and component.
   */
  addAdditionalProcessingFunction(nodeId, componentId, additionalProcessingFunction) {
    const key = nodeId + '_' + componentId;
    if (this.additionalProcessingFunctionsMap[key] == null) {
      this.additionalProcessingFunctionsMap[key] = [];
    }
    this.additionalProcessingFunctionsMap[key].push(additionalProcessingFunction);
  }
}

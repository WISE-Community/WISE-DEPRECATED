'use strict';

import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { ProjectService } from './projectService';
import { ConfigService } from './configService';
import { UtilService } from './utilService';
import * as angular from 'angular';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AnnotationService {
  activeGlobalAnnotationGroups: any;
  annotations: any;
  dummyAnnotationId: number = 1; // used in preview mode when we simulate saving of annotation
  private annotationSavedToServerSource: Subject<any> = new Subject<any>();
  public annotationSavedToServer$: Observable<any> = this.annotationSavedToServerSource.asObservable();
  private annotationReceivedSource: Subject<any> = new Subject<any>();
  public annotationReceived$: Observable<any> = this.annotationReceivedSource.asObservable();
  private displayGlobalAnnotationsSource: Subject<any> = new Subject<any>();
  public displayGlobalAnnotations$: Observable<any> = this.displayGlobalAnnotationsSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService,
    private UtilService: UtilService
  ) {}

  getAnnotations() {
    return this.annotations;
  }

  /**
   * Get the annotation with the specified id, or null if not found
   * @param annotationId
   */
  getAnnotationById(annotationId) {
    for (let annotation of this.annotations) {
      if (annotation.id === annotationId) {
        return annotation;
      }
    }
    return null;
  }

  /**
   * Get the latest annotation with the given params
   * @param params an object containing the params to match
   * @returns the latest annotation that matches the params
   */
  getLatestAnnotation(params) {
    let annotation = null;

    if (params != null) {
      let nodeId = params.nodeId;
      let componentId = params.componentId;
      let fromWorkgroupId = params.fromWorkgroupId;
      let toWorkgroupId = params.toWorkgroupId;
      let type = params.type;

      let annotations = this.annotations;

      if (annotations != null) {
        for (let a = annotations.length - 1; a >= 0; a--) {
          let tempAnnotation = annotations[a];

          if (tempAnnotation != null) {
            let match = true;

            if (nodeId && tempAnnotation.nodeId !== nodeId) {
              match = false;
            }
            if (match && componentId && tempAnnotation.componentId !== componentId) {
              match = false;
            }
            if (match && fromWorkgroupId && tempAnnotation.fromWorkgroupId !== fromWorkgroupId) {
              match = false;
            }
            if (match && toWorkgroupId && tempAnnotation.toWorkgroupId !== toWorkgroupId) {
              match = false;
            }
            if (match && type) {
              if (type.constructor === Array) {
                for (let thisType of type) {
                  if (tempAnnotation.type !== thisType) {
                    match = false;
                  }
                }
              } else {
                if (tempAnnotation.type !== type) {
                  match = false;
                }
              }
            }

            if (match) {
              annotation = tempAnnotation;
              break;
            }
          }
        }
      }
    }
    return annotation;
  }

  /**
   * Create an annotation object
   * @param annotationId the annotation id
   * @param runId the run id
   * @param periodId the period id
   * @param fromWorkgroupId the from workgroup id
   * @param toWorkgroupId the to workgroup id
   * @param nodeId the node id
   * @param componentId the component id
   * @param studentWorkId the student work id
   * @param annotationType the annotation type
   * @param data the data
   * @param clientSaveTime the client save time
   * @returns an annotation object
   */
  createAnnotation(
    annotationId,
    runId,
    periodId,
    fromWorkgroupId,
    toWorkgroupId,
    nodeId,
    componentId,
    studentWorkId,
    localNotebookItemId,
    notebookItemId,
    annotationType,
    data,
    clientSaveTime
  ) {
    return {
      id: annotationId,
      runId: runId,
      periodId: periodId,
      fromWorkgroupId: fromWorkgroupId,
      toWorkgroupId: toWorkgroupId,
      nodeId: nodeId,
      componentId: componentId,
      studentWorkId: studentWorkId,
      localNotebookItemId: localNotebookItemId,
      notebookItemId: notebookItemId,
      type: annotationType,
      data: data,
      clientSaveTime: clientSaveTime
    };
  }

  /**
   * Save the annotation to the server
   * @param annotation the annotation object
   * @returns a promise
   */
  saveAnnotation(annotation) {
    annotation.requestToken = this.UtilService.generateKey(); // use this to keep track of unsaved annotations.
    this.addOrUpdateAnnotation(annotation);
    const annotations = [annotation];
    if (this.ConfigService.isPreview()) {
      // if we're in preview, don't make any request to the server but pretend we did
      let savedAnnotationDataResponse = {
        annotations: annotations
      };
      let annotation = this.saveToServerSuccess(savedAnnotationDataResponse);
      let deferred = this.upgrade.$injector.get('$q').defer();
      deferred.resolve(annotation);
      return deferred.promise;
    } else {
      const params = {
        runId: this.ConfigService.getRunId(),
        workgroupId: this.ConfigService.getWorkgroupId(),
        annotations: angular.toJson(annotations)
      };
      const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
      return this.http
        .post(this.ConfigService.getConfigParam('teacherDataURL'), $.param(params), {
          headers: headers
        })
        .toPromise()
        .then((savedAnnotationDataResponse: any) => {
          return this.saveToServerSuccess(savedAnnotationDataResponse);
        });
    }
  }

  saveToServerSuccess(savedAnnotationDataResponse) {
    let localAnnotation = null;
    if (savedAnnotationDataResponse != null) {
      let savedAnnotations = savedAnnotationDataResponse.annotations;
      let localAnnotations = this.annotations;
      if (savedAnnotations != null && localAnnotations != null) {
        for (let savedAnnotation of savedAnnotations) {
          for (let y = localAnnotations.length - 1; y >= 0; y--) {
            localAnnotation = localAnnotations[y];

            if (localAnnotation.id != null && localAnnotation.id === savedAnnotation.id) {
              // we have found the matching local annotation so we will update it
              localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
              //localAnnotation.requestToken = null; // requestToken is no longer needed.

              this.broadcastAnnotationSavedToServer({ annotation: localAnnotation });
              break;
            } else if (
              localAnnotation.requestToken != null &&
              localAnnotation.requestToken === savedAnnotation.requestToken
            ) {
              // we have found the matching local annotation so we will update it
              localAnnotation.id = savedAnnotation.id;
              localAnnotation.serverSaveTime = savedAnnotation.serverSaveTime;
              localAnnotation.requestToken = null; // requestToken is no longer needed.

              if (this.ConfigService.isPreview() && localAnnotation.id == null) {
                /*
                 * we are in preview mode so we will set a dummy
                 * annotation id into the annotation
                 */
                localAnnotation.id = this.dummyAnnotationId;
                /*
                 * increment the dummy annotation id for the next
                 * annotation
                 */
                this.dummyAnnotationId++;
              }

              this.broadcastAnnotationSavedToServer({ annotation: localAnnotation });
              break;
            }
          }
        }
      }
    }
    return localAnnotation;
  }

  addOrUpdateAnnotation(annotation) {
    let isAnnotationFound = false;
    for (let a = this.annotations.length - 1; a >= 0; a--) {
      const localAnnotation = this.annotations[a];
      if (this.isAnnotationMatch(annotation, localAnnotation)) {
        isAnnotationFound = true;
        localAnnotation.data = annotation.data;
        localAnnotation.clientSaveTime = annotation.clientSaveTime;
        localAnnotation.serverSaveTime = annotation.serverSaveTime;
      }
    }
    if (!isAnnotationFound) {
      this.annotations.push(annotation);
    }
  }

  isAnnotationMatch(annotation1, annotation2) {
    return (
      annotation1.id === annotation2.id &&
      annotation1.nodeId === annotation2.nodeId &&
      annotation1.componentId === annotation2.componentId &&
      annotation1.fromWorkgroupId === annotation2.fromWorkgroupId &&
      annotation1.toWorkgroupId === annotation2.toWorkgroupId &&
      annotation1.type === annotation2.type &&
      annotation1.studentWorkId === annotation2.studentWorkId &&
      annotation1.runId === annotation2.runId &&
      annotation1.periodId === annotation2.periodId
    );
  }

  /**
   * Set the annotations
   * @param annotations the annotations aray
   */
  setAnnotations(annotations) {
    this.annotations = annotations;
  }

  /**
   * Get the total score for a workgroup
   * @param annotations an array of annotations
   * @param workgroupId the workgroup id
   */
  getTotalScore(annotations, workgroupId) {
    let totalScore = 0;
    const scoresFound = [];

    if (annotations != null && workgroupId != null) {
      for (let a = annotations.length - 1; a >= 0; a--) {
        const annotation = annotations[a];
        if (annotation != null && annotation.toWorkgroupId == workgroupId) {
          if (annotation.type === 'score' || annotation.type === 'autoScore') {
            const nodeId = annotation.nodeId;
            const componentId = annotation.componentId;
            const data = annotation.data;
            if (this.ProjectService.isActive(nodeId)) {
              const scoreFound = nodeId + '-' + componentId;
              if (scoresFound.indexOf(scoreFound) == -1) {
                if (data != null) {
                  const value = data.value;
                  if (!isNaN(value)) {
                    if (totalScore == null) {
                      totalScore = value;
                    } else {
                      totalScore += value;
                    }

                    /*
                     * remember that we have found a score for this component
                     * so that we don't double count it if the teacher scored
                     * the component more than once
                     */
                    scoresFound.push(scoreFound);
                  }
                }
              }
            }
          }
        }
      }
    }
    return totalScore;
  }

  /**
   * Get the score for a workgroup for a node
   * @param workgroupId the workgroup id
   * @param nodeId the node id
   * @returns the score for a workgroup for a node
   */
  getScore(workgroupId, nodeId) {
    let score = null;

    /*
     * an array to keep track of the components that we have obtained a
     * score for. we do not want to double count components if the student
     * has received a score multiple times for a node from the teacher.
     */
    const scoresFound = [];
    const annotations = this.annotations;

    if (workgroupId != null && nodeId != null) {
      for (let a = annotations.length - 1; a >= 0; a--) {
        const annotation = annotations[a];
        if (annotation != null && annotation.toWorkgroupId == workgroupId) {
          if (annotation.type === 'score' || annotation.type === 'autoScore') {
            const tempNodeId = annotation.nodeId;
            if (nodeId == tempNodeId) {
              const tempComponentId = annotation.componentId;
              if (this.componentExists(tempNodeId, tempComponentId)) {
                const data = annotation.data;
                const scoreFound = tempNodeId + '-' + tempComponentId;
                if (scoresFound.indexOf(scoreFound) == -1) {
                  if (data != null) {
                    const value = data.value;
                    if (!isNaN(value)) {
                      if (score == null) {
                        score = value;
                      } else {
                        score += value;
                      }

                      /*
                       * remember that we have found a score for this component
                       * so that we don't double count it if the teacher scored
                       * the component more than once
                       */
                      scoresFound.push(scoreFound);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return score;
  }

  componentExists(nodeId, componentId) {
    return this.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId) != null;
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
  createAutoScoreAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
    const annotationId = null;
    const fromWorkgroupId = null;
    const studentWorkId = null;
    const localNotebookItemId = null;
    const notebookItemId = null;
    const annotationType = 'autoScore';
    const clientSaveTime = Date.parse(new Date().toString());
    const annotation = this.createAnnotation(
      annotationId,
      runId,
      periodId,
      fromWorkgroupId,
      toWorkgroupId,
      nodeId,
      componentId,
      studentWorkId,
      localNotebookItemId,
      notebookItemId,
      annotationType,
      data,
      clientSaveTime
    );
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
  createAutoCommentAnnotation(runId, periodId, nodeId, componentId, toWorkgroupId, data) {
    const annotationId = null;
    const fromWorkgroupId = null;
    const studentWorkId = null;
    const localNotebookItemId = null;
    const notebookItemId = null;
    const annotationType = 'autoComment';
    const clientSaveTime = Date.parse(new Date().toString());
    const annotation = this.createAnnotation(
      annotationId,
      runId,
      periodId,
      fromWorkgroupId,
      toWorkgroupId,
      nodeId,
      componentId,
      studentWorkId,
      localNotebookItemId,
      notebookItemId,
      annotationType,
      data,
      clientSaveTime
    );
    return annotation;
  }

  /**
   * Create an auto comment annotation
   * @param runId the run id
   * @param periodId the period id
   * @param nodeId the node id
   * @param componentId the component id
   * @param fromWorkgroupId the teacher workgroup id
   * @param toWorkgroupId the student workgroup id
   * @param studentWorkId the component state id
   * @param data the annotation data
   * @returns the inappropriate flag annotation
   */
  createInappropriateFlagAnnotation(
    runId,
    periodId,
    nodeId,
    componentId,
    fromWorkgroupId,
    toWorkgroupId,
    studentWorkId,
    data
  ) {
    const annotationId = null;
    const localNotebookItemId = null;
    const notebookItemId = null;
    const annotationType = 'inappropriateFlag';
    const clientSaveTime = Date.parse(new Date().toString());
    const annotation = this.createAnnotation(
      annotationId,
      runId,
      periodId,
      fromWorkgroupId,
      toWorkgroupId,
      nodeId,
      componentId,
      studentWorkId,
      localNotebookItemId,
      notebookItemId,
      annotationType,
      data,
      clientSaveTime
    );
    return annotation;
  }

  /**
   * Get the latest annotations for a given component (as an object)
   * @param nodeId the node id
   * @param componentId the component id
   * @param workgroupId the workgroup id
   * @param scoreType (optional) the type of score
   * e.g.
   * 'autoScore' for auto graded score
   * 'score' for teacher graded score
   * 'any' for auto graded score or teacher graded score
   * @param commentType (optional) the type of comment
   * e.g.
   * 'autoComment' for auto graded comment
   * 'comment' for teacher graded comment
   * 'any' for auto graded comment or teacher graded comment
   * @return object containing the component's latest score and comment annotations
   */
  getLatestComponentAnnotations(
    nodeId,
    componentId,
    workgroupId,
    scoreType = null,
    commentType = null
  ) {
    let latestScoreAnnotation = this.getLatestScoreAnnotation(
      nodeId,
      componentId,
      workgroupId,
      scoreType
    );
    let latestCommentAnnotation = this.getLatestCommentAnnotation(
      nodeId,
      componentId,
      workgroupId,
      commentType
    );

    return {
      score: latestScoreAnnotation,
      comment: latestCommentAnnotation
    };
  }

  /**
   * Get the latest annotations for a given notebook item (as an object)
   * @param workgroupId the workgroup id that did the notebook
   * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
   */
  getLatestNotebookItemAnnotations(workgroupId, localNotebookItemId) {
    let latestScoreAnnotation = null;
    let latestCommentAnnotation = null;
    latestScoreAnnotation = this.getLatestNotebookItemScoreAnnotation(
      workgroupId,
      localNotebookItemId
    );
    latestCommentAnnotation = this.getLatestNotebookItemCommentAnnotation(
      workgroupId,
      localNotebookItemId
    );

    return {
      score: latestScoreAnnotation,
      comment: latestCommentAnnotation
    };
  }

  /**
   * Get the latest score annotation for this workgroup and localNotebookItemId, or null if not found
   * @param workgroupId the workgroup id that did the notebook
   * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
   */
  getLatestNotebookItemScoreAnnotation(workgroupId, localNotebookItemId) {
    let annotations = this.getAnnotations();
    for (let a = annotations.length - 1; a >= 0; a--) {
      let annotation = annotations[a];
      if (
        annotation != null &&
        annotation.type === 'score' &&
        annotation.notebookItemId != null &&
        annotation.localNotebookItemId === localNotebookItemId
      ) {
        return annotation;
      }
    }
    return null;
  }

  /**
   * Get the latest comment annotation for this workgroup and localNotebookItemId, or null if not found
   * @param workgroupId the workgroup id that did the notebook
   * @param localNotebookItemId unique id for note and its revisions ["finalReport", "xyzabc", ...]
   */
  getLatestNotebookItemCommentAnnotation(workgroupId, localNotebookItemId) {
    let annotations = this.getAnnotations();
    for (let a = annotations.length - 1; a >= 0; a--) {
      let annotation = annotations[a];
      if (
        annotation != null &&
        annotation.type === 'comment' &&
        annotation.notebookItemId != null &&
        annotation.localNotebookItemId === localNotebookItemId
      ) {
        return annotation;
      }
    }
    return null;
  }

  /**
   * Get the latest score annotation
   * @param nodeId the node id
   * @param componentId the component id
   * @param workgroupId the workgroup id
   * @param scoreType (optional) the type of score
   * e.g.
   * 'autoScore' for auto graded score
   * 'score' for teacher graded score
   * 'any' for auto graded score or teacher graded score
   * @returns the latest score annotation
   */
  getLatestScoreAnnotation(nodeId, componentId, workgroupId, scoreType = null) {
    let annotation = null;
    const annotations = this.getAnnotations();

    if (scoreType == null) {
      scoreType = 'any';
    }

    for (let a = annotations.length - 1; a >= 0; a--) {
      const tempAnnotation = annotations[a];
      if (tempAnnotation != null) {
        let acceptAnnotation = false;
        const tempNodeId = tempAnnotation.nodeId;
        const tempComponentId = tempAnnotation.componentId;
        const tempToWorkgroupId = tempAnnotation.toWorkgroupId;
        const tempAnnotationType = tempAnnotation.type;

        if (
          nodeId == tempNodeId &&
          componentId == tempComponentId &&
          workgroupId == tempToWorkgroupId
        ) {
          if (
            scoreType === 'any' &&
            (tempAnnotationType === 'autoScore' || tempAnnotationType === 'score')
          ) {
            acceptAnnotation = true;
          } else if (scoreType === 'autoScore' && tempAnnotationType === 'autoScore') {
            acceptAnnotation = true;
          } else if (scoreType === 'score' && tempAnnotationType === 'score') {
            acceptAnnotation = true;
          }

          if (acceptAnnotation) {
            annotation = tempAnnotation;
            break;
          }
        }
      }
    }
    return annotation;
  }

  isThereAnyScoreAnnotation(nodeId, componentId, periodId) {
    const annotations = this.getAnnotations();
    for (const annotation of annotations) {
      if (
        annotation.nodeId === nodeId &&
        annotation.componentId === componentId &&
        this.UtilService.isMatchingPeriods(annotation.periodId, periodId) &&
        (annotation.type === 'score' || annotation.type === 'autoScore')
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the latest comment annotation
   * @param nodeId the node id
   * @param componentId the component id
   * @param workgroupId the workgroup id
   * @param commentType (optional) the type of comment
   * e.g.
   * 'autoComment' for auto graded comment
   * 'comment' for teacher graded comment
   * 'any' for auto graded comment or teacher graded comment
   * @returns the latest comment annotation
   */
  getLatestCommentAnnotation(nodeId, componentId, workgroupId, commentType) {
    let annotation = null;
    const annotations = this.getAnnotations();

    if (commentType == null) {
      commentType = 'any';
    }

    for (let a = annotations.length - 1; a >= 0; a--) {
      const tempAnnotation = annotations[a];
      if (tempAnnotation != null) {
        let acceptAnnotation = false;
        const tempNodeId = tempAnnotation.nodeId;
        const tempComponentId = tempAnnotation.componentId;
        const tempToWorkgroupId = tempAnnotation.toWorkgroupId;
        const tempAnnotationType = tempAnnotation.type;

        if (
          nodeId == tempNodeId &&
          componentId == tempComponentId &&
          workgroupId == tempToWorkgroupId
        ) {
          if (
            commentType === 'any' &&
            (tempAnnotationType === 'autoComment' || tempAnnotationType === 'comment')
          ) {
            acceptAnnotation = true;
          } else if (commentType === 'autoComment' && tempAnnotationType === 'autoComment') {
            acceptAnnotation = true;
          } else if (commentType === 'comment' && tempAnnotationType === 'comment') {
            acceptAnnotation = true;
          }

          if (acceptAnnotation) {
            annotation = tempAnnotation;
            break;
          }
        }
      }
    }
    return annotation;
  }

  /**
   * Get the score value from the score annotation
   * @param scoreAnnotation a score annotation
   * @returns the score value e.g. 5
   */
  getScoreValueFromScoreAnnotation(scoreAnnotation) {
    if (scoreAnnotation != null) {
      const data = scoreAnnotation.data;

      if (data != null) {
        return data.value;
      }
    }
    return null;
  }

  /**
   * Get all global annotations that are active and inactive for a specified node and component
   * @returns all global annotations that are active and inactive for a specified node and component
   */
  getAllGlobalAnnotationsByNodeIdAndComponentId(nodeId, componentId) {
    let allGlobalAnnotations = this.getAllGlobalAnnotations();
    let globalAnnotationsByNodeIdAndComponentId = allGlobalAnnotations.filter(
      (globalAnnotation) => {
        return globalAnnotation.nodeId === nodeId && globalAnnotation.componentId === componentId;
      }
    );
    return globalAnnotationsByNodeIdAndComponentId;
  }

  /**
   * Get all global annotations that are active and inactive
   * @returns all global annotations that are active and inactive
   */
  getAllGlobalAnnotations() {
    let globalAnnotations = [];
    for (let annotation of this.annotations) {
      if (annotation != null && annotation.data != null) {
        if (annotation.data.isGlobal) {
          globalAnnotations.push(annotation);
        }
      }
    }
    return globalAnnotations;
  }

  /**
   * Get all global annotations that are active and inactive and groups them by annotation group name
   * @returns all global annotations that are active and inactive
   */
  getAllGlobalAnnotationGroups() {
    let globalAnnotationGroups = [];
    for (let annotation of this.annotations) {
      if (annotation != null && annotation.data != null) {
        if (annotation.data.isGlobal) {
          // check if this global annotation can be grouped (has the same annotationGroupName as another that we've seen before)
          if (
            annotation.data.annotationGroupName != null &&
            annotation.data.annotationGroupCreatedTime != null
          ) {
            let sameGroupFound = false;
            for (let globalAnnotationGroup of globalAnnotationGroups) {
              if (
                globalAnnotationGroup.annotationGroupNameAndTime ==
                annotation.data.annotationGroupName + annotation.data.annotationGroupCreatedTime
              ) {
                // push this annotation to the end of the group
                globalAnnotationGroup.annotations.push(annotation);
                sameGroupFound = true;
              }
            }
            if (!sameGroupFound) {
              let annotationGroup = {
                annotationGroupNameAndTime:
                  annotation.data.annotationGroupName + annotation.data.annotationGroupCreatedTime,
                annotations: [annotation]
              };
              globalAnnotationGroups.push(annotationGroup);
            }
          } else {
            // each global annotation should have a name, so it shouldn't get here
            console.error(
              this.upgrade.$injector.get('$filter')('translate')(
                'GLOBAL_ANNOTATION_DOES_NOT_HAVE_A_NAME'
              ) + annotation
            );
          }
        }
      }
    }
    return globalAnnotationGroups;
  }

  /**
   * Get all global annotations that are active
   * @returns all global annotations that are active, in a group
   * [
   * {
   *   annotationGroupName:"score1",
   *   annotations:[
   *   {
   *     type:autoScore,
   *     value:1
   *   },
   *   {
   *     type:autoComment,
   *     value:"you received a score of 1."
   *   }
   *   ]
   * },
   * {
   *   annotationGroupName:"score2",
   *   annotations:[...]
   * }
   * ]
   */
  getActiveGlobalAnnotationGroups() {
    return this.activeGlobalAnnotationGroups;
  }

  /**
   * Calculates the active global annotations and groups them by annotation group name
   */
  calculateActiveGlobalAnnotationGroups() {
    this.activeGlobalAnnotationGroups = [];

    for (let annotation of this.annotations) {
      if (annotation != null && annotation.data != null) {
        if (annotation.data.isGlobal && annotation.data.unGlobalizedTimestamp == null) {
          // check if this global annotation can be grouped (has the same annotationGroupName as another that we've seen before)
          if (annotation.data.annotationGroupName != null) {
            let sameGroupFound = false;
            for (let activeGlobalAnnotationGroup of this.activeGlobalAnnotationGroups) {
              if (
                activeGlobalAnnotationGroup.annotationGroupName ==
                annotation.data.annotationGroupName +
                  '_' +
                  annotation.data.annotationGroupCreatedTime
              ) {
                // push this annotation to the end of the group
                activeGlobalAnnotationGroup.annotations.push(annotation);
                sameGroupFound = true;
              }
            }
            if (!sameGroupFound) {
              let annotationGroup = {
                annotationGroupName:
                  annotation.data.annotationGroupName +
                  '_' +
                  annotation.data.annotationGroupCreatedTime,
                annotations: [annotation],
                nodeId: annotation.nodeId,
                componentId: annotation.componentId,
                serverSaveTime: annotation.serverSaveTime
              };
              this.activeGlobalAnnotationGroups.push(annotationGroup);
            }
          } else {
            // each global annotation should have a name, so it shouldn't get here
            console.error(
              this.upgrade.$injector.get('$filter')('translate')(
                'GLOBAL_ANNOTATION_DOES_NOT_HAVE_A_NAME'
              ) + annotation
            );
          }
        }
      }
    }
  }

  /**
   * Get all global annotations that are in-active
   * @returns all global annotations that are in-active
   * In-active global annotations has data.isGlobal = false and data.unGlobalizedTimestamp is set.
   */
  getInActiveGlobalAnnotations() {
    let inActiveGlobalAnnotations = [];
    for (let annotation of this.annotations) {
      if (annotation != null && annotation.data != null) {
        if (annotation.data.isGlobal && annotation.data.unGlobalizedTimestamp != null) {
          inActiveGlobalAnnotations.push(annotation);
        }
      }
    }
    return inActiveGlobalAnnotations;
  }

  /**
   * Get the latest teacher score annotation for a student work id
   * @param studentWorkId the student work id
   * @return the latest teacher score annotation for the student work
   */
  getLatestTeacherScoreAnnotationByStudentWorkId(studentWorkId) {
    return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'score');
  }

  /**
   * Get the latest teacher comment annotation for a student work id
   * @param studentWorkId the student work id
   * @return the latest teacher comment annotation for the student work
   */
  getLatestTeacherCommentAnnotationByStudentWorkId(studentWorkId) {
    return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'comment');
  }

  /**
   * Get the latest auto score annotation for a student work id
   * @param studentWorkId the student work id
   * @return the latest auto score annotation for the student work
   */
  getLatestAutoScoreAnnotationByStudentWorkId(studentWorkId) {
    return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'autoScore');
  }

  /**
   * Get the latest auto comment annotation for a student work id
   * @param studentWorkId the student work id
   * @return the latest auto comment annotation for the student work
   */
  getLatestAutoCommentAnnotationByStudentWorkId(studentWorkId) {
    return this.getLatestAnnotationByStudentWorkIdAndType(studentWorkId, 'autoComment');
  }

  /**
   * Get the latest annotation for the given student work and annotation type
   * @param studentWorkId the student work id
   * @param type the type of annotation
   * @return the latest annotation for the given student work and annotation type
   */
  getLatestAnnotationByStudentWorkIdAndType(studentWorkId, type) {
    for (let a = this.annotations.length - 1; a >= 0; a--) {
      const annotation = this.annotations[a];

      if (annotation != null) {
        if (studentWorkId == annotation.studentWorkId && type == annotation.type) {
          /*
           * we have found an annotation with the given student work
           * id and annotation type
           */
          return annotation;
        }
      }
    }
    return null;
  }

  /**
   * Get the annotations for the given student work
   * @param studentWorkId the student work id
   * @return array of annotations for the given student work
   */
  getAnnotationsByStudentWorkId(studentWorkId) {
    let annotations = [];
    for (let annotation of this.annotations) {
      if (annotation && studentWorkId == annotation.studentWorkId) {
        annotations.push(annotation);
      }
    }
    return annotations;
  }

  getAverageAutoScore(nodeId, componentId, periodId = -1, type = null) {
    let totalScoreSoFar = 0;
    let annotationsCounted = 0;
    for (let annotation of this.getAllLatestScoreAnnotations(nodeId, componentId, periodId)) {
      if (
        annotation.nodeId === nodeId &&
        annotation.componentId === componentId &&
        (periodId === -1 || annotation.periodId === periodId)
      ) {
        let score = null;
        if (type != null) {
          score = this.getSubScore(annotation, type);
        } else {
          score = this.getScoreFromAnnotation(annotation);
        }
        if (score != null) {
          totalScoreSoFar += score;
          annotationsCounted++;
        }
      }
    }
    return totalScoreSoFar / annotationsCounted;
  }

  getAllLatestScoreAnnotations(nodeId, componentId, periodId) {
    const workgroupIdsFound = {};
    const latestScoreAnnotations = [];
    for (let a = this.annotations.length - 1; a >= 0; a--) {
      const annotation = this.annotations[a];
      const workgroupId = annotation.toWorkgroupId;
      if (
        workgroupIdsFound[workgroupId] == null &&
        nodeId === annotation.nodeId &&
        componentId === annotation.componentId &&
        (periodId === -1 || periodId === annotation.periodId) &&
        ('score' === annotation.type || 'autoScore' === annotation.type)
      ) {
        workgroupIdsFound[workgroupId] = annotation;
        latestScoreAnnotations.push(annotation);
      }
    }
    return latestScoreAnnotations;
  }

  getScoreFromAnnotation(annotation) {
    return annotation.data.value;
  }

  getSubScore(annotation, type) {
    for (let score of annotation.data.scores) {
      if (score.id === type) {
        return score.score;
      }
    }
    return null;
  }

  broadcastAnnotationSavedToServer(args: any) {
    this.annotationSavedToServerSource.next(args);
  }

  broadcastAnnotationReceived(args: any) {
    this.annotationReceivedSource.next(args);
  }

  broadcastDisplayGlobalAnnotations() {
    this.displayGlobalAnnotationsSource.next();
  }
}

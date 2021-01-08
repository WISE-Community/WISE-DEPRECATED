import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AnnotationService } from './annotationService';
import { ConfigService } from './configService';
import { ProjectService } from './projectService';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class StudentStatusService {
  studentStatuses = [];
  private studentStatusReceivedSource: Subject<any> = new Subject<any>();
  public studentStatusReceived$: Observable<any> = this.studentStatusReceivedSource.asObservable();

  constructor(
    private http: HttpClient,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService
  ) {}

  retrieveStudentStatuses() {
    this.studentStatuses = [];
    return this.http
      .get(`/api/teacher/run/${this.ConfigService.getRunId()}/student-status`)
      .toPromise()
      .then((studentStatuses: any) => {
        for (const studentStatus of studentStatuses) {
          const parsedStatus = JSON.parse(studentStatus.status);
          parsedStatus.postTimestamp = studentStatus.timestamp;
          this.studentStatuses.push(parsedStatus);
        }
        return this.studentStatuses;
      });
  }

  getStudentStatuses() {
    return this.studentStatuses;
  }

  /**
   * Get the current node position and title for a workgroup
   * e.g. 2.2: Newton Scooter Concepts
   * @param workgroupId the workgroup id
   * @returns the node position and title
   */
  getCurrentNodePositionAndNodeTitleForWorkgroupId(workgroupId) {
    const studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);
    if (studentStatus != null) {
      const currentNodeId = studentStatus.currentNodeId;
      return this.ProjectService.getNodePositionAndTitleByNodeId(currentNodeId);
    }
    return null;
  }

  getStudentStatusForWorkgroupId(workgroupId) {
    const studentStatuses = this.getStudentStatuses();
    for (let tempStudentStatus of studentStatuses) {
      if (tempStudentStatus != null) {
        const tempWorkgroupId = tempStudentStatus.workgroupId;
        if (workgroupId === tempWorkgroupId) {
          return tempStudentStatus;
        }
      }
    }
    return null;
  }

  setStudentStatus(studentStatus) {
    const studentStatuses = this.getStudentStatuses();
    for (let x = 0; x < studentStatuses.length; x++) {
      const aStudentStatus = studentStatuses[x];
      if (aStudentStatus.workgroupId === studentStatus.workgroupId) {
        studentStatuses.splice(x, 1, studentStatus);
        break;
      }
    }
  }

  /**
   * Get the student project completion data by workgroup id
   * @param workgroupId the workgroup id
   * @param excludeNonWorkNodes boolean whether to exclude nodes without
   * @returns object with completed, total, and percent completed (integer
   * between 0 and 100)
   */
  getStudentProjectCompletion(workgroupId, excludeNonWorkNodes) {
    let completion = {
      totalItems: 0,
      completedItems: 0,
      completionPct: 0
    };

    // get the student status for the workgroup
    let studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);

    if (studentStatus) {
      let projectCompletion = studentStatus.projectCompletion;

      if (projectCompletion) {
        if (excludeNonWorkNodes) {
          // we're only looking for completion of nodes with work
          let completionPctWithWork = projectCompletion.completionPctWithWork;

          if (completionPctWithWork) {
            completion.totalItems = projectCompletion.totalItemsWithWork;
            completion.completedItems = projectCompletion.completedItemsWithWork;
            completion.completionPct = projectCompletion.completionPctWithWork;
          } else {
            /*
             * we have a legacy projectCompletion object that only includes information for all nodes
             * so we need to calculate manually
             */
            completion = this.getNodeCompletion('group0', -1, workgroupId, true);
          }
        } else {
          completion = projectCompletion;
        }
      }
    }
    return completion;
  }

  /**
   * Get the workgroups on a node in the given period
   * @param nodeId the node id
   * @param periodId the period id. pass in -1 to select all periods.
   * @returns an array of workgroup ids on a node in a period
   */
  getWorkgroupIdsOnNode(nodeId, periodId) {
    let workgroupIds = [];
    let studentStatuses = this.studentStatuses;
    for (let studentStatus of studentStatuses) {
      if (studentStatus != null) {
        if (periodId === -1 || periodId === studentStatus.periodId) {
          let currentNodeId = studentStatus.currentNodeId;
          if (nodeId === currentNodeId) {
            workgroupIds.push(studentStatus.workgroupId);
          } else if (this.ProjectService.isGroupNode(nodeId)) {
            let currentNode = this.ProjectService.getNodeById(currentNodeId);
            let group = this.ProjectService.getNodeById(nodeId);

            if (this.ProjectService.isNodeDescendentOfGroup(currentNode, group)) {
              workgroupIds.push(studentStatus.workgroupId);
            }
          }
        }
      }
    }
    return workgroupIds;
  }

  /**
   * Get node completion info for the given parameters
   * @param nodeId the node id
   * @param periodId the period id (pass in -1 to select all periods)
   * @param workgroupId the workgroup id to limit results to (optional)
   * @param excludeNonWorkNodes boolean whether to exclude nodes without
   * student work or not (optional)
   * @returns object with completed, total, and percent completed (integer
   * between 0 and 100).
   */
  getNodeCompletion(nodeId, periodId, workgroupId = null, excludeNonWorkNodes = false) {
    let numCompleted = 0;
    let numTotal = 0;
    let isGroupNode = this.ProjectService.isGroupNode(nodeId);

    let studentStatuses = this.studentStatuses;
    for (let studentStatus of studentStatuses) {
      if (studentStatus) {
        if (periodId === -1 || periodId === studentStatus.periodId) {
          if (!workgroupId || workgroupId === studentStatus.workgroupId) {
            let nodeStatuses = studentStatus.nodeStatuses;
            if (nodeStatuses) {
              let nodeStatus = nodeStatuses[nodeId];
              if (nodeStatus != null) {
                if (isGroupNode) {
                  let progress = nodeStatus.progress;
                  if (excludeNonWorkNodes) {
                    // we're looking for only nodes with student work
                    if (progress && progress.totalItemsWithWork) {
                      numTotal += progress.totalItemsWithWork;
                      numCompleted += progress.completedItemsWithWork;
                    } else {
                      /*
                       * we have a legacy nodeStatus.progress that only includes completion information for all nodes
                       * so we need to calculate manually
                       */
                      let group = this.ProjectService.getNodeById(nodeId);

                      let descendants = this.ProjectService.getDescendentsOfGroup(group);

                      for (let descendantId of descendants) {
                        if (!this.ProjectService.isGroupNode(descendantId)) {
                          let descendantStatus = nodeStatuses[descendantId];

                          if (
                            descendantStatus &&
                            descendantStatus.isVisible &&
                            this.ProjectService.nodeHasWork(descendantId)
                          ) {
                            numTotal++;

                            if (descendantStatus.isCompleted) {
                              numCompleted++;
                            }
                          }
                        }
                      }
                    }
                  } else {
                    // we're looking for completion percentage of all nodes
                    if (progress) {
                      numTotal += progress.totalItems;
                      numCompleted += progress.completedItems;
                    }
                  }
                } else {
                  // given node is not a group
                  if (nodeStatus.isVisible) {
                    /*
                     * the student can see the step. we need this check
                     * for cases when a project has branching. this way
                     * we only calculate the step completion percentage
                     * based on the students that can actually go to
                     * the step.
                     */

                    /*
                     * check whether we should include the node in the calculation
                     * i.e. either includeNonWorkNodes is true or the node has student work
                     */
                    let includeNode =
                      !excludeNonWorkNodes || this.ProjectService.nodeHasWork(nodeId);

                    if (includeNode) {
                      numTotal++;

                      if (nodeStatus.isCompleted) {
                        // the student has completed the node
                        numCompleted++;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    // generate the percentage number rounded down to the nearest integer
    let completionPercentage = numTotal > 0 ? Math.floor((100 * numCompleted) / numTotal) : 0;

    return {
      completedItems: numCompleted,
      totalItems: numTotal,
      completionPct: completionPercentage
    };
  }

  /**
   * Get the average score for a node for a period
   * @param nodeId the node id
   * @param periodId the period id. pass in -1 to select all periods.
   * @returns the average score for the node for the period
   */
  getNodeAverageScore(nodeId, periodId) {
    let studentScoreSum = 0;
    let numStudentsWithScore = 0;
    const studentStatuses = this.studentStatuses;

    for (let studentStatus of studentStatuses) {
      if (studentStatus != null) {
        if (periodId === -1 || periodId === studentStatus.periodId) {
          // the period matches the one we are looking for
          let workgroupId = studentStatus.workgroupId;

          // get the workgroups score on the node
          let score = this.AnnotationService.getScore(workgroupId, nodeId);

          if (score != null) {
            // increment the counter of students with a score for this node
            numStudentsWithScore++;

            // accumulate the sum of the scores for this node
            studentScoreSum += score;
          }
        }
      }
    }

    let averageScore = null;

    if (numStudentsWithScore !== 0) {
      // calculate the average score for this node rounded down to the nearest hundredth
      averageScore = Math.floor((100 * studentScoreSum) / numStudentsWithScore) / 100;
    }

    return averageScore;
  }

  /**
   * Get the max score for the project for the given workgroup id
   * @param workgroupId
   * @returns the sum of the max scores for all the nodes in the project visible
   * to the given workgroupId or null if none of the visible components has max scores.
   */
  getMaxScoreForWorkgroupId(workgroupId) {
    let maxScore = null;
    let studentStatus = this.getStudentStatusForWorkgroupId(workgroupId);
    if (studentStatus) {
      let nodeStatuses = studentStatus.nodeStatuses;
      if (nodeStatuses) {
        for (let p in nodeStatuses) {
          if (nodeStatuses.hasOwnProperty(p)) {
            let nodeStatus = nodeStatuses[p];
            let nodeId = nodeStatus.nodeId;
            if (nodeStatus.isVisible && this.ProjectService.isApplicationNode(nodeId)) {
              let nodeMaxScore = this.ProjectService.getMaxScoreForNode(nodeId);
              if (nodeMaxScore) {
                // there is a max score for the node, so add to total
                // TODO geoffreykwan: trying to add to null?
                maxScore += nodeMaxScore;
              }
            }
          }
        }
      }
    }
    return maxScore;
  }

  broadcastStudentStatusReceived(args: any) {
    this.studentStatusReceivedSource.next(args);
  }
}

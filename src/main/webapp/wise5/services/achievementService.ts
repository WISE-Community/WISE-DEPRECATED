'use strict';

import { HttpClient, HttpParams } from '@angular/common/http';
import { ConfigService } from './configService';
import { ProjectService } from './projectService';
import { StudentDataService } from './studentDataService';
import { Injectable } from '@angular/core';
import { UpgradeModule } from '@angular/upgrade/static';
import { UtilService } from './utilService';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class AchievementService {
  studentAchievementsByWorkgroupId: any;
  debug: boolean;
  private achievementCompletedSource: Subject<any> = new Subject<any>();
  public achievementCompleted$: Observable<any> = this.achievementCompletedSource.asObservable();
  private newStudentAchievementSource: Subject<any> = new Subject<any>();
  public newStudentAchievement$: Observable<any> = this.newStudentAchievementSource.asObservable();

  constructor(
    private upgrade: UpgradeModule,
    private http: HttpClient,
    private ConfigService: ConfigService,
    private ProjectService: ProjectService,
    private StudentDataService: StudentDataService,
    private UtilService: UtilService
  ) {
    this.studentAchievementsByWorkgroupId = {};
    this.debug = false;
  }

  /**
   * Output the string to the console if debug=true
   * @param str the string to output to the console
   */
  debugOutput(str) {
    if (this.debug) {
      console.log(str);
    }
  }

  createAchievementsURLParams(workgroupId, type) {
    let params = new HttpParams();
    if (workgroupId != null) {
      params = params.set('workgroupId', workgroupId);
    } else if (this.ConfigService.getMode() !== 'classroomMonitor') {
      params = params.set('workgroupId', this.ConfigService.getWorkgroupId());
      params = params.set('periodId', this.ConfigService.getPeriodId());
    }
    if (type != null) {
      params = params.set('type', type);
    }
    return params;
  }

  retrieveStudentAchievements(workgroupId = null, type = null) {
    if (this.ConfigService.isPreview()) {
      const workgroupId = this.ConfigService.getWorkgroupId();
      this.studentAchievementsByWorkgroupId[workgroupId] = [];
      return Promise.resolve(this.studentAchievementsByWorkgroupId);
    } else {
      const url = this.ConfigService.getAchievementsURL();
      const options = {
        params: this.createAchievementsURLParams(workgroupId, type)
      };
      return this.http
        .get(url, options)
        .toPromise()
        .then((studentAchievements: any[]) => {
          for (const studentAchievement of studentAchievements) {
            this.addOrUpdateStudentAchievement(studentAchievement);
            if (this.ConfigService.getMode() === 'studentRun') {
              const projectAchievement = this.ProjectService.getAchievementByAchievementId(
                studentAchievement.achievementId
              );
              if (projectAchievement != null) {
                /*
                 * set the completed field to true in case we ever
                 * need to easily see which projectAchievements the student
                 * has completed
                 */
                projectAchievement.completed = true;
                if (projectAchievement.deregisterFunction != null) {
                  /*
                   * the student has completed this achievement
                   * so we no longer need to listen for it
                   */
                  projectAchievement.deregisterFunction();
                  this.debugOutput('deregistering ' + projectAchievement.id);
                }
              }
            }
          }

          if (this.ConfigService.getMode() === 'studentRun') {
            /*
             * Loop through all the projectAchievements and
             * re-evaluate whether the student has completed each.
             * This is to make sure students never get stuck in a
             * state where they did everything required to complete
             * a certain achievement but some error or bug occurred
             * which prevented their student achievement from being
             * saved and then they end up never being able to
             * complete that achievement. We will avoid this
             * situation by re-evaluating all the projectAchievements
             * each time the student loads the VLE.
             */
            const projectAchievements = this.ProjectService.getAchievementItems();
            for (const projectAchievement of projectAchievements) {
              if (
                !this.isStudentAchievementExists(projectAchievement.id) &&
                this.isProjectAchievementSatisfied(projectAchievement)
              ) {
                this.createStudentAchievement(projectAchievement);
              }
            }
          }
          this.registerAchievementListeners();
          return this.studentAchievementsByWorkgroupId;
        });
    }
  }

  /**
   * Add Achievement to local bookkeeping
   * @param studentAchievement the student achievement to add or update
   */
  addOrUpdateStudentAchievement(studentAchievement) {
    if (studentAchievement != null) {
      const achievementWorkgroupId = studentAchievement.workgroupId;
      if (this.studentAchievementsByWorkgroupId[achievementWorkgroupId] == null) {
        this.studentAchievementsByWorkgroupId[achievementWorkgroupId] = new Array();
      }
      const achievements = this.studentAchievementsByWorkgroupId[achievementWorkgroupId];
      let found = false;
      for (let achievementIndex = 0; achievementIndex < achievements.length; achievementIndex++) {
        let achievement = achievements[achievementIndex];
        if (
          achievement.achievementId != null &&
          achievement.achievementId === studentAchievement.achievementId &&
          achievement.workgroupId != null &&
          achievement.workgroupId === studentAchievement.workgroupId
        ) {
          /*
           * the achievement 10 character alphanumeric id matches and
           * the workgroup id matches so we will update it
           */
          achievements[achievementIndex] = studentAchievement;
          found = true; // remember this so we don't insert later.
          break;
        }
      }
      if (!found) {
        // we did not find the achievement so we will add it to the array
        achievements.push(studentAchievement);
      }
    }
  }

  createAchievementsURLBody(studentAchievement) {
    let body = new HttpParams()
      .set('achievementId', studentAchievement.achievementId)
      .set('workgroupId', studentAchievement.workgroupId)
      .set('type', studentAchievement.type);
    if (studentAchievement.id != null) {
      body = body.set('id', studentAchievement.id);
    }
    if (studentAchievement.data != null) {
      body = body.set('data', JSON.stringify(studentAchievement.data));
    }
    return body;
  }

  /**
   * Saves the achievement for the logged-in user
   * @param studentAchievement
   */
  saveAchievementToServer(studentAchievement) {
    if (this.ConfigService.isPreview()) {
      return Promise.resolve(studentAchievement);
    } else {
      const url = this.ConfigService.getAchievementsURL();
      const body = this.createAchievementsURLBody(studentAchievement);
      const options = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      return this.http
        .post(url, body, options)
        .toPromise()
        .then((achievement: any) => {
          this.addOrUpdateStudentAchievement(achievement);
          return achievement;
        });
    }
  }

  /**
   * Creates a new student achievement object
   * @param type type of achievement ["completion", "milestone", etc]
   * @param achievementId id of achievement in project content
   * @param data other extra information about this achievement
   * @param workgroupId id of workgroup whom this achievement is for
   * @returns newly created student achievement object
   */
  createNewStudentAchievement(type, achievementId, data = null, workgroupId = null) {
    if (workgroupId == null) {
      workgroupId = this.ConfigService.getWorkgroupId();
    }
    return {
      id: null,
      type: type,
      achievementId: achievementId,
      workgroupId: workgroupId,
      data: data
    };
  }

  registerAchievementListeners() {
    const projectAchievements = this.ProjectService.getAchievements();
    if (projectAchievements.isEnabled) {
      for (const projectAchievement of projectAchievements.items) {
        if (!this.isStudentAchievementExists(projectAchievement.id)) {
          this.createListenerFunction(projectAchievement);
        }
      }
    }
  }

  createListenerFunction(projectAchievement) {
    let deregisterListenerFunction = null;
    if (
      projectAchievement.type === 'milestone' ||
      projectAchievement.type === 'milestoneReport' ||
      projectAchievement.type === 'completion'
    ) {
      deregisterListenerFunction = this.createStudentWorkSavedListener(projectAchievement);
    } else if (projectAchievement.type === 'aggregate') {
      deregisterListenerFunction = this.createAggregateAchievementListener(projectAchievement);
    }
    /*
     * set the deregisterListenerFunction into the project achievement so that we can deregister the
     * listener after the student has completed the achievement
     */
    projectAchievement.deregisterListenerFunction = deregisterListenerFunction;
  }

  /**
   * Check if the student has completed the achievement
   * @param achievementId
   * @return whether the student has completed the achievement
   */
  isStudentAchievementExists(achievementId) {
    const workgroupId = this.ConfigService.getWorkgroupId();
    const achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
    for (const achievement of achievements) {
      if (achievement.achievementId === achievementId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Create achievement and save to server
   * @param achievement the achievement the student completed
   */
  createStudentAchievement(achievement, data = {}) {
    if (achievement.isVisible) {
      alert(`Congratulations you completed: ${achievement.name}`);
    }

    const projectAchievement = this.ProjectService.getAchievementByAchievementId(achievement.id);
    if (projectAchievement != null && projectAchievement.deregisterListenerFunction != null) {
      /*
       * deregister the achievement listener now that the student has
       * completed the achievement
       */
      projectAchievement.deregisterListenerFunction.unsubscribe();
      this.debugOutput('deregistering ' + projectAchievement.id);
    }

    const workgroupId = this.ConfigService.getWorkgroupId();
    const newAchievement = this.createNewStudentAchievement(
      achievement.type,
      achievement.id,
      data,
      workgroupId
    );
    const achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
    achievements.push(newAchievement);
    this.saveAchievementToServer(newAchievement);
    this.broadcastAchievementCompleted({ achievementId: achievement.id });
  }

  /**
   * Create a listener for the component completed achievement
   * @param projectAchievement the achievement to listen for
   * @return the subscription object that we will use later to unsubscribe from the observable
   */
  createStudentWorkSavedListener(projectAchievement) {
    this.debugOutput('registering ' + projectAchievement.id);
    return this.StudentDataService.studentWorkSavedToServer$.subscribe((args: any) => {
      this.debugOutput(
        'createStudentWorkSavedListener checking ' +
          projectAchievement.id +
          ' completed ' +
          args.nodeId
      );
      if (!this.isStudentAchievementExists(projectAchievement.id)) {
        if (this.isAchievementCompletedByStudent(projectAchievement)) {
          this.createStudentAchievement(projectAchievement);
        }
      }
    });
  }

  /**
   * Check if the student completed a specific achievement
   * @param projectAchievement an achievement
   * @return whether the student completed the achievement
   */
  isProjectAchievementSatisfied(projectAchievement) {
    let completed = false;
    if (projectAchievement != null) {
      if (
        projectAchievement.type === 'milestone' ||
        projectAchievement.type === 'milestoneReport' ||
        projectAchievement.type === 'completion'
      ) {
        completed = this.isAchievementCompletedByStudent(projectAchievement);
      } else if (projectAchievement.type === 'aggregate') {
        completed = this.checkAggregateAchievement(projectAchievement);
      }
    }
    return completed;
  }

  /**
   * Check if the student completed a node completed achievement
   * @param projectAchievement a node completed achievement
   * @return whether the student completed the node completed achievement
   */
  isAchievementCompletedByStudent(projectAchievement) {
    for (const satisfyCriterion of projectAchievement.satisfyCriteria) {
      if (!this.isCriterionSatisfied(satisfyCriterion)) {
        return false;
      }
    }
    return true;
  }

  isCriterionSatisfied(satisfyCriterion) {
    if (satisfyCriterion.name === 'isCompleted') {
      return this.StudentDataService.isCompleted(
        satisfyCriterion.nodeId,
        satisfyCriterion.componentId
      );
    }
    return false;
  }

  /**
   * Create a listener for an aggregate achievement
   * @param projectAchievement the project achievement
   * @return the subscription object that we will use later to unsubscribe from the observable
   */
  createAggregateAchievementListener(projectAchievement) {
    const thisAchievementService = this;
    const thisAchievement = projectAchievement;
    this.debugOutput('registering ' + projectAchievement.id);
    return this.achievementCompleted$.subscribe((args: any) => {
      const projectAchievement = thisAchievement;
      if (projectAchievement != null) {
        this.debugOutput(
          'createAggregateAchievementListener checking ' +
            projectAchievement.id +
            ' completed ' +
            args.achievementId
        );
        const id = projectAchievement.id;
        if (!this.isStudentAchievementExists(id)) {
          const completed = this.checkAggregateAchievement(projectAchievement);
          if (completed) {
            thisAchievementService.createStudentAchievement(projectAchievement);
          }
        }
      }
    });
  }

  /**
   * Check if the student completed a aggregate achievement
   * @param projectAchievement an aggregate achievement
   * @return whether the student completed the aggregate achievement
   */
  checkAggregateAchievement(projectAchievement) {
    const params = projectAchievement.params;
    if (params != null) {
      const achievementIds = params.achievementIds;
      for (const achievementId of achievementIds) {
        if (!this.isStudentAchievementExists(achievementId)) {
          return false;
        }
      }
    }
    return true;
  }

  /**
   * Get student achievements for a workgroup id
   * @param workgroupId the workgroup id
   * @return an array of student achievements completed by the workgroup
   */
  getStudentAchievementsByWorkgroupId(workgroupId = null) {
    if (workgroupId == null) {
      workgroupId = this.ConfigService.getWorkgroupId();
    }
    if (this.studentAchievementsByWorkgroupId[workgroupId] == null) {
      this.studentAchievementsByWorkgroupId[workgroupId] = [];
      return this.studentAchievementsByWorkgroupId[workgroupId];
    } else if (this.studentAchievementsByWorkgroupId[workgroupId] != null) {
      return this.studentAchievementsByWorkgroupId[workgroupId];
    }
    return [];
  }

  /**
   * Get an array of student projectAchievements for a given achievement id
   * @param achievementId a 10 character achievement id
   * @return an array of student projectAchievements. student projectAchievements are
   * created when a workgroup completes an achievement.
   */
  getStudentAchievementsByAchievementId(achievementId) {
    const achievementsByAchievementId = [];
    const workgroupIds = this.ConfigService.getClassmateWorkgroupIds();
    for (const workgroupId of workgroupIds) {
      const achievementsForWorkgroup = this.studentAchievementsByWorkgroupId[workgroupId];
      if (achievementsForWorkgroup != null) {
        for (let a = achievementsForWorkgroup.length - 1; a >= 0; a--) {
          const studentAchievement = achievementsForWorkgroup[a];
          if (studentAchievement != null && studentAchievement.data != null) {
            if (studentAchievement.achievementId === achievementId) {
              achievementsByAchievementId.push(studentAchievement);
            }
          }
        }
      }
    }
    return achievementsByAchievementId;
  }

  /**
   * Get a mapping from achievement id to array of student projectAchievements
   * @return a mapping from achievement id to array of student projectAchievements
   * student projectAchievements are created when a workgroup completes an achievement.
   */
  getAchievementIdToStudentAchievementsMappings() {
    const achievementIdToAchievements = {};
    const projectAchievements = this.ProjectService.getAchievementItems();
    for (const projectAchievement of projectAchievements) {
      const studentAchievements = this.getStudentAchievementsByAchievementId(projectAchievement.id);
      achievementIdToAchievements[projectAchievement.id] = studentAchievements;
    }
    return achievementIdToAchievements;
  }

  /**
   * Get an achievement id that isn't being used
   * @return an achievement id that isn't being used
   */
  getAvailableAchievementId() {
    let id = null;
    const achievements = this.ProjectService.getAchievementItems();
    while (id == null) {
      id = this.UtilService.generateKey(10);
      for (const achievement of achievements) {
        if (achievement.id === id) {
          /*
           * the id is already being used so we need to find
           * a different one
           */
          id = null;
          break;
        }
      }
    }
    return id;
  }

  broadcastAchievementCompleted(args: any) {
    this.achievementCompletedSource.next(args);
  }

  broadcastNewStudentAchievement(args: any) {
    this.newStudentAchievementSource.next(args);
  }
}

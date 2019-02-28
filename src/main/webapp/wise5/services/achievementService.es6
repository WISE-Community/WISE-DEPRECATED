class AchievementService {
  constructor(
      $http,
      $q,
      $rootScope,
      ConfigService,
      ProjectService,
      StudentDataService,
      UtilService) {
    this.$http = $http;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.ConfigService = ConfigService;
    this.ProjectService = ProjectService;
    this.StudentDataService = StudentDataService;
    this.UtilService = UtilService;
    // an object of projectAchievements, where key is workgroupId and value is the array of projectAchievements for the workgroup.
    this.studentAchievementsByWorkgroupId = {};

    // whether to print debug output to the console
    this.debug = false;

    this.loadProjectAchievements();
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

  retrieveStudentAchievements(workgroupId = null, type = null) {
    if (this.ConfigService.isPreview()) {
      const workgroupId = this.ConfigService.getWorkgroupId();
      this.studentAchievementsByWorkgroupId[workgroupId] = [];
      return Promise.resolve(this.studentAchievementsByWorkgroupId);
    } else {
      const config = {
        method: 'GET',
        url: this.ConfigService.getAchievementsURL(),
        params: {}
      };
      if (workgroupId != null) {
        config.params.workgroupId = workgroupId;
      } else if (this.ConfigService.getMode() !== 'classroomMonitor') {
        config.params.workgroupId = this.ConfigService.getWorkgroupId();
        config.params.periodId = this.ConfigService.getPeriodId();
      }
      if (type != null) {
        config.params.type = type;
      }

      return this.$http(config).then((response) => {
        let studentAchievements = response.data;
        if (studentAchievements != null) {
          for (let studentAchievement of studentAchievements) {
            this.addOrUpdateStudentAchievement(studentAchievement);

            if (this.ConfigService.getMode() === 'studentRun') {
              const projectAchievement = this.ProjectService
                  .getAchievementByAchievementId(studentAchievement.achievementId);
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

          if (this.ConfigService.getMode() == 'studentRun') {
            /*
             * Loop through all the project projectAchievements and
             * re-evaluate whether the student has completed each.
             * This is to make sure students never get stuck in a
             * state where they did everything required to complete
             * a certain achievement but some error or bug occurred
             * which prevented their student achievement from being
             * saved and then they end up never being able to
             * complete that achievement. We will avoid this
             * situation by re-evaluating all the project
             * projectAchievements each time the student loads the VLE.
             */
            const projectAchievements = this.ProjectService.getAchievementItems();
            if (projectAchievements != null) {
              for (let projectAchievement of projectAchievements) {
                if (!this.isAchievementCompletedBySignedInStudent(projectAchievement.id)) {
                  if (this.isProjectAchievementSatisfied(projectAchievement)) {
                    /*
                     * the student has satisfied everything that is
                     * required of the achievement
                     */
                    this.studentCompletedAchievement(projectAchievement);
                  }
                }
              }
            }
          }
        } else {
          this.studentAchievementsByWorkgroupId = {};
        }

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
      const studentAchievements = this.studentAchievementsByWorkgroupId[achievementWorkgroupId];
      let found = false;
      for (let studentAchievementIndex = 0; studentAchievementIndex < studentAchievements.length; studentAchievementIndex++) {
        let studentAchievement = studentAchievements[studentAchievementIndex];

        if (studentAchievement.achievementId != null &&
            studentAchievement.achievementId === studentAchievement.achievementId &&
            studentAchievement.workgroupId != null &&
            studentAchievement.workgroupId === studentAchievement.workgroupId) {
          /*
           * the achievement 10 character alphanumeric id matches and
           * the workgroup id matches so we will update it
           */
          studentAchievements[studentAchievementIndex] = studentAchievement;
          found = true;  // remember this so we don't insert later.
          break;
        }
      }
      if (!found) {
        // we did not find the achievement so we will add it to the array
        studentAchievements.push(studentAchievement);
      }
    }
  }

  /**
   * Saves the achievement for the logged-in user
   * @param studentAchievement
   */
  saveAchievementToServer(studentAchievement) {
    if (this.ConfigService.isPreview()) {
      // if we're in preview, don't make any request to the server and resolve the promise right away
      const deferred = this.$q.defer();
      deferred.resolve(studentAchievement);
      return deferred.promise;
    } else {
      const config = {
        method: "POST",
        url: this.ConfigService.getAchievementsURL(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };

      let params = {
        achievementId: studentAchievement.achievementId,
        workgroupId: studentAchievement.workgroupId,
        type: studentAchievement.type
      };

      if (studentAchievement.id != null) {
        params.id = studentAchievement.id;
      }
      if (studentAchievement.data != null) {
        params.data = angular.toJson(studentAchievement.data);
      }

      config.data = $.param(params);

      return this.$http(config).then((result) => {
        let achievement = result.data;
        if (achievement.data != null) {
          achievement.data = angular.fromJson(achievement.data);
        }
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

  /**
   * Load the project achievements by creating listeners for the appropriate events
   */
  loadProjectAchievements() {
    const projectAchievements = this.ProjectService.getAchievements();
    if (projectAchievements != null && projectAchievements.isEnabled) {
      const projectAchievementItems = projectAchievements.items;
      if (projectAchievementItems != null) {
        for (let projectAchievement of projectAchievementItems) {
          let deregisterFunction = null;
          if (projectAchievement.type === 'milestone' || projectAchievement.type === 'completion') {
            deregisterFunction = this.createNodeCompletedListener(projectAchievement);
          } else if (projectAchievement.type === 'aggregate') {
            deregisterFunction = this.createAggregateAchievementListener(projectAchievement);
          }
          /*
           * set the deregisterFunction into the project
           * achievement so that we can deregister the
           * listener after the student has completed the
           * achievement
           */
          projectAchievement.deregisterFunction = deregisterFunction;
        }
      }
    }
  }

  /**
   * Check if the student has completed the achievement
   * @param achievementId
   * @return whether the student has completed the achievement
   */
  isAchievementCompletedBySignedInStudent(achievementId) {
    const workgroupId = this.ConfigService.getWorkgroupId();
    const achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
    if (achievements != null) {
      for (let achievement of achievements) {
        if (achievement.achievementId === achievementId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * The student has just completed an achievement
   * @param achievement the achievement the student completed
   */
  studentCompletedAchievement(achievement) {
    if (achievement.isVisible) {
      /*
       * this is a visible achievement so we will display a message
       * to the student
       */
      alert(`Congratulations you completed: ${achievement.name}`);
      console.log(`Congratulations you completed: ${achievement.name}`);
    }

    const projectAchievement = this.ProjectService.getAchievementByAchievementId(achievement.id);
    if (projectAchievement != null && projectAchievement.deregisterFunction != null) {
      /*
       * deregister the achievement listener now that the student has
       * completed the achievement
       */
      projectAchievement.deregisterFunction();
      this.debugOutput('deregistering ' + projectAchievement.id);
    }

    /*
     * create a copy of the achievement to make sure we don't cause
     * any referencing problems in the future
     */
    const achievementCopy = this.UtilService.makeCopyOfJSONObject(achievement);
    const workgroupId = this.ConfigService.getWorkgroupId();
    const type = achievementCopy.type;
    const id = achievementCopy.id;
    const data = achievementCopy;
    const newAchievement = this.createNewStudentAchievement(type, id, data, workgroupId);
    const achievements = this.getStudentAchievementsByWorkgroupId(workgroupId);
    achievements.push(newAchievement);
    this.saveAchievementToServer(newAchievement);
    this.$rootScope.$broadcast('achievementCompleted', { achievementId: achievementCopy.id });
  }

  /**
   * Create a listener for the node completed achievement
   * @param projectAchievement the achievement to listen for
   * @return the deregister function for the listener
   */
  createNodeCompletedListener(projectAchievement) {
    // save this to a variable so that we can access it in the callback
    const thisAchievementService = this;

    // save the achievement to a variable so that we can access it in the callback
    const thisAchievement = projectAchievement;

    this.debugOutput('registering ' + projectAchievement.id);

    const deregisterFunction = this.$rootScope.$on('nodeCompleted', (event, args) => {
      /*
       * the nodeCompleted event was fired so we will check if this
       * achievement has been completed
       */
      const achievement = thisAchievement;
      if (achievement != null) {
        this.debugOutput('createNodeCompletedListener checking ' + achievement.id + ' completed ' + args.nodeId);
        const id = achievement.id;

        if (!this.isAchievementCompletedBySignedInStudent(id)) {
          /*
           * the student has not completed this achievement before
           * so we will now check if they have completed it
           */
          // check if the student has completed this node completed achievement
          const completed = this.checkNodeCompletedAchievement(achievement);
          if (completed) {
            thisAchievementService.studentCompletedAchievement(achievement);
          }
        }
      }
    });
    return deregisterFunction;
  }

  /**
   * Check if the student completed a specific achievement
   * @param projectAchievement an achievement
   * @return whether the student completed the achievement
   */
  isProjectAchievementSatisfied(projectAchievement) {
    let completed = false;
    if (projectAchievement != null) {
      if (projectAchievement.type === 'milestone' || projectAchievement.type === 'completion') {
        completed = this.checkNodeCompletedAchievement(projectAchievement);
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
  checkNodeCompletedAchievement(projectAchievement) {
    let completed = false;
    const params = projectAchievement.params;
    if (params != null) {
      const nodeIds = params.nodeIds;
      for (let n = 0; n < nodeIds.length; n++) {
        const nodeId = nodeIds[n];
        if (n === 0) {
          // this is the first node id
          completed = this.StudentDataService.isCompleted(nodeId);
        } else {
          /*
           * this is a node id after the first node id so
           * we will use an and conditional
           */
          completed = completed && this.StudentDataService.isCompleted(nodeId);
        }
      }
    }
    return completed;
  }

  /**
   * Create a listener for an aggregate achievement
   * @param projectAchievement the project achievement
   * @return the deregister function for the listener
   */
  createAggregateAchievementListener(projectAchievement) {
    const thisAchievementService = this;
    const thisAchievement = projectAchievement;
    this.debugOutput('registering ' + projectAchievement.id);
    const deregisterFunction = this.$rootScope.$on('achievementCompleted', (event, args) => {
      /*
       * the achievementCompleted event was fired so we will check if this
       * achievement has been completed
       */
      const projectAchievement = thisAchievement;
      if (projectAchievement != null) {
        this.debugOutput('createAggregateAchievementListener checking ' + projectAchievement.id + ' completed ' + args.achievementId);

        const id = projectAchievement.id;
        const achievementId = args.achievementId;

        if (!this.isAchievementCompletedBySignedInStudent(id)) {
          /*
           * the student has not completed this achievement before
           * so we will now check if they have completed it
           */

          const completed = this.checkAggregateAchievement(projectAchievement);
          if (completed) {
            thisAchievementService.studentCompletedAchievement(projectAchievement);
          }
        }
      }
    });
    return deregisterFunction;
  }

  /**
   * Check if the student completed a aggregate achievement
   * @param projectAchievement an aggregate achievement
   * @return whether the student completed the aggregate achievement
   */
  checkAggregateAchievement(projectAchievement) {
    let completed = false;
    const params = projectAchievement.params;
    if (params != null) {
      const achievementIds = params.achievementIds;
      for (let a = 0; a < achievementIds.length; a++) {
        const tempAchievementId = achievementIds[a];
        if (a === 0) {
          // this is the first node id
          completed = this.isAchievementCompletedBySignedInStudent(tempAchievementId);
        } else {
          /*
           * this is a node id after the first node id so
           * we will use an and conditional
           */
          completed = completed && this.isAchievementCompletedBySignedInStudent(tempAchievementId);
        }
      }
    }
    return completed;
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
    for (let workgroupId of workgroupIds) {
      const achievementsForWorkgroup = this.studentAchievementsByWorkgroupId[workgroupId];
      if (achievementsForWorkgroup != null) {
        for (let a = achievementsForWorkgroup.length - 1; a >= 0; a--) {
          const studentAchievement = achievementsForWorkgroup[a];
          if (studentAchievement != null && studentAchievement.data != null) {
            if (studentAchievement.data.id === achievementId) {
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
   * @param achievementId the achievement id
   * @return a mapping from achievement id to array of student projectAchievements
   * student projectAchievements are created when a workgroup completes an achievement.
   */
  getAchievementIdToStudentAchievementsMappings(achievementId) {
    const achievementIdToAchievements = {};
    const projectAchievements = this.ProjectService.getAchievementItems();
    for (let projectAchievement of projectAchievements) {
      if (projectAchievement != null) {
        const studentAchievements =
          this.getStudentAchievementsByAchievementId(projectAchievement.id);
        achievementIdToAchievements[projectAchievement.id] = studentAchievements;
      }
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
      for (let achievement of achievements) {
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
}

AchievementService.$inject = [
  '$http',
  '$q',
  '$rootScope',
  'ConfigService',
  'ProjectService',
  'StudentDataService',
  'UtilService'
];

export default AchievementService;

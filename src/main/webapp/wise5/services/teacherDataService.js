'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var TeacherDataService = function () {
  function TeacherDataService($http, $filter, $q, $rootScope, AnnotationService, ConfigService, NotificationService, ProjectService, TeacherWebSocketService, UtilService) {
    var _this = this;

    _classCallCheck(this, TeacherDataService);

    this.$http = $http;
    this.$filter = $filter;
    this.$q = $q;
    this.$rootScope = $rootScope;
    this.AnnotationService = AnnotationService;
    this.ConfigService = ConfigService;
    this.NotificationService = NotificationService;
    this.ProjectService = ProjectService;
    this.TeacherWebSocketService = TeacherWebSocketService;
    this.UtilService = UtilService;
    this.$translate = this.$filter('translate');

    this.studentData = {
      componentStatesByWorkgroupId: {},
      componentStatesByNodeId: {},
      componentStatesByComponentId: {}
    };

    this.currentPeriod = null;
    this.currentWorkgroup = null;
    this.currentStep = null;
    this.currentNode = null;
    this.previousStep = null;
    this.runStatus = null;
    this.periods = [];
    this.nodeGradingSort = 'team';
    this.studentGradingSort = 'step';
    this.studentProgressSort = 'team';

    /**
     * Listen for the 'annotationSavedToServer' event which is fired when
     * we receive the response from saving an annotation to the server
     */
    this.$rootScope.$on('annotationSavedToServer', function (event, args) {
      if (args) {
        var annotation = args.annotation;
        _this.handleAnnotationReceived(annotation);
      }
    });

    /**
     * Listen for the 'newAnnotationReceived' event which is fired when
     * teacher receives a new annotation (usually on a student work) from the server
     */
    this.$rootScope.$on('newAnnotationReceived', function (event, args) {
      if (args) {
        var annotation = args.annotation;
        _this.handleAnnotationReceived(annotation);
      }
    });

    /**
     * Listen for the 'newStudentWorkReceived' event which is fired when
     * teacher receives a new student work from the server
     */
    this.$rootScope.$on('newStudentWorkReceived', function (event, args) {
      if (args) {
        var studentWork = args.studentWork;
        _this.addOrUpdateComponentState(studentWork);
        _this.$rootScope.$broadcast('studentWorkReceived', { studentWork: studentWork });
      }
    });
  }

  _createClass(TeacherDataService, [{
    key: 'handleAnnotationReceived',
    value: function handleAnnotationReceived(annotation) {
      this.studentData.annotations.push(annotation);

      var toWorkgroupId = annotation.toWorkgroupId;
      if (this.studentData.annotationsToWorkgroupId[toWorkgroupId] == null) {
        this.studentData.annotationsToWorkgroupId[toWorkgroupId] = new Array();
      }
      this.studentData.annotationsToWorkgroupId[toWorkgroupId].push(annotation);

      var nodeId = annotation.nodeId;
      if (this.studentData.annotationsByNodeId[nodeId] == null) {
        this.studentData.annotationsByNodeId[nodeId] = new Array();
      }
      this.studentData.annotationsByNodeId[nodeId].push(annotation);
      this.AnnotationService.setAnnotations(this.studentData.annotations);
      this.$rootScope.$broadcast('annotationReceived', { annotation: annotation });
    }

    /**
     * Get the data for the export and generate the csv file that will be downloaded
     * @param exportType the type of export
     */

  }, {
    key: 'getExport',
    value: function getExport(exportType, selectedNodes) {
      var exportURL = this.ConfigService.getConfigParam('runDataExportURL');
      var runId = this.ConfigService.getRunId();
      exportURL += "/" + runId + "/" + exportType;

      if (exportType === "allStudentWork" || exportType === "latestStudentWork") {
        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.getStudentWork = true;
        params.getAnnotations = true;
        params.getEvents = false;
        params.components = selectedNodes;

        return this.retrieveStudentData(params);
      } else if (exportType === "events") {
        var _params = {};
        _params.runId = this.ConfigService.getRunId();
        _params.getStudentWork = false;
        _params.getAnnotations = false;
        _params.getEvents = true;
        _params.components = selectedNodes;

        return this.retrieveStudentData(_params);
      } else if (exportType === "latestNotebookItems" || exportType === "allNotebookItems") {
        var httpParams = {
          method: 'GET',
          url: exportURL,
          params: {}
        };

        return this.$http(httpParams).then(function (result) {
          return result.data;
        });
      } else if (exportType === "notifications") {
        var _httpParams = {
          method: 'GET',
          url: exportURL,
          params: {}
        };

        return this.$http(_httpParams).then(function (result) {
          return result.data;
        });
      } else if (exportType === "studentAssets") {
        window.location.href = exportURL;
        var deferred = this.$q.defer();
        var promise = deferred.promise;
        deferred.resolve([]);
        return promise;
      } else if (exportType === "oneWorkgroupPerRow") {
        var _params2 = {};
        _params2.runId = this.ConfigService.getRunId();
        _params2.getStudentWork = true;
        _params2.getAnnotations = true;
        _params2.getEvents = true;
        _params2.components = selectedNodes;
        return this.retrieveStudentData(_params2);
      } else if (exportType === "rawData") {
        var _params3 = {};
        _params3.runId = this.ConfigService.getRunId();
        _params3.getStudentWork = true;
        _params3.getAnnotations = true;
        _params3.getEvents = true;
        _params3.components = selectedNodes;
        return this.retrieveStudentData(_params3);
      }
    }

    /**
     * Save events that occur in the Classroom Monitor to the server
     * @param event the event object
     * @returns a promise
     */

  }, {
    key: 'saveEvent',
    value: function saveEvent(context, nodeId, componentId, componentType, category, event, data, projectId) {
      var newEvent = {
        projectId: this.ConfigService.getProjectId(),
        runId: this.ConfigService.getRunId(),
        workgroupId: this.ConfigService.getWorkgroupId(),
        clientSaveTime: Date.parse(new Date()),
        context: context,
        nodeId: nodeId,
        componentId: componentId,
        type: componentType,
        category: category,
        event: event,
        data: data
      };

      if (newEvent.projectId == null) {
        newEvent.projectId = projectId;
      }

      var events = [newEvent];

      var params = {
        projectId: this.ConfigService.getProjectId(),
        runId: this.ConfigService.getRunId(),
        workgroupId: this.ConfigService.getWorkgroupId(),
        events: angular.toJson(events)
      };

      if (params.projectId == null) {
        params.projectId = projectId;
      }

      var httpParams = {};
      httpParams.method = 'POST';
      httpParams.url = this.ConfigService.getConfigParam('teacherDataURL');
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      httpParams.data = $.param(params);

      return this.$http(httpParams).then(function (result) {
        var savedEvents = null;
        if (result != null && result.data != null) {
          var _data = result.data;
          if (_data != null) {
            // get the saved events
            savedEvents = _data.events;
          }
        }
        return savedEvents;
      });
    }
  }, {
    key: 'retrieveStudentDataByNodeId',


    /**
     * Retrieve the student data for a node id
     * @param nodeId the node id
     * @returns the student data for the node id
     */
    value: function retrieveStudentDataByNodeId(nodeId) {
      var nodeIdsAndComponentIds = this.ProjectService.getNodeIdsAndComponentIds(nodeId);
      var showPreviousWorkNodeIdsAndComponentIds = this.ProjectService.getShowPreviousWorkNodeIdsAndComponentIds(nodeId);

      var components = [];
      components = components.concat(nodeIdsAndComponentIds);
      components = components.concat(showPreviousWorkNodeIdsAndComponentIds);

      var params = {};
      params.periodId = null;
      params.workgroupId = null;
      params.components = components;
      params.getAnnotations = false;
      params.getEvents = false;

      return this.retrieveStudentData(params);
    }
  }, {
    key: 'retrieveStudentDataByWorkgroupId',


    /**
     * Retrieve the student data for the workgroup id
     * @param workgroupId the workgroup id
     * @returns the student data for the workgroup id
     */
    value: function retrieveStudentDataByWorkgroupId(workgroupId) {
      var params = {};
      params.periodId = null;
      params.nodeId = null;
      params.workgroupId = workgroupId;
      params.toWorkgroupId = workgroupId;
      params.getAnnotations = false;
      return this.retrieveStudentData(params);
    }
  }, {
    key: 'retrieveAnnotations',


    /**
     * Retrieve the annotations for the run
     * @returns the annotations for the run
     */
    value: function retrieveAnnotations() {
      var params = {};
      params.periodId = null;
      params.nodeId = null;
      params.workgroupId = null;
      params.toWorkgroupId = null;
      params.getStudentWork = false;
      params.getEvents = false;
      params.getAnnotations = true;
      return this.retrieveStudentData(params);
    }
  }, {
    key: 'retrieveStudentData',


    /**
     * Retrieve the student data
     * @param params the params that specify what student data we want
     * @returns a promise
     */
    value: function retrieveStudentData(params) {
      var _this2 = this;

      var studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');
      params.runId = this.ConfigService.getRunId();

      if (params.getStudentWork == null) {
        params.getStudentWork = true;
      }

      if (params.getEvents == null) {
        params.getEvents = false;
      }

      if (params.getAnnotations == null) {
        params.getAnnotations = true;
      }

      var httpParams = {
        "method": "GET",
        "url": studentDataURL,
        "params": params
      };

      return this.$http(httpParams).then(function (result) {
        var resultData = result.data;
        if (resultData != null) {
          if (resultData.studentWorkList != null) {
            var componentStates = resultData.studentWorkList;

            // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId objects
            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
              for (var _iterator = componentStates[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                var componentState = _step.value;

                _this2.addOrUpdateComponentState(componentState);
              }
            } catch (err) {
              _didIteratorError = true;
              _iteratorError = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion && _iterator.return) {
                  _iterator.return();
                }
              } finally {
                if (_didIteratorError) {
                  throw _iteratorError;
                }
              }
            }
          }

          if (resultData.events != null) {
            // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays

            // sort the events by server save time
            resultData.events.sort(_this2.UtilService.sortByServerSaveTime);

            _this2.studentData.allEvents = resultData.events;
            _this2.studentData.eventsByWorkgroupId = {};
            _this2.studentData.eventsByNodeId = {};
            var _iteratorNormalCompletion2 = true;
            var _didIteratorError2 = false;
            var _iteratorError2 = undefined;

            try {
              for (var _iterator2 = resultData.events[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                var event = _step2.value;

                var eventWorkgroupId = event.workgroupId;
                if (_this2.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
                  _this2.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
                }
                _this2.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);
                var eventNodeId = event.nodeId;
                if (_this2.studentData.eventsByNodeId[eventNodeId] == null) {
                  _this2.studentData.eventsByNodeId[eventNodeId] = new Array();
                }
                _this2.studentData.eventsByNodeId[eventNodeId].push(event);
              }
            } catch (err) {
              _didIteratorError2 = true;
              _iteratorError2 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
                  _iterator2.return();
                }
              } finally {
                if (_didIteratorError2) {
                  throw _iteratorError2;
                }
              }
            }
          }

          if (resultData.annotations != null) {
            // populate annotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
            _this2.studentData.annotations = resultData.annotations;
            _this2.studentData.annotationsToWorkgroupId = {};
            _this2.studentData.annotationsByNodeId = {};
            var _iteratorNormalCompletion3 = true;
            var _didIteratorError3 = false;
            var _iteratorError3 = undefined;

            try {
              for (var _iterator3 = resultData.annotations[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                var annotation = _step3.value;

                var annotationWorkgroupId = annotation.toWorkgroupId;
                if (!_this2.studentData.annotationsToWorkgroupId[annotationWorkgroupId]) {
                  _this2.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                }
                _this2.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);
                var annotationNodeId = annotation.nodeId;
                if (!_this2.studentData.annotationsByNodeId[annotationNodeId]) {
                  _this2.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                }
                _this2.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
              }
            } catch (err) {
              _didIteratorError3 = true;
              _iteratorError3 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion3 && _iterator3.return) {
                  _iterator3.return();
                }
              } finally {
                if (_didIteratorError3) {
                  throw _iteratorError3;
                }
              }
            }
          }
          _this2.AnnotationService.setAnnotations(_this2.studentData.annotations);
        }
        return resultData;
      });
    }
  }, {
    key: 'addOrUpdateComponentState',


    /**
     * Add ComponentState to local bookkeeping
     * @param componentState the ComponentState to add
     */
    value: function addOrUpdateComponentState(componentState) {
      var componentStateWorkgroupId = componentState.workgroupId;
      if (this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
        this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
      }
      var found = false;
      for (var w = 0; w < this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].length; w++) {
        var cs = this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w];
        if (cs.id != null && cs.id === componentState.id) {
          // found the same component id, so just update it in place.
          this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w] = componentState;
          found = true; // remember this so we don't insert later.
          break;
        }
      }
      if (!found) {
        this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].push(componentState);
      }

      var componentStateNodeId = componentState.nodeId;
      if (this.studentData.componentStatesByNodeId[componentStateNodeId] == null) {
        this.studentData.componentStatesByNodeId[componentStateNodeId] = new Array();
      }
      found = false; // reset
      for (var n = 0; n < this.studentData.componentStatesByNodeId[componentStateNodeId].length; n++) {
        var _cs = this.studentData.componentStatesByNodeId[componentStateNodeId][n];
        if (_cs.id != null && _cs.id === componentState.id) {
          // found the same component id, so just update it in place.
          this.studentData.componentStatesByNodeId[componentStateNodeId][n] = componentState;
          found = true; // remember this so we don't insert later.
          break;
        }
      }
      if (!found) {
        this.studentData.componentStatesByNodeId[componentStateNodeId].push(componentState);
      }

      var componentId = componentState.componentId;
      if (this.studentData.componentStatesByComponentId[componentId] == null) {
        this.studentData.componentStatesByComponentId[componentId] = new Array();
      }
      found = false; // reset
      for (var c = 0; c < this.studentData.componentStatesByComponentId[componentId].length; c++) {
        var _cs2 = this.studentData.componentStatesByComponentId[componentId][c];
        if (_cs2.id != null && _cs2.id === componentState.id) {
          // found the same component id, so just update it in place.
          this.studentData.componentStatesByComponentId[componentId][c] = componentState;
          found = true; // remember this so we don't insert later.
          break;
        }
      }
      if (!found) {
        this.studentData.componentStatesByComponentId[componentId].push(componentState);
      }
    }
  }, {
    key: 'retrieveRunStatus',


    /**
     * Retrieve the run status from the server
     */
    value: function retrieveRunStatus() {
      var _this3 = this;

      var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
      var runId = this.ConfigService.getConfigParam('runId');

      var params = {
        runId: runId
      };

      var httpParams = {};
      httpParams.method = 'GET';
      httpParams.url = runStatusURL;
      httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
      httpParams.params = params;

      return this.$http(httpParams).then(function (result) {
        if (result != null) {
          var data = result.data;
          if (data != null) {
            _this3.runStatus = data;
            _this3.initializePeriods();
          }
        }
      });
    }
  }, {
    key: 'getComponentStatesByWorkgroupId',
    value: function getComponentStatesByWorkgroupId(workgroupId) {
      var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
      if (componentStatesByWorkgroupId != null) {
        return componentStatesByWorkgroupId;
      } else {
        return [];
      }
    }
  }, {
    key: 'getComponentStatesByNodeId',
    value: function getComponentStatesByNodeId(nodeId) {
      var componentStatesByNodeId = this.studentData.componentStatesByNodeId[nodeId];
      if (componentStatesByNodeId != null) {
        return componentStatesByNodeId;
      } else {
        return [];
      }
    }

    /**
     * Get the component stats for a component id
     * @param componentId the component id
     * @returns an array containing component states for a component id
     */

  }, {
    key: 'getComponentStatesByComponentId',
    value: function getComponentStatesByComponentId(componentId) {
      var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];
      if (componentStatesByComponentId != null) {
        return componentStatesByComponentId;
      }
      return [];
    }
  }, {
    key: 'getLatestComponentStateByWorkgroupIdNodeIdAndComponentId',
    value: function getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
      var latestComponentState = null;
      var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
      if (componentStates != null) {
        for (var c = componentStates.length - 1; c >= 0; c--) {
          var componentState = componentStates[c];
          if (componentState != null) {
            var componentStateNodeId = componentState.nodeId;
            var componentStateComponentId = componentState.componentId;
            if (nodeId == componentStateNodeId && componentId == componentStateComponentId) {
              latestComponentState = componentState;
              break;
            }
          }
        }
      }
      return latestComponentState;
    }
  }, {
    key: 'getLatestComponentStateByWorkgroupIdNodeId',
    value: function getLatestComponentStateByWorkgroupIdNodeId(workgroupId, nodeId) {
      var latestComponentState = null;
      var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);
      if (componentStates != null) {
        for (var c = componentStates.length - 1; c >= 0; c--) {
          var componentState = componentStates[c];
          if (componentState != null) {
            var componentStateNodeId = componentState.nodeId;
            if (nodeId == componentStateNodeId) {
              return componentState;
            }
          }
        }
      }
      return null;
    }

    /**
     * Get the latest component states for a workgroup. Each component state
     * will be the latest component state for a component.
     * @param workgroupId the workgroup id
     * @return an array of latest component states
     */

  }, {
    key: 'getLatestComponentStatesByWorkgroupId',
    value: function getLatestComponentStatesByWorkgroupId(workgroupId) {
      var componentStates = [];
      if (workgroupId != null) {
        var componentStatesForWorkgroup = this.getComponentStatesByWorkgroupId(workgroupId);
        if (componentStatesForWorkgroup != null) {
          // mapping of component to revision counter
          var componentRevisionCounter = {};

          /*
           * used to keep track of the components we have found component
           * states for already
           */
          var componentsFound = {};
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = componentStatesForWorkgroup[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var _componentState = _step4.value;

              if (_componentState != null) {
                // get the node id and component id of the component state
                var _nodeId = _componentState.nodeId;
                var _componentId = _componentState.componentId;

                // generate the component key e.g. "node2_bb83hs0sd8"
                var _key = _nodeId + "-" + _componentId;

                if (componentRevisionCounter[_key] == null) {
                  // initialize the component revision counter for this component to 1 if there is no entry
                  componentRevisionCounter[_key] = 1;
                }

                var revisionCounter = componentRevisionCounter[_key];

                // set the revision counter into the component state
                _componentState.revisionCounter = revisionCounter;

                // increment the revision counter for the component
                componentRevisionCounter[_key] = revisionCounter + 1;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4.return) {
                _iterator4.return();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }

          for (var csb = componentStatesForWorkgroup.length - 1; csb >= 0; csb--) {
            var componentState = componentStatesForWorkgroup[csb];

            if (componentState != null) {
              // get the node id and component id of the component state
              var nodeId = componentState.nodeId;
              var componentId = componentState.componentId;

              // generate the component key e.g. "node2_bb83hs0sd8"
              var key = nodeId + "-" + componentId;

              if (componentsFound[key] == null) {
                /*
                 * we have not found a component state for this
                 * component yet so we will add it to the array
                 * of component states
                 */
                componentStates.push(componentState);

                /*
                 * add an entry into the components found so that
                 * don't add any more component states from this
                 * component
                 */
                componentsFound[key] = true;
              }
            }
          }

          /*
           * reverse the component states array since we have been adding
           * component states from newest to oldest order but we want them
           * in oldest to newest order
           */
          componentStates.reverse();
        }
      }
      return componentStates;
    }
  }, {
    key: 'getComponentStatesByWorkgroupIdAndNodeId',
    value: function getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {
      var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
      var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

      // find the intersect and return it
      return componentStatesByWorkgroupId.filter(function (n) {
        return componentStatesByNodeId.indexOf(n) != -1;
      });
    }

    /**
     * Get component states for a workgroup id and component id
     * @param workgroupId the workgroup id
     * @param componentId the component id
     * @returns an array of component states
     */

  }, {
    key: 'getComponentStatesByWorkgroupIdAndComponentId',
    value: function getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
      var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
      var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

      // find the intersect and return it
      return componentStatesByWorkgroupId.filter(function (n) {
        return componentStatesByComponentId.indexOf(n) != -1;
      });
    }
  }, {
    key: 'getEventsByWorkgroupId',
    value: function getEventsByWorkgroupId(workgroupId) {
      var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
      if (eventsByWorkgroupId != null) {
        return eventsByWorkgroupId;
      } else {
        return [];
      }
    }
  }, {
    key: 'getEventsByNodeId',
    value: function getEventsByNodeId(nodeId) {
      var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
      if (eventsByNodeId != null) {
        return eventsByNodeId;
      } else {
        return [];
      }
    }
  }, {
    key: 'getEventsByWorkgroupIdAndNodeId',
    value: function getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
      var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
      var eventsByNodeId = this.getEventsByNodeId(nodeId);

      // find the intersect and return it
      return eventsByWorkgroupId.filter(function (n) {
        return eventsByNodeId.indexOf(n) != -1;
      });
    }
  }, {
    key: 'getLatestEventByWorkgroupIdAndNodeIdAndType',


    /**
     * Get the latest event by workgroup id, node id, and event type
     * @param workgroupId the workgroup id
     * @param nodeId the node id
     * @param eventType the event type
     * @return the latest event with the matching parameters or null if
     * no event is found with the matching parameters
     */
    value: function getLatestEventByWorkgroupIdAndNodeIdAndType(workgroupId, nodeId, eventType) {
      var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
      if (eventsByWorkgroupId != null) {
        for (var e = eventsByWorkgroupId.length - 1; e >= 0; e--) {
          var event = eventsByWorkgroupId[e];
          if (event != null) {
            if (event.nodeId == nodeId && event.event == eventType) {
              return event;
            }
          }
        }
      }
      return null;
    }
  }, {
    key: 'getAnnotationsToWorkgroupId',
    value: function getAnnotationsToWorkgroupId(workgroupId) {
      var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
      if (annotationsToWorkgroupId != null) {
        return annotationsToWorkgroupId;
      } else {
        return [];
      }
    }
  }, {
    key: 'getAnnotationsByNodeId',
    value: function getAnnotationsByNodeId(nodeId) {
      var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
      if (annotationsByNodeId != null) {
        return annotationsByNodeId;
      } else {
        return [];
      }
    }
  }, {
    key: 'getAnnotationsToWorkgroupIdAndNodeId',
    value: function getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
      var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
      var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

      // find the intersect and return it
      return annotationsToWorkgroupId.filter(function (n) {
        return annotationsByNodeId.indexOf(n) != -1;
      });
    }

    /**
     * Initialize the periods
     */

  }, {
    key: 'initializePeriods',
    value: function initializePeriods() {
      var periods = this.ConfigService.getPeriods();
      var currentPeriod = null;

      if (periods.length > 1) {
        var allPeriodsOption = {
          periodId: -1,
          periodName: this.$translate('allPeriods')
        };

        periods.unshift(allPeriodsOption);
        currentPeriod = periods[0];
      } else if (periods.length == 1) {
        currentPeriod = periods[0];
      }

      var mergedPeriods = [];

      /*
       * Get the periods from the run status. These periods may not be up to
       * date so we need to compare them with the periods from the config.
       */
      var runStatusPeriods = this.runStatus.periods;

      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = periods[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var period = _step5.value;

          if (period != null) {
            var runStatusPeriod = null;
            if (runStatusPeriods != null) {
              var _iteratorNormalCompletion6 = true;
              var _didIteratorError6 = false;
              var _iteratorError6 = undefined;

              try {
                for (var _iterator6 = runStatusPeriods[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                  var tempRunStatusPeriod = _step6.value;

                  if (tempRunStatusPeriod != null) {
                    if (period.periodId == tempRunStatusPeriod.periodId) {
                      runStatusPeriod = tempRunStatusPeriod;
                    }
                  }
                }
              } catch (err) {
                _didIteratorError6 = true;
                _iteratorError6 = err;
              } finally {
                try {
                  if (!_iteratorNormalCompletion6 && _iterator6.return) {
                    _iterator6.return();
                  }
                } finally {
                  if (_didIteratorError6) {
                    throw _iteratorError6;
                  }
                }
              }
            }

            if (runStatusPeriod == null) {
              /*
               * we did not find the period object in the run status so
               * we will use the period object from the config
               */
              mergedPeriods.push(period);
            } else {
              mergedPeriods.push(runStatusPeriod);
            }
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }

      this.periods = mergedPeriods;
      this.runStatus.periods = mergedPeriods;

      if (currentPeriod) {
        this.setCurrentPeriod(currentPeriod);
      }
    }
  }, {
    key: 'setCurrentPeriod',
    value: function setCurrentPeriod(period) {
      var previousPeriod = this.currentPeriod;
      this.currentPeriod = period;
      var periodId = this.currentPeriod.periodId;

      /*
       * if currently selected workgroup is in a different period, clear the
       * currently selected workgroup
       */
      var currentWorkgroup = this.getCurrentWorkgroup();
      if (currentWorkgroup) {
        var workgroupPeriod = currentWorkgroup.periodId;
        if (periodId !== -1 && workgroupPeriod !== periodId) {
          this.setCurrentWorkgroup(null);
        }
      }

      this.$rootScope.$broadcast('currentPeriodChanged', { previousPeriod: previousPeriod, currentPeriod: this.currentPeriod });
    }
  }, {
    key: 'getCurrentPeriod',
    value: function getCurrentPeriod() {
      return this.currentPeriod;
    }
  }, {
    key: 'getPeriods',
    value: function getPeriods() {
      return this.periods;
    }
  }, {
    key: 'getRunStatus',
    value: function getRunStatus() {
      return this.runStatus;
    }
  }, {
    key: 'setCurrentWorkgroup',
    value: function setCurrentWorkgroup(workgroup) {
      this.currentWorkgroup = workgroup;
      this.$rootScope.$broadcast('currentWorkgroupChanged', { currentWorkgroup: this.currentWorkgroup });
    }
  }, {
    key: 'getCurrentWorkgroup',
    value: function getCurrentWorkgroup() {
      return this.currentWorkgroup;
    }
  }, {
    key: 'setCurrentStep',
    value: function setCurrentStep(step) {
      this.currentStep = step;
      this.$rootScope.$broadcast('currentStepChanged', { currentStep: this.currentStep });
    }
  }, {
    key: 'getCurrentStep',
    value: function getCurrentStep() {
      return this.currentStep;
    }

    /**
     * Get the current node
     * @returns the current node object
     */

  }, {
    key: 'getCurrentNode',
    value: function getCurrentNode() {
      return this.currentNode;
    }

    /**
     * Get the current node id
     * @returns the current node id
     */

  }, {
    key: 'getCurrentNodeId',
    value: function getCurrentNodeId() {
      if (this.currentNode != null) {
        return this.currentNode.id;
      }
      return null;
    }

    /**
     * Set the current node
     * @param nodeId the node id
     */

  }, {
    key: 'setCurrentNodeByNodeId',
    value: function setCurrentNodeByNodeId(nodeId) {
      if (nodeId != null) {
        var node = this.ProjectService.getNodeById(nodeId);
        this.setCurrentNode(node);
      }
    }

    /**
     * Set the current node
     * @param node the node object
     */

  }, {
    key: 'setCurrentNode',
    value: function setCurrentNode(node) {
      var previousCurrentNode = this.currentNode;
      if (previousCurrentNode !== node) {
        if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)) {
          this.previousStep = previousCurrentNode;
        }

        this.currentNode = node;
        this.$rootScope.$broadcast('currentNodeChanged', { previousNode: previousCurrentNode, currentNode: this.currentNode });
      }
    }

    /**
     * End the current node
     */

  }, {
    key: 'endCurrentNode',
    value: function endCurrentNode() {
      var previousCurrentNode = this.currentNode;
      if (previousCurrentNode != null) {
        this.$rootScope.$broadcast('exitNode', { nodeToExit: previousCurrentNode });
      }
    }

    /**
     * End the current node and set the current node
     * @param nodeId the node id of the new current node
     */

  }, {
    key: 'endCurrentNodeAndSetCurrentNodeByNodeId',
    value: function endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
      this.endCurrentNode();
      this.setCurrentNodeByNodeId(nodeId);
    }

    /**
     * Get the total score for a workgroup
     * @param workgroupId the workgroup id
     * @returns the total score for the workgroup
     */

  }, {
    key: 'getTotalScoreByWorkgroupId',
    value: function getTotalScoreByWorkgroupId(workgroupId) {
      if (this.studentData.annotationsToWorkgroupId != null) {
        var annotations = this.studentData.annotationsToWorkgroupId[workgroupId];
        return this.AnnotationService.getTotalScore(annotations, workgroupId);
      }
      return null;
    }

    /**
     * Get the run status
     * @returns the run status object
     */

  }, {
    key: 'getRunStatus',
    value: function getRunStatus() {
      return this.runStatus;
    }

    /**
     * Check if any period in the run is paused
     * @returns Boolean whether any periods are paused
     */

  }, {
    key: 'isAnyPeriodPaused',
    value: function isAnyPeriodPaused(periodId) {
      var runStatus = this.runStatus;

      if (runStatus && runStatus.periods) {
        var periods = runStatus.periods;
        var nPeriods = periods.length;
        var nPeriodsPaused = 0;
        var _iteratorNormalCompletion7 = true;
        var _didIteratorError7 = false;
        var _iteratorError7 = undefined;

        try {
          for (var _iterator7 = periods[Symbol.iterator](), _step7; !(_iteratorNormalCompletion7 = (_step7 = _iterator7.next()).done); _iteratorNormalCompletion7 = true) {
            var period = _step7.value;

            if (period != null) {
              if (period.paused) {
                return true;
              }
            }
          }
        } catch (err) {
          _didIteratorError7 = true;
          _iteratorError7 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion7 && _iterator7.return) {
              _iterator7.return();
            }
          } finally {
            if (_didIteratorError7) {
              throw _iteratorError7;
            }
          }
        }
      }
      return false;
    }

    /**
     * Check if the given period is paused
     * @param periodId the id for a period
     * @returns Boolean whether the period is paused or not
     */

  }, {
    key: 'isPeriodPaused',
    value: function isPeriodPaused(periodId) {
      var isPaused = false;
      var runStatus = this.runStatus;

      if (runStatus && runStatus.periods) {
        var periods = runStatus.periods;
        var nPeriods = periods.length;
        var nPeriodsPaused = 0;

        var _iteratorNormalCompletion8 = true;
        var _didIteratorError8 = false;
        var _iteratorError8 = undefined;

        try {
          for (var _iterator8 = periods[Symbol.iterator](), _step8; !(_iteratorNormalCompletion8 = (_step8 = _iterator8.next()).done); _iteratorNormalCompletion8 = true) {
            var period = _step8.value;

            if (period != null) {
              isPaused = period.paused;
              if (periodId == period.periodId) {
                // we have found the period we are looking for
                break;
              } else {
                if (isPaused) {
                  nPeriodsPaused++;
                } else {
                  break;
                }
              }
            }
          }
        } catch (err) {
          _didIteratorError8 = true;
          _iteratorError8 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion8 && _iterator8.return) {
              _iterator8.return();
            }
          } finally {
            if (_didIteratorError8) {
              throw _iteratorError8;
            }
          }
        }

        if (periodId === -1 && nPeriods === nPeriodsPaused) {
          isPaused = true;
        }
      }
      return isPaused;
    }

    /**
     * The pause screen status was changed for the given periodId. Update period accordingly.
     * @param periodId the id of the period to toggle
     * @param isPaused Boolean whether the period should be paused or not
     */

  }, {
    key: 'pauseScreensChanged',
    value: function pauseScreensChanged(periodId, isPaused) {
      if (periodId) {
        this.updatePausedRunStatusValue(periodId, isPaused);

        if (isPaused) {
          this.TeacherWebSocketService.pauseScreens(periodId);
        } else {
          this.TeacherWebSocketService.unPauseScreens(periodId);
        }

        this.sendRunStatus();
        var context = "ClassroomMonitor",
            nodeId = null,
            componentId = null,
            componentType = null,
            category = "TeacherAction",
            data = { periodId: periodId };
        var event = "pauseScreen";
        if (!isPaused) {
          event = "unPauseScreen";
        }
        this.saveEvent(context, nodeId, componentId, componentType, category, event, data);
        this.$rootScope.$broadcast('pauseScreensChanged', { periods: this.runStatus.periods });
      }
    }

    /**
     * Create a local run status object to keep track of the run status
     * @returns the run status object
     */

  }, {
    key: 'createRunStatus',
    value: function createRunStatus() {
      var runStatus = {};
      runStatus.runId = this.ConfigService.getConfigParam('runId');
      var periods = this.ConfigService.getPeriods();
      var _iteratorNormalCompletion9 = true;
      var _didIteratorError9 = false;
      var _iteratorError9 = undefined;

      try {
        for (var _iterator9 = periods[Symbol.iterator](), _step9; !(_iteratorNormalCompletion9 = (_step9 = _iterator9.next()).done); _iteratorNormalCompletion9 = true) {
          var period = _step9.value;

          period.paused = false;
        }
      } catch (err) {
        _didIteratorError9 = true;
        _iteratorError9 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion9 && _iterator9.return) {
            _iterator9.return();
          }
        } finally {
          if (_didIteratorError9) {
            throw _iteratorError9;
          }
        }
      }

      runStatus.periods = periods;
      this.runStatus = runStatus;
      return this.runStatus;
    }

    /**
     * Update the paused value for a period in our run status
     * @param periodId the period id
     * @param value whether the period is paused or not
     */

  }, {
    key: 'updatePausedRunStatusValue',
    value: function updatePausedRunStatusValue(periodId, value) {
      if (this.runStatus == null) {
        this.createRunStatus();
      }

      var runStatus = this.runStatus;
      var periods = runStatus.periods;
      var allPeriodsPaused = true;

      if (periods) {
        var l = periods.length,
            x = l - 1;
        for (; x > -1; x--) {
          var tempPeriod = periods[x];
          var tempPeriodId = tempPeriod.periodId;

          //check if the period id matches the one we need to update or if all periods has been selected
          if (periodId === tempPeriodId || periodId === -1) {
            tempPeriod.paused = value;
          }

          if (tempPeriodId !== -1 && !tempPeriod.paused) {
            allPeriodsPaused = false;
          }

          if (tempPeriodId === -1) {
            tempPeriod.paused = allPeriodsPaused;
          }
        }
      }
    }

    /**
     * Send the run status back to the server to be saved in the db
     * @param customPauseMessage the custom pause message text to send to the students
     */

  }, {
    key: 'sendRunStatus',
    value: function sendRunStatus(customPauseMessage) {
      var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
      if (runStatusURL != null) {
        var runId = this.ConfigService.getConfigParam('runId');
        if (customPauseMessage != null) {
          this.runStatus.pauseMessage = customPauseMessage;
        }

        var runStatus = angular.toJson(this.runStatus);
        var runStatusParams = {
          runId: runId,
          status: runStatus
        };

        var httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = runStatusURL;
        httpParams.headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
        httpParams.data = $.param(runStatusParams);
        this.$http(httpParams);
      }
    }
  }]);

  return TeacherDataService;
}();

TeacherDataService.$inject = ['$http', '$filter', '$q', '$rootScope', 'AnnotationService', 'ConfigService', 'NotificationService', 'ProjectService', 'TeacherWebSocketService', 'UtilService'];

exports.default = TeacherDataService;
//# sourceMappingURL=teacherDataService.js.map

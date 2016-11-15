'use strict';

class TeacherDataService {

    constructor($http,
                $q,
                $rootScope,
                AnnotationService,
                ConfigService,
                NotificationService,
                ProjectService,
                TeacherWebSocketService) {
        this.$http = $http;
        this.$q = $q;
        this.$rootScope = $rootScope;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.NotificationService = NotificationService;
        this.ProjectService = ProjectService;
        this.TeacherWebSocketService = TeacherWebSocketService;

        this.studentData = {
            componentStatesByWorkgroupId: {},
            componentStatesByNodeId: {},
            componentStatesByComponentId: {}
        };

        this.currentPeriod = null;
        this.currentNode = null;
        this.previousStep = null;
        this.runStatus = null;
        this.periods = [];

        this.initializePeriods();

        /**
         * Listen for the 'annotationSavedToServer' event which is fired when
         * we receive the response from saving an annotation to the server
         */
        this.$rootScope.$on('annotationSavedToServer', (event, args) => {

            if (args) {
                // get the annotation that was saved to the server
                let annotation = args.annotation;
                this.handleAnnotationReceived(annotation);
            }
        });

        /**
         * Listen for the 'newAnnotationReceived' event which is fired when
         * teacher receives a new annotation (usually on a student work) from the server
         */
        this.$rootScope.$on('newAnnotationReceived', (event, args) => {

            if (args) {
                // get the annotation that was saved to the server
                let annotation = args.annotation;
                this.handleAnnotationReceived(annotation);
            }
        });

        /**
         * Listen for the 'newStudentWorkReceived' event which is fired when
         * teacher receives a new student work from the server
         */
        this.$rootScope.$on('newStudentWorkReceived', (event, args) => {

            if (args) {
                // get the student work (component state) that was saved to the server
                let studentWork = args.studentWork;
                this.addOrUpdateComponentState(studentWork);
                // broadcast the event that a new work has been received
                this.$rootScope.$broadcast('studentWorkReceived', {studentWork: studentWork});
            }
        });
    }

    handleAnnotationReceived(annotation) {
        // add the annotation to the local annotations array
        this.studentData.annotations.push(annotation);

        let toWorkgroupId = annotation.toWorkgroupId;
        if (this.studentData.annotationsToWorkgroupId[toWorkgroupId] == null) {
            this.studentData.annotationsToWorkgroupId[toWorkgroupId] = new Array();
        }
        this.studentData.annotationsToWorkgroupId[toWorkgroupId].push(annotation);

        let nodeId = annotation.nodeId;
        if (this.studentData.annotationsByNodeId[nodeId] == null) {
            this.studentData.annotationsByNodeId[nodeId] = new Array();
        }
        this.studentData.annotationsByNodeId[nodeId].push(annotation);

        this.AnnotationService.setAnnotations(this.studentData.annotations);

        // broadcast the event that a new annotation has been received
        this.$rootScope.$broadcast('annotationReceived', {annotation: annotation});
    }

    /**
     * Retrieves the export given the export Type
     * @param exportType
     */
    getExport(exportType) {
        let exportURL = this.ConfigService.getConfigParam('runDataExportURL');
        let runId = this.ConfigService.getRunId();
        exportURL += "/" + runId + "/" + exportType;

        if (exportType === "studentAssets") {
            window.location.href = exportURL;
            let deferred = this.$q.defer();
            let promise = deferred.promise;
            deferred.resolve([]);
            return promise;
        } else {
            let httpParams = {
                method : 'GET',
                url : exportURL,
                params : {}
            };

            return this.$http(httpParams).then((result) => {
                return result.data;
            });
        }
    };

    /**
     * Save events that occur in the Classroom Monitor to the server
     * @param event the event object
     * @returns a promise
     */
    saveEvent(context, nodeId, componentId, componentType, category, event, data) {
        let newEvent = {
            runId : this.ConfigService.getRunId(),
            workgroupId : this.ConfigService.getWorkgroupId(),
            clientSaveTime : Date.parse(new Date()),
            context : context,
            nodeId : nodeId,
            componentId : componentId,
            type : componentType,
            category : category,
            event : event,
            data : data
        };

        let events = [newEvent];

        let params = {
             runId : this.ConfigService.getRunId(),
             workgroupId : this.ConfigService.getWorkgroupId(),
             events : angular.toJson(events)
        };

        let httpParams = {};
        httpParams.method = 'POST';
        httpParams.url = this.ConfigService.getConfigParam('teacherDataURL');
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        httpParams.data = $.param(params);

        return this.$http(httpParams).then((result) => {

            var savedEvents = null;

            if (result != null && result.data != null) {
                let data = result.data;

                if (data != null) {

                    // get the saved events
                    savedEvents = data.events;
                }
            }

            return savedEvents;
        });
    };

    /**
     * Retrieve the student data for a node id
     * @param nodeId the node id
     * @returns the student data for the node id
     */
    retrieveStudentDataByNodeId(nodeId) {

        //var periodId = null;

        //if (this.currentPeriod != null && this.currentPeriod.periodName != 'All') {
            //periodId = this.currentPeriod.periodId;
        //}

        // get the node ids and component ids in the node
        var nodeIdsAndComponentIds = this.ProjectService.getNodeIdsAndComponentIds(nodeId);

        // get the show previous work node ids and component ids in the node
        var showPreviousWorkNodeIdsAndComponentIds = this.ProjectService.getShowPreviousWorkNodeIdsAndComponentIds(nodeId);

        var components = [];
        components = components.concat(nodeIdsAndComponentIds);
        components = components.concat(showPreviousWorkNodeIdsAndComponentIds);

        var params = {};
        params.runId = this.ConfigService.getRunId();
        //params.periodId = periodId;
        params.periodId = null;
        params.workgroupId = null;
        params.components = components;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the student data for the workgroup id
     * @param workgroupId the workgroup id
     * @returns the student data for the workgroup id
     */
    retrieveStudentDataByWorkgroupId(workgroupId) {

        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = null;
        params.nodeId = null;
        params.workgroupId = workgroupId;
        params.toWorkgroupId = workgroupId;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the annotations for the run
     * @returns the annotations for the run
     */
    retrieveAnnotations() {
        var params = {};
        params.runId = this.ConfigService.getRunId();
        params.periodId = null;
        params.nodeId = null;
        params.workgroupId = null;
        params.toWorkgroupId = null;
        params.getStudentWork = false;
        params.getEvents = false;
        params.getAnnotations = true;

        return this.retrieveStudentData(params);
    };

    /**
     * Retrieve the student data
     * @param params the params that specify what student data we want
     * @returns a promise
     */
    retrieveStudentData(params) {
        let studentDataURL = this.ConfigService.getConfigParam('teacherDataURL');

        if (params.getStudentWork == null) {
            params.getStudentWork = true;
        }

        if (params.getEvents == null) {
            params.getEvents = false;
        }

        if (params.getAnnotations == null) {
            params.getAnnotations = true;
        }

        let httpParams = {
            "method": "GET",
            "url": studentDataURL,
            "params": params
        };

        return this.$http(httpParams).then((result) => {
            var resultData = result.data;
            if (resultData != null) {

                if (resultData.studentWorkList != null) {
                    var componentStates = resultData.studentWorkList;

                    // populate allComponentStates, componentStatesByWorkgroupId and componentStatesByNodeId objects
                    for (var i = 0; i < componentStates.length; i++) {
                        var componentState = componentStates[i];
                        this.addOrUpdateComponentState(componentState);
                    }
                }

                if (resultData.events != null) {
                    // populate allEvents, eventsByWorkgroupId, and eventsByNodeId arrays
                    this.studentData.allEvents = resultData.events;
                    this.studentData.eventsByWorkgroupId = {};
                    this.studentData.eventsByNodeId = {};
                    for (var i = 0; i < resultData.events.length; i++) {
                        var event = resultData.events[i];
                        var eventWorkgroupId = event.workgroupId;
                        if (this.studentData.eventsByWorkgroupId[eventWorkgroupId] == null) {
                            this.studentData.eventsByWorkgroupId[eventWorkgroupId] = new Array();
                        }
                        this.studentData.eventsByWorkgroupId[eventWorkgroupId].push(event);

                        var eventNodeId = event.nodeId;
                        if (this.studentData.eventsByNodeId[eventNodeId] == null) {
                            this.studentData.eventsByNodeId[eventNodeId] = new Array();
                        }
                        this.studentData.eventsByNodeId[eventNodeId].push(event);
                    }
                }

                if (resultData.annotations != null) {
                    // populate annotations, annotationsByWorkgroupId, and annotationsByNodeId arrays
                    this.studentData.annotations = resultData.annotations;
                    this.studentData.annotationsToWorkgroupId = {};
                    this.studentData.annotationsByNodeId = {};
                    for (var i = 0; i < resultData.annotations.length; i++) {
                        var annotation = resultData.annotations[i];
                        var annotationWorkgroupId = annotation.toWorkgroupId;
                        if (!this.studentData.annotationsToWorkgroupId[annotationWorkgroupId]) {
                            this.studentData.annotationsToWorkgroupId[annotationWorkgroupId] = new Array();
                        }
                        this.studentData.annotationsToWorkgroupId[annotationWorkgroupId].push(annotation);

                        var annotationNodeId = annotation.nodeId;
                        if (!this.studentData.annotationsByNodeId[annotationNodeId]) {
                            this.studentData.annotationsByNodeId[annotationNodeId] = new Array();
                        }
                        this.studentData.annotationsByNodeId[annotationNodeId].push(annotation);
                    }
                }

                this.AnnotationService.setAnnotations(this.studentData.annotations);
            }
        });
    };

    /**
     * Add ComponentState to local bookkeeping
     * @param componentState the ComponentState to add
     */
    addOrUpdateComponentState(componentState) {
        var componentStateWorkgroupId = componentState.workgroupId;
        if (this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] == null) {
            this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId] = new Array();
        }
        let found = false;
        for (let w = 0; w < this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId].length; w++) {
            let cs = this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w];
            if (cs.id != null && cs.id === componentState.id) {
                // found the same component id, so just update it in place.
                this.studentData.componentStatesByWorkgroupId[componentStateWorkgroupId][w] = componentState;
                found = true;  // remember this so we don't insert later.
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
        found = false;  // reset
        for (let n = 0; n < this.studentData.componentStatesByNodeId[componentStateNodeId].length; n++) {
            let cs = this.studentData.componentStatesByNodeId[componentStateNodeId][n];
            if (cs.id != null && cs.id === componentState.id) {
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
        found = false;  // reset
        for (let c = 0; c < this.studentData.componentStatesByComponentId[componentId].length; c++) {
            let cs = this.studentData.componentStatesByComponentId[componentId][c];
            if (cs.id != null && cs.id === componentState.id) {
                // found the same component id, so just update it in place.
                this.studentData.componentStatesByComponentId[componentId][c] = componentState
                found = true; // remember this so we don't insert later.
                break;
            }
        }
        if (!found) {
            this.studentData.componentStatesByComponentId[componentId].push(componentState);
        }
    };

    /**
     * Retrieve the run status from the server
     */
    retrieveRunStatus() {
        var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');
        var runId = this.ConfigService.getConfigParam('runId');

        //create the params for the request
        var params = {
            runId:runId
        };

        var httpParams = {};
        httpParams.method = 'GET';
        httpParams.url = runStatusURL;
        httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
        httpParams.params = params;

        // make the request
        return this.$http(httpParams).then((result) => {
            if (result != null) {
                var data = result.data;
                if (data != null) {
                    // save the run status
                    this.runStatus = data;
                }
            }
        });
    }

    getComponentStatesByWorkgroupId(workgroupId) {
        if (this.studentData.componentStatesByWorkgroupId == null) {
            //debugger;
        }
        var componentStatesByWorkgroupId = this.studentData.componentStatesByWorkgroupId[workgroupId];
        if (componentStatesByWorkgroupId != null) {
            return componentStatesByWorkgroupId;
        } else {
            return [];
        }
    }

    getComponentStatesByNodeId(nodeId) {
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
    getComponentStatesByComponentId(componentId) {
        var componentStates = [];

        var componentStatesByComponentId = this.studentData.componentStatesByComponentId[componentId];

        if (componentStatesByComponentId != null) {
            componentStates = componentStatesByComponentId;
        }

        return componentStates;
    }

    getLatestComponentStateByWorkgroupIdNodeIdAndComponentId(workgroupId, nodeId, componentId) {
        var latestComponentState = null;

        var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        if (componentStates != null) {

            // loop through all the component states from newest to oldest
            for (var c = componentStates.length - 1; c >= 0; c--) {
                var componentState = componentStates[c];

                if (componentState != null) {
                    var componentStateNodeId = componentState.nodeId;
                    var componentStateComponentId = componentState.componentId;

                    // compare the node id and component id
                    if (nodeId == componentStateNodeId &&
                        componentId == componentStateComponentId) {
                        latestComponentState = componentState;
                        break;
                    }
                }
            }
        }

        return latestComponentState;
    }

    getLatestComponentStateByWorkgroupIdNodeId(workgroupId, nodeId) {
        var latestComponentState = null;

        var componentStates = this.getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId);

        if (componentStates != null) {

            // loop through all the component states from newest to oldest
            for (var c = componentStates.length - 1; c >= 0; c--) {
                var componentState = componentStates[c];

                if (componentState != null) {
                    var componentStateNodeId = componentState.nodeId;

                    // compare the node id and component id
                    if (nodeId == componentStateNodeId) {
                        latestComponentState = componentState;
                        break;
                    }
                }
            }
        }

        return latestComponentState;
    }

    getComponentStatesByWorkgroupIdAndNodeId(workgroupId, nodeId) {

        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByNodeId = this.getComponentStatesByNodeId(nodeId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter((n) => {
            return componentStatesByNodeId.indexOf(n) != -1;
        });
    }

    /**
     * Get component states for a workgroup id and component id
     * @param workgroupId the workgroup id
     * @param componentId the component id
     * @returns an array of component states
     */
    getComponentStatesByWorkgroupIdAndComponentId(workgroupId, componentId) {
        var componentStatesByWorkgroupId = this.getComponentStatesByWorkgroupId(workgroupId);
        var componentStatesByComponentId = this.getComponentStatesByComponentId(componentId);

        // find the intersect and return it
        return componentStatesByWorkgroupId.filter((n) => {
            return componentStatesByComponentId.indexOf(n) != -1;
        });
    }

    getEventsByWorkgroupId(workgroupId) {
        var eventsByWorkgroupId = this.studentData.eventsByWorkgroupId[workgroupId];
        if (eventsByWorkgroupId != null) {
            return eventsByWorkgroupId;
        } else {
            return [];
        }
    };

    getEventsByNodeId(nodeId) {
        var eventsByNodeId = this.studentData.eventsByNodeId[nodeId];
        if (eventsByNodeId != null) {
            return eventsByNodeId;
        } else {
            return [];
        }
    };

    getEventsByWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var eventsByWorkgroupId = this.getEventsByWorkgroupId(workgroupId);
        var eventsByNodeId = this.getEventsByNodeId(nodeId);

        // find the intersect and return it
        return eventsByWorkgroupId.filter((n) => {
            return eventsByNodeId.indexOf(n) != -1;
        });
    };

    getAnnotationsToWorkgroupId(workgroupId) {
        var annotationsToWorkgroupId = this.studentData.annotationsToWorkgroupId[workgroupId];
        if (annotationsToWorkgroupId != null) {
            return annotationsToWorkgroupId;
        } else {
            return [];
        }
    }

    getAnnotationsByNodeId(nodeId) {
        var annotationsByNodeId = this.studentData.annotationsByNodeId[nodeId];
        if (annotationsByNodeId != null) {
            return annotationsByNodeId;
        } else {
            return [];
        }
    }

    getAnnotationsToWorkgroupIdAndNodeId(workgroupId, nodeId) {
        var annotationsToWorkgroupId = this.getAnnotationsToWorkgroupId(workgroupId);
        var annotationsByNodeId = this.getAnnotationsByNodeId(nodeId);

        // find the intersect and return it
        return annotationsToWorkgroupId.filter((n) => {
            return annotationsByNodeId.indexOf(n) != -1;
        });
    }

    /**
     * Initialize the periods
     */
    initializePeriods() {
        let periods = this.ConfigService.getPeriods();
        let currentPeriod = null;

        if (periods.length > 1) {
            // create an option for all periods
            let allPeriodsOption = {
                periodId: -1,
                periodName: 'All'
            };

            periods.unshift(allPeriodsOption);
            currentPeriod = periods[0];
        }

        this.periods = periods;

        // set the current period
        if (currentPeriod) {
            this.setCurrentPeriod(currentPeriod);
        }
    }

    setCurrentPeriod(period) {
        let previousPeriod = this.currentPeriod;
        this.currentPeriod = period;

        // broadcast the event that the current period has changed
        this.$rootScope.$broadcast('currentPeriodChanged', {previousPeriod: previousPeriod, currentPeriod: this.currentPeriod});
    }

    getCurrentPeriod() {
        return this.currentPeriod;
    }

    getPeriods() {
        return this.periods;
    }

    /**
     * Get the current node
     * @returns the current node object
     */
    getCurrentNode() {
        return this.currentNode;
    }

    /**
     * Get the current node id
     * @returns the current node id
     */
    getCurrentNodeId() {
        var currentNodeId = null;

        if (this.currentNode != null) {
            currentNodeId = this.currentNode.id;
        }

        return currentNodeId;
    }

    /**
     * Set the current node
     * @param nodeId the node id
     */
    setCurrentNodeByNodeId(nodeId) {
        if (nodeId != null) {
            let node = this.ProjectService.getNodeById(nodeId);

            this.setCurrentNode(node);
        }
    }

    /**
     * Set the current node
     * @param node the node object
     */
    setCurrentNode(node) {
        let previousCurrentNode = this.currentNode;

        if (previousCurrentNode !== node) {
            // the current node is about to change

            if (previousCurrentNode && !this.ProjectService.isGroupNode(previousCurrentNode.id)){
                // set the previous node to the current node
                this.previousStep = previousCurrentNode;
            }

            // set the current node to the new node
            this.currentNode = node;

            // broadcast the event that the current node has changed
            this.$rootScope.$broadcast('currentNodeChanged', {previousNode: previousCurrentNode, currentNode: this.currentNode});
        }
    }

    /**
     * End the current node
     */
    endCurrentNode() {

        // get the current node
        var previousCurrentNode = this.currentNode;

        if (previousCurrentNode != null) {

            // tell the node to exit
            this.$rootScope.$broadcast('exitNode', {nodeToExit: previousCurrentNode});
        }
    }

    /**
     * End the current node and set the current node
     * @param nodeId the node id of the new current node
     */
    endCurrentNodeAndSetCurrentNodeByNodeId(nodeId) {
        // end the current node
        this.endCurrentNode();

        // set the current node
        this.setCurrentNodeByNodeId(nodeId);
    }

    /**
     * Get the total score for a workgroup
     * @param workgroupId the workgroup id
     * @returns the total score for the workgroup
     */
    getTotalScoreByWorkgroupId(workgroupId) {

        var totalScore = null;

        if (this.studentData.annotationsToWorkgroupId != null) {

            // get all the annotations for a workgroup
            var annotations = this.studentData.annotationsToWorkgroupId[workgroupId];

            // get the total score for the workgroup
            totalScore = this.AnnotationService.getTotalScore(annotations, workgroupId);
        }

        return totalScore;
    }

    /**
     * Get the run status
     * @returns the run status object
     */
    getRunStatus() {
        return this.runStatus;
    }

    /**
     * Check if a period is paused
     * @returns whether the period is paused or not
     */
    isPeriodPaused(periodId) {

        let isPaused = false;

        // get the run status
        let runStatus = this.runStatus;

        if (runStatus && runStatus.periods) {
            let periods = runStatus.periods;
            let nPeriods = periods.length;
            let nPeriodsPaused = 0;

            // loop through all the periods
            for (let p = 0; p < periods.length; p++) {
                let period = periods[p];

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

            if (periodId === -1 && nPeriods === nPeriodsPaused) {
                isPaused = true;
            }
        }

        return isPaused;
    }

    /**
     * The pause screen status was changed. update period(s) accordingly.
     */
    pauseScreensChanged(isPaused) {

        // get the currently selected period Id
        let periodId = this.currentPeriod.periodId;

        // update the run status
        this.updatePausedRunStatusValue(periodId, isPaused);

        if (isPaused) {
            // pause the student screens
            this.TeacherWebSocketService.pauseScreens(periodId);
        } else {
            // unpause the student screens
            this.TeacherWebSocketService.unPauseScreens(periodId);
        }

        // save the run status to the server
        this.sendRunStatus();
    }

    /**
     * Create a local run status object to keep track of the run status
     * @returns the run status object
     */
    createRunStatus() {
        var runStatus = {};

        // get the run id
        runStatus.runId = this.ConfigService.getConfigParam('runId');

        // get all the periods objects
        var periods = this.ConfigService.getPeriods();

        //loop through all the periods
        for (var x = 0; x < periods.length; x++) {
            //get a period
            var period = periods[x];

            //set this to default to not paused
            period.paused = false;
        }

        // set the periods into the run status
        runStatus.periods = periods;

        // set the run status into the view so we can access it later
        this.runStatus = runStatus;

        return this.runStatus;
    }

    /**
     * Update the paused value for a period in our run status
     * @param periodId the period id
     * @param value whether the period is paused or not
     */
    updatePausedRunStatusValue(periodId, value) {
        //create the local run status object if necessary
        if (this.runStatus == null) {
            this.createRunStatus();
        }

        //get the local run status object
        let runStatus = this.runStatus;

        let periods = runStatus.periods;

        if (periods) {
            //loop through all the periods
            for (let x = 0; x < periods.length; x++) {
                //get a period
                let tempPeriod = periods[x];

                //get the period id
                let tempPeriodId = tempPeriod.periodId;

                //check if the period id matches the one we need to update or if all periods has been selected
                if (periodId === tempPeriodId || periodId === -1) {
                    //we have found the period we want to update
                    tempPeriod.paused = value;
                }
            }
        }
    }

    /**
     * Send the run status back to the server to be saved in the db
     * @param customPauseMessage the custom pause message text to send to the students
     */
    sendRunStatus(customPauseMessage) {
        //get the run status url we will use to make the request
        var runStatusURL = this.ConfigService.getConfigParam('runStatusURL');

        if (runStatusURL != null) {
            //make the request to the server for the student statuses

            //get the run id
            var runId = this.ConfigService.getConfigParam('runId');

            if (customPauseMessage != null) {
                //set the pause message if one was provided
                this.runStatus.pauseMessage = customPauseMessage;
            }

            //get the run status as a string
            var runStatus = angular.toJson(this.runStatus);

            //create the params for the request
            var runStatusParams = {
                runId:runId,
                status:runStatus
            };

            var httpParams = {};
            httpParams.method = 'POST';
            httpParams.url = runStatusURL;
            httpParams.headers = {'Content-Type': 'application/x-www-form-urlencoded'};
            httpParams.data = $.param(runStatusParams);

            // make the request
            this.$http(httpParams);
        }
    };
}

TeacherDataService.$inject = [
    '$http',
    '$q',
    '$rootScope',
    'AnnotationService',
    'ConfigService',
    'NotificationService',
    'ProjectService',
    'TeacherWebSocketService'
];

export default TeacherDataService;

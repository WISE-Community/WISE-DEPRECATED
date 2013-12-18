<%@ include file="../include.jsp"%>

<!DOCTYPE html>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
<meta http-equiv="X-UA-Compatible" content="chrome=1" />
<meta http-equiv="Content-Type" content="text/html;charset=utf-8" />

<title><spring:message code="pages.statistics.title" /></title>

<script src="${contextPath}/<spring:theme code="jquery.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="flot.js"/>" type="text/javascript"></script>
<script src="${contextPath}/<spring:theme code="excanvas.js"/>" type="text/javascript"></script>

<script type="text/javascript">

//the ids of the graphs
var graphIds = [];
graphIds.push('totalNumberStudentsOverTime');
graphIds.push('totalNumberStudentLoginsOverTime');
graphIds.push('totalNumberTeachersOverTime');
graphIds.push('totalNumberTeacherLoginsOverTime');
graphIds.push('totalNumberProjectsOverTime');
graphIds.push('totalNumberRunsOverTime');
graphIds.push('totalNumberTimesRunProjectClickedOverTime');
graphIds.push('break');
graphIds.push('totalNumberStudentsPerMonth');
graphIds.push('totalNumberStudentLoginsPerMonth');
graphIds.push('totalNumberTeachersPerMonth');
graphIds.push('totalNumberTeacherLoginsPerMonth');
graphIds.push('totalNumberProjectsPerMonth');
graphIds.push('totalNumberRunsPerMonth');
graphIds.push('totalNumberTimesRunProjectClickedPerMonth');
graphIds.push('break');
graphIds.push('totalNumberStepWorksOverTime');
graphIds.push('totalNumberStepsOverTime');
graphIds.push('totalNumberAnnotationsOverTime');
graphIds.push('totalNumberHintViewsOverTime');
graphIds.push('break');
graphIds.push('totalNumberStepTypesComparison');
graphIds.push('totalNumberStepWorkStepTypesComparison');
graphIds.push('totalNumberAnnotationTypesComparison');

//the labels of the graphs for the radio buttons
var graphLabels = [];
graphLabels.push('<spring:message code="pages.statistics.studentsTime" />');
graphLabels.push('<spring:message code="pages.statistics.studentLoginsTime" />');
graphLabels.push('<spring:message code="pages.statistics.teachersTime" />');
graphLabels.push('<spring:message code="pages.statistics.teacherLoginsTime" />');
graphLabels.push('<spring:message code="pages.statistics.projectsTime" />');
graphLabels.push('<spring:message code="pages.statistics.runsTime" />');
graphLabels.push('<spring:message code="pages.statistics.runClickedTime" />');
graphLabels.push('break');
graphLabels.push('<spring:message code="pages.statistics.newStudentsMonth" />');
graphLabels.push('<spring:message code="pages.statistics.studentLoginsMonth" />');
graphLabels.push('<spring:message code="pages.statistics.newTeachersMonth" />');
graphLabels.push('<spring:message code="pages.statistics.teacherLoginsMonth" />');
graphLabels.push('<spring:message code="pages.statistics.projectsMonth" />');
graphLabels.push('<spring:message code="pages.statistics.runsMonth" />');
graphLabels.push('<spring:message code="pages.statistics.runClickedMonth" />');
graphLabels.push('break');
graphLabels.push('<spring:message code="pages.statistics.studentWorkTime" />');
graphLabels.push('<spring:message code="pages.statistics.stepsCreatedTime" />');
graphLabels.push('<spring:message code="pages.statistics.feedbackTime" />');
graphLabels.push('<spring:message code="pages.statistics.hintsTime" />');
graphLabels.push('break');
graphLabels.push('<spring:message code="pages.statistics.stepTypes" />');
graphLabels.push('<spring:message code="pages.statistics.workByStepType" />');
graphLabels.push('<spring:message code="pages.statistics.feedbackByStepType" />');

//the mappings from graph ids to titles
var graphIdToTitles = {};
graphIdToTitles['totalNumberStudentsOverTime'] = '<spring:message code="pages.statistics.studentsTime" />';
graphIdToTitles['totalNumberStudentLoginsOverTime'] = '<spring:message code="pages.statistics.studentLoginsTime" />';
graphIdToTitles['totalNumberTeachersOverTime'] = '<spring:message code="pages.statistics.teachersTime" />';
graphIdToTitles['totalNumberTeacherLoginsOverTime'] = '<spring:message code="pages.statistics.teacherLoginsTime" />';
graphIdToTitles['totalNumberProjectsOverTime'] = '<spring:message code="pages.statistics.projectsTime" />';
graphIdToTitles['totalNumberRunsOverTime'] = '<spring:message code="pages.statistics.runsTime" />';
graphIdToTitles['totalNumberTimesRunProjectClickedOverTime'] = '<spring:message code="pages.statistics.runClickedTime" />';

graphIdToTitles['totalNumberStudentsPerMonth'] = '<spring:message code="pages.statistics.newStudentsMonth" />';
graphIdToTitles['totalNumberStudentLoginsPerMonth'] = '<spring:message code="pages.statistics.studentLoginsMonth" />';
graphIdToTitles['totalNumberTeachersPerMonth'] = '<spring:message code="pages.statistics.newTeachersMonth" />';
graphIdToTitles['totalNumberTeacherLoginsPerMonth'] = '<spring:message code="pages.statistics.teacherLoginsMonth" />';
graphIdToTitles['totalNumberProjectsPerMonth'] = '<spring:message code="pages.statistics.projectsMonth" />';
graphIdToTitles['totalNumberRunsPerMonth'] = '<spring:message code="pages.statistics.runsMonth" />';
graphIdToTitles['totalNumberTimesRunProjectClickedPerMonth'] = '<spring:message code="pages.statistics.runClickedMonth" />';

graphIdToTitles['totalNumberStepWorksOverTime'] = '<spring:message code="pages.statistics.studentWorkTime" />';
graphIdToTitles['totalNumberStepsOverTime'] = '<spring:message code="pages.statistics.stepsCreatedTime" />';
graphIdToTitles['totalNumberAnnotationsOverTime'] = '<spring:message code="pages.statistics.feedbackTime" />';
graphIdToTitles['totalNumberHintViewsOverTime'] = '<spring:message code="pages.statistics.hintsTime" />';

graphIdToTitles['totalNumberStepTypesComparison'] = '<spring:message code="pages.statistics.stepTypes" />';
graphIdToTitles['totalNumberStepWorkStepTypesComparison'] = '<spring:message code="pages.statistics.workByStepType" />';
graphIdToTitles['totalNumberAnnotationTypesComparison'] = '<spring:message code="pages.statistics.feedbackByStepType" />';

//the number of days in each month 1-12
var numberDaysInMonth = [];
numberDaysInMonth[1] = 31;
numberDaysInMonth[2] = 28;
numberDaysInMonth[3] = 31;
numberDaysInMonth[4] = 30;
numberDaysInMonth[5] = 31;
numberDaysInMonth[6] = 30;
numberDaysInMonth[7] = 31;
numberDaysInMonth[8] = 31;
numberDaysInMonth[9] = 30;
numberDaysInMonth[10] = 31;
numberDaysInMonth[11] = 30;
numberDaysInMonth[12] = 31;

//the names of each month 1-12
var monthNames = [];
monthNames[1] = "<spring:message code="month_jan_short"/>";
monthNames[2] = "<spring:message code="month_feb_short"/>";
monthNames[3] = "<spring:message code="month_mar_short"/>";
monthNames[4] = "<spring:message code="month_apr_short"/>";
monthNames[5] = "<spring:message code="month_may_short"/>";
monthNames[6] = "<spring:message code="month_jun_short"/>";
monthNames[7] = "<spring:message code="month_jul_short"/>";
monthNames[8] = "<spring:message code="month_aug_short"/>";
monthNames[9] = "<spring:message code="month_sep_short"/>";
monthNames[10] = "<spring:message code="month_oct_short"/>";
monthNames[11] = "<spring:message code="month_nov_short"/>";
monthNames[12] = "<spring:message code="month_dec_short"/>";

/**
 * Is the hour the first hour of the day
 * @param hour the hour of the day from 0-23
 */
function isFirstHourOfDay(hour) {
	return hour == 0;
}

/**
 * Is the hour the last hour of the day
 * @param hour the hour of the day from 0-23
 */
function isLastHourOfDay(hour) {
	return hour == 23;
}

/**
 * Is the day the first day of the month
 * @param day the day of the month from 1-31
 */
function isFirstDayOfMonth(day) {
	return day == 1;
}

/**
 * Is the day the last day of the month
 * @param day the day from 1-31
 * @param month the month from 0-11
 */
function isLastDayOfMonth(day, month) {
	//get the number of days in the month
	var daysInMonth = numberDaysInMonth[month];

	return day == daysInMonth;
}

/**
 * Determine if the current entry is the last entry of the day
 * by comparing it with the next entry.
 * @param portalStatisticsEntry the current statistics entry
 * @param nextPortalStatisticsEntry the next statistics entry
 */
function isLastEntryOfDay(portalStatisticsEntry, nextPortalStatisticsEntry) {
	var result = false;
	
	if(nextPortalStatisticsEntry == null) {
		//there is no next entry so this is the last entry of the day
		result = true;
	} else {
		//get the timestamps for both entries
		var timestamp = portalStatisticsEntry.timestamp;
		var nextTimestamp = nextPortalStatisticsEntry.timestamp;
		
		//get the timestamp as a Date object
		var date = new Date(timestamp);
		var hour = date.getHours();
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		
		//get the next timestamp as a Date object
		var nextEntryDate = new Date(nextTimestamp);
		var nextEntryHour = nextEntryDate.getHours();
		var nextEntryDay = nextEntryDate.getDate();
		var nextEntryMonth = nextEntryDate.getMonth() + 1;
		var nextEntryYear = nextEntryDate.getFullYear();
		
		if(day != nextEntryDay) {
			/*
			 * the day is not the same, so the current
			 * entry is the last entry of the day
			 */
			result = true;
		}		
	}
	
	return result;
}

/**
 * Determine if the current entry is the last entry of the month
 * by comparing it with the next entry.
 * @param portalStatisticsEntry the current statistics entry
 * @param nextPortalStatisticsEntry the next statistics entry
 */
function isLastEntryOfMonth(portalStatisticsEntry, nextPortalStatisticsEntry) {
	var result = false;
	
	if(nextPortalStatisticsEntry == null) {
		//there is no next entry so this is the last entry of the day
		result = true;
	} else {
		//get the timestamps for both entries
		var timestamp = portalStatisticsEntry.timestamp;
		var nextTimestamp = nextPortalStatisticsEntry.timestamp;
		
		//get the timestamp as a Date object
		var date = new Date(timestamp);
		var hour = date.getHours();
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();
		
		//get the next timestamp as a Date object
		var nextEntryDate = new Date(nextTimestamp);
		var nextEntryHour = nextEntryDate.getHours();
		var nextEntryDay = nextEntryDate.getDate();
		var nextEntryMonth = nextEntryDate.getMonth() + 1;
		var nextEntryYear = nextEntryDate.getFullYear();
		
		if(month != nextEntryMonth) {
			/*
			 * the month is not the same, so the current
			 * entry is the last entry of the month
			 */
			result = true;
		}		
	}
	
	return result;
}

//get the wise base urls
var wiseBaseURL = "${wiseBaseURL}";

//get the pages to request statistics from the portal and vle
var portalStatisticsPage = "/getPortalStatistics.html";
var vleStatisticsPage = "/getVLEStatistics.html";

//boolean for checking if we are done
var doneParsingPortalStatistics = false;
var doneParsingVLEStatistics = false;

//portal arrays for storing counts for all time
var totalNumberStudentsArray = [];
var totalNumberStudentLoginsArray = [];
var totalNumberTeachersArray = [];
var totalNumberTeacherLoginsArray = [];
var totalNumberProjectsArray = [];
var totalNumberRunsArray = [];
var totalNumberProjectsRunArray = [];

//portal arrays for storing monthly counts
var totalNumberStudentsMonthlyArray = [];
var totalNumberStudentLoginsMonthlyArray = [];
var totalNumberTeachersMonthlyArray = [];
var totalNumberTeacherLoginsMonthlyArray = [];
var totalNumberProjectsMonthlyArray = [];
var totalNumberRunsMonthlyArray = [];
var totalNumberProjectsRunMonthlyArray = [];

//the array to store the months e.g. "Mar 2011"
var monthlyLabelArray = [];

//vle arrays for storing counts for all time
var totalHintViewCountArray = [];
var totalNodeCountArray = [];
var totalStepWorkCountArray = [];
var totalAnnotationCountArray = [];

//vle arrays for storing the individual counts for each node type or annotation type
var individualNodeTypeCountsObject = {};
var individualStepWorkNodeTypeCountsObject = {};
var individualAnnotationCountsObject = {};

/*
 * vle arrays for storing the individual counts for each node type.
 * each element in the array represents one node type.
 * nodeTypeCountsComparison contains the count
 * nodeTypeCountsComparisonTicks contains the node type
 */
var nodeTypeCountsComparison = [];
var nodeTypeCountsComparisonTicks = [];

/*
 * vle arrays for storing the individual counts for each node type.
 * each element in the array represents one node type.
 * stepWorkNodeTypesCountsComparison contains the count
 * stepWorkNodeTypesCountsComparisonTicks contains the node type
 */
var stepWorkNodeTypesCountsComparison = [];
var stepWorkNodeTypesCountsComparisonTicks = [];

/*
 * vle arrays for storing the individual counts for each annotation type.
 * each element in the array represents one annotation type.
 * annotationCountsComparison contains the count
 * annotationCountsComparisonTicks contains the node type
 */
var annotationCountsComparison = [];
var annotationCountsComparisonTicks = [];

/**
 * Get the portal statistics
 */
function getPortalStatistics() {
	$.ajax({
		url:wiseBaseURL + portalStatisticsPage,
		success:getPortalStatisticsCallback,
		dataType:'json'
	});
}

/**
 * Called after we recieve the portal statistics
 * @param data a JSONArray containing the statistics
 * @param textStatus
 * @param jqXHR
 */
function getPortalStatisticsCallback(data, textStatus, jqXHR) {
	//get the statistics as a JSONArray
	var portalStatisticsArray = data;

	//parse the portal statistics
	parsePortalStatistics(portalStatisticsArray);
}

/**
 * Parse the portal statistics and fill our arrays with values we will
 * use to generate the graphs
 * @param portalStatisticsArray a JSONArray that contains all the portal statistics
 */
function parsePortalStatistics(portalStatisticsArray) {
	var monthStartEntry = null;
	var monthEndEntry = null;

	//loop through all the portal statistics entries
	for(var x=0; x<portalStatisticsArray.length; x++) {
		//get an entry
		var portalStatisticsEntry = portalStatisticsArray[x];
		
		//get the next entry for comparison purposes
		var nextPortalStatisticsEntry = portalStatisticsArray[x + 1];

		//get the timestamp
		var timestamp = portalStatisticsEntry.timestamp;

		//get all the statistics values
		var totalNumberStudents = portalStatisticsEntry.totalNumberStudents;
		var totalNumberStudentLogins = portalStatisticsEntry.totalNumberStudentLogins;
		var totalNumberTeachers = portalStatisticsEntry.totalNumberTeachers;
		var totalNumberTeacherLogins = portalStatisticsEntry.totalNumberTeacherLogins;
		var totalNumberProjects = portalStatisticsEntry.totalNumberProjects;
		var totalNumberRuns = portalStatisticsEntry.totalNumberRuns;
		var totalNumberProjectsRun = portalStatisticsEntry.totalNumberProjectsRun;

		//add the statistics values to their appropriate array
		totalNumberStudentsArray.push([timestamp, totalNumberStudents]);
		totalNumberStudentLoginsArray.push([timestamp, totalNumberStudentLogins]);
		totalNumberTeachersArray.push([timestamp, totalNumberTeachers]);
		totalNumberTeacherLoginsArray.push([timestamp, totalNumberTeacherLogins]);
		totalNumberProjectsArray.push([timestamp, totalNumberProjects]);
		totalNumberRunsArray.push([timestamp, totalNumberRuns]);
		totalNumberProjectsRunArray.push([timestamp, totalNumberProjectsRun]);

		//get the timestamp as a Date object
		var date = new Date(timestamp);
		var hour = date.getHours();
		var day = date.getDate();
		var month = date.getMonth() + 1;
		var year = date.getFullYear();

		if(isLastEntryOfMonth(portalStatisticsEntry, nextPortalStatisticsEntry) && isLastEntryOfDay(portalStatisticsEntry, nextPortalStatisticsEntry)) {
			/*
			 * the date is the last entry on the last day of the month
			 * so we will remember this statistics entry
			 */
			monthEndEntry = portalStatisticsEntry;
		}
		
		if(monthStartEntry == null) {
			//this is the first portal statistics entry so we will remember it
			monthStartEntry = portalStatisticsEntry;
		}

		if(x == portalStatisticsArray.length - 1) {
			//this is the last portal statistics entry so we will remember it
			monthEndEntry = portalStatisticsEntry;
		}

		if(monthStartEntry != null && monthEndEntry != null) {
			/*
			 * we have found the start and end entries for a month so we can
			 * calculate the statistics for this month
			 */

			//get the month name and label
			var monthName = monthNames[month];
			var monthLabel = monthName + " " + year;

			//get the next available index in the array
			var index = monthlyLabelArray.length;

			//add an entry into our month label array
			monthlyLabelArray.push([index, getVerticalText(monthLabel)]);

			//get the counts for this month
			var totalNumberStudentsForMonth = monthEndEntry.totalNumberStudents - monthStartEntry.totalNumberStudents;
			var totalNumberStudentLoginsForMonth = monthEndEntry.totalNumberStudentLogins - monthStartEntry.totalNumberStudentLogins;
			var totalNumberTeachersForMonth = monthEndEntry.totalNumberTeachers - monthStartEntry.totalNumberTeachers;
			var totalNumberTeacherLoginsForMonth = monthEndEntry.totalNumberTeacherLogins - monthStartEntry.totalNumberTeacherLogins;
			var totalNumberProjectsForMonth = monthEndEntry.totalNumberProjects - monthStartEntry.totalNumberProjects;
			var totalNumberRunsForMonth = monthEndEntry.totalNumberRuns - monthStartEntry.totalNumberRuns;
			var totalNumberProjectsRunForMonth = monthEndEntry.totalNumberProjectsRun - monthStartEntry.totalNumberProjectsRun;

			//add the counts to our monthly arrays
			totalNumberStudentsMonthlyArray.push([index, totalNumberStudentsForMonth]);
			totalNumberStudentLoginsMonthlyArray.push([index, totalNumberStudentLoginsForMonth]);
			totalNumberTeachersMonthlyArray.push([index, totalNumberTeachersForMonth]);
			totalNumberTeacherLoginsMonthlyArray.push([index, totalNumberTeacherLoginsForMonth]);
			totalNumberProjectsMonthlyArray.push([index, totalNumberProjectsForMonth]);
			totalNumberRunsMonthlyArray.push([index, totalNumberRunsForMonth]);
			totalNumberProjectsRunMonthlyArray.push([index, totalNumberProjectsRunForMonth]);

			//remember the end entry because that will be our new start entry
			monthStartEntry = monthEndEntry;

			//clear the end entry
			monthEndEntry = null;
		}
	}

	//we are done parsing the portal statistics
	doneParsingStatistics("portal");
}

/**
 * Get the vle statistics
 */
function getVLEStatistics() {
	$.ajax({
		url:wiseBaseURL + vleStatisticsPage,
		success:getVLEStatisticsCallback,
		dataType:'json'
	});
}

/*
 * Called after we receive the vle statistics
 * @param data a JSONArray containing the statistics
 * @param textStatus
 * @param jqXHR
 */
function getVLEStatisticsCallback(data, textStatus, jqXHR) {
	//get the vle statistics as a JSONArray
	var vleStatisticsArray = data;

	//parse the vle statistics
	parseVLEStatistics(vleStatisticsArray);
}

/**
 * Parse the vle statistics
 * @param vleStatisticsArray the array of vle statistics
 */
function parseVLEStatistics(vleStatisticsArray) {
	//loop through all the vle statistics
	for(var x=0; x<vleStatisticsArray.length; x++) {
		//get a vle statistics entry
		var vleStatisticsEntry = vleStatisticsArray[x];

		//get the timestamp
		var timestamp = vleStatisticsEntry.timestamp;

		//get the counts
		var totalHintViewCount = vleStatisticsEntry.totalHintViewCount;
		var totalNodeCount = vleStatisticsEntry.totalNodeCount;
		var totalStepWorkCount = vleStatisticsEntry.totalStepWorkCount;
		var totalAnnotationCount = vleStatisticsEntry.totalAnnotationCount;

		//add the counts to our arrays
		
		if(totalHintViewCount != null) {
			totalHintViewCountArray.push([timestamp, totalHintViewCount]);
		}
		
		if(totalNodeCount != null) {
			totalNodeCountArray.push([timestamp, totalNodeCount]);
		}
		
		if(totalStepWorkCount != null) {
			totalStepWorkCountArray.push([timestamp, totalStepWorkCount]);
		}
		
		if(totalAnnotationCount != null) {
			totalAnnotationCountArray.push([timestamp, totalAnnotationCount]);
		}

		//get the counts for the individual node types
		var individualNodeTypeCounts = vleStatisticsEntry.individualNodeTypeCounts;

		if(individualNodeTypeCounts != null) {
			//loop through all the node types
			for(var a=0; a<individualNodeTypeCounts.length; a++) {
				//get the entry
				var individualNodeTypeCount = individualNodeTypeCounts[a];

				//get the node type
				var nodeType = individualNodeTypeCount.nodeType;

				//get the count
				var count = individualNodeTypeCount.count;

				//add the count to the object that holds the individual statistics for all the node types
				addCountForType(individualNodeTypeCountsObject, nodeType, timestamp, count);

				if(x == vleStatisticsArray.length - 1) {
					/*
					 * we are on the last entry for this node type so we will add
					 * it to our array that we will use to graph all the node types
					 * next to each other for comparison
					 */

					//add the count
					nodeTypeCountsComparison.push([a, count]);

					//add the label
					nodeTypeCountsComparisonTicks.push([a, removeNodeTextAndMakeVertical(nodeType)]);
				}
			}
		}

		//get the counts for the individual node types for step works
		var individualStepWorkNodeTypeCounts = vleStatisticsEntry.individualStepWorkNodeTypeCounts;

		if(individualStepWorkNodeTypeCounts != null) {
			//loop through all the node types
			for(var b=0; b<individualStepWorkNodeTypeCounts.length; b++) {
				//get the entry
				var individualStepWorkNodeTypeCount = individualStepWorkNodeTypeCounts[b];

				//get the node type
				var nodeType = individualStepWorkNodeTypeCount.nodeType;

				//get the count
				var count = individualStepWorkNodeTypeCount.count;

				//add the count to the object that holds the individual statistics for all the node types for step works
				addCountForType(individualStepWorkNodeTypeCountsObject, nodeType, timestamp, count);

				if(x == vleStatisticsArray.length - 1) {
					/*
					 * we are on the last entry for this node type so we will add
					 * it to our array that we will use to graph all the node types
					 * next to each other for comparison
					 */

					//add the count
					stepWorkNodeTypesCountsComparison.push([b, count]);

					//add the label
					stepWorkNodeTypesCountsComparisonTicks.push([b, removeNodeTextAndMakeVertical(nodeType)]);
				}
			}
		}

		//get the counts for the individual annotation types
		var individualAnnotationCounts = vleStatisticsEntry.individualAnnotationCounts;

		if(individualAnnotationCounts != null) {
			//loop through all the annotation types
			for(var c=0; c<individualAnnotationCounts.length; c++) {
				//get the entry
				var individualAnnotationCount = individualAnnotationCounts[c];

				//get the annotation type
				var annotationType = individualAnnotationCount.annotationType;

				//get the count
				var count = individualAnnotationCount.count;

				//add the count to the object that holds the individual statistics for all annotation types
				addCountForType(individualAnnotationCountsObject, annotationType, timestamp, count);

				if(x == vleStatisticsArray.length - 1) {
					/*
					 * we are on the last entry for this node type so we will add
					 * it to our array that we will use to graph all the node types
					 * next to each other for comparison
					 */

					//add the count
					annotationCountsComparison.push([c, count]);

					//add the label
					annotationCountsComparisonTicks.push([c, removeNodeText(annotationType)]);
				}
			}
		}
	}

	//we are done parsing vle statistics
	doneParsingStatistics("vle");
}

/**
 * Remove the text "Node" from the node type and then
 * make it the text vertical
 * @param nodeType the text to modify
 */
function removeNodeTextAndMakeVertical(nodeType) {
	nodeType = removeNodeText(nodeType);
	nodeType = getVerticalText(nodeType);

	return nodeType;
}

/**
 * Remove the text "Node"
 * e.g.
 * before=OpenResponseNode
 * after=OpenResponse
 * @param text the text to modify
 */
function removeNodeText(text) {
	return text.replace(/Node/gi, "");
}

/**
 * make the text vertical by inserting <br> between every letter
 * @param text the text to modify
 */
function getVerticalText(text) {
	var verticalText = "";
	
	nodeTypeSplit = text.split('');

	for(var x=0; x<nodeTypeSplit.length; x++) {
		var nodeTypeChar = nodeTypeSplit[x];
		var br = "";
		
		if(x != nodeTypeSplit.length - 1) {
			br = "<br>";
		}
		
		verticalText += nodeTypeChar + br;
	}

	return verticalText;
}

/**
 * Add the count for the individual type
 */
function addCountForType(individualCountsObject, type, timestamp, count) {
	//get the array for the individual type
	var arrayForType = individualCountsObject[type];

	if(arrayForType == null) {
		//the array does not exist so we will make it
		arrayForType = [];
		individualCountsObject[type] = arrayForType;
	}

	//add the entry into the array
	arrayForType.push([timestamp, count]);
}

/**
 * Called when we are done parsing either the portal or vle statistics.
 * When both are done parsing, we will then parse the radio buttons and graphs.
 * @param context "portal" or "vle"
 */
function doneParsingStatistics(context) {
	if(context == "portal") {
		doneParsingPortalStatistics = true;
	} else if(context == "vle") {
		doneParsingVLEStatistics = true;
	}

	if(doneParsingPortalStatistics && doneParsingVLEStatistics) {
		//remove the 'Loading Statistics...' text
		$('#loadingStatisticsMessageDiv').html('');
		
		/*
		 * we are done parsing the portal and vle statistics so we will
		 * generate the radio buttons and graphs
		 */
		generateRadioButtonsDivs();
		generateGraphs();
	}
}

/**
 * Show a specific graph
 * @param graphId the id of the graph
 */
function showGraph(graphId) {
	//boolean values to determine what type of graph it is
	var lineGraph = false;
	var barGraph = false;
	
	//the array that we will use to plot the data
	var graphData = [];

	//the object that will hold the parameters for plotting the graph 
	var graphParams = {};

	var graphColor = "green";

	//set the graph title
	setGraphTitle(graphIdToTitles[graphId]);

	if(graphId == 'totalNumberStudentsOverTime') {
		graphData = {
				data:totalNumberStudentsArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberStudentLoginsOverTime') {
		graphData = {
				data:totalNumberStudentLoginsArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberTeachersOverTime') {
		graphData = {
				data:totalNumberTeachersArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberTeacherLoginsOverTime') {
		graphData = {
				data:totalNumberTeacherLoginsArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberProjectsOverTime') {
		graphData = {
				data:totalNumberProjectsArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberRunsOverTime') {
		graphData = {
				data:totalNumberRunsArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberTimesRunProjectClickedOverTime') {
		graphData = {
				data:totalNumberProjectsRunArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberStudentsPerMonth') {
		graphData = {
        	data:totalNumberStudentsMonthlyArray,
        	label:'Counts',
        	bars:{show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberStudentLoginsPerMonth') {
		graphData = {
        	data:totalNumberStudentLoginsMonthlyArray,
            bars:{show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberTeachersPerMonth') {
		graphData = {
        	data:totalNumberTeachersMonthlyArray,
        	bars:{show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberTeacherLoginsPerMonth') {
		graphData = {
        	data: totalNumberTeacherLoginsMonthlyArray,
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberProjectsPerMonth') {
		graphData = {
        	data: totalNumberProjectsMonthlyArray,
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberRunsPerMonth') {
		graphData = {
        	data: totalNumberRunsMonthlyArray,
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
       	};
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberTimesRunProjectClickedPerMonth') {
		graphData = {
	       	data: totalNumberProjectsRunMonthlyArray,
	       	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
	    };
		graphParams = {
			xaxis:{ticks:monthlyLabelArray},
			grid:{hoverable:true}
		};
		barGraph = true;
	}else if(graphId == 'totalNumberStepWorksOverTime') {
		graphData = {
				data:totalStepWorkCountArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberStepsOverTime') {
		graphData = {
				data:totalNodeCountArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberAnnotationsOverTime') {
		graphData = {
				data:totalAnnotationCountArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberHintViewsOverTime') {
		graphData = {
				data:totalHintViewCountArray,
				color:graphColor
			};
		graphParams = {
			xaxis:{mode:"time"},
			grid:{hoverable:true}
		};
		lineGraph = true;
	} else if(graphId == 'totalNumberStepTypesComparison') {
		graphData = {
        	data: nodeTypeCountsComparison,
        	label:'Counts',
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
       	};
		graphParams = {
			xaxis:{ticks:nodeTypeCountsComparisonTicks},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberStepWorkStepTypesComparison') {
		graphData = {
        	data: stepWorkNodeTypesCountsComparison,
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:stepWorkNodeTypesCountsComparisonTicks},
			grid:{hoverable:true}
		};
		barGraph = true;
	} else if(graphId == 'totalNumberAnnotationTypesComparison') {
		graphData = {
        	data: annotationCountsComparison,
        	bars: {show: true, align:'center', barWidth:0.3},
    		color:graphColor
        };
		graphParams = {
			xaxis:{ticks:annotationCountsComparisonTicks},
			grid:{hoverable:true}
		};
		barGraph = true;
	}

	//plot the graph
	$.plot($("#graphDiv"), [graphData], graphParams);

	//show the tooltip
    function showTooltip(x, y, contents) {
        $('<div id="tooltip">' + contents + '</div>').css( {
            position: 'absolute',
            display: 'none',
            top: y + 5,
            left: x + 5,
            border: '1px solid #fdd',
            padding: '2px',
            'background-color': '#fee',
            opacity: 0.80
        }).appendTo("body").fadeIn(200);
    }

    var previousPoint = null;

    //unbind any previous plothover bind events
    $("#graphDiv").unbind("plothover");

    //when the cursor hovers over a point on the graph, we will show the tooltip
    $("#graphDiv").bind("plothover", function (event, pos, item) {
        $("#x").text(pos.x.toFixed(2));
        $("#y").text(pos.y.toFixed(2));

        if (item) {
            //cursor is hovering over a data point so we will show the tooltip
            if (previousPoint != item.dataIndex) {
                previousPoint = item.dataIndex;
                
                $("#tooltip").remove();
                var x = item.datapoint[0].toFixed(2);
                var y = item.datapoint[1].toFixed(2);

				x = parseInt(x);
				y = parseInt(y);
				
                var text = "";
                
				if(lineGraph) {
					//we are on a line graph
					
					//get the date
					var date = new Date(x);
					var month = date.getMonth() + 1;
					var monthName = monthNames[month];
					var day = date.getDate();
					var year = date.getFullYear();

					/*
					 * display the date and the count value
					 * e.g.
					 * (Oct 25, 2011 = 1239)
					 */
					text = "(" + monthName + " " + day + ", " + year + " = " + y + ")";
				} else if(barGraph) {
					//we are on a bar graph
					
					//get the name of the data bar
					var barName = item.series.xaxis.ticks[x].label;

					//remove any <br> from the name
					barName = barName.replace(/<br>/g, "");

					/*
					 * display the bar name and the count value
					 * e.g.
					 * (OpenResponse = 12382)
					 */
					text = "(" + barName + " = " + y + ")";
				}
                
                showTooltip(item.pageX, item.pageY, text);
            }
        } else {
            //cursor is not hovering over a data point so we will not show the tooltip
            $("#tooltip").remove();
            previousPoint = null;            
        }
    });
}

/**
 * Set the graph title
 * @param graphTitle the title of the graph
 */
function setGraphTitle(graphTitle) {
	$('#graphTitleDiv').html(graphTitle);
}

/**
 * Generate the radio buttons
 */
function generateRadioButtonsDivs() {
	//text at the top
	var radioButtonsHtml = "<spring:message code="pages.statistics.totalNoOf"/><br><br>";

	//loop through all the graph ids
	for(var x=0; x<graphIds.length; x++) {
		//get a graph id
		var graphId = graphIds[x];

		//get a graph label
		var graphLabel = graphLabels[x];

		if(graphId == 'break') {
			//add a line break
			radioButtonsHtml += "<br>";
		} else {
			//add a radio button
			radioButtonsHtml += "<input id='" + graphId + "RadioButton' type='radio' name='selectGraphRadioButton' onclick='showGraph(\"" + graphId + "\")' />" + graphLabel + "<br>";			
		}
	}

	//insert the radio buttons html into the div
	$('#radioButtonsDiv').html(radioButtonsHtml);
}

/**
 * Generate the first graph
 */
function generateGraphs() {
	//generate the graph
	showGraph('totalNumberStudentsOverTime');

	//set the check box for the first graph to be checked
	$('#totalNumberStudentsOverTimeRadioButton').attr('checked', true);

	//get the radio button focus
	$('#totalNumberStudentsOverTimeRadioButton').focus();
}

$(document).ready(function() {
	//get the portal and vle statistics
	getPortalStatistics();
	getVLEStatistics();
});

</script>
</head>
<body>
	<div id="parentDiv" align="center">
		<div id="loadingStatisticsMessageDiv"><spring:message code="pages.statistics.loading"/></div>
		<table>
			<tr>
				<td><div id="graphTitleDiv" align="center"></div><div id="graphDiv" style="width:600px;height:500px;"></div></td>
				<td><div id="radioButtonsDiv"></div></td>
			</tr>
		</table>
	</div>
</body>
</html>
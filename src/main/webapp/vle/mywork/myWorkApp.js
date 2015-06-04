'use strict';  // Defines that JavaScript code should be executed in "strict mode" 
//see here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

var myWorkApp = angular.module('myWorkApp', []);

myWorkApp
.directive('myWork', function() {
	return {
		restrict: 'A',
		replace: false,  // don't replace the innerHTML of the renderWork element.
		scope:false,  // use parent's scope
		link: function(scope, elem, attrs) {

			var view = window.parent.view;  // currently assumes mywork is loaded in an iFrame
			document.eventManager = window.parent.eventManager;
			scope.name = view.getUserAndClassInfo().getWorkgroupId();

			scope.totalScoreForWorkgroup = 0;

			//do not retrieve annotations in preview
			if (view.config.getConfigParam("mode") != "preview") {
				//we are not in preview so we will obtain the annotations

				var workgroupId = view.getUserAndClassInfo().getWorkgroupId();

				//get all the ids for teacher and shared teachers
				var teacherIds = view.getUserAndClassInfo().getAllTeacherWorkgroupIds();

				//get the scores given to the student by the teachers
				var totalScoreAndTotalPossible = view.getAnnotations().getTotalScoreAndTotalPossibleByToWorkgroupAndFromWorkgroups(workgroupId, teacherIds, view.maxScores);

				//get the total score for the workgroup
				scope.totalScoreForWorkgroup = totalScoreAndTotalPossible.totalScore;

				//get the max total score for the steps that were graded for this workgroup
				var totalPossibleForWorkgroup = totalScoreAndTotalPossible.totalPossible;

				//get the max total score for this project
				var totalPossibleForProject = view.getMaxScoreForProject();
			}

			var vleState = view.getState();

			var numStepsCompleted = 0;

			//get all the node ids that the student can potentially visit
			var nodeIds = view.getStepNodeIdsStudentCanVisit(vleState);

			//loop through all the nodeIds
			for(var y=0; y<nodeIds.length; y++) {
				var nodeId = nodeIds[y];

				//get the latest work for the current workgroup 
				var latestNodeVisit = vleState.getLatestNodeVisitByNodeId(nodeId);
				var latestNodeVisitPostTime = null;

				//check if there was any work
				if (latestNodeVisit != null) {
					//student has completed this step so we will increment the counter
					numStepsCompleted++;
				}
			}

			//for the current team, calculate the percentage of the project they have completed
			scope.teamPercentProjectCompleted = Math.floor((numStepsCompleted / nodeIds.length) * 100) + "%";

			scope.score = view.getI18NString('score');
			scope.percent_project_completed = view.getI18NString('percent_project_completed');

			var showGrades = true; // always show annotations/grades if we're not in preview mode

			if (view.config.getConfigParam("mode") == "preview") {
				showGrades = false;
			}

			//create the div that will contain the score table as well as all the student work
			$('#showWorkContainer').append(view.getProject().getShowAllWorkHtml(view.getProject().getRootNode(), showGrades));

			var percentBarSize = 0; //the default bar size, we will use this for the thickness of the hr

			if(scope.teamPercentProjectCompleted != '0%') {
				percentBarSize = 3; //set the thickness to 3 if percent completed is > 0%
			}

			//display the percentage and jqueryui progressbar
			var completedVal = parseInt(scope.teamPercentProjectCompleted.replace('%',''));
			$("#teamProgress").progressbar({value: completedVal});

			// print mysystem...should happen after opening showallworkdialog
			$(".mysystem").each(function() {
				var json_str = $(this).html();
				$(this).html("");
				var divId = $(this).attr("id");
				var contentBaseUrl = $(this).attr("contentBaseUrl");
				try {
					new MySystemPrint(json_str,divId,contentBaseUrl);
				} catch (err) {
					// do nothing
				}
			});

			//get all the node ids in the project
			var nodeIds = view.getProject().getNodeIds();

			//loop through all the node ids
			for(var x=0; x<nodeIds.length; x++) {
				//get a node object
				var node = view.getProject().getNodeById(nodeIds[x]);

				//only perform this for steps that have a grading view
				if(node.hasGradingView()) {
					//get the node id
					var nodeId = node.id;

					//get the latest node visit that contains student work for this step
					var nodeVisit = view.getState().getLatestNodeVisitByNodeId(nodeId);

					//check if the student has any work for this step
					if(nodeVisit != null) {
						//get the div to display the work in
						var studentWorkDiv = $("#latestWork_" + nodeVisit.id);

						//render the work into the div to display it
						node.renderGradingView(studentWorkDiv, nodeVisit, "", workgroupId);

						// show button to add to portfolio
						if (view.getProjectMetadata().tools.isPortfolioEnabled && view.portfolio) {
							var addToPortfolio = $("<span>").addClass("addToPortfolio").html(view.getI18NString("portfolio_add_item"));
							addToPortfolio.click({"itemType":"stepWork",
								"nodeId":nodeId,
								"nodeVisitId":nodeVisit.id,
								"title":node.title,
								"view":view},
								view.portfolio.addItemEventHandler);
							var portfolioSpan = $("<span>").addClass('portfolioAction').html(addToPortfolio);
							$("[id='stepWork_"+nodeId+"'] .sectionHead").append(portfolioSpan);
						}

						if($("#new_latestWork_" + nodeVisit.id).length != 0) {
							/*
							 * render the work into the new feedback div if it exists. the
							 * new feedback div exists when the teacher has given a new
							 * score or comment and we need to show the work and feedback
							 * for that step at the the top of the show all work
							 */
							node.renderGradingView($("#new_latestWork_" + nodeVisit.id), nodeVisit, "", workgroupId);
						}
					}
				}
			}

		}}});

$(document).ready(function() {
	var view = window.parent.view;
	//check if there was any new feeback for the student and display a popup if so
	if(view.getProject().hasNewFeedback()) {
		alert(view.getI18NString('you_have_new_feedback_from_teacher') + '\n\n' + view.getI18NString('new_feedback_labeled_as_new'));
	}			
});
'use strict';  // Defines that JavaScript code should be executed in "strict mode" 
               // see here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

var surveyApp = angular.module('surveyApp',[]);

surveyApp.controller('surveyController',
		['$scope', '$http', function ($scope, $http) {
			$scope.survey = JSON.parse($("#surveyJSON").html());
			
			$scope.submitSurvey = function() {
				$scope.survey.save_time=new Date().getTime();
				
				$http({
				    method: 'POST',
				    url: 'survey.html',
				    data: $.param({
						 "command":"saveSurvey",
						 "runId":$("#runId").html(),
						 "survey":angular.toJson($scope.survey)
						 }),
				    headers: {'Content-Type': 'application/x-www-form-urlencoded'}
				  })
				  .success(function(data, status, headers, config) {
					  alert("Survey successfully saved. Thank you!");
					  window.close();
				  })
				  .error(function(data, status, headers, config) {
					  alert("Error saving survey. Please contact WISE staff. Sorry for the inconvenience!");
					  window.close();
				  });
			}
		}
]);
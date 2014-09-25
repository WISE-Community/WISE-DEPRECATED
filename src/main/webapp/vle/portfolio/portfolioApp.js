'use strict';  // Defines that JavaScript code should be executed in "strict mode" 
               // see here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

var portfolioApp = angular.module('portfolioApp', ['ngRoute', 'ui.sortable', "xeditable"]);

portfolioApp.config(['$routeProvider',
                    function($routeProvider) {
                      $routeProvider.
                        when('/toc', {
                          templateUrl: 'portfolio/portfolioTOC.html',
                          controller: 'portfolioTOCController'
                        }).
                        when('/item/:itemId', {
                          templateUrl: 'portfolio/portfolioItem.html',
                          controller: 'portfolioItemController'
                        }).
                        otherwise({
                        	redirectTo: '/toc'
                        });
                    }]);

portfolioApp.run(function(editableOptions) {
	  editableOptions.theme = 'default'; // Can be  'bs2' (bootstrap2), 'bs3' (bootstrap3), 'default'
});

portfolioApp.controller('portfolioMainController', 
		['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
	$scope.location = $location;
		}
]);


portfolioApp.controller('portfolioTOCController', 
		['$scope', function ($scope) {
	var view = window.parent.view;  // currently assumes this is loaded in an iFrame
	$scope.portfolio = view.portfolio;
	
	$scope.sortableOptions = {
		    stop: function(event, ui) { 
		    	$scope.portfolio.saveToServer();
		    }
		  };
	
	$scope.removeItem = function (item) {
		$scope.portfolio.items.splice($scope.portfolio.items.indexOf(item), 1);
		$scope.portfolio.deletedItems.push(item);
		$scope.portfolio.saveToServer();
	};
}]);

portfolioApp.controller('portfolioItemController', 
		['$scope', '$routeParams', '$location', function ($scope, $routeParams, $location) {
	$scope.location = $location;

	var view = window.parent.view;  // currently assumes this is loaded in an iFrame
	$scope.view = view;
	$scope.portfolio = view.portfolio;
	$scope.item = view.portfolio.getItemById($routeParams.itemId);
	
	$scope.removeItem = function (item) {
		$scope.portfolio.items.splice($scope.portfolio.items.indexOf(item), 1);
		$scope.portfolio.deletedItems.push(item);
		$scope.portfolio.saveToServer();
		$scope.location.path('/toc');
	};
	
	$scope.$watch('item.title', function (newValue, oldValue) {
		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
			$scope.portfolio.saveToServer();
		}
	}, true);
	
	$scope.$watch('item.studentAnnotation', function (newValue, oldValue) {
		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
			$scope.portfolio.saveToServer();
		}
	}, true);

}]);

portfolioApp
	.directive('renderWork', function() {
		return {
		    restrict: 'A',
		    replace: false,  // don't replace the innerHTML of the renderWork element.
		    scope:false,  // use parent's scope
		    link: function(scope, elem, attrs) {
		    	var portfolioItemType = scope.item.itemType;
	    		var studentWorkDiv = $("#studentWork");

		    	if (portfolioItemType == "stepWork") {
		    		var workgroupId = scope.view.getUserAndClassInfo().getWorkgroupId();
		    		var nodeId = scope.item.nodeId;
		    		var node = scope.view.getProject().getNodeById(nodeId);
		    		//get the node id
		    		var nodeVisitId = scope.item.nodeVisitId;

		    		//get the latest node visit that contains student work for this step
		    		var nodeVisit = scope.view.getState().getNodeVisitById(nodeVisitId);

		    		//set node visit in scope
		    		scope.nodeVisit = nodeVisit;
		    		
		    		if(nodeVisit != null) {
		    			//get the div to display the work in

		    			//render the work into the div to display it
		    			node.renderGradingView(studentWorkDiv, nodeVisit, "", workgroupId);

		    			if($("#new_latestWork").length != 0) {
		    				/*
		    				 * render the work into the new feedback div if it exists. the
		    				 * new feedback div exists when the teacher has given a new
		    				 * score or comment and we need to show the work and feedback
		    				 * for that step at the the top of the show all work
		    				 */
		    				node.renderGradingView($("#new_latestWork"), nodeVisit, "", workgroupId);
		    			}
		    		}		
		    	} else if (portfolioItemType == "studentUploadedAsset") {
		    		studentWorkDiv.html("<img src='"+scope.item.studentUploadedAssetURL+"' />");
		    	}
		    }
		  };
});

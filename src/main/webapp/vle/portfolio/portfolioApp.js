'use strict'; // Defines that JavaScript code should be executed in "strict
// mode"
//see here:
//https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Strict_mode

var portfolioApp = angular.module('portfolioApp', [ 'ngAnimate', 'ngSanitize', 'ui.sortable', 'xeditable', 'ui.bootstrap', 'ui.router' ]);

/*
 * portfolioApp.config(['$routeProvider', function($routeProvider) {
 * $routeProvider.when('/', { templateUrl : 'contents.tpl.html', controller :
 * 'portfolioController' }).when('/item/:itemId', { templateUrl :
 * 'contents.tpl.html', controller : 'portfolioController' }).otherwise({
 * redirectTo : '/' }); }])
 */

portfolioApp.config(function($stateProvider, $urlRouterProvider){
	$urlRouterProvider.otherwise('/');
	var modalInstance = null;
	localStorage.portfolioMode = '';
	
	$stateProvider
		.state('contents', {
			url: '/',
			templateUrl: 'contents.tpl.html',
			controller: 'portfolioController'
		})
		.state('contents.item', {
			url: '/item/:itemId',
			onEnter: function($modal, $state, $stateParams) {
                modalInstance = $modal.open({
                	templateUrl: 'item.tpl.html',
                	controller: 'portfolioItemController',
                	windowClass: function() {
                		var className = 'portfolio-details';
                		if(localStorage.portfolioMode === 'nextSlide'){
                			className += ' ' + 'from-right';
                		} else if(localStorage.portfolioMode === 'previousSlide') {
                			className += ' ' + 'from-left';
                		}
                		return className;
                	},
                	resolve: {
            			itemId: function() {
            	            return $stateParams.itemId;
            	        }
            		}
                });
                modalInstance.result.then(function() {
                }, function() {
                	modalInstance = null;
                	$('.modal.portfolio-details').removeClass('from-right').removeClass('from-left');
                    //if ($state.$current.name === stateName) {
                        $state.go('contents');
                    //}
                });
            }//,
            //onExit: function() {
                //if (modalInstance) {
                    //modalInstance.close();
                //}
            //}
		});
})

.run(function(editableOptions, $rootScope) {
	editableOptions.theme = 'bs3'; // Can be 'bs2' (bootstrap2), 'bs3' (bootstrap3), 'default'
	
	$rootScope.$on('$stateChangeSuccess', function (ev, to, toParams, from, fromParams) {
	   if(to.name === 'contents'){
		   localStorage.portfolioMode = '';
	   }
	});
})

.controller('portfolioController', ['$scope', function($scope) {
	$scope.view = window.parent.view; // currently assumes portfolio is loaded in an iFrame
	$scope.portfolio = $scope.view.portfolio;
	
	$scope.sortableOptions = {
		stop : function(event, ui) {
			event.preventDefault();
		},
		helper: 'clone'
	};

	$scope.removeItem = function(item) {
		$scope.portfolio.items.splice($scope.portfolio.items.indexOf(item), 1);
		$scope.portfolio.deletedItems.push(item);
		$scope.portfolio.saveToServer();
	};
}])

.controller('portfolioItemController', ['$scope', '$rootScope', '$state', 'itemId', '$modalInstance', function($scope, $rootScope, $state, itemId, $modalInstance) {
	$scope.view = window.parent.view; // currently assumes portfolio is loaded in an iFrame
	$scope.portfolio = $scope.view.portfolio;
	$scope.itemId = itemId;
	$scope.item = $scope.view.portfolio.getItemById(itemId);
	$scope.itemSource = false;
	if($scope.item.nodeId){
		$scope.itemSource = $scope.view.getStepTerm() + ' ' + $scope.view.getProject().getStepNumberAndTitle($scope.item.nodeId);
	}
	$scope.itemIndex = $scope.portfolio.items.indexOf($scope.item);
	var previousItem = $scope.portfolio.items[$scope.itemIndex - 1],
		nextItem = $scope.portfolio.items[$scope.itemIndex + 1];

	$scope.removeItem = function(item) {
		$scope.portfolio.items.splice($scope.portfolio.items.indexOf(item), 1);
		$scope.portfolio.deletedItems.push(item);
		$scope.portfolio.saveToServer();
		$scope.close();
	};
	
	$scope.previous = function() {
		$('.modal.portfolio-details').addClass('from-right').removeClass('from-left');
		localStorage.portfolioMode = 'previousSlide';
		$modalInstance.result.finally(function() {
			setTimeout(function(){ // TODO: figure out why this timeout kludge is necessary and remove
				$state.transitionTo('contents.item', {itemId: previousItem.id});
			}, 400)
        });
		$modalInstance.close(true);
	};
	
	$scope.next = function() {
		$('.modal.portfolio-details').addClass('from-left').removeClass('from-right');
		localStorage.portfolioMode = 'nextSlide';
		$modalInstance.result.finally(function() {
			setTimeout(function(){ // TODO: figure out why this timeout kludge is necessary and remove
				$state.transitionTo('contents.item', {itemId: nextItem.id});
			}, 400)
        });
		$modalInstance.close(true);
	};
	
	$scope.close = function(){
		$('.modal.portfolio-details').removeClass('from-right').removeClass('from-left');
		$modalInstance.dismiss();
	};

	$scope.$watch('item.title', function(newValue,oldValue) {
		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
			$scope.portfolio.saveToServer();
		}
	}, true);

	$scope.$watch('item.studentAnnotation', function(newValue, oldValue) {
		if (newValue !== oldValue) { // This prevents unneeded calls to the local storage
			$scope.portfolio.saveToServer();
		}
	}, true);
}])

.directive('renderWork', function() {
	return {
		restrict : 'A',
		replace: false, // don't replace the innerHTML of the renderWork element.
		scope : false, // use parent's scope
		link : function(scope, elem, attrs) {
			var portfolioItemType = scope.item.itemType;
			var studentWorkDiv = $("#studentWork");

			if (portfolioItemType === "stepWork") {
				var workgroupId = scope.view.getUserAndClassInfo().getWorkgroupId();
				var nodeId = scope.item.nodeId;
				var node = scope.view.getProject().getNodeById(nodeId);
				// get the node id
				var nodeVisitId = scope.item.nodeVisitId;

				// get the latest node visit that contains student work for this step
				var nodeVisit = scope.view.getState().getNodeVisitById(nodeVisitId);

				// set node visit in scope
				scope.nodeVisit = nodeVisit;

				if (nodeVisit != null) {
					// get the div to display the work in

					// render the work into the div to display it
					node.renderGradingView(studentWorkDiv, nodeVisit, "", workgroupId);

					if ($("#new_latestWork").length) {
						/*
						 * render the work into the new feedback div if it
						 * exists. the new feedback div exists when the teacher
						 * has given a new score or comment and we need to show
						 * the work and feedback for that step at the the top of
						 * the show all work
						 */
						node.renderGradingView($("#new_latestWork"), nodeVisit, "", workgroupId);
					}
				}
			} else if (portfolioItemType === "studentUploadedAsset") {
				studentWorkDiv.html("<img class='no-step' src='" + scope.item.studentUploadedAssetURL+ "' />");
			}
		}
	};
});

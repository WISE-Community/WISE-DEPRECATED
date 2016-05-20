(function () {
	var tbioDirective = ['$log', function ($log) {
		//$log.log('Loading Textbox.io Directive');
		var link = function (scope, element, attrs, controllers) {
			var idOfElement = '[' + element.prop('id') + '] ';
			//$log.log('In TBIO directive for ID ' + idOfElement);
			var tbioCtrl = controllers[0];
			var ngModelCtrl = controllers[1];
			if (ngModelCtrl) {
				tbioCtrl.init(element, attrs, ngModelCtrl);
			}

			// When the DOM element is removed from the page AngularJS will trigger the $destroy event on
			// the scope. This gives us a chance to cancel the $interval.
			element.on("$destroy", function () {
				//console.log('elemend destroyed!');
				//$interval.cancel(interval);
			}); //$on end
		};
		return {
			restrict: 'A',
			priority: 100,
			require: ['tbio', 'ngModel'],
			controller: tbioController,
			scope: {
				configuration: '=' //tbioConfiguration JavaScript object
			},
			link: link
		};
	}];

	var tbioRequiredDirective = ['$log', function ($log) {
		//$log.log('Loading Textbox.io Required Directive');
		var link = function (scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) return;
			attrs.required = true; // force truthy in case we are on non input element
			attrs.$observe('tbioRequired', function () {
				ngModelCtrl.$validate();
			});
			ngModelCtrl.$validators.tbioRequired = function (modelValue, viewValue) {
				var jStrippedString = jQuery(modelValue).text().trim();
				//$log.log('REQUIRED: ' + (!attrs.required || !ngModelCtrl.$isEmpty(jStrippedString)));
				return !attrs.required || !ngModelCtrl.$isEmpty(jStrippedString);
			};
		};
		return {
			restrict: 'A',
			require: '?ngModel',
			link: link
		};
	}];

	var tbioMinLengthDirective = ['$log', function ($log) {
		//$log.log('Loading Textbox.io Min Length Directive');
		var link = function (scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) return;
			var minlength = 0;
			attrs.$observe('tbioMinlength', function (value) {
				minlength = parseInt(value) || 0;
				ngModelCtrl.$validate();
			});
			ngModelCtrl.$validators.tbioMinlength = function (modelValue, viewValue) {
				var jStrippedString = jQuery(modelValue).text().trim();
				//$log.log('Min Length? ' + (ngModelCtrl.$isEmpty(jStrippedString) || jStrippedString.length >= minlength));
				return ngModelCtrl.$isEmpty(jStrippedString) || jStrippedString.length >= minlength;
			};
		};
		return {
			restrict: 'A',
			require: 'ngModel',
			link: link
		};
	}];

	var tbioMaxLengthDirective = ['$log', function ($log) {
		//$log.log('Loading Textbox.io Max Length Directive');
		var link = function (scope, element, attrs, ngModelCtrl) {
			if (!ngModelCtrl) return;
			var maxlength = -1;
			attrs.$observe('tbioMaxlength', function (value) {
				maxlength = isNaN(parseInt(value)) ? -1 : parseInt(value);
				ngModelCtrl.$validate();
			});
			ngModelCtrl.$validators.tbioMaxlength = function (modelValue, viewValue) {
				var jStrippedString = jQuery(modelValue).text().trim();
				//$log.log('Max Length? ' + ((maxlength < 0) || ngModelCtrl.$isEmpty(jStrippedString) || (jStrippedString.length <= maxlength)));
				return (maxlength < 0) || ngModelCtrl.$isEmpty(jStrippedString) || (jStrippedString.length <= maxlength);
			};
		};
		return {
			restrict: 'A',
			require: 'ngModel',
			link: link
		};
	}];

	var tbioController = ['$scope', '$interval', '$log', 'tbioConfigFactory', 'tbioValidationsFactory',
						  function ($scope, $interval, $log, tbioConfigFactory, tbioValidationsFactory) {
			//$log.log('Loading Textbox.io Controller');
			this.init = function (element, attrs, ngModelController) {
				var idOfElement = '[' + element.prop('id') + '] ';
				//$log.log('In this.init for ' + idOfElement);
				var theEditor;
				var config = attrs['configuration'];

				$scope.$on("notebookItemChosen", angular.bind(this, function (event, args) {
					// When the student chooses a notebook item, insert it into the current cursor position
					textboxio.getActiveEditor().content.insertHtmlAtCursor(args.notebookItemHTML);
				})); //$on end


				//Populate the editor once the modelValue exists
				//would reload the editor if the model is changed in the background.
				ngModelController.$render = function () {

					if (!theEditor) { //only load the editor the first time

						if (tbioConfigFactory.hasOwnProperty(config)) {
							theEditor = textboxio.replace(element[0], tbioConfigFactory[config]);
						} else {
							theEditor = textboxio.replace(element[0]);
						}

					}
					if (ngModelController.$modelValue) {
						theEditor.content.set(ngModelController.$modelValue);
						ngModelController.$setPristine()
					}

					theEditor.events.dirty.addListener(function() {
						//$log.log('Content Changed to '+ theEditor.content.get());
						ngModelController.$setViewValue(theEditor.content.get());
						theEditor.content.setDirty(false);
					});
				}; //$render end

				// In lieu of events I just update the model every X seconds.
				// Once the editor has event(s) this gets replaced by event code.
				/*
				var interval = $interval(function () {
					//Workaround to keep $pristine accurate until you type into the editor
					//if (ngModelController.$viewValue && (ngModelController.$viewValue != theEditor.content.get())) {
					if (ngModelController.$viewValue && ngModelController.dirty) {
						$log.log('Content Changed to '+ theEditor.content.get());
						ngModelController.$setViewValue(theEditor.content.get());
						return;
					}
					//Check for the default "empty" string and don't put anything in the view when "empty" is there
					//to start with.  The prior if will catch having editor content that is completely deleted to revert
					//to "empty".
					if (!('<p><br /></p>' == theEditor.content.get())) {
						ngModelController.$setViewValue(theEditor.content.get());
					}
				}, 500); // interval end
				*/

				// When the DOM element is removed from the page AngularJS will trigger the $destroy event on
				// the scope. This gives us a chance to cancel the $interval.
				$scope.$on("$destroy", function (event) {
					//$interval.cancel(interval);
				}); //$on end

				//Allow developer to inject custom validation functions via tbioValidationsFactory
				for (var i = 0; i < tbioValidationsFactory.length; i++) {
					var validationFn = tbioValidationsFactory[i];
					//$log.log('Adding custom validation: ' + validationFn);
					ngModelController.$validators[validationFn] = tbioValidationsFactory[validationFn];
				}
			}; //init end
	}];

	//Create the actual Controller and Directive
	angular.module('ephox.textboxio', [])
		.directive('tbio', tbioDirective)
		.directive('tbioMinlength', tbioMinLengthDirective)
		.directive('tbioMaxlength', tbioMaxLengthDirective)
		.directive('tbioRequired', tbioRequiredDirective);
}());

'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _annotationController = require('./annotation/annotationController');

var _annotationController2 = _interopRequireDefault(_annotationController);

var _componentAnnotationsController = require('./componentAnnotations/componentAnnotationsController');

var _componentAnnotationsController2 = _interopRequireDefault(_componentAnnotationsController);

var _possibleScoreController = require('./possibleScore/possibleScoreController');

var _possibleScoreController2 = _interopRequireDefault(_possibleScoreController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentDirective = function () {
    function ComponentDirective($injector, $compile, NodeService, ProjectService, StudentDataService) {
        _classCallCheck(this, ComponentDirective);

        this.restrict = 'E';
        this.$injector = $injector;
        this.$compile = $compile;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
    }

    _createClass(ComponentDirective, [{
        key: 'link',
        value: function link($scope, element, attrs) {
            var nodeId = attrs.nodeid;
            var componentId = attrs.componentid;
            var componentState = attrs.componentstate;
            var workgroupId = null;
            var teacherWorkgroupId = null;
            var originalNodeId = attrs.originalnodeid;
            var originalComponentId = attrs.originalcomponentid;

            $scope.mode = "student";
            if (attrs.mode) {
                $scope.mode = attrs.mode;
            }

            if (attrs.workgroupid != null) {
                try {
                    workgroupId = parseInt(attrs.workgroupid);
                } catch (e) {}
            }

            if (attrs.teacherworkgroupid) {
                try {
                    teacherWorkgroupId = parseInt(attrs.teacherworkgroupid);
                } catch (e) {}
            }

            if (componentState == null || componentState === '') {
                componentState = ComponentDirective.instance.StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
            } else {
                componentState = angular.fromJson(componentState);
                nodeId = componentState.nodeId;
                componentId = componentState.componentId;
            }

            var authoringComponentContent = ComponentDirective.instance.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
            var componentContent = ComponentDirective.instance.ProjectService.injectAssetPaths(authoringComponentContent);

            $scope.componentContent = componentContent;
            $scope.authoringComponentContent = authoringComponentContent;
            $scope.componentState = componentState;
            $scope.componentTemplatePath = ComponentDirective.instance.NodeService.getComponentTemplatePath(componentContent.type);
            $scope.nodeId = nodeId;
            $scope.workgroupId = workgroupId;
            $scope.teacherWorkgroupId = teacherWorkgroupId;
            $scope.type = componentContent.type;

            if (originalNodeId != null && originalComponentId != null) {
                /*
                 * set the original node id and component id. this is used
                 * when we are showing previous work from another component.
                 */
                $scope.originalNodeId = originalNodeId;
                $scope.originalComponentId = originalComponentId;

                // get the original component
                var originalComponentContent = ComponentDirective.instance.ProjectService.getComponentByNodeIdAndComponentId(originalNodeId, originalComponentId);
                $scope.originalComponentContent = originalComponentContent;
            }

            var componentHTML = '<div id="{{component.id}}" class="component-wrapper">' + '<div ng-include="componentTemplatePath" class="component component--{{type}}"></div></div>';

            if (componentHTML != null) {
                element.html(componentHTML);
                ComponentDirective.instance.$compile(element.contents())($scope);
            }
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory($injector, $compile, NodeService, ProjectService, StudentDataService) {
            ComponentDirective.instance = new ComponentDirective($injector, $compile, NodeService, ProjectService, StudentDataService);
            return ComponentDirective.instance;
        }
    }]);

    return ComponentDirective;
}();

var ClassResponseDirective = function () {
    function ClassResponseDirective(StudentStatusService) {
        _classCallCheck(this, ClassResponseDirective);

        this.restrict = 'E';
        this.scope = {
            response: '=',
            submitbuttonclicked: '&',
            studentdatachanged: '&'
        };
        this.templateUrl = 'wise5/components/discussion/classResponse.html';
        this.StudentStatusService = StudentStatusService;
    }

    _createClass(ClassResponseDirective, [{
        key: 'link',
        value: function link($scope, $element, attrs) {
            $scope.element = $element[0];

            $scope.getAvatarColorForWorkgroupId = function (workgroupId) {
                return ClassResponseDirective.instance.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
            };

            // handle the submit button click
            $scope.submitButtonClicked = function (response) {
                $scope.submitbuttonclicked({ r: response });
            };

            $scope.expanded = false;

            $scope.$watch(function () {
                return $scope.response.replies.length;
            }, function (oldValue, newValue) {
                if (newValue !== oldValue) {
                    $scope.toggleExpanded(true);
                }
            });

            $scope.toggleExpanded = function (open) {
                if (open) {
                    $scope.expanded = true;
                } else {
                    $scope.expanded = !$scope.expanded;
                }

                if ($scope.expanded) {
                    var $clist = $($scope.element).find('.discussion-comments__list');
                    setTimeout(function () {
                        $clist.animate({ scrollTop: $clist.height() }, 250);
                    }, 250);
                }
            };
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory(StudentStatusService) {
            ClassResponseDirective.instance = new ClassResponseDirective(StudentStatusService);
            return ClassResponseDirective.instance;
        }
    }]);

    return ClassResponseDirective;
}();

var CompileDirective = function () {
    function CompileDirective($compile) {
        _classCallCheck(this, CompileDirective);

        this.$compile = $compile;
    }

    _createClass(CompileDirective, [{
        key: 'link',
        value: function link(scope, ele, attrs) {
            scope.$watch(function (scope) {
                return scope.$eval(attrs.compile);
            }, function (value) {
                ele.html(value);
                CompileDirective.instance.$compile(ele.contents())(scope);
            });
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory($compile) {
            CompileDirective.instance = new CompileDirective($compile);
            return CompileDirective.instance;
        }
    }]);

    return CompileDirective;
}();

/**
 * A directive that asks the user if they are sure they want to change a
 * number input value to a lower value. We will not ask the user if they
 * change the number to a higher value. This directive is intended to
 * be used in cases when changing to a lower value will have a destructive
 * effect such as setting the number of rows in the authoring view of the
 * table component.
 */


var ConfirmNumberDecrease = function () {
    function ConfirmNumberDecrease() {
        _classCallCheck(this, ConfirmNumberDecrease);

        this.priority = -1;
        this.restrict = 'A';
        this.require = 'ngModel';
    }

    _createClass(ConfirmNumberDecrease, [{
        key: 'link',
        value: function link($scope, element, attrs, modelCtrl) {

            // get the message
            var message = attrs.confirmNumberDecrease;

            modelCtrl.$parsers.push(function (newValue) {

                // get the old value
                var oldValue = modelCtrl.$modelValue;

                // check if the new value is less than the old value
                if (newValue < oldValue) {
                    /*
                     * the new value is less than the old value so we will ask them to confirm
                     * the change since it may be destructive
                     */
                    var answer = confirm(message);

                    if (answer) {
                        // the user wants to change the value
                        return newValue;
                    } else {
                        // the user does not want to change the value so we will roll it back
                        modelCtrl.$setViewValue(oldValue);
                        modelCtrl.$render();
                        return oldValue;
                    }
                } else {
                    /*
                     * the new value is equal or greater than the old value so we do
                     * not need the user to confirm the change
                     */
                    return newValue;
                }
            });
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory() {
            ConfirmNumberDecrease.instance = new ConfirmNumberDecrease();
            return ConfirmNumberDecrease.instance;
        }
    }]);

    return ConfirmNumberDecrease;
}();

/**
 * Disable the backspace key so that it does not navigate the user back
 * in their browser history.
 */


var DisableDeleteKeypress = function () {
    function DisableDeleteKeypress($document) {
        _classCallCheck(this, DisableDeleteKeypress);

        this.restrict = 'A';
        this.$document = $document;
    }

    _createClass(DisableDeleteKeypress, [{
        key: 'link',
        value: function link($document) {
            DisableDeleteKeypress.instance.$document.bind('keydown', function (e) {

                // check for the delete key press
                if (e.keyCode === 8) {
                    // the delete key was pressed

                    // get the name of the node e.g. body, input, div, etc.
                    var nodeName = e.target.nodeName;

                    // get the type if applicable e.g. text, password, file, etc.
                    var targetType = e.target.type;

                    if (nodeName != null) {
                        nodeName = nodeName.toLowerCase();
                    }

                    if (targetType != null) {
                        targetType = targetType.toLowerCase();
                    }

                    if (nodeName === 'input' && targetType === 'text' || nodeName === 'input' && targetType === 'password' || nodeName === 'input' && targetType === 'file' || nodeName === 'input' && targetType === 'search' || nodeName === 'input' && targetType === 'email' || nodeName === 'input' && targetType === 'number' || nodeName === 'input' && targetType === 'date' || nodeName === 'textarea') {
                        /*
                         * the user is typing in a valid input element so we will
                         * allow the delete key press
                         */
                    } else {
                            /*
                             * the user is not typing in an input element so we will
                             * not allow the delete key press
                             */
                            e.preventDefault();
                        }
                }
            });
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory($document) {
            DisableDeleteKeypress.instance = new DisableDeleteKeypress($document);
            return DisableDeleteKeypress.instance;
        }
    }]);

    return DisableDeleteKeypress;
}();

/**
 * Listen for the backspace key press so we can perform special processing
 * specific for components such as deleting a point in a graph component.
 */


var ListenForDeleteKeypress = function () {
    function ListenForDeleteKeypress($document) {
        _classCallCheck(this, ListenForDeleteKeypress);

        this.restrict = 'A';
        this.$document = $document;
    }

    _createClass(ListenForDeleteKeypress, [{
        key: 'link',
        value: function link($scope) {
            ListenForDeleteKeypress.instance.$document.bind('keydown', function (e) {

                // check for the delete key press
                if (e.keyCode === 8) {
                    // the delete key was pressed

                    // fire the deleteKeyPressed event
                    $scope.$broadcast('deleteKeyPressed');
                }
            });
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory($document) {
            ListenForDeleteKeypress.instance = new ListenForDeleteKeypress($document);
            return ListenForDeleteKeypress.instance;
        }
    }]);

    return ListenForDeleteKeypress;
}();

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */


var wiselink = function () {
    function wiselink($document, StudentDataService) {
        _classCallCheck(this, wiselink);

        this.restrict = 'E';
        this.$document = $document;
        this.StudentDataService = StudentDataService;
    }

    _createClass(wiselink, [{
        key: 'link',
        value: function link($scope, element, attrs) {

            // the node id to navigate the student to
            var nodeId = attrs.nodeid;

            // the text to display in the link or button
            var linkText = attrs.linktext;

            // the type is optional and defaults to link
            var type = attrs.type;

            if (nodeId != null) {
                if (type == 'button') {
                    // we will make a button
                    element.html('<button>' + linkText + '</button>');
                } else {
                    // we will make a link
                    element.html('<a>' + linkText + '</a>');
                }

                element.bind('click', function () {
                    /*
                     * when the link or button is clicked, navigate the student to
                     * the appropriate step or activity
                     */
                    wiselink.instance.StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
                });
            }
        }
    }], [{
        key: 'directiveFactory',
        value: function directiveFactory($document, StudentDataService) {
            wiselink.instance = new wiselink($document, StudentDataService);
            return wiselink.instance;
        }
    }]);

    return wiselink;
}();

var Annotation = {
    bindings: {
        annotation: '<',
        type: '@',
        mode: '<',
        nodeId: '<',
        componentId: '<',
        fromWorkgroupId: '<',
        toWorkgroupId: '<',
        componentStateId: '<',
        active: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/annotation/annotation.html',
    controller: 'AnnotationController as annotationController'
};

var ComponentAnnotations = {
    bindings: {
        scoreAnnotation: '<',
        commentAnnotation: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/componentAnnotations/componentAnnotations.html',
    controller: 'ComponentAnnotationsController as componentAnnotationsCtrl'
};

var PossibleScore = {
    bindings: {
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/possibleScore/possibleScore.html',
    controller: 'PossibleScoreController as possibleScoreCtrl'
};

var Directives = angular.module('directives', []);

ClassResponseDirective.directiveFactory.$inject = ['StudentStatusService'];
CompileDirective.directiveFactory.$inject = ['$compile'];
ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'NodeService', 'ProjectService', 'StudentDataService'];
ConfirmNumberDecrease.directiveFactory.$inject = [];
DisableDeleteKeypress.directiveFactory.$inject = ['$document'];
ListenForDeleteKeypress.directiveFactory.$inject = ['$document'];
wiselink.directiveFactory.$inject = ['$document', 'StudentDataService'];

Directives.controller('AnnotationController', _annotationController2.default);
Directives.component('annotation', Annotation);
Directives.controller('ComponentAnnotationsController', _componentAnnotationsController2.default);
Directives.component('componentAnnotations', ComponentAnnotations);
Directives.controller('PossibleScoreController', _possibleScoreController2.default);
Directives.component('possibleScore', PossibleScore);
Directives.directive('classResponse', ClassResponseDirective.directiveFactory);
Directives.directive('compile', CompileDirective.directiveFactory);
Directives.directive('component', ComponentDirective.directiveFactory);
Directives.directive('confirmNumberDecrease', ConfirmNumberDecrease.directiveFactory);
Directives.directive('disableDeleteKeypress', DisableDeleteKeypress.directiveFactory);
Directives.directive('listenForDeleteKeypress', ListenForDeleteKeypress.directiveFactory);
Directives.directive('wiselink', wiselink.directiveFactory);

exports.default = Directives;
//# sourceMappingURL=directives.js.map
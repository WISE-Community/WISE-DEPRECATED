'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

Object.defineProperty(exports, "__esModule", {
    value: true
});

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
            }

            var component = ComponentDirective.instance.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

            $scope.component = component;
            $scope.componentState = componentState;
            $scope.componentTemplatePath = ComponentDirective.instance.NodeService.getComponentTemplatePath(component.type);
            $scope.nodeId = nodeId;
            $scope.workgroupId = workgroupId;
            $scope.teacherWorkgroupId = teacherWorkgroupId;

            var componentHTML = "<div id=\"{{component.id}}\" class=\"component-content\" >" + "<div ng-include=\"componentTemplatePath\" style=\"overflow-x: auto;\"></div></div>";

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
    function ClassResponseDirective() {
        _classCallCheck(this, ClassResponseDirective);

        this.restrict = 'E';
        this.scope = {
            response: '=',
            submitbuttonclicked: '&',
            studentdatachanged: '&'
        };
        this.templateUrl = 'wise5/components/discussion/classResponse.html';
    }

    _createClass(ClassResponseDirective, [{
        key: 'link',
        value: function link($scope, $element, StudentStatusService) {
            $scope.element = $element[0];

            $scope.getAvatarColorForWorkgroupId = function (workgroupId) {
                return StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
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
        value: function directiveFactory() {
            ClassResponseDirective.instance = new ClassResponseDirective();
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

var navItemDirective = function () {
    function navItemDirective() {
        _classCallCheck(this, navItemDirective);

        this.scope = {
            nodeId: '=',
            showPosition: '=',
            type: '='
        };
        this.template = '<ng-include src="navitemCtrl.getTemplateUrl()"></ng-include>';
        this.controller = 'NavItemController';
        this.controllerAs = 'navitemCtrl';
        this.bindToController = true;
    }

    _createClass(navItemDirective, null, [{
        key: 'directiveFactory',
        value: function directiveFactory() {
            navItemDirective.instance = new navItemDirective();
            return navItemDirective.instance;
        }
    }]);

    return navItemDirective;
}();

var stepToolsDirective = function () {
    function stepToolsDirective() {
        _classCallCheck(this, stepToolsDirective);

        this.scope = {
            nodeId: '=',
            showPosition: '='
        };
        this.template = '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>';
        this.controller = 'StepToolsCtrl';
        this.controllerAs = 'stepToolsCtrl';
        this.bindToController = true;
    }

    _createClass(stepToolsDirective, null, [{
        key: 'directiveFactory',
        value: function directiveFactory() {
            stepToolsDirective.instance = new stepToolsDirective();
            return stepToolsDirective.instance;
        }
    }]);

    return stepToolsDirective;
}();

var nodeStatusIconDirective = function () {
    function nodeStatusIconDirective() {
        _classCallCheck(this, nodeStatusIconDirective);

        this.scope = {
            nodeId: '=',
            customClass: '='
        };
        this.template = '<ng-include src="nodeStatusIconCtrl.getTemplateUrl()"></ng-include>';
        this.controller = 'NodeStatusIconCtrl';
        this.controllerAs = 'nodeStatusIconCtrl';
        this.bindToController = true;
    }

    _createClass(nodeStatusIconDirective, null, [{
        key: 'directiveFactory',
        value: function directiveFactory() {
            nodeStatusIconDirective.instance = new nodeStatusIconDirective();
            return nodeStatusIconDirective.instance;
        }
    }]);

    return nodeStatusIconDirective;
}();

var Directives = angular.module('directives', []);

ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'NodeService', 'ProjectService', 'StudentDataService'];
ClassResponseDirective.directiveFactory.$inject = [];
CompileDirective.directiveFactory.$inject = ['$compile'];

Directives.directive('component', ComponentDirective.directiveFactory);
Directives.directive('classResponse', ClassResponseDirective.directiveFactory);
Directives.directive('compile', CompileDirective.directiveFactory);

navItemDirective.directiveFactory.$inject = [];
stepToolsDirective.directiveFactory.$inject = [];
nodeStatusIconDirective.directiveFactory.$inject = [];

Directives.directive('navItem', navItemDirective.directiveFactory);
Directives.directive('stepTools', stepToolsDirective.directiveFactory);
Directives.directive('nodeStatusIcon', nodeStatusIconDirective.directiveFactory);

exports.default = Directives;
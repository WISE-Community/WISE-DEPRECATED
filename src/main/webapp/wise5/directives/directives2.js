class ComponentDirective {
    constructor($injector, $compile, NodeService, ProjectService, StudentDataService) {
        this.restrict = 'E';
        this.$injector = $injector;
        this.$compile = $compile;
        this.NodeService = NodeService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
    }

    static directiveFactory($injector, $compile, NodeService, ProjectService, StudentDataService) {
        ComponentDirective.instance = new ComponentDirective($injector, $compile, NodeService, ProjectService, StudentDataService);
        return ComponentDirective.instance;
    }

    link($scope, element, attrs) {
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
            } catch(e) {

            }
        }

        if (attrs.teacherworkgroupid) {
            try {
                teacherWorkgroupId = parseInt(attrs.teacherworkgroupid);
            } catch(e) {

            }
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

        var componentHTML = "<div id=\"{{component.id}}\" class=\"component-content\" >" +
            "<div ng-include=\"componentTemplatePath\" style=\"overflow-x: auto;\"></div></div>";

        if (componentHTML != null) {
            element.html(componentHTML);
            ComponentDirective.instance.$compile(element.contents())($scope);
        }
    }
}

class ClassResponseDirective {
    constructor(StudentStatusService) {
        this.restrict = 'E';
        this.scope = {
            response: '=',
            submitbuttonclicked: '&',
            studentdatachanged: '&'
        };
        this.templateUrl = 'wise5/components/discussion/classResponse.html';
        this.StudentStatusService = StudentStatusService;
    }

    static directiveFactory(StudentStatusService) {
        ClassResponseDirective.instance = new ClassResponseDirective(StudentStatusService);
        return ClassResponseDirective.instance;
    }

    link($scope, $element, attrs) {
        $scope.element = $element[0];

        $scope.getAvatarColorForWorkgroupId = function (workgroupId) {
            return ClassResponseDirective.instance.StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
        };

        // handle the submit button click
        $scope.submitButtonClicked = function(response) {
            $scope.submitbuttonclicked({r: response});
        };

        $scope.expanded = false;

        $scope.$watch(
            function () { return $scope.response.replies.length; },
            function (oldValue, newValue) {
                if (newValue !== oldValue) {
                    $scope.toggleExpanded(true);
                }
            }
        );

        $scope.toggleExpanded = function (open) {
            if (open) {
                $scope.expanded = true;
            } else {
                $scope.expanded = !$scope.expanded;
            }

            if ($scope.expanded) {
                var $clist = $($scope.element).find('.discussion-comments__list');
                setTimeout(function () {
                    $clist.animate({scrollTop: $clist.height()}, 250);
                }, 250);
            }
        };
    };
}

class CompileDirective {
    constructor($compile) {

        this.$compile = $compile;
    }

    static directiveFactory($compile) {
        CompileDirective.instance = new CompileDirective($compile);
        return CompileDirective.instance;
    }

    link(scope, ele, attrs) {
        scope.$watch(
            function(scope) {
                return scope.$eval(attrs.compile);
            },
            function(value) {
                ele.html(value);
                CompileDirective.instance.$compile(ele.contents())(scope);
            }
        );
    }
}

class navItemDirective {
    constructor() {
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

    static directiveFactory() {
        navItemDirective.instance = new navItemDirective();
        return navItemDirective.instance;
    }
}

class stepToolsDirective {
    constructor() {
        this.scope = {
            nodeId: '=',
            showPosition: '='
        };
        this.template = '<ng-include src="stepToolsCtrl.getTemplateUrl()"></ng-include>';
        this.controller = 'StepToolsCtrl';
        this.controllerAs = 'stepToolsCtrl';
        this.bindToController = true;
    }

    static directiveFactory() {
        stepToolsDirective.instance = new stepToolsDirective();
        return stepToolsDirective.instance;
    }
}

class nodeStatusIconDirective {
    constructor() {
        this.scope = {
            nodeId: '=',
            customClass: '='
        };
        this.template = '<ng-include src="nodeStatusIconCtrl.getTemplateUrl()"></ng-include>';
        this.controller = 'NodeStatusIconCtrl';
        this.controllerAs = 'nodeStatusIconCtrl';
        this.bindToController = true;
    }

    static directiveFactory() {
        nodeStatusIconDirective.instance = new nodeStatusIconDirective();
        return nodeStatusIconDirective.instance;
    }
}

let Directives = angular.module('directives', []);

ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'NodeService', 'ProjectService', 'StudentDataService'];
ClassResponseDirective.directiveFactory.$inject = ['StudentStatusService'];
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

export default Directives;



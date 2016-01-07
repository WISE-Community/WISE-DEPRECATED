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
    constructor() {
        this.restrict = 'E';
        this.scope = {
            response: '=',
            submitbuttonclicked: '&',
            studentdatachanged: '&'
        };
        this.templateUrl = 'wise5/components/discussion/classResponse.html';
    }

    static directiveFactory() {
        ClassResponseDirective.instance = new ClassResponseDirective();
        return ClassResponseDirective.instance;
    }

    link($scope, $element, StudentStatusService) {
        $scope.element = $element[0];

        $scope.getAvatarColorForWorkgroupId = function (workgroupId) {
            return StudentStatusService.getAvatarColorForWorkgroupId(workgroupId);
        }

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
        }
    };
}

let Directives = angular.module('directives', []);

ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'NodeService', 'ProjectService', 'StudentDataService'];
ClassResponseDirective.directiveFactory.$inject = [];

Directives.directive('component', ComponentDirective.directiveFactory);
Directives.directive('classResponse', ClassResponseDirective.directiveFactory);

export default Directives;



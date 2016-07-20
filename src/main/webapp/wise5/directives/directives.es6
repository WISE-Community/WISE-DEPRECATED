'use strict';

import AnnotationController from './annotation/annotationController';
import ComponentAnnotationsController from './componentAnnotations/componentAnnotationsController';
import PossibleScoreController from './possibleScore/possibleScoreController';
import WiselinkController from './wiselink/wiselinkController';

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
        var originalNodeId = attrs.originalnodeid;
        var originalComponentId = attrs.originalcomponentid;

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
            nodeId = componentState.nodeId;
            componentId = componentState.componentId;

        }

        var authoringComponentContent = ComponentDirective.instance.ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);
        var componentContent = ComponentDirective.instance.ProjectService.injectAssetPaths(authoringComponentContent);

        // inject the click attribute that will snip the image when the image is clicked
        componentContent = ComponentDirective.instance.ProjectService.injectClickToSnipImage(componentContent);

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

        var componentHTML = '<div id="{{component.id}}" class="component-wrapper">' +
            '<div ng-include="componentTemplatePath" class="component component--{{type}}"></div></div>';

        if (componentHTML != null) {
            element.html(componentHTML);
            ComponentDirective.instance.$compile(element.contents())($scope);
        }
    }
}

class ClassResponseDirective {
    constructor(StudentStatusService, ConfigService) {
        this.restrict = 'E';
        this.scope = {
            response: '=',
            submitbuttonclicked: '&',
            studentdatachanged: '&'
        };
        this.templateUrl = 'wise5/components/discussion/classResponse.html';
        this.StudentStatusService = StudentStatusService;
        this.ConfigService = ConfigService;
    }

    static directiveFactory(StudentStatusService, ConfigService) {
        ClassResponseDirective.instance = new ClassResponseDirective(StudentStatusService, ConfigService);
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

        $scope.adjustClientSaveTime = function(time) {
            return ClassResponseDirective.instance.ConfigService.convertToClientTimestamp(time);
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

/**
 * A directive that asks the user if they are sure they want to change a
 * number input value to a lower value. We will not ask the user if they
 * change the number to a higher value. This directive is intended to
 * be used in cases when changing to a lower value will have a destructive
 * effect such as setting the number of rows in the authoring view of the
 * table component.
 */
class ConfirmNumberDecrease {
    constructor() {
        this.priority = -1;
        this.restrict = 'A';
        this.require = 'ngModel';
    }

    static directiveFactory() {
        ConfirmNumberDecrease.instance = new ConfirmNumberDecrease();
        return ConfirmNumberDecrease.instance;
    }

    link($scope, element, attrs, modelCtrl) {

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
}

/**
 * Disable the backspace key so that it does not navigate the user back
 * in their browser history.
 */
class DisableDeleteKeypress {
    constructor($document) {
        this.restrict = 'A';
        this.$document = $document;
    }

    static directiveFactory($document) {
        DisableDeleteKeypress.instance = new DisableDeleteKeypress($document);
        return DisableDeleteKeypress.instance;
    }

    link($document) {
        DisableDeleteKeypress.instance.$document.bind('keydown', function(e) {

            // check for the delete key press
            if (e.keyCode === 8) {
                // the delete key was pressed

                // get the name of the node e.g. body, input, div, etc.
                let nodeName = e.target.nodeName;

                // get the type if applicable e.g. text, password, file, etc.
                let targetType = e.target.type;

                if (nodeName != null) {
                    nodeName = nodeName.toLowerCase();
                }

                if (targetType != null) {
                    targetType = targetType.toLowerCase();
                }

                let contentEditable = e.target.contentEditable === 'true';

                if ((nodeName === 'input' && targetType === 'text') ||
                    (nodeName === 'input' && targetType === 'password') ||
                    (nodeName === 'input' && targetType === 'file') ||
                    (nodeName === 'input' && targetType === 'search') ||
                    (nodeName === 'input' && targetType === 'email') ||
                    (nodeName === 'input' && targetType === 'number') ||
                    (nodeName === 'input' && targetType === 'date') ||
                    nodeName === 'textarea' || contentEditable) {
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
}

/**
 * Listen for the backspace key press so we can perform special processing
 * specific for components such as deleting a point in a graph component.
 */
class ListenForDeleteKeypress {
    constructor($document) {
        this.restrict = 'A';
        this.$document = $document;
    }

    static directiveFactory($document) {
        ListenForDeleteKeypress.instance = new ListenForDeleteKeypress($document);
        return ListenForDeleteKeypress.instance;
    }

    link($scope) {
        ListenForDeleteKeypress.instance.$document.bind('keydown', function(e) {

            // check for the delete key press
            if (e.keyCode === 8) {
                // the delete key was pressed

                // fire the deleteKeyPressed event
                $scope.$broadcast('deleteKeyPressed');
            }
        })
    }
}

/**
 * Creates a link or button that the student can click on to navigate to
 * another step or activity in the project.
 */
const Wiselink = {
    bindings: {
        nodeId: '@',
        linkText: '@',
        tooltip: '@',
        linkClass: '@',
        type: '@'
    },
    templateUrl: 'wise5/directives/wiselink/wiselink.html',
    controller: 'WiselinkController as wiselinkCtrl'
}

const Annotation = {
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
}

const ComponentAnnotations = {
    bindings: {
        scoreAnnotation: '<',
        commentAnnotation: '<',
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/componentAnnotations/componentAnnotations.html',
    controller: 'ComponentAnnotationsController as componentAnnotationsCtrl'
}

const PossibleScore = {
    bindings: {
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/possibleScore/possibleScore.html',
    controller: 'PossibleScoreController as possibleScoreCtrl'
}

let Directives = angular.module('directives', []);

ClassResponseDirective.directiveFactory.$inject = ['StudentStatusService', 'ConfigService'];
CompileDirective.directiveFactory.$inject = ['$compile'];
ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'NodeService', 'ProjectService', 'StudentDataService'];
ConfirmNumberDecrease.directiveFactory.$inject = [];
DisableDeleteKeypress.directiveFactory.$inject = ['$document'];
ListenForDeleteKeypress.directiveFactory.$inject = ['$document'];

Directives.controller('AnnotationController', AnnotationController);
Directives.component('annotation', Annotation);
Directives.controller('ComponentAnnotationsController', ComponentAnnotationsController);
Directives.component('componentAnnotations', ComponentAnnotations);
Directives.controller('PossibleScoreController', PossibleScoreController);
Directives.component('wiselink', Wiselink);
Directives.controller('WiselinkController', WiselinkController);
Directives.component('possibleScore', PossibleScore);
Directives.directive('classResponse', ClassResponseDirective.directiveFactory);
Directives.directive('compile', CompileDirective.directiveFactory);
Directives.directive('component', ComponentDirective.directiveFactory);
Directives.directive('confirmNumberDecrease', ConfirmNumberDecrease.directiveFactory);
Directives.directive('disableDeleteKeypress', DisableDeleteKeypress.directiveFactory);
Directives.directive('listenForDeleteKeypress', ListenForDeleteKeypress.directiveFactory);

export default Directives;

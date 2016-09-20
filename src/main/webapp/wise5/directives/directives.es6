'use strict';

import AnnotationController from './annotation/annotationController';
import ComponentAnnotationsController from './componentAnnotations/componentAnnotationsController';
import PossibleScoreController from './possibleScore/possibleScoreController';
import WiselinkController from './wiselink/wiselinkController';

class ComponentDirective {
    constructor($injector, $compile, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService) {
        this.restrict = 'E';
        this.$injector = $injector;
        this.$compile = $compile;
        this.ConfigService = ConfigService;
        this.NodeService = NodeService;
        this.NotebookService = NotebookService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;
    }

    static directiveFactory($injector, $compile, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService) {
        ComponentDirective.instance = new ComponentDirective($injector, $compile, ConfigService, NodeService, NotebookService, ProjectService, StudentDataService);
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

        // replace any student names in the component content
        componentContent = ComponentDirective.instance.ConfigService.replaceStudentNames(componentContent);

        if (this.NotebookService.isNotebookEnabled()) {
            // inject the click attribute that will snip the image when the image is clicked
            componentContent = ComponentDirective.instance.ProjectService.injectClickToSnipImage(componentContent);
        }

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
 * Make the element draggable
 */
class DraggableDirective {
    constructor($document) {
        this.restrict = 'A';
        this.$document = $document;
    }

    static directiveFactory($document) {
        DraggableDirective.instance = new DraggableDirective($document);
        return DraggableDirective.instance;
    }

    /**
     * Set up the element
     */
    link(scope, element, attr) {

        var $document = this.$document;

        /*
         * used to remember the start x and y coordinate of the top left corner
         * of the element
         */
        var startX = 0;
        var startY = 0;

        // set the attributes into the element so we can access them later
        this.attributes = attr;

        /*
         * listen for the mouse down event so we can set up the variables
         * to start dragging
         */
        element.on('mousedown', (event) => {

            // Prevent default dragging of selected content
            event.preventDefault();

            var leftString = null;
            var topString = null;
            var left = null;
            var top = null;

            if (element != null && element.length > 0) {
                /*
                 * get the pixel location of the top left corner relative to its
                 * parent container
                 */
                leftString = element[0].style.left;
                topString = element[0].style.top;

                if (leftString != null) {
                    // get the integer value of the left
                    left = parseInt(leftString.replace('px', ''));
                }

                if (topString != null) {
                    // get the integer value of the top
                    top = parseInt(topString.replace('px', ''));
                }

                /*
                 * get the position of the mouse and subtract the distance from
                 * the upper left corner of the parent container to the upper
                 * left corner of the element.
                 * this will be equal to the sum of two values.
                 * the first value is the x and y difference between the upper
                 * left corner of the browser screen to the upper left corner
                 * of the parent container.
                 * the second value is the x and y difference between the upper
                 * left corner of the element to the mouse position.
                 * we will use the sum of these two values later to calculate
                 * where to place the element when it is being dragged.
                 */
                startX = event.pageX - left;
                startY = event.pageY - top;

                // add mouse listeners to handle moving the element
                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            }
        });

        /**
         * Called when the user is dragging the element
         * @param event the event
         */
        function mousemove(event) {

            var linkTypeChooserWidth = null;
            var linkTypeChooserHeight = null;

            // get the width and height of the element we are dragging
            var linkTypeChooserWidthString = angular.element(element[0]).css('width');
            var linkTypeChooserHeightString = angular.element(element[0]).css('height');

            if (linkTypeChooserWidthString != null && linkTypeChooserHeightString != null) {
                // get the integer values of the width and height
                linkTypeChooserWidth = parseInt(linkTypeChooserWidthString.replace('px', ''));
                linkTypeChooserHeight = parseInt(linkTypeChooserHeightString.replace('px', ''));
            }

            /*
             * get the width and height of the container that we want to restrict
             * the element within. the user will not be able to drag the element
             * outside of these boundaries.
             */
            var overlayWidth = element.scope().$eval(element[0].attributes['container-width'].value);
            var overlayHeight = element.scope().$eval(element[0].attributes['container-height'].value);

            /*
             * calculate the x and y position of where the element should be
             * placed. we will calculate the position by taking the mouse
             * position and subtracting the value we previously calculated
             * in the mousedown event. performing the subtraction will give
             * us the x and y difference between the upper left corner of the
             * parent container and the upper left corner of the element.
             */
            var x = event.pageX - startX;
            var y = event.pageY - startY;

            var top = 0;

            if (element.scope().conceptMapController.mode == 'authoring') {
                /*
                 * if we are in authoring mode we need to include the offset of
                 * the container for some reason.
                 * TODO: figure out why the offset is required in authoring mode
                 * but not in student mode.
                 */

                // get the concept map container
                var conceptMapContainer = angular.element('#conceptMapContainer');

                // get the offset of the container relative to the whole page
                var offset = conceptMapContainer.offset();

                // get the top offset
                var offsetTop = offset.top;

                // set the top to the offset
                top = offsetTop;
            }

            if (x < 0) {
                /*
                 * the x position that we have calculated for the left
                 * side of the element is past the left side of the parent
                 * container so we will set the x position to 0 so that the
                 * element is up against the left side of the parent container
                 */
                x = 0;
            } else if((x + linkTypeChooserWidth) > overlayWidth) {
                /*
                 * the x position that we have calculated for the right
                 * side of the element is past the right side of the parent
                 * container so we will set the x position so that the element
                 * is up against the right side of the parent container
                 */
                x = overlayWidth - linkTypeChooserWidth;
            }

            if (y < top) {
                /*
                 * the y position that we have calculated for the top
                 * side of the element is past the top side of the parent
                 * container so we will set the y position to 0 so that the
                 * element is up against the top side of the parent container
                 */
                y = top;
            } else if ((y + linkTypeChooserHeight) > (overlayHeight + top)) {
                /*
                 * the y position that we have calculated for the bottom
                 * side of the element is past the bottom side of the parent
                 * container so we will set the y position so that the element
                 * is up against the bottom side of the parent container
                 */
                y = (overlayHeight + top) - linkTypeChooserHeight;
            }

            // move the element to the new position
            element.css({
                top: y + 'px',
                left:  x + 'px'
            });
        }

        /**
         * Called when the user has released the mouse button
         */
        function mouseup() {
            // remove the mousemove listener
            $document.off('mousemove', mousemove);

            // remove the mouseup listener
            $document.off('mouseup', mouseup);
        }
    };
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
        annotations: '<',
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

CompileDirective.directiveFactory.$inject = ['$compile'];
ComponentDirective.directiveFactory.$inject = ['$injector', '$compile', 'ConfigService', 'NodeService', 'NotebookService', 'ProjectService', 'StudentDataService'];
ConfirmNumberDecrease.directiveFactory.$inject = [];
DisableDeleteKeypress.directiveFactory.$inject = ['$document'];
ListenForDeleteKeypress.directiveFactory.$inject = ['$document'];
DraggableDirective.directiveFactory.$inject = ['$document'];

Directives.controller('AnnotationController', AnnotationController);
Directives.component('annotation', Annotation);
Directives.controller('ComponentAnnotationsController', ComponentAnnotationsController);
Directives.component('componentAnnotations', ComponentAnnotations);
Directives.controller('PossibleScoreController', PossibleScoreController);
Directives.component('wiselink', Wiselink);
Directives.controller('WiselinkController', WiselinkController);
Directives.component('possibleScore', PossibleScore);
Directives.directive('compile', CompileDirective.directiveFactory);
Directives.directive('component', ComponentDirective.directiveFactory);
Directives.directive('confirmNumberDecrease', ConfirmNumberDecrease.directiveFactory);
Directives.directive('disableDeleteKeypress', DisableDeleteKeypress.directiveFactory);
Directives.directive('draggable', DraggableDirective.directiveFactory);
Directives.directive('listenForDeleteKeypress', ListenForDeleteKeypress.directiveFactory);

export default Directives;

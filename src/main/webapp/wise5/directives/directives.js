
define(['angular', 'projectService', 'studentDataService'], function(angular, projectService, studentDataService) {
    
    angular.module('directives', [])
    
    .filter('appropriateSizeText', function() {
        /**
         * Given a string of a number of bytes, returns a string of the size
         * in either: bytes, kilobytes or megabytes depending on the size.
         */
        return function(bytes) {
            /**
             * Returns the given number @param num to the nearest
             * given decimal place @param decimal. (e.g if called 
             * roundToDecimal(4.556, 1) it will return 4.6.
             */
            var roundToDecimal = function(num, decimal) {
                var rounder = 1;
                if (decimal) {
                    rounder = Math.pow(10, decimal);
                }

                return Math.round(num*rounder) / rounder;
            };
            
            if (bytes > 1048576) {
                return roundToDecimal(((bytes/1024) / 1024), 1) + ' mb';
            } else if (bytes > 1024) {
                return roundToDecimal((bytes/1024), 1) + ' kb';
            } else {
                return bytes + ' b';
            }
        };        
    })
    
    /**
     * Returns the given number @param num to the nearest
     * given decimal place @param decimal. (e.g if called 
     * roundToDecimal(4.556, 1) it will return 4.6.
     */
    .filter('roundToDecimal', function() {
        
        return function(num, decimal) {
            var rounder = 1;
            if (decimal) {
                rounder = Math.pow(10, decimal);
            }

            return Math.round(num*rounder) / rounder;
        };
    })
    
    .directive('compile', function($compile) {
        return function(scope, ele, attrs) {
            scope.$watch(
                    function(scope) {
                        return scope.$eval(attrs.compile);
                    },
                    function(value) {
                        ele.html(value);
                        $compile(ele.contents())(scope);
                    }
            );
        };
    })

    .directive('componentstatehtml', function($injector, $sanitize) {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {

                if (attrs.componentstate) {
                    var componentState = JSON.parse(attrs.componentstate);
                    var componentType = componentState.componentType;

                    if (componentType != null) {
                        var childService = $injector.get(componentType + 'Service');

                        if (childService != null) {
                            var studentWorkHTML = childService.getStudentWorkAsHTML(componentState, $scope);

                            if (studentWorkHTML != null) {
                                element[0].innerHTML = "<div> " + $sanitize(studentWorkHTML) + "</div>";
                            }
                        }
                    }
                }
            }
        };
    })

    .directive('component', function($injector, $compile, NodeService, ProjectService, StudentDataService) {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {

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
                    componentState = StudentDataService.getLatestComponentStateByNodeIdAndComponentId(nodeId, componentId);
                } else {
                    componentState = angular.fromJson(componentState);
                }

                var component = ProjectService.getComponentByNodeIdAndComponentId(nodeId, componentId);

                $scope.component = component;
                $scope.componentState = componentState;
                $scope.componentTemplatePath = NodeService.getComponentTemplatePath(component.type);
                $scope.nodeId = nodeId;
                $scope.workgroupId = workgroupId;
                $scope.teacherWorkgroupId = teacherWorkgroupId;

                var studentWorkHTML = "<div id=\"{{component.id}}\" class=\"component-content\" >" +
                    "<div ng-include=\"componentTemplatePath\" style=\"overflow-x: auto;\"></div></div>";

                if (studentWorkHTML != null) {
                    element.html(studentWorkHTML);
                    $compile(element.contents())($scope);
                }
            }
        };
    })

    .directive('wiseuserinfo', function($injector, ConfigService) {
        return {
            restrict: 'E',
            link: function($scope, element, attrs) {

                var workgroupId = attrs.workgroupid;

                if (workgroupId == null) {
                    workgroupId = ConfigService.getWorkgroupId();
                }

                if (workgroupId != null) {
                    var studentFirstNames = ConfigService.getStudentFirstNamesByWorkgroupId(workgroupId);

                    if (studentFirstNames != null) {
                        element[0].innerHTML = studentFirstNames.join(", ");
                    }
                } else {
                    element[0].innerHTML = "student";  // default case
                }
            }
        };
    })

    .directive('wiselink', function(StudentDataService) {
        return {
            restrict: 'E',
            replace: true,
            link: function(scope, element, attrs) {

                var nodeId = attrs.nodeid;
                //var componentId = attrs.componentid; TODO: allow linking to component within a node
                var linkText = attrs.linktext;

                if (nodeId !== null) {
                    element[0].innerHTML = '<a>' + linkText + '</a>';
                }
                element.bind('click', function() {
                    StudentDataService.endCurrentNodeAndSetCurrentNodeByNodeId(nodeId);
                });
            }

        };
    })

    .directive('disableDeleteKeypress', [
        '$document',
        '$rootScope',
        function($document, $rootScope) {
            return {
                restrict: 'A',
                link: function() {
                    $document.bind('keydown', function(e) {

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

                            if ((nodeName === 'input' && targetType === 'text') ||
                                (nodeName === 'input' && targetType === 'password') ||
                                (nodeName === 'input' && targetType === 'file') ||
                                (nodeName === 'input' && targetType === 'search') ||
                                (nodeName === 'input' && targetType === 'email') ||
                                (nodeName === 'input' && targetType === 'number') ||
                                (nodeName === 'input' && targetType === 'date') ||
                                nodeName === 'textarea') {
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
                    })
                }
            }
        }
    ])

    .directive('listenForDeleteKeypress', [
        '$document',
        '$rootScope',
        function($document, $rootScope) {
            return {
                restrict: 'A',
                link: function($scope) {
                    $document.bind('keydown', function(e) {

                        // check for the delete key press
                        if (e.keyCode === 8) {
                            // the delete key was pressed

                            // handle the delete key press in the scope
                            $scope.handleDeleteKeyPressed();
                        }
                    })
                }
            }
        }
    ])

    .directive('annotation', function($injector,
                                      $compile,
                                      AnnotationService,
                                      ConfigService,
                                      NodeService,
                                      ProjectService,
                                      StudentDataService,
                                      TeacherDataService,
                                      UtilService) {
            return {
                restrict: 'E',
                controller: 'AnnotationController',
                controllerAs: 'annotationController',
                bindToController: true,
                scope: {
                },
                link: function($scope, element, attrs) {

                    var annotationHTML = '';

                    var type = attrs.type;
                    var mode = attrs.mode;
                    var nodeId = attrs.nodeid;
                    var componentId = attrs.componentid;
                    var fromWorkgroupId = attrs.fromworkgroupid;
                    var toWorkgroupId = attrs.toworkgroupid;
                    var componentStateId = attrs.componentstateid;
                    var active = attrs.active;

                    if (fromWorkgroupId == '') {
                        fromWorkgroupId = null;
                    } else if (fromWorkgroupId != null) {
                        // convert the string to a number
                        fromWorkgroupId = UtilService.convertStringToNumber(fromWorkgroupId);
                    }

                    if (toWorkgroupId == '') {
                        toWorkgroupId = null;
                    } else if (toWorkgroupId != null) {
                        // convert the string to a number
                        toWorkgroupId = UtilService.convertStringToNumber(toWorkgroupId);
                    }

                    if (componentStateId == '') {
                        componentStateId = null;
                    } else if (componentStateId != null) {
                        // convert the string to a number
                        componentStateId = UtilService.convertStringToNumber(componentStateId);
                    }

                    if (active == 'true') {
                        active = true;
                    } else {
                        active = false;
                    }

                    if (mode === 'student') {

                        var annotationParams = {};
                        annotationParams.nodeId = nodeId;
                        annotationParams.componentId = componentId;
                        annotationParams.fromWorkgroupId = fromWorkgroupId;
                        annotationParams.toWorkgroupId = toWorkgroupId;
                        annotationParams.type = type;
                        annotationParams.studentWorkId = componentStateId;

                        // get the latest annotation that matches the params
                        annotation = AnnotationService.getLatestAnnotation(annotationParams);

                        if (type === 'score') {

                            if (annotation != null) {
                                var data = annotation.data;
                                var dataJSONObject = angular.fromJson(data);

                                if (dataJSONObject) {
                                    var value = dataJSONObject.value;

                                    if (value != null && value != '') {
                                        // display the score to the student
                                        annotationHTML += '<span>Score: ' + value + '</span>';
                                    }
                                }
                            }
                        } else if (type === 'comment') {
                            if (annotation != null) {
                                var data = annotation.data;
                                var dataJSONObject = angular.fromJson(data);

                                if (dataJSONObject) {
                                    var value = dataJSONObject.value;

                                    if (value != null && value != '') {
                                        // display the comment to the student
                                        annotationHTML += '<span>Comment: ' + value + '</span>';
                                    }
                                }
                            }
                        }
                    } else if (mode === 'grading') {

                        var annotationParams = {};
                        annotationParams.nodeId = nodeId;
                        annotationParams.componentId = componentId;
                        annotationParams.fromWorkgroupId = fromWorkgroupId;
                        annotationParams.toWorkgroupId = toWorkgroupId;
                        annotationParams.type = type;
                        annotationParams.studentWorkId = componentStateId;

                        var annotation = null;

                        if (active) {
                            /*
                             * this directive instance is the active annotation that the teacher can use to
                             * grade so we will get the latest annotation for the student work
                             */
                            annotation = AnnotationService.getLatestAnnotation(annotationParams);
                        } else {
                            /*
                             * this directive instance is not the active annotation so we will get the
                             * annotation directly associated with the student work
                             */
                            annotation = AnnotationService.getAnnotation(annotationParams);
                        }

                        // set the values into the controller so we can access them in the controller
                        $scope.annotationController.annotationId = null;
                        $scope.annotationController.nodeId = nodeId;
                        $scope.annotationController.periodId = null;
                        $scope.annotationController.componentId = componentId;
                        $scope.annotationController.fromWorkgroupId = fromWorkgroupId;
                        $scope.annotationController.toWorkgroupId = toWorkgroupId;
                        $scope.annotationController.type = type;
                        $scope.annotationController.componentStateId = componentStateId;
                        $scope.annotationController.isDisabled = !active;

                        if (annotation != null) {
                            if (componentStateId == annotation.studentWorkId) {
                                /*
                                 * the annotation is for the component state that is being displayed.
                                 * sometimes the annotation may not be for the component state that
                                 * is being displayed which can happen when student submits work,
                                 * the teacher annotates it, and then the student submits new work.
                                 * when this happens, we will show the teacher annotation but the
                                 * annotation is associated with the first student work and not the
                                 * second student work. setting the annotationId in the scope will
                                 * cause the server to update the annotation as opposed to creating
                                 * a new annotation row in the database.
                                 */
                                $scope.annotationController.annotationId = annotation.id;
                            }
                        }

                        var toUserInfo = ConfigService.getUserInfoByWorkgroupId(toWorkgroupId);

                        if (toUserInfo != null) {
                            // set the period id
                            $scope.annotationController.periodId = toUserInfo.periodId;
                        }

                        if (annotation != null) {
                            var data = annotation.data;

                            if (data != null) {
                                var dataJSONObject = angular.fromJson(data);

                                if (dataJSONObject != null) {
                                    // set the annotation value
                                    $scope.annotationController.value = dataJSONObject.value;
                                }
                            }
                        }

                        if (type === 'score') {
                            annotationHTML += 'Score: ';
                            annotationHTML += '<input size="10" ng-model="annotationController.value" ng-disabled="annotationController.isDisabled" ng-change="annotationController.postAnnotation()" ng-model-options="{ debounce: 2000 }"></input>';
                        } else if (type === 'comment') {
                            annotationHTML += 'Comment: ';
                            annotationHTML += '<br/>';
                            annotationHTML += '<textarea ng-model="annotationController.value" ng-disabled="annotationController.isDisabled" ng-change="annotationController.postAnnotation()" ng-model-options="{ debounce: 2000 }" rows="5" cols="30"></textarea>';
                        }
                    }

                    element.html(annotationHTML);
                    $compile(element.contents())($scope);
                }
            };
        })
});
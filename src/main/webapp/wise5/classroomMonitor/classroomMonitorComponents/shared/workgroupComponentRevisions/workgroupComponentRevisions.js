"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var WorkgroupComponentRevisionsController = function () {
    function WorkgroupComponentRevisionsController(moment, AnnotationService, ConfigService, TeacherDataService) {
        var _this = this;

        _classCallCheck(this, WorkgroupComponentRevisionsController);

        this.moment = moment;
        this.AnnotationService = AnnotationService;
        this.ConfigService = ConfigService;
        this.TeacherDataService = TeacherDataService;

        this.$onInit = function () {
            /**
             * Set a constant specifying the number of additional component
             * states to show each time more states are shown
             */
            _this.increment = 5;
            _this.totalShown = _this.increment;
        };

        this.$onChanges = function () {
            _this.populateData();
        };
    }

    _createClass(WorkgroupComponentRevisionsController, [{
        key: 'populateData',


        /**
         * Set the revisions for this workgroup and component.
         * A component state counts as a revision if it is a submit, has an
         * annotation associated with it, or is the last component state for a node
         * visit.
         */
        value: function populateData() {
            var _this2 = this;

            // create a data object that holds the revisions (by componentState id)
            this.data = {};
            this.total = 0;

            // add revisions to the data object
            if (this.componentStates) {
                this.getNodeEnteredEvents().then(function (result) {
                    var events = result.events;
                    var nodeVisits = [];
                    if (events.length) {
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = events[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var event = _step.value;

                                nodeVisits.push({
                                    serverSaveTime: event.serverSaveTime,
                                    states: []
                                });
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator.return) {
                                    _iterator.return();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                    var nVisits = nodeVisits.length;

                    // group all component states by node visit
                    for (var cStatesIndex = _this2.componentStates.length - 1; cStatesIndex > -1; cStatesIndex--) {
                        var componentState = _this2.componentStates[cStatesIndex];
                        var id = componentState.id;
                        var componentSaveTime = componentState.serverSaveTime;
                        if (nVisits > 0) {
                            // add state to corresponding node visit
                            for (var nVisitsIndex = nVisits - 1; nVisitsIndex > -1; nVisitsIndex--) {
                                var nodeVisit = nodeVisits[nVisitsIndex];
                                var visitSaveTime = nodeVisit.serverSaveTime;
                                if (_this2.moment(componentSaveTime).isSameOrAfter(visitSaveTime)) {
                                    nodeVisit.states.push(componentState);
                                    break;
                                }
                            }
                        } else {
                            /*
                             * We don't have any node visits, so count all
                             * all states as revisions.
                             */
                            _this2.total++;
                            _this2.data[id] = {
                                clientSaveTime: _this2.convertToClientTimestamp(componentSaveTime),
                                componentState: componentState
                            };
                        }
                    }

                    // find revisions in each node visit and add to model
                    for (var visitsIndex = 0; visitsIndex < nVisits; visitsIndex++) {
                        var states = nodeVisits[visitsIndex].states;
                        var nStates = states.length;

                        // check if each state is a revision
                        for (var statesIndex = 0; statesIndex < nStates; statesIndex++) {
                            var state = states[statesIndex];
                            var isRevision = false;
                            if (statesIndex === 0) {
                                /*
                                 * The latest state for a visit always counts as a
                                 * revision
                                 */
                                isRevision = true;
                            } else if (state.isSubmit) {
                                // any submit counts as a revision
                                isRevision = true;
                            } else {
                                /*
                                 * Double check to see if there is an annotation
                                 * associated with the component.
                                 */
                                var latestAnnotations = _this2.AnnotationService.getAnnotationsByStudentWorkId(state.id);
                                var _iteratorNormalCompletion2 = true;
                                var _didIteratorError2 = false;
                                var _iteratorError2 = undefined;

                                try {
                                    for (var _iterator2 = latestAnnotations[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                        var annotation = _step2.value;

                                        var type = annotation.type;
                                        if (type === 'score' || type === 'autoScore' || type === 'comment' || type === 'autoComment') {
                                            isRevision = true;
                                            break;
                                        }
                                    }
                                } catch (err) {
                                    _didIteratorError2 = true;
                                    _iteratorError2 = err;
                                } finally {
                                    try {
                                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                                            _iterator2.return();
                                        }
                                    } finally {
                                        if (_didIteratorError2) {
                                            throw _iteratorError2;
                                        }
                                    }
                                }
                            }
                            if (isRevision) {
                                _this2.total++;
                                _this2.data[state.id] = {
                                    clientSaveTime: _this2.convertToClientTimestamp(state.serverSaveTime),
                                    componentState: state
                                };
                            }
                        }
                    }
                });
            }
        }

        /**
         * Get the nodeEntered events for this workgroup and this node
         */

    }, {
        key: 'getNodeEnteredEvents',
        value: function getNodeEnteredEvents() {
            var params = {
                getAnnotations: false,
                getEvents: true,
                getStudentWork: false,
                event: 'nodeEntered',
                nodeId: this.nodeId,
                workgroupId: this.workgroupId
            };
            return this.TeacherDataService.retrieveStudentData(params);
        }
    }, {
        key: 'convertToClientTimestamp',
        value: function convertToClientTimestamp(time) {
            return this.ConfigService.convertToClientTimestamp(time);
        }

        /**
         * Increase the number of component states shown by 5
         */

    }, {
        key: 'showMore',
        value: function showMore() {
            this.totalShown += this.increment;
        }

        /**
         * The show more element has come into or out of view
         * @param inview whether the element is in view or not
         */

    }, {
        key: 'moreInView',
        value: function moreInView(inview) {
            if (inview && this.totalShown > this.increment) {
                // automatically show more component states
                this.showMore();
            }
        }
    }]);

    return WorkgroupComponentRevisionsController;
}();

WorkgroupComponentRevisionsController.$inject = ['moment', 'AnnotationService', 'ConfigService', 'TeacherDataService'];

var WorkgroupComponentRevisions = {
    bindings: {
        componentStates: '<',
        nodeId: '@',
        workgroupId: '@'
    },
    template: '<md-list class="component-revisions">\n            <div ng-repeat="item in $ctrl.data | toArray | orderBy: \'-clientSaveTime\'"\n                 ng-if="$index < $ctrl.totalShown">\n                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item"\n                              ng-class="{\'component-revisions__item--latest\': $first}">\n                    <div class="md-list-item-text component-revisions__item__text"\n                         flex>\n                        <h3 class="accent-2 md-body-2 gray-lightest-bg component__header">\n                            #{{$ctrl.total - $index}}\n                            <span ng-if="$first"> (Latest)</span>\n                        </h3>\n                        <div>\n                            <component component-state="{{ item.componentState }}"\n                                       workgroup-id="{{ $ctrl.workgroupId }}"\n                                       mode="gradingRevision">\n                        </div>\n                    </div>\n                </md-list-item>\n            </div>\n            <div ng-if="$ctrl.totalShown > $ctrl.increment"\n                 in-view="$ctrl.moreInView($inview)"></div>\n            <div ng-if="$ctrl.total > $ctrl.increment" class="md-padding center">\n                <md-button class="md-raised"\n                           ng-if="$ctrl.totalShown <= $ctrl.increment"\n                           ng-click="$ctrl.showMore()"\n                           translate="SHOW_MORE">\n                </md-button>\n            </div>\n        </md-list>',
    controller: WorkgroupComponentRevisionsController
};

exports.default = WorkgroupComponentRevisions;
//# sourceMappingURL=workgroupComponentRevisions.js.map

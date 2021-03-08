'use strict';

import { AnnotationService } from '../../../../services/annotationService';
import { ConfigService } from '../../../../services/configService';
import { TeacherDataService } from '../../../../services/teacherDataService';

class WorkgroupComponentRevisionsController {
  componentStates: any = [];
  data: any;
  increment: number = 5;
  nodeId: string;
  total: number;
  totalShown: number;
  workgroupId: number;

  static $inject = ['moment', 'AnnotationService', 'ConfigService', 'TeacherDataService'];

  constructor(
    private moment: any,
    private AnnotationService: AnnotationService,
    private ConfigService: ConfigService,
    private TeacherDataService: TeacherDataService
  ) {}

  $onInit() {
    this.totalShown = this.increment;
  }

  $onChanges() {
    this.populateData();
  }

  /**
   * Set the revisions for this workgroup and component.
   * A component state counts as a revision if it is a submit, has an
   * annotation associated with it, or is the last component state for a node
   * visit.
   */
  populateData() {
    this.data = {};
    this.total = 0;
    this.getNodeEnteredEvents().then(({ events }) => {
      const nodeVisits = [];
      for (const event of events) {
        nodeVisits.push({
          serverSaveTime: event.serverSaveTime,
          states: []
        });
      }
      let nVisits = nodeVisits.length;

      // group all component states by node visit
      for (let cStatesIndex = this.componentStates.length - 1; cStatesIndex > -1; cStatesIndex--) {
        let componentState = this.componentStates[cStatesIndex];
        let id = componentState.id;
        let componentSaveTime = componentState.serverSaveTime;
        if (nVisits > 0) {
          // add state to corresponding node visit
          for (let nVisitsIndex = nVisits - 1; nVisitsIndex > -1; nVisitsIndex--) {
            let nodeVisit = nodeVisits[nVisitsIndex];
            let visitSaveTime = nodeVisit.serverSaveTime;
            if (this.moment(componentSaveTime).isSameOrAfter(visitSaveTime)) {
              nodeVisit.states.push(componentState);
              break;
            }
          }
        } else {
          // we don't have any node visits, so count all all states as revisions.
          this.total++;
          this.data[id] = {
            clientSaveTime: this.convertToClientTimestamp(componentSaveTime),
            componentState: componentState
          };
        }
      }

      // find revisions in each node visit and add to model
      for (let visitsIndex = 0; visitsIndex < nVisits; visitsIndex++) {
        let states = nodeVisits[visitsIndex].states;
        let nStates = states.length;
        for (let statesIndex = 0; statesIndex < nStates; statesIndex++) {
          let state = states[statesIndex];
          let isRevision = false;
          if (statesIndex === 0) {
            // The latest state for a visit always counts as a revision
            isRevision = true;
          } else if (state.isSubmit) {
            isRevision = true;
          } else {
            // Double check to see if there is an annotation associated with the component.
            for (const annotation of this.AnnotationService.getAnnotationsByStudentWorkId(
              state.id
            )) {
              if (['score', 'autoScore', 'comment', 'autoComment'].includes(annotation.type)) {
                isRevision = true;
                break;
              }
            }
          }
          if (isRevision) {
            this.total++;
            this.data[state.id] = {
              clientSaveTime: this.convertToClientTimestamp(state.serverSaveTime),
              componentState: state
            };
          }
        }
      }
    });
  }

  getNodeEnteredEvents() {
    const params = {
      getAnnotations: false,
      getEvents: true,
      getStudentWork: false,
      event: 'nodeEntered',
      nodeId: this.nodeId,
      workgroupId: this.workgroupId,
      runId: this.ConfigService.getRunId()
    };
    return this.TeacherDataService.retrieveStudentData(params);
  }

  convertToClientTimestamp(time) {
    return this.ConfigService.convertToClientTimestamp(time);
  }

  showMore() {
    this.totalShown += this.increment;
  }

  moreInView(inview) {
    if (inview && this.totalShown > this.increment) {
      this.showMore();
    }
  }
}

const WorkgroupComponentRevisions = {
  bindings: {
    componentStates: '<',
    nodeId: '@',
    componentId: '@',
    workgroupId: '@',
    fromWorkgroupId: '@'
  },
  template: `<md-list class="component-revisions">
            <div ng-repeat="item in $ctrl.data | toArray | orderBy: '-clientSaveTime'"
                 ng-if="$index < $ctrl.totalShown">
                <md-list-item class="list-item md-whiteframe-1dp component-revisions__item"
                              ng-class="{'component-revisions__item--latest': $first}">
                    <div class="md-list-item-text component-revisions__item__text"
                         flex>
                        <h3 class="accent-1 md-body-2 gray-lightest-bg component__header">
                            #{{$ctrl.total - $index}}
                            <span ng-if="$first"> (Latest)</span>
                        </h3>
                        <div style="padding: 20px;">
                            <ng-content ng-switch="item.componentState.componentType">
                              <div ng-switch-when="Draw|Label|Match|MultipleChoice|OpenResponse|Table" ng-switch-when-separator="|" class="component__content" layout="row" layout-wrap>
                                  <div flex="100" flex-gt-sm="66" layout="column" class="component--grading__response">
                                      <draw-grading
                                          ng-if="item.componentState.componentType === 'Draw'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId"
                                          is-revision="true">
                                      </draw-grading>
                                      <label-grading
                                          ng-if="item.componentState.componentType === 'Label'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId"
                                          is-revision="true">
                                      </label-grading>
                                      <match-grading
                                          ng-if="item.componentState.componentType === 'Match'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId">
                                      </match-grading>
                                      <multiple-choice-grading
                                          ng-if="item.componentState.componentType === 'MultipleChoice'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId">
                                      </multiple-choice-grading>
                                      <open-response-grading
                                          ng-if="item.componentState.componentType === 'OpenResponse'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId">
                                      </open-response-grading>
                                      <table-grading
                                          ng-if="item.componentState.componentType === 'Table'"
                                          node-id="{{::$ctrl.nodeId}}"
                                          component-id="{{::$ctrl.componentId}}"
                                          component-state="{{ item.componentState }}"
                                          workgroup-id="::$ctrl.workgroupId">
                                      </table-grading>
                                      <component-revisions-info
                                          node-id="::$ctrl.nodeId"
                                          component-id="::$ctrl.componentId"
                                          to-workgroup-id="::$ctrl.workgroupId"
                                          component-state="item.componentState"
                                          active='false'>
                                      </component-revisions-info>
                                  </div>
                                  <div flex="100" flex-gt-sm="33" class="component--grading__annotations">
                                    <component-grading node-id="::$ctrl.nodeId"
                                        component-id="::$ctrl.componentId"
                                        max-score="componentContent.maxScore"
                                        from-workgroup-id="::$ctrl.fromWorkgroupId"
                                        to-workgroup-id="$ctrl.workgroupId"
                                        component-state-id="item.componentState.id"
                                        show-all-annotations="true"
                                        is-disabled="true">
                                    </component-grading>
                                  </div>
                              </div>
                              <component ng-switch-default
                                         component-state="{{ item.componentState }}"
                                         workgroup-id="::$ctrl.workgroupId"
                                         mode="gradingRevision">
                            </ng-content>
                        </div>
                    </div>
                </md-list-item>
            </div>
            <div ng-if="$ctrl.totalShown > $ctrl.increment"
                 in-view="$ctrl.moreInView($inview)"></div>
            <div ng-if="$ctrl.total > $ctrl.increment" class="md-padding center">
                <md-button class="md-raised"
                           ng-if="$ctrl.totalShown <= $ctrl.increment"
                           ng-click="$ctrl.showMore()"
                           translate="SHOW_MORE">
                </md-button>
            </div>
        </md-list>`,
  controller: WorkgroupComponentRevisionsController
};

export default WorkgroupComponentRevisions;

"use strict";

class GlobalAnnotationsListController {
    constructor($rootScope,
                $scope,
                $filter,
                AnnotationService,
                ProjectService,
                StudentDataService) {
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$filter = $filter;
        this.AnnotationService = AnnotationService;
        this.ProjectService = ProjectService;
        this.StudentDataService = StudentDataService;

        this.$translate = this.$filter('translate');

        this.active = false;

        this.$onInit = () => {
            this.setModel();
        }

        this.annotationSavedToServerSubscription =
                this.AnnotationService.annotationSavedToServer$.subscribe(() => {
            this.setModel();
        });

        this.nodeStatusesChangedSubscription =
                this.StudentDataService.nodeStatusesChanged$.subscribe(() => {
            this.setModel();
        });

        this.$scope.$on('$destroy', () => {
          this.ngOnDestroy();
        });
    };

    ngOnDestroy() {
        this.unsubscribeAll();
    }

    unsubscribeAll() {
        this.annotationSavedToServerSubscription.unsubscribe();
        this.nodeStatusesChangedSubscription.unsubscribe();
    }

    setModel() {
        let latestGlobalAnnotationGroup = this.getLatestGlobalAnnotationGroup();
        this.latestGlobalComment = null;
        this.latestGlobalScore = null;

        if (latestGlobalAnnotationGroup) {
            let annotations = latestGlobalAnnotationGroup.annotations;

            let n = annotations.length-1;
            for (let i = n; i > -1; i--) {
                let annotation = annotations[i];
                let type = annotation.type;
                if (type === 'autoComment') {
                    this.latestGlobalComment = annotation;
                } else if (type === 'autoScore') {
                    this.latestGlobalScore = annotation;
                }

                if (this.latestGlobalComment && this.latestGlobalScore) {
                    break;
                }
            }

            let nodeId = latestGlobalAnnotationGroup.nodeId;
            this.nodeTitle = this.ProjectService.getNodePositionAndTitleByNodeId(nodeId);
        }
    }

    getLatestGlobalAnnotationGroup() {
        let latestGlobalAnnotationGroup = null;

        let annotations = this.AnnotationService.getActiveGlobalAnnotationGroups();
        let total = annotations.length;

        if (total) {
            annotations.sort(function(a,b){
                return new Date(b.serverSaveTime) - new Date(a.serverSaveTime);
            });

            latestGlobalAnnotationGroup = annotations[0];
        }

        return latestGlobalAnnotationGroup;
    }
}

GlobalAnnotationsListController.$inject = [
    '$rootScope',
    '$scope',
    '$filter',
    'AnnotationService',
    'ProjectService',
    'StudentDataService'
];

const GlobalAnnotationsList = {
    bindings: {},
    template:
        `<p class="md-body-1 text-secondary" style="text-decoration: underline;">From {{$ctrl.nodeTitle}}<br /></p>
        <div class="md-body-1">
            <p ng-if="$ctrl.latestGlobalComment">
                <compile data="$ctrl.latestGlobalComment.data.value"></compile>
            </p>
            <p ng-if="$ctrl.latestGlobalScore">
                Score: {{$ctrl.latestGlobalScore.data.value}}<span ng-if="$ctrl.maxScore">/{{$ctrl.maxScore}}</span>
            </p>
        </div>`,
    controller: GlobalAnnotationsListController
};

export default GlobalAnnotationsList;

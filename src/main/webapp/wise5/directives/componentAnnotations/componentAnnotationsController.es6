'use strict';

class ComponentAnnotationsController {
    constructor($scope,
                $element,
                ProjectService,
                $mdMedia) {
        this.ProjectService = ProjectService;

        // the score annotation
        this.score = this.scoreAnnotation ? this.scoreAnnotation.data.value : null;
        this.hasScore = (parseInt(this.score) > -1);
        this.maxScoreDisplay = (parseInt(this.maxScore) > 0) ? '/' + this.maxScore : '';

        // the comment annotation
        this.comment = this.commentAnnotation ? this.commentAnnotation.data.value : null;

        this.themeSettings = this.ProjectService.getThemeSettings();
        this.hideComponentScores = this.themeSettings.hideComponentScores;

        // watch for browser window width changes and set smScreen to true when applicable
        $scope.$watch(() => { return $mdMedia('gt-xs'); }, (sm) => {
            this.smScreen = sm;
        });

        // TODO: differentiate between teacher, automated, and peer annotations in the future
        // TODO: watch for annotation updates
    }
}

ComponentAnnotationsController.$inject = [
    '$scope',
    '$element',
    'ProjectService',
    '$mdMedia'
];

export default ComponentAnnotationsController;

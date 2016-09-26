'use strict';

class PossibleScoreController {
    constructor($scope,
                $element,
                ProjectService) {
        this.ProjectService = ProjectService;
        this.themeSettings = this.ProjectService.getThemeSettings();
        this.hidePossibleScores = this.themeSettings.hidePossibleScores;
    }
}

PossibleScoreController.$inject = [
    '$scope',
    '$element',
    'ProjectService'
];

const PossibleScore = {
    bindings: {
        maxScore: '<'
    },
    templateUrl: 'wise5/directives/possibleScore/possibleScore.html',
    controller: PossibleScoreController,
    controllerAs: 'possibleScoreCtrl'
};

export default PossibleScore;

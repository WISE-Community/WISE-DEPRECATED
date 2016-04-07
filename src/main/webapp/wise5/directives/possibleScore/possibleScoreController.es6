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

export default PossibleScoreController;

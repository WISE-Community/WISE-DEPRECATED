'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PossibleScoreController = function PossibleScoreController($scope, $element, ProjectService) {
    _classCallCheck(this, PossibleScoreController);

    this.ProjectService = ProjectService;
    this.themeSettings = this.ProjectService.getThemeSettings();
    this.hidePossibleScores = this.themeSettings.hidePossibleScores;
};

PossibleScoreController.$inject = ['$scope', '$element', 'ProjectService'];

exports.default = PossibleScoreController;
//# sourceMappingURL=possibleScoreController.js.map
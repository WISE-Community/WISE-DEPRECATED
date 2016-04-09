'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ComponentAnnotationsController = function ComponentAnnotationsController($scope, $element, ProjectService, $mdMedia) {
    var _this = this;

    _classCallCheck(this, ComponentAnnotationsController);

    this.ProjectService = ProjectService;

    // the score annotation
    this.score = this.scoreAnnotation ? this.scoreAnnotation.data.value : null;
    this.hasScore = parseInt(this.score) > -1;
    this.maxScoreDisplay = parseInt(this.maxScore) > 0 ? '/' + this.maxScore : '';

    // the comment annotation
    this.comment = this.commentAnnotation ? this.commentAnnotation.data.value : null;

    this.themeSettings = this.ProjectService.getThemeSettings();
    this.hideComponentScores = this.themeSettings.hideComponentScores;

    // watch for browser window width changes and set smScreen to true when applicable
    $scope.$watch(function () {
        return $mdMedia('gt-xs');
    }, function (sm) {
        _this.smScreen = sm;
    });

    // TODO: differentiate between teacher, automated, and peer annotations in the future
    // TODO: watch for annotation updates
};

ComponentAnnotationsController.$inject = ['$scope', '$element', 'ProjectService', '$mdMedia'];

exports.default = ComponentAnnotationsController;
//# sourceMappingURL=componentAnnotationsController.js.map
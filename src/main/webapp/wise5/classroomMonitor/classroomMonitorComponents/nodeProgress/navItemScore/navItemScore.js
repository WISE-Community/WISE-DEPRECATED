"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NavItemScoreController = function NavItemScoreController($filter) {
    var _this = this;

    _classCallCheck(this, NavItemScoreController);

    this.$filter = $filter;

    this.showScore = false;
    this.averageScoreDisplay = '';

    this.$onChanges = function (changes) {
        if (typeof _this.maxScore === 'number' || typeof _this.averageScore === 'number') {
            // there is either a max score or an average score
            _this.showScore = true;
            var averageScore = '';

            if (typeof _this.maxScore === 'number') {
                // there is a max score
                if (typeof _this.averageScore === 'number') {
                    // there is and average score
                    averageScore = _this.averageScore > 0 ? _this.$filter('number')(_this.averageScore, 1) : 0;
                } else {
                    averageScore = "-";
                }
                // create the average score display e.g. 8/10
                _this.averageScoreDisplay = averageScore + '/' + _this.maxScore;
            } else {
                // there is no max score
                averageScore = _this.averageScore > 0 ? _this.$filter('number')(_this.averageScore, 1) : 0;
                // create the average score display e.g. 8/0
                _this.averageScoreDisplay = averageScore + '/0';
            }
        } else {
            _this.showScore = false;
        }
    };
};

NavItemScoreController.$inject = ['$filter'];

var NavItemScore = {
    bindings: {
        averageScore: '<',
        maxScore: '<'
    },
    template: '<span class="nav-item--list__info-item" ng-if="$ctrl.showScore">\n            <md-icon class="score"> grade </md-icon>\n            <span class="md-body-2 text-secondary">{{$ctrl.averageScoreDisplay}}</span>\n        </span>',
    controller: NavItemScoreController
};

exports.default = NavItemScore;
//# sourceMappingURL=navItemScore.js.map
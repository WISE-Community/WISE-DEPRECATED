"use strict";

class NavItemScoreController {
    constructor($filter) {
        this.$filter = $filter;

        this.showScore = false;
        this.averageScoreDisplay = '';

        this.$onChanges = (changes) => {
            if (typeof this.maxScore === 'number' || typeof this.averageScore === 'number') {
                // there is either a max score or an average score
                this.showScore = true;
                let averageScore = '';

                if (typeof this.maxScore === 'number') {
                    // there is a max score
                    if (typeof this.averageScore === 'number') {
                        // there is and average score
                        averageScore = this.averageScore > 0 ? this.$filter('number')(this.averageScore, 1) : 0;
                    } else {
                        averageScore = "-";
                    }
                    // create the average score display e.g. 8/10
                    this.averageScoreDisplay = averageScore + '/' + this.maxScore;
                } else {
                    // there is no max score
                    averageScore = this.averageScore > 0 ? this.$filter('number')(this.averageScore, 1) : 0;
                    // create the average score display e.g. 8/0
                    this.averageScoreDisplay = averageScore + '/0';
                }
            } else {
                this.showScore = false;
            }
        }
    };
}

NavItemScoreController.$inject = [
    '$filter'
];

const NavItemScore = {
    bindings: {
        averageScore: '<',
        maxScore: '<'
    },
    template:
        `<span class="nav-item--list__info-item" ng-if="$ctrl.showScore">
            <md-icon class="score"> grade </md-icon>
            <span class="md-body-2 text-secondary">{{$ctrl.averageScoreDisplay}}</span>
        </span>`,
    controller: NavItemScoreController
};

export default NavItemScore;

'use strict';

class NavItemScoreController {
  averageScore: any;
  averageScoreDisplay: string = '';
  maxScore: any;
  showScore: boolean = false;

  static $inject = ['$filter'];

  constructor(private $filter: any) {}

  $onChanges(changes) {
    if (typeof this.maxScore === 'number' || typeof this.averageScore === 'number') {
      // there is either a max score or an average score
      this.showScore = true;
      let averageScore = '';

      if (typeof this.maxScore === 'number') {
        // there is a max score
        if (typeof this.averageScore === 'number') {
          // there is an average score
          if (this.averageScore >= 0) {
            if (this.averageScore % 1 !== 0) {
              averageScore = this.$filter('number')(this.averageScore, 1);
            } else {
              averageScore = this.averageScore.toString();
            }
          }
        } else {
          averageScore = '-';
        }
        // create the average score display e.g. 8/10
        this.averageScoreDisplay = averageScore + '/' + this.maxScore;
      } else {
        // there is no max score
        if (this.averageScore >= 0) {
          if (this.averageScore % 1 !== 0) {
            averageScore = this.$filter('number')(this.averageScore, 1);
          } else {
            averageScore = this.averageScore;
          }
        }
        // create the average score display e.g. 8/0
        this.averageScoreDisplay = averageScore + '/0';
      }
    } else {
      this.showScore = false;
    }
  }
}

const NavItemScore = {
  bindings: {
    averageScore: '<',
    maxScore: '<'
  },
  template: `<span ng-if="$ctrl.showScore" layout="row" layout-align="start center">
            <md-icon class="score"> grade </md-icon>
            <span class="md-body-2 text-secondary">{{$ctrl.averageScoreDisplay}}</span>
        </span>`,
  controller: NavItemScoreController
};

export default NavItemScore;

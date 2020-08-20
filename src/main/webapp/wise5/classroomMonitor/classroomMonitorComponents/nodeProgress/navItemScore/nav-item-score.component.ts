'use strict';

import { Component, Input } from "@angular/core";
import { UpgradeModule } from "@angular/upgrade/static";

@Component({
  selector: 'nav-item-score',
  templateUrl: 'nav-item-score.component.html'
})
export class NavItemScoreComponent {

  @Input()
  averageScore: any;

  averageScoreDisplay: string = '';

  @Input()
  maxScore: any;

  showScore: boolean = false;

  constructor(private upgrade: UpgradeModule) {}

  ngOnChanges(changes) {
    if (typeof this.maxScore === 'number' || typeof this.averageScore === 'number') {
      this.showScore = true;
      let averageScore = '';
      if (typeof this.maxScore === 'number') {
        if (typeof this.averageScore === 'number') {
          if (this.averageScore >= 0) {
            if (this.averageScore % 1 !== 0) {
              averageScore = this.upgrade.$injector.get('$filter')('number')(this.averageScore, 1);
            } else {
              averageScore = this.averageScore.toString();
            }
          }
        } else {
          averageScore = '-';
        }
        this.averageScoreDisplay = averageScore + '/' + this.maxScore;
      } else {
        if (this.averageScore >= 0) {
          if (this.averageScore % 1 !== 0) {
            averageScore = this.upgrade.$injector.get('$filter')('number')(this.averageScore, 1);
          } else {
            averageScore = this.averageScore;
          }
        }
        this.averageScoreDisplay = averageScore + '/0';
      }
    } else {
      this.showScore = false;
    }
  }
}

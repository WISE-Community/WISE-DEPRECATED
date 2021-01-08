'use strict';

import { Component, Inject, Input, LOCALE_ID } from '@angular/core';
import { formatNumber } from '@angular/common';

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

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  ngOnChanges(changes) {
    if (typeof this.maxScore === 'number' || typeof this.averageScore === 'number') {
      this.showScore = true;
      this.averageScoreDisplay = this.getAverageScoreDisplay();
    } else {
      this.showScore = false;
    }
  }

  getAverageScoreDisplay(): string {
    const averageScore = this.formatAverageScore(this.averageScore);
    if (typeof this.maxScore === 'number') {
      return `${averageScore}/${this.maxScore}`;
    } else {
      return `${averageScore}/0`;
    }
  }

  formatAverageScore(averageScore: any): string {
    if (typeof averageScore === 'number') {
      if (averageScore % 1 !== 0) {
        averageScore = formatNumber(averageScore, this.locale, '1.1-1').toString();
      }
    } else {
      averageScore = '-';
    }
    return averageScore;
  }
}

'use strict';

import { Input, Component } from '@angular/core';

@Component({
  selector: 'workgroup-node-score',
  templateUrl: 'workgroup-node-score.component.html'
})
export class WorkgroupNodeScoreComponent {
  @Input()
  score: number;

  @Input()
  maxScore: number;
}

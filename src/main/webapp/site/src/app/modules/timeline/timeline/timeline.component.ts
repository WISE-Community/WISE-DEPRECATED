import { Component, OnInit, ViewEncapsulation } from '@angular/core';

export class TimelineItem {}

@Component({
  selector: 'app-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'timeline' }
})
export class TimelineComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}

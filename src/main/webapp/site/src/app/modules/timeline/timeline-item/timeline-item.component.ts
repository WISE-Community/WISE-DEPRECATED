import { Component, Input, OnInit, Directive, ViewEncapsulation } from '@angular/core';

@Directive({
  selector: 'app-timeline-item-label',
  host: { class: 'timeline-item__label' }
})
export class TimelineItemLabel {}

@Directive({
  selector: 'app-timeline-item-content',
  host: { class: 'timeline-item__content' }
})
export class TimelineItemContent {}

@Component({
  selector: 'app-timeline-item',
  templateUrl: './timeline-item.component.html',
  styleUrls: ['./timeline-item.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TimelineItemComponent implements OnInit {
  @Input()
  active: boolean = false;

  constructor() {}

  ngOnInit() {}
}

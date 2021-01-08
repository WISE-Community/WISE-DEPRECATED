import { Directive, Output, EventEmitter, HostListener, ElementRef } from '@angular/core';

@Directive({
  selector: '[track-scroll]'
})
export class TrackScrollDirective {
  @Output() yPositionChange: EventEmitter<any> = new EventEmitter();

  constructor(private el: ElementRef) {}

  @HostListener('scroll', ['$event'])
  track(event: any) {
    this.yPositionChange.emit(this.el.nativeElement);
  }
}

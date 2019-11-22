import {
  Component,
  Input,
  OnInit,
  Renderer,
  ElementRef,
  EventEmitter,
  Output
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'html-activity',
  template: `<div [innerHTML]="sanitizedHTML"></div>`
})
export class Html implements OnInit {
  @Input() component: any;
  @Output() activity: EventEmitter<string> = new EventEmitter<string>();
  sanitizedHTML: SafeHtml;

  constructor(private sanitizer: DomSanitizer, elementRef: ElementRef,
      renderer: Renderer) {
    this.sanitizer = sanitizer;
    renderer.listen(elementRef.nativeElement, 'click', (event) => {
      if (event.target.tagName.toLowerCase() === 'img') {
        this.activity.emit(event);
      }
    });
  }

  ngOnInit() {
    this.sanitizedHTML = this.sanitizer.bypassSecurityTrustHtml(this.component.html);
  }
}

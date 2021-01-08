import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef,
  ViewEncapsulation,
  ViewChild,
  ElementRef
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeroSectionComponent {
  @Input()
  imgSrc: string;

  @Input()
  imgDescription: string;

  @Input()
  imgSources: Object;

  @Input()
  headline: string;

  @ContentChild('headlineTemplate', { static: false }) headlineRef: TemplateRef<any>;

  @Input()
  tagline: string;

  @ContentChild('taglineTemplate', { static: false }) taglineRef: TemplateRef<any>;

  @ViewChild('bgRef') bgRef: ElementRef;

  bgStyle: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  ngAfterViewInit() {
    this.bgRef.nativeElement.onload = () => {
      this.bgStyle = this.getBgStyle();
    };
  }

  /**
   * Returns the background-image css value for imgSrc
   * @returns {SafeStyle}
   */
  getBgStyle(): SafeStyle {
    const style: string = `url(${this.bgRef.nativeElement.currentSrc})`;
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }
}

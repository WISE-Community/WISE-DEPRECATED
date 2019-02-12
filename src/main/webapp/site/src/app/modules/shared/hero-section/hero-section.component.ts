import { Component, ContentChild, Input, OnInit, TemplateRef, ViewEncapsulation } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-hero-section',
  templateUrl: './hero-section.component.html',
  styleUrls: ['./hero-section.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeroSectionComponent implements OnInit {

  @Input()
  imgSrc: string;

  @Input()
  headline: string;

  @ContentChild('headlineTemplate') headlineRef: TemplateRef<any>;

  @Input()
  tagline: string;

  @ContentChild('taglineTemplate') taglineRef: TemplateRef<any>;

  bgStyle: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
    this.bgStyle = this.getBgStyle();
  }

  /**
   * Returns the background-image css value for imgSrc
   * @returns {SafeStyle}
   */
  getBgStyle(): SafeStyle {
    const STYLE = `url(${this.imgSrc})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }
}

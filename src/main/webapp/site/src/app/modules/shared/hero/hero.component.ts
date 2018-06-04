import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit {

  @Input()
  imgSrc: string = '';

  @Input()
  headline: string = '';

  @Input()
  tagline: string = '';

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

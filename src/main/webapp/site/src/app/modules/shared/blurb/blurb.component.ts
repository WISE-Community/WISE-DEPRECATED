import { Component, ContentChild, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-blurb',
  templateUrl: './blurb.component.html',
  styleUrls: ['./blurb.component.scss']
})
export class BlurbComponent implements OnInit {

  @Input()
  imgSrc: string;

  @Input()
  imgDescription: string;

  @Input()
  headline: string;

  @ContentChild('headlineTemplate') headlineRef: TemplateRef<any>;

  @Input()
  content: string;

  @ContentChild('contentTemplate') contentRef: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

}

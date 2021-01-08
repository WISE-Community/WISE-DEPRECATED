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
  imgSources: Object;

  @Input()
  headline: string;

  @ContentChild('headlineTemplate', { static: false }) headlineRef: TemplateRef<any>;

  @Input()
  content: string;

  @ContentChild('contentTemplate', { static: false }) contentRef: TemplateRef<any>;

  constructor() {}

  ngOnInit() {}
}

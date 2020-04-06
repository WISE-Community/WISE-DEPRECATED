import {
  Component,
  ContentChild,
  Input,
  OnInit,
  TemplateRef,
  ViewEncapsulation
} from '@angular/core';

@Component({
  selector: 'app-call-to-action',
  templateUrl: './call-to-action.component.html',
  styleUrls: ['./call-to-action.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CallToActionComponent implements OnInit {
  @Input()
  destination: string;

  @Input()
  isOutsideLink: boolean = false;

  @Input()
  linkTarget: string;

  @Input()
  icon: string;

  @Input()
  isSvgIcon: boolean = false;

  @Input()
  iconColor: string;

  @Input()
  headline: string;

  @ContentChild('headlineTemplate', { static: false }) headlineRef: TemplateRef<any>;

  @Input()
  content: string;

  @ContentChild('contentTemplate', { static: false }) contentRef: TemplateRef<any>;

  constructor() {}

  ngOnInit() {}
}

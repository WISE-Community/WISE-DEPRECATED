import { Component, Input, OnInit } from '@angular/core';

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

  @Input()
  content: string;

  constructor() { }

  ngOnInit() {
  }

}

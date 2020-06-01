import { Component, OnInit, ViewEncapsulation, SecurityContext } from '@angular/core';
import { I18n } from '@ngx-translate/i18n-polyfill';
import {
  bounceIn,
  flipInX,
  flipInY,
  jackInTheBox,
  rotateIn,
  zoomIn
} from "../animations";
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [
    bounceIn,
    flipInX,
    flipInY,
    jackInTheBox,
    rotateIn,
    zoomIn
  ]
})
export class HomeComponent implements OnInit {

  loaded: boolean = false;
  blurbs: Array<Object> = [
    {
      imgSrc: 'assets/img/wise-students-building@2x.jpg',
      imgDescription: this.i18n('WISE students building'),
      imgSources: [
        {
          type: 'image/webp', 
          srcset: 'assets/img/wise-students-building.webp, assets/img/wise-students-building@2x.webp 2x'
        },
        {
          srcset: 'assets/img/wise-students-building.jpg, assets/img/wise-students-building@2x.jpg 2x'
        }
      ],
      contentTemplate: this.sanitizer.sanitize(SecurityContext.HTML, 'Free, standards-aligned, and research-based inquiry curricula that address <a href="http://www.nextgenscience.org/three-dimensions" target="_blank">NGSS 3D proficiency')
    },
    {
      imgSrc: 'assets/img/wise-project-view@2x.jpg',
      imgDescription: this.i18n('WISE unit on laptop'),
      imgSources: [
        {
          type: 'image/webp', 
          srcset: 'assets/img/wise-project-view.webp, assets/img/wise-project-view@2x.webp 2x'
        },
        {
          srcset: 'assets/img/wise-project-view.jpg, assets/img/wise-project-view@2x.jpg 2x'
        }
      ],
      content: this.i18n('Interactive scientific models plus hands-on activities, personalized guidance, and rich embedded assessments')
    },
    {
      imgSrc: 'assets/img/wise-students-and-teacher@2x.jpg',
      imgDescription: this.i18n('WISE students and teacher'),
      imgSources: [
        {
          type: 'image/webp', 
          srcset: 'assets/img/wise-students-and-teacher.webp, assets/img/wise-students-and-teacher@2x.webp 2x'
        },
        {
          srcset: 'assets/img/wise-students-and-teacher.jpg, assets/img/wise-students-and-teacher@2x.jpg 2x'
        }
      ],
      content: this.i18n('Robust teacher grading and management tools supporting individualized and customized learning')
    }
  ];

  constructor(private i18n: I18n, private sanitizer: DomSanitizer) { }

  ngOnInit() {
  }
}

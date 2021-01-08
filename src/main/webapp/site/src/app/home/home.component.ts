import { Component, OnInit, ViewEncapsulation, SecurityContext } from '@angular/core';
import { bounceIn, flipInX, flipInY, jackInTheBox, rotateIn, zoomIn } from '../animations';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [bounceIn, flipInX, flipInY, jackInTheBox, rotateIn, zoomIn]
})
export class HomeComponent implements OnInit {
  loaded: boolean = false;
  hero = {
    imgSrc: 'assets/img/wise-students-hero.jpg',
    imgDescription: $localize`WISE students in classroom`,
    imgSources: [
      {
        type: 'image/webp',
        sizes: '100vw',
        srcset: `assets/img/wise-students-hero-600w.webp 600w,
            assets/img/wise-students-hero-900w.webp 900w, 
            assets/img/wise-students-hero-1200w.webp 1200w,
            assets/img/wise-students-hero.webp 1600w`
      },
      {
        sizes: '100vw',
        srcset: `assets/img/wise-students-hero-600w.jpg 600w,
          assets/img/wise-students-hero-900w.jpg 900w, 
          assets/img/wise-students-hero-1200w.jpg 1200w,
          assets/img/wise-students-hero.jpg 1600w`
      }
    ]
  };
  ngssLink = {
    startTag: '<a href="http://www.nextgenscience.org/three-dimensions" target="_blank">',
    closeTag: '</a>'
  };
  blurbs: Array<Object> = [
    {
      imgSrc: 'assets/img/wise-students-building@2x.jpg',
      imgDescription: $localize`WISE students building`,
      imgSources: [
        {
          type: 'image/webp',
          srcset:
            'assets/img/wise-students-building.webp, assets/img/wise-students-building@2x.webp 2x'
        },
        {
          srcset:
            'assets/img/wise-students-building.jpg, assets/img/wise-students-building@2x.jpg 2x'
        }
      ],
      contentTemplate: this.sanitizer.sanitize(
        SecurityContext.HTML,
        $localize`Free, standards-aligned, and research-based inquiry curricula that address ${this.ngssLink.startTag}:START_LINK:NGSS 3D proficiency${this.ngssLink.closeTag}:CLOSE_LINK:`
      )
    },
    {
      imgSrc: 'assets/img/wise-project-view@2x.jpg',
      imgDescription: $localize`WISE unit on laptop`,
      imgSources: [
        {
          type: 'image/webp',
          srcset: 'assets/img/wise-project-view.webp, assets/img/wise-project-view@2x.webp 2x'
        },
        {
          srcset: 'assets/img/wise-project-view.jpg, assets/img/wise-project-view@2x.jpg 2x'
        }
      ],
      content: $localize`Interactive scientific models plus hands-on activities, personalized guidance, and rich embedded assessments`
    },
    {
      imgSrc: 'assets/img/wise-students-and-teacher@2x.jpg',
      imgDescription: $localize`WISE students and teacher`,
      imgSources: [
        {
          type: 'image/webp',
          srcset:
            'assets/img/wise-students-and-teacher.webp, assets/img/wise-students-and-teacher@2x.webp 2x'
        },
        {
          srcset:
            'assets/img/wise-students-and-teacher.jpg, assets/img/wise-students-and-teacher@2x.jpg 2x'
        }
      ],
      content: $localize`Robust teacher grading and management tools supporting individualized and customized learning`
    }
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {}
}

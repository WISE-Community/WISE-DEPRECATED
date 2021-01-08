import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LibraryGroup } from '../libraryGroup';

@Component({
  selector: 'app-library-group-thumbs',
  templateUrl: './library-group-thumbs.component.html',
  styleUrls: ['./library-group-thumbs.component.scss']
})
export class LibraryGroupThumbsComponent implements OnInit {
  @Input()
  group: LibraryGroup = new LibraryGroup();

  children: Array<any> = [];

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
    this.children = this.group.children;
    for (let project of this.children) {
      if (project.type === 'project') {
        project.thumbStyle = this.getThumbStyle(project.projectThumb);
      }
    }
  }

  /**
   * Returns the background-image css value for project thumbnail
   * @param {string} projectThumb
   * @returns {SafeStyle}
   */
  getThumbStyle(projectThumb: string) {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }
}

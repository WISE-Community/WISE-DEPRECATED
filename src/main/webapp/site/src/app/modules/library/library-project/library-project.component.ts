import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog} from '@angular/material';
import { LibraryProject } from "../libraryProject";
import { LibraryProjectDetailsComponent } from "../library-project-details/library-project-details.component";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-library-project',
  templateUrl: './library-project.component.html',
  styleUrls: ['./library-project.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryProjectComponent implements OnInit {

  @Input()
  project: LibraryProject = new LibraryProject();

  constructor(public dialog: MatDialog, 
              private sanitizer: DomSanitizer,
              private i18n: I18n) {
  }

  ngOnInit() {
    this.project.thumbStyle = this.getThumbStyle(this.project.projectThumb);
  }

  /**
   * Returns the background-image css value for project thumbnail
   * @param {string} projectThumb
   * @returns {SafeStyle}
   */
  getThumbStyle(projectThumb: string) {
    const DEFAULT_THUMB = 'assets/img/default-picture-sm.svg';
    const STYLE = `url(${projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  showDetails(): void {
    const project = this.project;
    this.dialog.open(LibraryProjectDetailsComponent, {
      ariaLabel: this.i18n('Project Details'),
      data: { project: project },
      panelClass: 'mat-dialog--md'
    });
  }
}

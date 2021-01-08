import { Component, Input, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { LibraryProject } from '../libraryProject';
import { LibraryProjectDetailsComponent } from '../library-project-details/library-project-details.component';
import { flash } from '../../../animations';

@Component({
  selector: 'app-library-project',
  templateUrl: './library-project.component.html',
  styleUrls: ['./library-project.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [flash]
})
export class LibraryProjectComponent implements OnInit {
  @Input()
  project: LibraryProject = new LibraryProject();

  animateDuration: string = '0s';
  animateDelay: string = '0s';

  constructor(
    public dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private elRef: ElementRef
  ) {}

  ngOnInit() {
    this.project.thumbStyle = this.getThumbStyle(this.project.projectThumb);
    if (this.project.isHighlighted) {
      this.animateDuration = '2s';
      this.animateDelay = '1s';
      setTimeout(() => {
        this.project.isHighlighted = false;
      }, 7000);
    }
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
      ariaLabel: $localize`Unit Details`,
      data: { project: project },
      panelClass: 'mat-dialog--md'
    });
  }
}

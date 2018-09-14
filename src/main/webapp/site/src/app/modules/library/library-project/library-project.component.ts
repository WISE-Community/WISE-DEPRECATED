import { Component, Inject, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { LibraryProject } from "../libraryProject";
import { NGSSStandards } from "../ngssStandards";
import { LibraryService } from "../../../services/library.service";
import { CreateRunDialogComponent } from "../../../teacher/create-run-dialog/create-run-dialog.component";
import { UserService } from "../../../services/user.service";
import { User } from "../../../domain/user";
import { Project } from "../../../teacher/project";

@Component({
  selector: 'app-library-project',
  templateUrl: './library-project.component.html',
  styleUrls: ['./library-project.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryProjectComponent implements OnInit {

  @Input()
  project: LibraryProject = new LibraryProject();

  ngss: NGSSStandards = new NGSSStandards();
  ngssWebUrl: string = 'https://www.nextgenscience.org/search-standards?keys=';

  constructor(private sanitizer: DomSanitizer, public dialog: MatDialog) {
    this.sanitizer = sanitizer;
  }

  ngOnInit() {
    this.project.thumbStyle = this.getThumbStyle(this.project.projectThumb);
    this.setNGSS();
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

  setNGSS(): void {
    const standards = this.project.metadata.standardsAddressed;
    if (standards) {
      const ngss = standards.ngss;
      if (ngss) {
        if (ngss.disciplines) {
          this.ngss.disciplines = ngss.disciplines;
        }
        if (ngss.dci) {
          this.ngss.dci = ngss.dci;
        }
        if (ngss.dciArrangements) {
          this.ngss.dciArrangements = ngss.dciArrangements;
        }
        if (ngss.ccc) {
          this.ngss.ccc = ngss.ccc;
        }
        if (ngss.practices) {
          this.ngss.practices = ngss.practices;
        }
      }
    }
  }

  showDetails(): void {
    const project = this.project;
    const ngss = this.ngss;
    const ngssWebUrl = this.ngssWebUrl;
    this.dialog.open(LibraryProjectDetailsComponent, {
      ariaLabel: 'Project Details',
      data: { project: project, ngss: ngss, ngssWebUrl: ngssWebUrl },
      panelClass: 'mat-dialog-container--md'
    });
  }
}

@Component({
  selector: 'app-library-project-details',
  templateUrl: './library-project-details.component.html'
})

export class LibraryProjectDetailsComponent implements OnInit {

  isTeacher: boolean = false;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private libraryService: LibraryService,
              private userService: UserService) {
    this.isTeacher = userService.isTeacher();
  }

  ngOnInit() {
  }

  onClose(): void {
    this.dialogRef.close();
  }

  menuAction(value: string): void {
    switch(value) {
      case 'copy':
        this.copyProject();
        break;
      case 'run':
        this.runProject();
        break;
      case 'edit':
        this.editProject();
        break;
      case 'share':
          this.shareProject();
          break;
    }
  }

  copyProject() {
    this.libraryService.copyProject(this.data.project.id).subscribe((newProject: Project) => {
      const newLibraryProject: LibraryProject = new LibraryProject();
      newLibraryProject.id = newProject.id;
      newLibraryProject.name = newProject.name;
      newLibraryProject.metadata = newProject.metadata;
      newLibraryProject.visible = true;
      this.libraryService.addPersonalLibraryProject(newLibraryProject);
      this.dialogRef.afterClosed().subscribe(() => {
        scrollTo(0, 0);
      });
      this.dialog.closeAll();
    });
  }

  runProject() {
    this.dialog.open(CreateRunDialogComponent, {
      data: this.data
    });
  }

  shareProject() {

  };

  editProject() {

  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { LibraryService } from "../../../services/library.service";
import { UserService } from "../../../services/user.service";
import { CreateRunDialogComponent } from "../../../teacher/create-run-dialog/create-run-dialog.component";
import { UseWithClassWarningDialogComponent } from "../../../teacher/use-with-class-warning-dialog/use-with-class-warning-dialog.component";
import { NGSSStandards } from "../ngssStandards";
import { ConfigService } from "../../../services/config.service";

@Component({
  selector: 'app-library-project-details',
  templateUrl: './library-project-details.component.html',
  styleUrls: ['./library-project-details.component.scss']
})
export class LibraryProjectDetailsComponent implements OnInit {
  isTeacher: boolean = false;
  isRunProject: false;
  ngss: NGSSStandards = new NGSSStandards();
  ngssWebUrl: string = 'https://www.nextgenscience.org/search-standards?keys=';
  previewLink: string;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private libraryService: LibraryService,
              private userService: UserService,
              private configService: ConfigService) {
    this.isTeacher = userService.isTeacher();
    this.isRunProject = data.isRunProject;
    this.setNGSS();
  }

  ngOnInit() {
    this.previewLink = `${this.configService.getContextPath()}/previewproject.html?projectId=${this.data.project.id}`;
  }

  onClose(): void {
    this.dialogRef.close();
  }

  setNGSS(): void {
    if (this.data.project) {
      const standards = this.data.project.metadata.standardsAddressed;
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
  }

  runProject() {
    if (this.data.project.wiseVersion === 4) {
      this.dialog.open(UseWithClassWarningDialogComponent, {
        data: this.data,
        panelClass: 'mat-dialog--md'
      });
    } else {
      this.dialog.open(CreateRunDialogComponent, {
        data: this.data,
        panelClass: 'mat-dialog--md',
        disableClose: true
      });
    }
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
import { LibraryService } from "../../../services/library.service";
import { UserService } from "../../../services/user.service";
import { LibraryProject } from "../libraryProject";
import { CreateRunDialogComponent } from "../../../teacher/create-run-dialog/create-run-dialog.component";
import { NGSSStandards } from "../ngssStandards";

@Component({
  selector: 'app-library-project-details',
  templateUrl: './library-project-details.component.html',
  styleUrls: ['./library-project-details.component.scss']
})
export class LibraryProjectDetailsComponent implements OnInit {
  isTeacher: boolean = false;
  ngss: NGSSStandards = new NGSSStandards();
  ngssWebUrl: string = 'https://www.nextgenscience.org/search-standards?keys=';

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<LibraryProjectDetailsComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private libraryService: LibraryService,
              private userService: UserService) {
    this.isTeacher = userService.isTeacher();
    this.setNGSS();
  }

  ngOnInit() {
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

  copyProject() {
    this.libraryService.copyProject(this.data.project.id).subscribe((newProject: LibraryProject) => {
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
}

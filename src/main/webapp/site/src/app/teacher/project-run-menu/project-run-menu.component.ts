import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Project } from "../project";
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "../create-run-dialog/create-run-dialog.component";
import { ShareRunDialogComponent } from "../share-run-dialog/share-run-dialog.component";

@Component({
  selector: 'app-project-run-menu',
  templateUrl: './project-run-menu.component.html',
  styleUrls: ['./project-run-menu.component.scss']
})
export class ProjectRunMenuComponent implements OnInit {

  @Input()
  project: Project;

  editLink: string = '';
  previewLink: string = '';

  constructor(public dialog: MatDialog, public teacherService: TeacherService) { }

  ngOnInit() {
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.project.id }`;
    this.previewLink = `/wise/previewproject.html?projectId=${ this.project.id }`;
  }

  shareRun() {
    this.dialog.open(ShareRunDialogComponent, {
      data: { project: this.project }
    });
  }

  showCreateRunDialog() {
    const dialogRef = this.dialog.open(CreateRunDialogComponent, {
      data: { project: this.project }
    });

    dialogRef.afterClosed().subscribe(result => {
      scrollTo(0, 0);
    });
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "../create-run-dialog/create-run-dialog.component";
import { ShareRunDialogComponent } from "../share-run-dialog/share-run-dialog.component";

@Component({
  selector: 'app-run-menu',
  templateUrl: './run-menu.component.html',
  styleUrls: ['./run-menu.component.scss']
})
export class RunMenuComponent implements OnInit {

  @Input()
  run: Run;

  editLink: string = '';
  previewLink: string = '';

  constructor(public dialog: MatDialog, public teacherService: TeacherService) { }

  ngOnInit() {
    this.editLink = `/wise/author/authorproject.html?projectId=${ this.run.project.id }`;
    this.previewLink = `/wise/previewproject.html?projectId=${ this.run.project.id }`;
  }

  shareRun() {
    this.dialog.open(ShareRunDialogComponent, {
      data: { run: this.run }
    });
  }

  showCreateRunDialog() {
    const dialogRef = this.dialog.open(CreateRunDialogComponent, {
      data: { run: this.run }
    });

    dialogRef.afterClosed().subscribe(result => {
      scrollTo(0, 0);
    });
  }
}

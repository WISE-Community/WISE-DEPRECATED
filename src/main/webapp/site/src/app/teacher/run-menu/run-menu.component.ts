import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "../create-run-dialog/create-run-dialog.component";
import { ShareRunDialogComponent } from "../share-run-dialog/share-run-dialog.component";
import { UserService } from "../../services/user.service";
import { TeacherRun } from "../teacher-run";

@Component({
  selector: 'app-run-menu',
  templateUrl: './run-menu.component.html',
  styleUrls: ['./run-menu.component.scss']
})
export class RunMenuComponent implements OnInit {

  @Input()
  run: TeacherRun;

  editLink: string = '';
  previewLink: string = '';

  constructor(public dialog: MatDialog,
              public teacherService: TeacherService,
              public userService: UserService) {
  }

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
      data: this.run
    });

    dialogRef.afterClosed().subscribe(result => {
      scrollTo(0, 0);
    });
  }

  isScheduled() {
    if (this.run.endTime) {
      return false;
    }
    let startTime = new Date(this.run.startTime).getTime();
    let now = new Date().getTime();
    if (startTime < now) {
      return false;
    }
    return true;
  }

  canEdit() {
    return this.run.project.canEdit(this.userService.getUserId());
  }

  canShare() {
    return this.run.canGradeAndManage(this.userService.getUserId());
  }
}

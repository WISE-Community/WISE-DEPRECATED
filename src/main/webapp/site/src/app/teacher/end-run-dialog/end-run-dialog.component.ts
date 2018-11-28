import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from "@angular/material";
import { TeacherService } from "../teacher.service";
import { Run } from "../../domain/run";
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-end-run-dialog',
  templateUrl: './end-run-dialog.component.html',
  styleUrls: ['./end-run-dialog.component.scss']
})
export class EndRunDialogComponent implements OnInit {

  isEnding: boolean = false;
  isEnded: boolean = false;
  isError: boolean = false;
  run: Run;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<EndRunDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService) {
    this.run = data.run;
  }

  ngOnInit() {
  }

  endRun() {
    this.isEnding = true;
    this.teacherService.endRun(this.run.id)
      .pipe(
        finalize(() => {
          this.isEnding = false;
        })
      )
      .subscribe((response: any) => {
        if (response.status == 'success') {
          this.run = response.run;
          this.data.run.endTime = new Date(response.run.endTime).getTime();
          this.isEnded = true;
        } else {
          this.isError = true;
        }
      });
  }
}

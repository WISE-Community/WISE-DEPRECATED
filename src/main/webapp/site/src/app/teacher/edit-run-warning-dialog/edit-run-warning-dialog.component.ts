import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ConfigService } from '../../services/config.service';
import { Run } from '../../domain/run';
import { Router } from '@angular/router';

@Component({
  selector: 'app-edit-run-warning-dialog',
  templateUrl: './edit-run-warning-dialog.component.html',
  styleUrls: ['./edit-run-warning-dialog.component.scss']
})
export class EditRunWarningDialogComponent implements OnInit {
  run: Run;
  editLink: string = '';
  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<EditRunWarningDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private configService: ConfigService
  ) {
    this.run = data.run;
    this.dialog.closeAll();
  }

  ngOnInit() {
    this.editLink = `${this.configService.getContextPath()}/teacher/edit/unit/${
      this.run.project.id
    }`;
  }

  editContent() {
    this.router.navigateByUrl(this.editLink);
    this.dialogRef.close();
  }
}

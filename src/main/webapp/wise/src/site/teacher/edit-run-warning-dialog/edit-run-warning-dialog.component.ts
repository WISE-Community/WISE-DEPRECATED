import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ConfigService } from '../../services/config.service';
import { Run } from "../../domain/run";

@Component({
  selector: 'app-edit-run-warning-dialog',
  templateUrl: './edit-run-warning-dialog.component.html',
  styleUrls: ['./edit-run-warning-dialog.component.scss']
})
export class EditRunWarningDialogComponent implements OnInit {

  run: Run;
  editLink: string = '';
  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<EditRunWarningDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private configService: ConfigService) {
    this.run = data.run;
  }

  ngOnInit() {
    this.editLink = `${ this.configService.getContextPath() }/author/authorproject.html?projectId=${ this.run.project.id }`;
  }
}

import { Component, Inject, OnInit } from '@angular/core';
import { Project } from '../../domain/project';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-edit-run-warning-dialog',
  templateUrl: './edit-run-warning-dialog.component.html',
  styleUrls: ['./edit-run-warning-dialog.component.scss']
})
export class EditRunWarningDialogComponent implements OnInit {

  project: Project;
  editLink: string = '';
  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<EditRunWarningDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private configService: ConfigService) {
    this.project = data.project;
  }

  ngOnInit() {
    this.editLink = `${ this.configService.getContextPath() }/author/authorproject.html?projectId=${ this.project.id }`;
  }
}

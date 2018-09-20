import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Run } from "../../domain/run";
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "../create-run-dialog/create-run-dialog.component";
import { ShareRunDialogComponent } from "../share-run-dialog/share-run-dialog.component";
import { ConfigService } from "../../services/config.service";

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

  constructor(private dialog: MatDialog,
              private teacherService: TeacherService,
              private configService: ConfigService) { }

  ngOnInit() {
    this.editLink = `${this.configService.getContextPath()}/author/authorproject.html?projectId=${this.run.project.id}`;
    this.previewLink = `${this.configService.getContextPath()}/previewproject.html?projectId=${this.run.project.id}`;
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
}

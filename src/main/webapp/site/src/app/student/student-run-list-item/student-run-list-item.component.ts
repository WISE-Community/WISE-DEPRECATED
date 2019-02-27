import { Component, OnInit, Input } from '@angular/core';
import { StudentRun } from '../student-run';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { ConfigService } from "../../services/config.service";
import { MatDialog } from "../../../../../../../../node_modules/@angular/material/dialog";
import { TeamSignInDialogComponent } from "../team-sign-in-dialog/team-sign-in-dialog.component";

@Component({
  selector: 'app-student-run-list-item',
  templateUrl: './student-run-list-item.component.html',
  styleUrls: ['./student-run-list-item.component.scss']
})
export class StudentRunListItemComponent implements OnInit {

  @Input()
  run: StudentRun = new StudentRun();

  problemLink: string = '';
  thumbStyle: SafeStyle;
  isAvailable: boolean = true;

  constructor(private sanitizer: DomSanitizer,
              private configService: ConfigService,
              public dialog: MatDialog) {
    this.sanitizer = sanitizer;
    this.configService = configService;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.thumbStyle = this.getThumbStyle();
    this.problemLink = `${this.configService.getContextPath()}/contact?runId=${this.run.id}`;
    this.configService.getConfig().subscribe(config => {
      if (config != null) {
        if (new Date(this.run.startTime) > new Date(Date.now())) {
          this.isAvailable = false;
        }
      }
    });
    if (this.run.isHighlighted) {
      setTimeout(() => {
        this.run.isHighlighted = false;
      }, 5000)
    }
  }

launchRun() {
    if (this.run.maxStudentsPerTeam === 1 || this.run.endTime) {
      window.location.href = `${this.configService.getContextPath()}/student/startproject.html?runId=${this.run.id}`;
    } else {
      this.dialog.open(TeamSignInDialogComponent, {
        data: { run: this.run },
        panelClass: 'mat-dialog--sm'
      });
    }
  }
}

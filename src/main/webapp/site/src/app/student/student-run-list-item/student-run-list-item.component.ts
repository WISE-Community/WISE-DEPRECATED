import { Component, OnInit, Input } from '@angular/core';
import { StudentRun } from '../student-run';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { ConfigService } from '../../services/config.service';
import { MatDialog } from '@angular/material/dialog';
import { TeamSignInDialogComponent } from '../team-sign-in-dialog/team-sign-in-dialog.component';
import { Student } from '../../domain/student';
import { StudentService } from '../student.service';
import { UserService } from '../../services/user.service';
import { flash } from '../../animations';

@Component({
  selector: 'app-student-run-list-item',
  templateUrl: './student-run-list-item.component.html',
  styleUrls: ['./student-run-list-item.component.scss'],
  animations: [flash]
})
export class StudentRunListItemComponent implements OnInit {
  @Input()
  run: StudentRun = new StudentRun();

  problemLink: string = '';
  thumbStyle: SafeStyle;
  animateDuration: string = '0s';
  animateDelay: string = '0s';

  constructor(
    private sanitizer: DomSanitizer,
    private configService: ConfigService,
    public dialog: MatDialog,
    private studentService: StudentService,
    private userService: UserService
  ) {
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
    if (this.run.isHighlighted) {
      this.animateDuration = '2s';
      this.animateDelay = '1s';
      setTimeout(() => {
        this.run.isHighlighted = false;
      }, 7000);
    }
  }

  launchRun() {
    if (this.run.maxStudentsPerTeam === 1) {
      this.skipTeamSignIn();
    } else {
      this.dialog.open(TeamSignInDialogComponent, {
        data: { run: this.run },
        panelClass: 'mat-dialog--sm',
        disableClose: true
      });
    }
  }

  reviewRun() {
    this.skipTeamSignIn();
  }

  skipTeamSignIn() {
    const user = <Student>this.userService.getUser().getValue();
    const presentUserIds = [user.id];
    const absentUserIds = [];
    this.studentService
      .launchRun(this.run.id, this.run.workgroupId, presentUserIds, absentUserIds)
      .subscribe((response: any) => {
        window.location.href = response.startProjectUrl;
      });
  }

  isRunActive(run) {
    return run.isActive(this.configService.getCurrentServerTime());
  }

  isRunCompleted(run) {
    return run.isCompleted(this.configService.getCurrentServerTime());
  }
}

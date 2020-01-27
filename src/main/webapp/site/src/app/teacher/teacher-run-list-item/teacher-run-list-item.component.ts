import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { TeacherRun } from "../teacher-run";
import { ConfigService } from "../../services/config.service";
import { I18n } from '@ngx-translate/i18n-polyfill';
import { flash } from '../../animations';


@Component({
  selector: 'app-teacher-run-list-item',
  templateUrl: './teacher-run-list-item.component.html',
  styleUrls: ['./teacher-run-list-item.component.scss'],
  animations: [ flash ]
})
export class TeacherRunListItemComponent implements OnInit {

  @Input()
  run: TeacherRun = new TeacherRun();

  editLink: string = '';
  gradeAndManageLink: string = '';
  manageStudentsLink: string = '';
  thumbStyle: SafeStyle;
  animateDuration: string = '0s';
  animateDelay: string = '0s';

  constructor(private sanitizer: DomSanitizer,
              private configService: ConfigService,
              private i18n: I18n,
              private elRef: ElementRef) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.project.projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.run.project.thumbStyle = this.getThumbStyle();
    this.editLink = `${this.configService.getContextPath()}/author/authorproject.html?projectId=${this.run.project.id}`;
    if (this.run != null) {
      this.gradeAndManageLink = `${this.configService.getContextPath()}/teacher/run/manage/${this.run.id}#!/run/${this.run.id}/project/`;
      this.manageStudentsLink = `${this.configService.getContextPath()}/teacher/run/manage/${this.run.id}#!/run/${this.run.id}/manageStudents`;
      if (this.run.isHighlighted) {
        this.animateDuration = '2s';
        this.animateDelay = '1s';
        setTimeout(() => {
          this.run.isHighlighted = false;
        }, 7000)
      }
    }
  }

  ngAfterViewInit() {
    if (this.run.isHighlighted) {
      this.elRef.nativeElement.querySelector('mat-card').scrollIntoView();
    }
  }

  periodsString() {
    let string = '';
    const length = this.run.periods.length;
    for (let p = 0; p < length; p++) {
      if (p === 0) {
        string = this.i18n('Class Periods:') + ' ';
      }
      string += this.run.periods[p];
      if (p < length - 1) {
        string += ', ';
      }
    }
    return string;
  }

  isRunActive(run) {
    return run.isActive(this.configService.getCurrentServerTime());
  }

  isRunCompleted(run) {
    return run.isCompleted(this.configService.getCurrentServerTime());
  }
}

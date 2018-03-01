import { Component, OnInit, Input } from '@angular/core';
import { StudentRun } from '../student-run';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';

@Component({
  selector: 'app-student-run-list-item',
  templateUrl: './student-run-list-item.component.html',
  styleUrls: ['./student-run-list-item.component.scss']
})
export class StudentRunListItemComponent implements OnInit {

  @Input()
  run: StudentRun = new StudentRun();

  runLink: string = '';
  problemLink: string = '';
  thumbStyle: SafeStyle;

  constructor(private sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  getThumbStyle() {
    const DEFAULT_THUMB = 'assets/img/default-picture.svg';
    const STYLE = `url(${this.run.projectThumb}), url(${DEFAULT_THUMB})`;
    return this.sanitizer.bypassSecurityTrustStyle(STYLE);
  }

  ngOnInit() {
    this.thumbStyle = this.getThumbStyle();
    this.runLink = `/wise/student/teamsignin.html?runId=${ this.run.id }`;
    this.problemLink = `/wise/contact/contactwise.html?projectId=${ this.run.projectId }&runId=${ this.run.id }`;
  }
}

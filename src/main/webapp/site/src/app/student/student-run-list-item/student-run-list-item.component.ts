import { Component, OnInit, Input } from '@angular/core';
import { StudentRun } from '../student-run';
import { DomSanitizer } from '@angular/platform-browser';
import { SafeStyle } from '@angular/platform-browser';
import { ConfigService } from "../../services/config.service";

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
  isAvailable: boolean = true;

  constructor(private sanitizer: DomSanitizer,
              private configService: ConfigService) {
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
    this.runLink = `${this.configService.getContextPath()}/student/teamsignin.html?runId=${this.run.id}`;
    this.problemLink = `${this.configService.getContextPath()}/contact/contactwise.html?projectId=${this.run.project.id}&runId=${this.run.id}`;
    this.configService.getConfig().subscribe(config => {
      if (config != null) {
        if (this.run.startTime > config.currentTime) {
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
}

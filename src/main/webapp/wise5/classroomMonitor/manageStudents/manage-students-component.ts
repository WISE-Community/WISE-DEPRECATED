'use strict';

import { Component } from '@angular/core';
import { ConfigService } from '../../services/configService';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'manage-students',
  templateUrl: 'manage-students.html'
})
export class ManageStudentsComponent {
  iframeSrc: SafeResourceUrl;

  constructor(private configService: ConfigService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.iframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(
      `${this.configService.getConfigParam('contextPath')}/teacher/management/viewmystudents` +
        `?runId=${this.configService.getRunId()}`
    );
  }
}

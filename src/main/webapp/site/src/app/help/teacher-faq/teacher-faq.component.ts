import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-teacher-faq',
  templateUrl: './teacher-faq.component.html',
  styleUrls: ['./teacher-faq.component.scss']
})
export class TeacherFaqComponent implements OnInit {
  contextPath: string;

  constructor(private configService: ConfigService) {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.contextPath = config.contextPath;
      }
    });
  }

  ngOnInit() {}

  ngAfterViewInit() {
    const appHelpElements = document.getElementsByTagName('app-help');
    if (appHelpElements.length > 0) {
      appHelpElements[0].scrollIntoView();
    }
  }

  scrollTo(id) {
    document.getElementById(id).scrollIntoView();
  }
}

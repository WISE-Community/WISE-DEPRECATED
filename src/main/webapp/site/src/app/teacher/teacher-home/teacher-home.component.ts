import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { ConfigService } from "../../services/config.service";
import { MatTabGroup } from '@angular/material';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { LibraryService } from '../../services/library.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.component.html',
  styleUrls: ['./teacher-home.component.scss']
})
export class TeacherHomeComponent implements OnInit {
  @ViewChild('tabs', { static: true }) tabs: MatTabGroup;

  user: User = new User();
  authoringToolLink: string = '';
  tabLinks: any[] = [
    { path: 'schedule', label: this.i18n('Class Schedule') },
    { path: 'library', label: this.i18n('Browse WISE Units') }
  ]

  constructor(private userService: UserService,
              private configService: ConfigService,
              private libraryService: LibraryService,
              private router: Router,
              private i18n: I18n) {
  }

  ngOnInit() {
    this.getUser();
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.authoringToolLink = `${this.configService.getContextPath()}/teacher-tool#!/edit/home`;
      }
    });
  }

  ngOnDestroy() {
    this.libraryService.clearAll();
  }

  getUser() {
    this.userService.getUser()
      .subscribe(user => {
        this.user = user;
      });
  }

  isRunListRoute(): boolean {
    return this.router.url === '/teacher/home/schedule';
  }
}

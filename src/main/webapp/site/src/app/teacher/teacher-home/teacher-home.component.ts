import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService } from '../../services/user.service';
import { User } from '../../domain/user';
import { ConfigService } from '../../services/config.service';
import { MatTabGroup } from '@angular/material/tabs';
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
  isDiscourseEnabled: boolean;
  tabLinks: any[] = [
    { path: 'schedule', label: $localize`Class Schedule` },
    { path: 'library', label: $localize`Unit Library` }
  ];

  constructor(
    private userService: UserService,
    private configService: ConfigService,
    private libraryService: LibraryService,
    private router: Router
  ) {}

  ngOnInit() {
    this.getUser();
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.authoringToolLink = `${this.configService.getContextPath()}/teacher/edit/home`;
        this.isDiscourseEnabled = this.configService.getDiscourseURL() != null;
      }
    });
  }

  ngOnDestroy() {
    this.libraryService.clearAll();
  }

  getUser() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
    });
  }

  openAuthoringTool() {
    this.router.navigateByUrl(this.authoringToolLink);
  }

  isRunListRoute(): boolean {
    return this.router.url === '/teacher/home/schedule';
  }
}

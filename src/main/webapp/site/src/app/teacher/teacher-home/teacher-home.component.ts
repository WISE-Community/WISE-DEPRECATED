import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { TeacherService } from "../teacher.service";
import { ConfigService } from "../../services/config.service";
import { MatTab, MatTabGroup, MatTabHeader } from '@angular/material';

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.component.html',
  styleUrls: ['./teacher-home.component.scss']
})
export class TeacherHomeComponent implements OnInit {
  @ViewChild('tabs') tabs: MatTabGroup;

  user: User = new User();
  selectedTabIndex: number = 0;
  authoringToolLink: string = '';

  constructor(private userService: UserService,
              private teacherService: TeacherService,
              private configService: ConfigService,
              private activatedRoute: ActivatedRoute) {
    teacherService.tabIndexSource$.subscribe((tabIndex) => {
      this.selectedTabIndex = tabIndex;
    });
  }

  ngOnInit() {
    this.getUser();
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.authoringToolLink = `${this.configService.getContextPath()}/author`;
      }
    });
    this.activatedRoute.data.subscribe(({ selectedTabIndex }) => {
      this.selectedTabIndex = selectedTabIndex;
      // this.teacherService.setTabIndex(selectedTabIndex);
    });
    // Workaround for intercepting mat-tab change events
    // https://stackoverflow.com/questions/51354135/how-to-conditionally-prevent-user-from-navigating-to-other-tab-in-mat-tab-group/51354403#51354403
    this.tabs._handleClick = this.interceptTabChange.bind(this);
  }

  getUser() {
    this.userService.getUser()
      .subscribe(user => {
        this.user = user;
      });
  }

  interceptTabChange(tab: MatTab, tabHeader: MatTabHeader, idx: number) {
    if (idx === 2) {
      window.location.href = this.authoringToolLink;
      return false;
    }
    MatTabGroup.prototype._handleClick.apply(this.tabs, arguments);
  }
}

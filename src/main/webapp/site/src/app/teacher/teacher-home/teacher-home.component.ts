import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";
import { TeacherService } from "../teacher.service";

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.component.html',
  styleUrls: ['./teacher-home.component.scss']
})
export class TeacherHomeComponent implements OnInit {

  user: User = new User();
  selectedTabIndex: number = 0;

  constructor(private userService: UserService,
              private teacherService: TeacherService) {
    teacherService.tabIndexSource$.subscribe((tabIndex) => {
      this.selectedTabIndex = tabIndex;
    });
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.userService.getUser()
      .subscribe(user => {
        this.user = user;
      });
  }

}

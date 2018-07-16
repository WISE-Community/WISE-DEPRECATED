import { Component, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { User } from "../../domain/user";

@Component({
  selector: 'app-teacher-home',
  templateUrl: './teacher-home.component.html',
  styleUrls: ['./teacher-home.component.scss']
})
export class TeacherHomeComponent implements OnInit {

  user: User = new User();

  constructor(private userService: UserService) { }

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

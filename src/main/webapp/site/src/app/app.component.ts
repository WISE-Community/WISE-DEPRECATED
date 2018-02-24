import { Component } from '@angular/core';
import {UserService} from "./user.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  user: User = {};

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

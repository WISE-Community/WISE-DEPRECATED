import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../domain/user';
import { UserService } from "../../services/user.service";
import { Observable } from "rxjs/Observable";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: User;

  location: string = ''; // current location
  role: string = '';
  url: string = '';

  constructor(private router: Router, private userService: UserService) {
    this.router = router;
    this.router.events.subscribe((event) => {
      this.url = this.router.url;
      if (this.url.includes('/teacher')) {
        this.location = 'teacher';
      } else if (this.url.includes('/student')) {
        this.location = 'student';
      } else {
        this.location = '';
      }
    });
  }

  ngOnInit() {
    this.getUser();
  }

  getUser() {
    this.userService.getUser()
      .subscribe(user => {
        this.user = user;
        if (user != null) {
          this.role = user.role;
        }
      });
  }
}

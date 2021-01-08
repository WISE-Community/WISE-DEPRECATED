import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../domain/user';
import { UserService } from '../../services/user.service';
import { UtilService } from '../../services/util.service';

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

  constructor(
    private router: Router,
    private userService: UserService,
    private utilService: UtilService
  ) {
    this.router = router;
    this.router.events.subscribe((event) => {
      this.setLocation();
    });
  }

  ngOnInit() {
    this.getUser();
    this.setLocation();
  }

  getUser() {
    this.userService.getUser().subscribe((user) => {
      this.user = user;
      if (user != null) {
        this.role = user.role;
      }
    });
  }

  setLocation() {
    this.url = this.router.url;
    if (this.url.match(/^\/teacher/)) {
      this.location = 'teacher';
    } else if (this.url.match(/^\/student/)) {
      this.location = 'student';
    } else {
      this.location = '';
    }
  }

  showMobileMenu() {
    this.utilService.showMobileMenu();
  }
}

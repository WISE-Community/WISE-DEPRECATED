import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: User;

  location: string = ''; // current location
  url: string = '';

  constructor(private router: Router) {
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
    // dummy user for testing
    this.user = {
      id: 1234,
      userName: 'DemoUser0101',
      firstName: 'Demo',
      lastName: 'User',
      role: 'student'
    }
  }

}

import { Component, OnInit } from '@angular/core';
import { User } from '../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  user: User;

  constructor() { }

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

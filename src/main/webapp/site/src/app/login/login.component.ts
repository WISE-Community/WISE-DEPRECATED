import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  ngOnInit(): void {
  }

  credentials = {username: '', password: ''};

  constructor(private userService: UserService, private http: HttpClient, private router: Router) {
  }

  login() {
    this.userService.authenticate(this.credentials, () => {
      this.router.navigateByUrl('/student');  // <- change me when teacher site is ready
    });
    return false;
  }
}

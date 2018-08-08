import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  credentials: any = {username: '', password: ''};
  error: boolean = false;

  constructor(private userService: UserService, private http: HttpClient,
      private router: Router) {
  }

  login(): boolean {
    this.error = false;
    this.userService.authenticate(this.credentials, () => {
      if (this.userService.isAuthenticated) {
        this.router.navigateByUrl(this.userService.getRedirectUrl());
      } else {
        this.error = true;
      }
    });
    return false;
  }

  public socialSignIn(socialPlatform : string) {
    window.location.href = "/wise/google-login";
  }
}

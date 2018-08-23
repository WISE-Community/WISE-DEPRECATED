import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

import { UserService } from '../services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['username'] != null) {
        this.credentials.username = params['username'];
        this.isShowGoogleLogin = false;
      }
    });
  }

  credentials: any = {username: '', password: ''};
  error: boolean = false;
  processing: boolean = false;
  isShowGoogleLogin: boolean = true;

  constructor(private userService: UserService, private http: HttpClient,
      private router: Router, private route: ActivatedRoute,) {
  }

  login(): boolean {
    this.processing = true;
    this.error = false;
    this.userService.authenticate(this.credentials, () => {
      if (this.userService.isAuthenticated) {
        this.router.navigateByUrl(this.userService.getRedirectUrl());
      } else {
        this.error = true;
        this.processing = false;
      }
    });
    return false;
  }
}

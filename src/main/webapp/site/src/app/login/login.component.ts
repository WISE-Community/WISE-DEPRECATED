import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { UserService } from '../services/user.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  credentials: any = {username: '', password: ''};
  error: boolean = false;
  processing: boolean = false;
  isGoogleAuthenticationEnabled: boolean = false;

  constructor(private userService: UserService, private http: HttpClient,
      private router: Router, private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.isGoogleAuthenticationEnabled = config.googleClientId != null;
      }
    });
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

  public socialSignIn(socialPlatform : string) {
    window.location.href = `${this.configService.getContextPath()}/google-login`;
  }
}

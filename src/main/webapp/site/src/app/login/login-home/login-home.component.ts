import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';

import { UserService } from '../../services/user.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-login',
  templateUrl: './login-home.component.html',
  styleUrls: ['./login-home.component.scss']
})
export class LoginHomeComponent implements OnInit {

  credentials: any = {username: '', password: '', recaptchaResponse: null};
  passwordError: boolean = false;
  processing: boolean = false;
  isGoogleAuthenticationEnabled: boolean = false;
  isShowGoogleLogin: boolean = true;
  recaptchaPublicKey: string = "";
  recaptchaResponse: string = "";
  isRecaptchaRequired: boolean = false;

  constructor(private userService: UserService, private http: HttpClient,
      private router: Router, private route: ActivatedRoute,
      private configService: ConfigService) {
  }

  ngOnInit(): void {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.isGoogleAuthenticationEnabled = config.googleClientId != null;
        this.recaptchaPublicKey = this.configService.getRecaptchaPublicKey();
      }
    });
    this.route.params.subscribe(params => {
      if (params['username'] != null) {
        this.credentials.username = params['username'];
        this.isShowGoogleLogin = false;
      }
    });
  }
  
  login(): boolean {
    this.processing = true;
    this.passwordError = false;
    this.userService.authenticate(this.credentials, () => {
      if (this.userService.isAuthenticated) {
        this.router.navigateByUrl(this.userService.getRedirectUrl());
      } else {
        this.processing = false;
        this.isRecaptchaRequired = this.userService.isRecaptchaRequired;
        if (this.isRecaptchaRequired) {
          this.passwordError = false;
        } else {
          this.passwordError = true;
        }
      }
    });
    return false;
  }

  public socialSignIn(socialPlatform : string) {
    window.location.href = `${this.configService.getContextPath()}/google-login`;
  }

  recaptchaResolved(recaptchaResponse) {
    this.recaptchaResponse = recaptchaResponse;
    this.credentials.recaptchaResponse = recaptchaResponse;
  }
}

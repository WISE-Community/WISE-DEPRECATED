import { Component, OnInit, ViewChild } from '@angular/core';
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
  credentials: any = { username: '', password: '', recaptchaResponse: null };
  passwordError: boolean = false;
  processing: boolean = false;
  isGoogleAuthenticationEnabled: boolean = false;
  isShowGoogleLogin: boolean = true;
  recaptchaPublicKey: string = '';
  isRecaptchaRequired: boolean = false;
  accessCode: string = '';
  @ViewChild('recaptchaRef', { static: false }) recaptchaRef: any;

  constructor(
    private userService: UserService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {}

  ngOnInit(): void {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.isGoogleAuthenticationEnabled = config.googleClientId != '';
        this.recaptchaPublicKey = this.configService.getRecaptchaPublicKey();
      }
      if (this.userService.isSignedIn()) {
        this.router.navigateByUrl(this.getRedirectUrl(''));
      }
    });
    this.route.params.subscribe((params) => {
      if (params['username'] != null) {
        this.credentials.username = params['username'];
        this.isShowGoogleLogin = false;
      }
    });
    this.route.queryParams.subscribe((params) => {
      if (params['username'] != null) {
        this.credentials.username = params['username'];
      }
      if (params['is-recaptcha-required'] != null) {
        this.isRecaptchaRequired = JSON.parse(params['is-recaptcha-required']);
      }
      if (params['accessCode'] != null) {
        this.accessCode = params['accessCode'];
      }
    });
  }

  login(): boolean {
    this.processing = true;
    this.passwordError = false;
    this.userService.authenticate(this.credentials, (response) => {
      if (this.userService.isAuthenticated) {
        this.router.navigateByUrl(this.getRedirectUrl(''));
      } else {
        this.processing = false;
        this.isRecaptchaRequired = response.isRecaptchaRequired;
        this.credentials.password = null;
        if (this.isRecaptchaRequired) {
          this.passwordError = false;
          this.addParametersToURL();
          this.resetRecaptcha();
        } else {
          this.passwordError = true;
        }
      }
    });
    return false;
  }

  public addParametersToURL() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        username: this.credentials.username,
        'is-recaptcha-required': true
      },
      queryParamsHandling: 'merge'
    });
  }

  public resetRecaptcha() {
    if (this.recaptchaRef != null) {
      this.recaptchaRef.reset();
    }
  }

  public socialSignIn(socialPlatform: string) {
    window.location.href = this.getRedirectUrl(socialPlatform);
  }

  recaptchaResolved(recaptchaResponse) {
    this.credentials.recaptchaResponse = recaptchaResponse;
  }

  getRedirectUrl(social: string): string {
    let redirectUrl = '';
    if (social === 'google') {
      redirectUrl = `${this.configService.getContextPath()}/google-login`;
    } else {
      redirectUrl = this.userService.getRedirectUrl();
    }
    if (this.accessCode !== '') {
      redirectUrl = `${redirectUrl}?accessCode=${this.accessCode}`;
    }
    return redirectUrl;
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService, GoogleLoginProvider } from "angular5-social-login";
import { Router } from "@angular/router";

@Component({
  selector: 'app-register-teacher',
  templateUrl: './register-teacher.component.html',
  styleUrls: ['./register-teacher.component.scss']
})
export class RegisterTeacherComponent implements OnInit {

  email: string;

  constructor(private socialAuthService: AuthService, private router: Router) {}

  ngOnInit() {
  }

  public signUp() {
    this.router.navigate(['join/teacher/form', { email: this.email} ]);
  }

  public socialSignIn(socialPlatform : string) {
    let socialPlatformProvider;
    if (socialPlatform == "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        this.router.navigate(['join/teacher/form',
          { gID: userData.id,
            name: userData.name,
            email: userData.email
          }
          ]);
      }
    );
  }
}

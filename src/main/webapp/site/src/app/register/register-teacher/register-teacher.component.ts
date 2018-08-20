import { Component, OnInit } from '@angular/core';
import { AuthService, GoogleLoginProvider } from "angularx-social-login";
import { Router } from "@angular/router";
import { TeacherService } from "../../teacher/teacher.service";

@Component({
  selector: 'app-register-teacher',
  templateUrl: './register-teacher.component.html',
  styleUrls: ['./register-teacher.component.scss']
})
export class RegisterTeacherComponent implements OnInit {

  email: string = "";

  constructor(private socialAuthService: AuthService,
      private teacherService: TeacherService, private router: Router) {}

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
        const googleUserID = userData.id;
        this.teacherService.isGoogleIdExists(googleUserID).subscribe((isExists) => {
          if (isExists) {
            this.router.navigate(['join/teacher/googleUserAlreadyExists']);
          } else {
            this.router.navigate(['join/teacher/form',
              { gID: googleUserID,
                name: userData.name,
                email: userData.email
              }
            ]);

          }
        });
      }
    );
  }
}

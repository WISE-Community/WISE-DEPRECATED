import { Component, OnInit } from '@angular/core';
import { AuthService, GoogleLoginProvider } from "angularx-social-login";
import { TeacherService } from "../../teacher/teacher.service";
import { Router } from "@angular/router";
import { StudentService } from '../../student/student.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-register-student',
  templateUrl: './register-student.component.html',
  styleUrls: ['./register-student.component.scss']
})
export class RegisterStudentComponent implements OnInit {

  firstName: string = "";
  lastName: string = "";

  constructor(private socialAuthService: AuthService,
              private studentService: StudentService, private userService: UserService,
              private router: Router) {}

  ngOnInit() {
  }

  public signUp() {
    this.router.navigate(['join/student/form', { firstName: this.firstName, lastName: this.lastName } ]);
  }

  public socialSignIn(socialPlatform : string) {
    let socialPlatformProvider;
    if (socialPlatform == "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        const googleUserID = userData.id;
        this.userService.isGoogleIdExists(googleUserID).subscribe((isExists) => {
          if (isExists) {
            this.router.navigate(['join/googleUserAlreadyExists']);
          } else {
            this.router.navigate(['join/student/form',
              { gID: googleUserID,
                name: userData.name
              }
            ]);

          }
        });
      }
    );
  }

}

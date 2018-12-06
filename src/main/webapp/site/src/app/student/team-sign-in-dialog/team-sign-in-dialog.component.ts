import { Component, Inject, Input, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { Student } from "../../domain/student";
import { StudentRun } from "../student-run";
import { MAT_DIALOG_DATA } from "@angular/material";
import { AuthService, GoogleLoginProvider } from "angularx-social-login";
import { ConfigService } from "../../services/config.service";

@Component({
  selector: 'app-team-sign-in-dialog',
  templateUrl: './team-sign-in-dialog.component.html',
  styleUrls: ['./team-sign-in-dialog.component.scss']
})
export class TeamSignInDialogComponent implements OnInit {

  user: Student;

  run: StudentRun = new StudentRun();

  teamMembers: any[] = [];

  showSignInForm: any = {};

  isSignedIn: any = {};

  isGoogleAuthenticationEnabled: boolean = false;

  constructor(private configService: ConfigService,
              private socialAuthService: AuthService,
              private userService: UserService,
              @Inject(MAT_DIALOG_DATA) public data: any) {
    this.run = this.data.run;
    this.user = <Student>this.getUser().getValue();
    for (let workgroupMember of this.run.workgroupMembers) {
      if (workgroupMember.id !== this.user.id) {
        this.teamMembers.push(workgroupMember);
      }
    }

    for (let i = this.teamMembers.length; i < this.run.studentsPerTeam - 1; i++) {
      this.teamMembers.push(new Student());
    }
  }

  getUser() {
    return this.userService.getUser();
  }

  signInTeamMember(userId) {
    this.showSignInForm[userId] = true;
  }

  isShowSignInButton(teamMember) {
    return !this.showSignInForm[teamMember.id];
  }

  isShowPasswordField(teamMember) {
    return this.showSignInForm[teamMember.id] &&
      !teamMember.isGoogleUser;
  }

  isShowSignInWithGoogle(teamMember) {
    return this.showSignInForm[teamMember.id] &&
      this.isGoogleAuthenticationEnabled &&
      teamMember.isGoogleUser;
  }

  signIn(user: any) {
    this.userService.checkAuthentication(user.userName, user.password).subscribe((response) => {
      this.isSignedIn[user.id] = response.isValid;
      if (response.isValid !== true) {
        alert("Invalid username or password. Please try again.");
      }
      user.password = null;
    });
  }

  socialSignIn(socialPlatform : string, userId: string) {
    let socialPlatformProvider;
    if (socialPlatform == "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        const googleUserID = userData.id;
        this.userService.isGoogleIdCorrect(googleUserID, userId).subscribe((isCorrect) => {
          this.isSignedIn[userId] = isCorrect;
          if (!isCorrect) {
            alert("Incorrect Google User. Please try again.");
          }
        });
      }
    );
  }

  ngOnInit() {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.isGoogleAuthenticationEnabled = config.googleClientId != null;
      }
    });
  }

}

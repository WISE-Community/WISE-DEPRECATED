import { Component, Inject, Input, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { Student } from "../../domain/student";
import { StudentRun } from "../student-run";
import { MAT_DIALOG_DATA } from "@angular/material";
import { AuthService, GoogleLoginProvider } from "angularx-social-login";
import { ConfigService } from "../../services/config.service";
import { StudentService } from "../student.service";

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
              private studentService: StudentService,
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

  ngOnInit() {
    this.configService.getConfig().subscribe((config) => {
      if (config != null) {
        this.isGoogleAuthenticationEnabled = config.googleClientId != null;
      }
    });
  }

  getUser() {
    return this.userService.getUser();
  }

  signInTeamMember(teamMember) {
    this.showSignInForm[teamMember.id] = true;
  }

  cancelSignInTeamMember(teamMember) {
    this.showSignInForm[teamMember.id] = false;
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

  launchRun() {
    const presentUserIds = [];
    presentUserIds.push(this.user.id);
    const absentUserIds = [];
    for (let member of this.teamMembers) {
      if (this.isSignedIn[member.id]) {
        presentUserIds.push(member.id);
      } else {
        absentUserIds.push(member.id);
      }
    }
    this.studentService.launchRun(this.run.id, this.run.workgroupId, presentUserIds, absentUserIds)
        .subscribe((response: any) => {
          window.location.href = response.startProjectUrl;
        });
  }
}

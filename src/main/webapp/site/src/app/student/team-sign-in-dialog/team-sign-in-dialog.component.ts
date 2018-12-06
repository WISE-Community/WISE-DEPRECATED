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
    if (this.run.workgroupMembers != null) {
      for (let workgroupMember of this.run.workgroupMembers) {
        if (workgroupMember.id !== this.user.id) {
          this.teamMembers.push(workgroupMember);
          this.markAsNotSignedIn(workgroupMember);
        }
      }
    }

    for (let i = this.teamMembers.length; i < this.run.studentsPerTeam - 1; i++) {
      const student = new Student();
      this.markAsNotSignedIn(student);
      this.teamMembers.push(student);
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

  isShowUsernameField(teamMember) {
    return this.showSignInForm[teamMember.id] &&
      !teamMember.isGoogleUser;
  }

  isShowPasswordField(teamMember) {
    return this.showSignInForm[teamMember.id] &&
      !teamMember.isGoogleUser;
  }

  isShowSignInWithGoogle(teamMember) {
    return this.showSignInForm[teamMember.id] &&
      this.isGoogleAuthenticationEnabled &&
      (teamMember.id == null || teamMember.isGoogleUser);
  }

  signIn(user: any) {
    this.userService.checkAuthentication(user.userName, user.password).subscribe((response) => {
      if (response.isValid === true) {
        user.id = response.userId;
      } else {
        alert("Invalid username or password. Please try again.");
      }
      this.isSignedIn[user.id] = response.isValid;
      user.password = null;
    });
  }

  socialSignIn(socialPlatform : string, teamMember: any) {
    let socialPlatformProvider;
    if (socialPlatform == "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        const userId = teamMember.id;
        const googleUserId = userData.id;
        if (userId == null) {
          this.userService.getUserByGoogleId(googleUserId).subscribe((response) => {
            if (response.status === 'success') {
              teamMember.id = response.userId;
              this.isSignedIn[teamMember.id] = true;
              teamMember.userName = response.userName;
              this.markAsSignedIn(teamMember);
            }
          });
        } else {
          this.userService.isGoogleIdCorrect(googleUserId, userId).subscribe((isCorrect) => {
            this.isSignedIn[userId] = isCorrect;
            if (isCorrect) {
              this.markAsSignedIn(teamMember);
            } else {
              alert("Incorrect Google User. Please try again.");
            }
          });
        }
      }
    );
  }

  markAsSignedIn(teamMember: any) {
    teamMember.status = 'signedIn';
  }

  markAsNotSignedIn(teamMember: any) {
    teamMember.status = 'notSignedIn';
  }

  markAsAbsent(teamMember: any) {
    teamMember.status = 'absent';
  }

  launchRun() {
    const presentUserIds = [];
    presentUserIds.push(this.user.id);
    const absentUserIds = [];
    for (let member of this.teamMembers) {
      if (member.id != null) {
        if (this.isSignedIn[member.id]) {
          presentUserIds.push(member.id);
        } else {
          absentUserIds.push(member.id);
        }
      }
    }
    this.studentService.launchRun(this.run.id, this.run.workgroupId, presentUserIds, absentUserIds)
        .subscribe((response: any) => {
          window.location.href = response.startProjectUrl;
        });
  }
}

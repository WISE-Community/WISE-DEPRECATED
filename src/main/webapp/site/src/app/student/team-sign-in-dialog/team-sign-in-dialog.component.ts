import { Component, Inject, Input, OnInit } from '@angular/core';
import { UserService } from "../../services/user.service";
import { Student } from "../../domain/student";
import { StudentRun } from "../student-run";
import { MAT_DIALOG_DATA } from "@angular/material";
import { AuthService, GoogleLoginProvider } from "angularx-social-login";
import { ConfigService } from "../../services/config.service";
import { StudentService } from "../student.service";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-team-sign-in-dialog',
  templateUrl: './team-sign-in-dialog.component.html',
  styleUrls: ['./team-sign-in-dialog.component.scss']
})
export class TeamSignInDialogComponent implements OnInit {

  user: Student;
  run: StudentRun = new StudentRun();
  teamMembers: any[] = [];
  hiddenMembers: boolean[] = [];
  showSignInForm: any = {};
  isGoogleAuthenticationEnabled: boolean = false;
  canLaunch: boolean = false;

  constructor(private configService: ConfigService,
              private socialAuthService: AuthService,
              private userService: UserService,
              private studentService: StudentService,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private i18n: I18n) {
    this.run = this.data.run;
    this.user = <Student>this.getUser().getValue();
    if (this.run.workgroupMembers != null) {
      for (let workgroupMember of this.run.workgroupMembers) {
        if (workgroupMember.id !== this.user.id) {
          this.hiddenMembers.push(false);
          this.teamMembers.push(workgroupMember);
          this.markAsNotSignedIn(workgroupMember);
        }
      }
    }

    for (let i = this.teamMembers.length; i < this.run.maxStudentsPerTeam - 1; i++) {
      const student = new Student();
      this.markAsNotSignedIn(student);
      this.hiddenMembers.push(true);
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

  isShowUsernameField(teamMember) {
    return !this.isExistingStudent(teamMember);
  }

  isShowPasswordField(teamMember) {
    return this.isNotSignedIn(teamMember) && !this.isGoogleUser(teamMember);
  }

  isShowSignInWithGoogle(teamMember) {
    return this.isNotSignedIn(teamMember) && this.isGoogleAuthenticationEnabled &&
        (!this.isExistingStudent(teamMember) || this.isGoogleUser(teamMember));
  }

  signIn(teamMember: any) {
    this.userService.checkAuthentication(teamMember.userName, teamMember.password).subscribe((response) => {
      if (response.isValid === true) {
        this.studentService.canBeAddedToWorkgroup(this.run.id, this.run.workgroupId, response.userId)
              .subscribe((canBeAddedToWorkgroupResponse) => {
          if (canBeAddedToWorkgroupResponse.status && !canBeAddedToWorkgroupResponse.isTeacher) {
            teamMember.id = response.userId;
            teamMember.userName = response.userName;
            teamMember.firstName = response.firstName;
            teamMember.lastName = response.lastName;
            this.markAsSignedIn(teamMember);
          } else if (canBeAddedToWorkgroupResponse.isTeacher) {
            alert(this.i18n('A teacher cannot be added as a team member.'));
            teamMember.userName = null;
          } else {
            alert(this.i18n('{{firstName}} {{lastName}} is already on another team.', {firstName: response.firstName, lastName: response.lastName}));
            teamMember.userName = null;
          }
        });
      } else {
        alert(this.i18n('Invalid username or password. Please try again.'));
      }
      teamMember.password = null;
    });
  }

  socialSignIn(socialPlatform : string, teamMember: any) {
    let socialPlatformProvider;
    if (socialPlatform == "google"){
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then(
      (userData) => {
        const googleUserId = userData.id;
        if (this.isExistingStudent(teamMember)) {
          this.userService.isGoogleIdCorrect(googleUserId, teamMember.id).subscribe((isCorrect) => {
            if (isCorrect) {
              this.markAsSignedIn(teamMember);
            } else {
              alert(this.i18n('Incorrect Google user. Please try again.'));
            }
          });
        } else {
          this.userService.getUserByGoogleId(googleUserId).subscribe((response) => {
            if (response.status === 'success') {
              this.studentService.canBeAddedToWorkgroup(this.run.id, this.run.workgroupId, response.userId)
                .subscribe((canBeAddedToWorkgroupResponse) => {
                  if (canBeAddedToWorkgroupResponse.status && !canBeAddedToWorkgroupResponse.isTeacher) {
                    teamMember.id = response.userId;
                    teamMember.userName = response.userName;
                    teamMember.firstName = response.firstName;
                    teamMember.lastName = response.lastName;
                    this.markAsSignedIn(teamMember);
                  } else if (canBeAddedToWorkgroupResponse.isTeacher) {
                    alert(this.i18n('A teacher cannot be added as a team member.'));
                  } else {
                    alert(this.i18n('{{firstName}} {{lastName}} is already on another team.', {firstName: response.firstName, lastName: response.lastName}));
                  }
                });
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

  toggleAbsent(teamMember: any, isAbsent: boolean) {
    isAbsent ? teamMember.status = 'absent' : teamMember.status = 'notSignedIn';
  }

  isGoogleUser(teamMember: any) {
    return teamMember.isGoogleUser;
  }

  isSignedIn(teamMember: any) {
    return teamMember.status === 'signedIn';
  }

  isNotSignedIn(teamMember: any) {
    return teamMember.status === 'notSignedIn';
  }

  isAbsent(teamMember: any) {
    return teamMember.status === 'absent';
  }

  isExistingStudent(teamMember: any) {
    return teamMember.id != null;
  }

  isCanLaunch() {
    for (let teamMember of this.teamMembers) {
      if (this.isExistingStudent(teamMember) && this.isNotSignedIn(teamMember)) {
        return false;
      }
    }
    return true;
  }

  launchRun() {
    const presentUserIds = [];
    presentUserIds.push(this.user.id);
    const absentUserIds = [];
    for (let member of this.teamMembers) {
      if (member.id != null) {
        if (member.status === 'signedIn') {
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

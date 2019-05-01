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
    this.userService.checkAuthentication(teamMember.username, teamMember.password).subscribe((response) => {
      if (response.isUsernameValid === true && response.isPasswordValid === true) {
        this.studentService.canBeAddedToWorkgroup(this.run.id, this.run.workgroupId, response.userId)
              .subscribe((canBeAddedToWorkgroupResponse) => {
          if (canBeAddedToWorkgroupResponse.isTeacher) {
            alert(this.i18n('A teacher cannot be added as a team member.'));
            teamMember.username = null;
          } else if (canBeAddedToWorkgroupResponse.status && this.allowSignIn(teamMember, 1)) {
            let index = 0;
            for (const member of canBeAddedToWorkgroupResponse.members) {
              const currentMember = this.teamMembers[index];
              currentMember.id = member.id;
              currentMember.username = member.username;
              currentMember.firstName = member.firstName;
              currentMember.lastName = member.lastName;
              this.hiddenMembers[index] = false;
              this.markAsNotSignedIn(currentMember);
              index++;
            }
            this.markAsSignedIn(teamMember);
            if (canBeAddedToWorkgroupResponse.addUserToWorkgroup) {
              this.run.workgroupId = canBeAddedToWorkgroupResponse.workgroupId;
            }
          } else if (canBeAddedToWorkgroupResponse.members.length === this.run.maxStudentsPerTeam) {
            alert(this.i18n('{{firstName}} {{lastName}} is already in a team that is full.', {firstName: response.firstName, lastName: response.lastName}))
          } else if (!this.allowSignIn(teamMember, 1)) {
            alert(this.i18n('{{firstName}} {{lastName}} is already in the team.', {firstName: response.firstName, lastName: response.lastName}));
            if (!this.isExistingStudent(teamMember)) {
              teamMember.username = null;
            }
          } else {
            alert(this.i18n('{{firstName}} {{lastName}} is already on another team.', {firstName: response.firstName, lastName: response.lastName}));
            teamMember.username = null;
          }
        });
      } else if (response.isUsernameValid !== true) {
        alert(this.i18n('Invalid username. Please try again.'));
        teamMember.username = null;
      } else if (response.isPasswordValid !== true) {
        alert(this.i18n('Invalid password. Please try again.'));
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
                  if (canBeAddedToWorkgroupResponse.isTeacher) {
                    alert(this.i18n('A teacher cannot be added as a team member.'));
                  } else if (canBeAddedToWorkgroupResponse.status && this.allowSignIn(response, 0)) {
                    for (const member of canBeAddedToWorkgroupResponse.members) {
                      this.teamMembers.push({ id: member.id, username: member.username, firstName: member.firstName, lastName: member.lastName });
                    }
                    this.markAsSignedIn(teamMember);
                  } else if (canBeAddedToWorkgroupResponse.members.length === this.run.maxStudentsPerTeam) {
                    alert(this.i18n('{{firstName}} {{lastName}} is already in a team that is full.', {firstName: response.firstName, lastName: response.lastName}))
                  } else if (!this.allowSignIn(response, 0)) {
                    alert(this.i18n('{{firstName}} {{lastName}} is already in the team.', {firstName: response.firstName, lastName: response.lastName}));
                  } else {
                    alert(this.i18n('{{firstName}} {{lastName}} is already on another team.', {firstName: response.firstName, lastName: response.lastName}));
                  }
                });
            } else if (response.status === 'error') {
              alert(this.i18n('No WISE user with this Google ID found.'));
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


  allowSignIn(teamMember: any, numMembersExpected: number) {
    if (teamMember.username === this.user.username) {
      return false;
    }
    const membersWithSameUsername = this.teamMembers.filter(({ username }) => {
      return username !== undefined && username === teamMember.username;
    });
    return membersWithSameUsername.length === numMembersExpected;
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

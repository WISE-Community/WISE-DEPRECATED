import { Component, Inject, Input, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Student } from '../../domain/student';
import { StudentRun } from '../student-run';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AuthService, GoogleLoginProvider } from 'angularx-social-login';
import { ConfigService } from '../../services/config.service';
import { StudentService } from '../student.service';
import { Router } from '@angular/router';

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

  constructor(
    private configService: ConfigService,
    private socialAuthService: AuthService,
    private userService: UserService,
    private studentService: StudentService,
    private router: Router,
    public dialogRef: MatDialogRef<TeamSignInDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
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
    return (
      this.isNotSignedIn(teamMember) &&
      this.isGoogleAuthenticationEnabled &&
      (!this.isExistingStudent(teamMember) || this.isGoogleUser(teamMember))
    );
  }

  signIn(teamMember: any) {
    this.userService
      .checkAuthentication(teamMember.username, teamMember.password)
      .subscribe((response) => {
        if (response.isUsernameValid === true && response.isPasswordValid === true) {
          this.studentService
            .canBeAddedToWorkgroup(this.run.id, this.run.workgroupId, response.userId)
            .subscribe((canBeAddedToWorkgroupResponse) => {
              if (canBeAddedToWorkgroupResponse.isTeacher) {
                alert($localize`A teacher cannot be added as a team member.`);
                teamMember.username = null;
              } else if (canBeAddedToWorkgroupResponse.status && this.allowSignIn(teamMember, 1)) {
                for (const member of canBeAddedToWorkgroupResponse.workgroupMembers) {
                  if (!this.isLoggedInUser(member.username)) {
                    const currentMember = this.getTeamMemberByUsernameOrAvailableSlot(
                      member.username
                    );
                    this.updateTeamMember(this.teamMembers.indexOf(currentMember), member);
                  }
                }
                this.markAsSignedIn(teamMember);
                if (canBeAddedToWorkgroupResponse.addUserToWorkgroup) {
                  this.run.workgroupId = canBeAddedToWorkgroupResponse.workgroupId;
                }
              } else if (
                canBeAddedToWorkgroupResponse.workgroupMembers.length ===
                this.run.maxStudentsPerTeam
              ) {
                alert(
                  $localize`${this.getNameDisplay(
                    response
                  )}:studentName: is already in a team that is full`
                );
                teamMember.username = null;
              } else if (!this.allowSignIn(teamMember, 1)) {
                alert(
                  $localize`${this.getNameDisplay(response)}:studentName: is already in the team`
                );
                if (!this.isExistingStudent(teamMember)) {
                  teamMember.username = null;
                }
              } else {
                alert(
                  $localize`${this.getNameDisplay(
                    response
                  )}:studentName: is already on another team`
                );
                teamMember.username = null;
              }
            });
        } else if (response.isUsernameValid !== true) {
          alert($localize`Invalid username. Please try again.`);
          teamMember.username = null;
        } else if (response.isPasswordValid !== true) {
          alert($localize`Invalid password. Please try again.`);
        }
        teamMember.password = null;
      });
  }

  socialSignIn(socialPlatform: string, teamMember: any) {
    let socialPlatformProvider;
    if (socialPlatform == 'google') {
      socialPlatformProvider = GoogleLoginProvider.PROVIDER_ID;
    }

    this.socialAuthService.signIn(socialPlatformProvider).then((userData) => {
      const googleUserId = userData.id;
      if (this.isExistingStudent(teamMember)) {
        this.userService.isGoogleIdCorrect(googleUserId, teamMember.id).subscribe((isCorrect) => {
          if (isCorrect) {
            this.markAsSignedIn(teamMember);
          } else {
            alert($localize`Incorrect Google user. Please try again.`);
          }
        });
      } else {
        this.userService.getUserByGoogleId(googleUserId).subscribe((response) => {
          if (response.status === 'success') {
            this.studentService
              .canBeAddedToWorkgroup(this.run.id, this.run.workgroupId, response.userId)
              .subscribe((canBeAddedToWorkgroupResponse) => {
                if (canBeAddedToWorkgroupResponse.isTeacher) {
                  alert($localize`A teacher cannot be added as a team member.`);
                } else if (canBeAddedToWorkgroupResponse.status && this.allowSignIn(response, 0)) {
                  for (const member of canBeAddedToWorkgroupResponse.workgroupMembers) {
                    if (!this.isLoggedInUser(member.username)) {
                      const currentMember = this.getTeamMemberByUsernameOrAvailableSlot(
                        member.username
                      );
                      this.updateTeamMember(this.teamMembers.indexOf(currentMember), member);
                    }
                  }
                  this.markAsSignedIn(teamMember);
                } else if (
                  canBeAddedToWorkgroupResponse.workgroupMembers.length ===
                  this.run.maxStudentsPerTeam
                ) {
                  alert(
                    $localize`${this.getNameDisplay(
                      response
                    )}:studentName: is already in a team that is full`
                  );
                } else if (!this.allowSignIn(response, 0)) {
                  alert(
                    $localize`${this.getNameDisplay(response)}:studentName: is already in the team`
                  );
                } else {
                  alert(
                    $localize`${this.getNameDisplay(
                      response
                    )}:studentName: is already on another team`
                  );
                }
              });
          } else if (response.status === 'error') {
            alert($localize`No WISE user with this Google ID found.`);
          }
        });
      }
    });
  }

  markAsSignedIn(teamMember: any) {
    teamMember.status = 'signedIn';
  }

  markAsNotSignedIn(teamMember: any) {
    teamMember.status = 'notSignedIn';
  }

  toggleAbsent(teamMember: any, isAbsent: boolean) {
    isAbsent ? (teamMember.status = 'absent') : (teamMember.status = 'notSignedIn');
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

  isLoggedInUser(username: string): boolean {
    return this.user.username === username;
  }

  isCanLaunch() {
    for (let teamMember of this.teamMembers) {
      if (this.isExistingStudent(teamMember) && this.isNotSignedIn(teamMember)) {
        return false;
      }
    }
    return true;
  }

  getTeamMemberByUsernameOrAvailableSlot(username: string) {
    for (const teamMember of this.teamMembers) {
      if (teamMember.username === username) {
        return teamMember;
      }
    }
    for (const teamMember of this.teamMembers) {
      if (!teamMember.username) {
        return teamMember;
      }
    }
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
    const presentUserIds = [this.user.id];
    const absentUserIds = [];
    for (const member of this.teamMembers) {
      if (member.id != null) {
        if (member.status === 'signedIn') {
          presentUserIds.push(member.id);
        } else {
          absentUserIds.push(member.id);
        }
      }
    }
    this.studentService
      .launchRun(this.run.id, this.run.workgroupId, presentUserIds, absentUserIds)
      .subscribe((response: any) => {
        if (response.status === 'error') {
          let targetMember;
          if (this.isLoggedInUserInWorkgroup(response.workgroupMembers)) {
            this.updateTeamMembers(response.workgroupMembers);
            targetMember = this.user;
          } else {
            targetMember = this.removeTeamMembersAlreadyInAWorkgroup(response.workgroupMembers);
          }
          const teamMatesDisplay = this.getWorkgroupTeammatesDisplay(
            response.workgroupMembers,
            targetMember.username
          );
          setTimeout(() => {
            alert(
              $localize`${this.getNameDisplay(
                targetMember
              )}:studentName: is already in a team with ${teamMatesDisplay}:studentNames:`
            );
          }, 100);
        } else {
          this.router.navigateByUrl(response.startProjectUrl);
          this.dialogRef.close();
        }
      });
  }

  getNameDisplay(user: any) {
    return `${user.firstName} ${user.lastName} (${user.username})`;
  }

  getWorkgroupTeammatesDisplay(workgroupMembers: any[], targetUsername: string) {
    const teamMateNameDisplays = [];
    for (const workgroupMember of workgroupMembers) {
      if (workgroupMember.username !== targetUsername) {
        teamMateNameDisplays.push(this.getNameDisplay(workgroupMember));
      }
    }
    if (teamMateNameDisplays.length <= 1) {
      return teamMateNameDisplays.join();
    }
    const lastNameDisplay = teamMateNameDisplays.pop();
    return `${teamMateNameDisplays.join(', ')} and ${lastNameDisplay}`;
  }

  isLoggedInUserInWorkgroup(workgroupMembers: any[]) {
    for (const member of workgroupMembers) {
      if (this.isLoggedInUser(member.username)) {
        return true;
      }
    }
    return false;
  }

  updateTeamMembers(workgroupMembers: any[]) {
    const existingWorkgroupMembersNotSignedIn = this.getExistingWorkgroupMembersNotSignedIn(
      workgroupMembers
    );
    const existingWorkgroupMembersUsernames = workgroupMembers.map((member) => {
      return member.username;
    });
    let existingWorkgroupMemberIndex = 0;
    this.teamMembers.forEach((teamMember, index) => {
      if (!existingWorkgroupMembersUsernames.includes(teamMember.username)) {
        this.clearTeamMember(index);
        if (existingWorkgroupMemberIndex < existingWorkgroupMembersNotSignedIn.length) {
          this.updateTeamMember(
            index,
            existingWorkgroupMembersNotSignedIn[existingWorkgroupMemberIndex]
          );
          existingWorkgroupMemberIndex++;
        }
      }
    });
  }

  updateTeamMember(index: number, workgroupMember: any) {
    this.teamMembers[index].username = workgroupMember.username;
    this.teamMembers[index].firstName = workgroupMember.firstName;
    this.teamMembers[index].lastName = workgroupMember.lastName;
    this.teamMembers[index].id = workgroupMember.id;
    this.teamMembers[index].isGoogleUser = workgroupMember.isGoogleUser;
    this.hiddenMembers[index] = false;
  }

  getExistingWorkgroupMembersNotSignedIn(workgroupMembers: any[]): any[] {
    const teamMembersUsernames = this.teamMembers.map((member) => {
      return member.username;
    });
    const existingWorkgroupMembersNotSignedIn = [];
    for (const workgroupMember of workgroupMembers) {
      if (
        !this.isLoggedInUser(workgroupMember.username) &&
        !teamMembersUsernames.includes(workgroupMember.username)
      ) {
        existingWorkgroupMembersNotSignedIn.push(workgroupMember);
      }
    }
    return existingWorkgroupMembersNotSignedIn;
  }

  removeTeamMembersAlreadyInAWorkgroup(workgroupMembers: any[]): any {
    const workgroupMembersUsernames = workgroupMembers.map((member) => {
      return member.username;
    });
    let removedMember = null;
    this.teamMembers.forEach((teamMember, index) => {
      if (workgroupMembersUsernames.includes(teamMember.username)) {
        this.clearTeamMember(index);
        removedMember = teamMember;
      }
    });
    return removedMember;
  }

  clearTeamMember(index: number) {
    this.teamMembers[index] = new Student();
    this.markAsNotSignedIn(this.teamMembers[index]);
    this.hiddenMembers[index] = true;
  }
}

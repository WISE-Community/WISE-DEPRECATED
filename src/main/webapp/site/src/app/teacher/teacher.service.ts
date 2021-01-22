import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { Project } from '../domain/project';
import { Teacher } from '../domain/teacher';
import { Run } from '../domain/run';
import { Course } from '../domain/course';
import { CopyProjectDialogComponent } from '../modules/library/copy-project-dialog/copy-project-dialog.component';

@Injectable()
export class TeacherService {
  private runsUrl = '/api/teacher/runs';
  private sharedRunsUrl = '/api/teacher/sharedruns';
  private registerUrl = '/api/teacher/register';
  private runPermissionUrl = '/api/teacher/run/permission';
  private projectPermissionUrl = '/api/teacher/project/permission';
  private transferRunOwnershipUrl = '/api/teacher/run/permission/transfer';
  private usernamesUrl = '/api/teacher/usernames';
  private createRunUrl = '/api/teacher/run/create';
  private runUrl = '/api/teacher/run';
  private lastRunUrl = '/api/teacher/projectlastrun';
  private addPeriodToRunUrl = '/api/teacher/run/add/period';
  private deletePeriodFromRunUrl = '/api/teacher/run/delete/period';
  private updateRunStudentsPerTeamUrl = '/api/teacher/run/update/studentsperteam';
  private updateRunStartTimeUrl = '/api/teacher/run/update/starttime';
  private updateRunEndTimeUrl = '/api/teacher/run/update/endtime';
  private updateRunIsLockedAfterEndDateUrl = '/api/teacher/run/update/islockedafterenddate';
  private forgotUsernameUrl = '/api/teacher/forgot/username';
  private forgotPasswordUrl = '/api/teacher/forgot/password';
  private getVerificationCodeUrl = '/api/teacher/forgot/password/verification-code';
  private checkVerificationCodeUrl = '/api/teacher/forgot/password/verification-code';
  private changePasswordUrl = '/api/teacher/forgot/password/change';
  private classroomAuthorizationUrl = '/api/google-classroom/get-authorization-url';
  private listCoursesUrl = '/api/google-classroom/list-courses';
  private addAssignmentUrl = '/api/google-classroom/create-assignment';
  private newProjectSource = new Subject<Project>();
  public newProjectSource$ = this.newProjectSource.asObservable();
  private newRunSource = new Subject<Run>();
  public newRunSource$ = this.newRunSource.asObservable();
  private updateProfileUrl = '/api/teacher/profile/update';

  constructor(private http: HttpClient) {}

  copyProject(project: Project, dialog: MatDialog) {
    dialog.open(CopyProjectDialogComponent, {
      data: { project: project },
      panelClass: 'mat-dialog--sm'
    });
  }

  getRuns(): Observable<Run[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<Run[]>(this.runsUrl, { headers: headers });
  }

  getSharedRuns(): Observable<Run[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<Run[]>(this.sharedRunsUrl, { headers: headers });
  }

  getRun(runId: number): Observable<Run> {
    return this.http.get<Run>(`${this.runUrl}/${runId}`);
  }

  getProjectLastRun(projectId: number): Observable<Run> {
    return this.http.get<Run>(`${this.lastRunUrl}/${projectId}`);
  }

  registerTeacherAccount(teacherUser: Teacher): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };
    return this.http.post(this.registerUrl, teacherUser, {
      headers: headers,
      responseType: 'json'
    });
  }

  createRun(
    projectId: number,
    periods: string,
    maxStudentsPerTeam: number,
    startDate: number,
    endDate: number,
    isLockedAfterEndDate: boolean
  ): Observable<Run> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('projectId', projectId + '');
    body = body.set('periods', periods);
    body = body.set('maxStudentsPerTeam', maxStudentsPerTeam + '');
    body = body.set('startDate', startDate + '');
    if (endDate) {
      body = body.set('endDate', endDate + '');
      body = body.set('isLockedAfterEndDate', isLockedAfterEndDate + '');
    }
    return this.http.post<Run>(this.createRunUrl, body, { headers: headers });
  }

  retrieveAllTeacherUsernames(): Observable<string[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<string[]>(this.usernamesUrl, { headers: headers });
  }

  addSharedOwner(runId: number, teacherUsername: string) {
    const url = `${this.runPermissionUrl}/${runId}/${teacherUsername}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<Object>(url, null, { headers: headers });
  }

  transferRunOwnership(runId: number, teacherUsername: string) {
    const url = `${this.transferRunOwnershipUrl}/${runId}/${teacherUsername}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<Object>(url, null, { headers: headers });
  }

  removeSharedOwner(runId: number, username: string) {
    const url = `${this.runPermissionUrl}/${runId}/${username}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<Object>(url, { headers: headers });
  }

  addSharedOwnerRunPermission(runId: number, userId: string, permissionId: number) {
    const url = `${this.runPermissionUrl}/${runId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<any>(url, null, { headers: headers });
  }

  removeSharedOwnerRunPermission(runId: number, userId: string, permissionId: number) {
    const url = `${this.runPermissionUrl}/${runId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<any>(url, { headers: headers });
  }

  addSharedOwnerProjectPermission(projectId: number, userId: string, permissionId: number) {
    const url = `${this.projectPermissionUrl}/${projectId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<Object>(url, { headers: headers });
  }

  removeSharedOwnerProjectPermission(projectId: number, userId: string, permissionId: number) {
    const url = `${this.projectPermissionUrl}/${projectId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<Object>(url, { headers: headers });
  }

  addSharedProjectOwner(projectId: number, username: string) {
    const url = `${this.projectPermissionUrl}/${projectId}/${username}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<Object>(url, null, { headers: headers });
  }

  removeSharedProjectOwner(projectId: number, username: string) {
    const url = `${this.projectPermissionUrl}/${projectId}/${username}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<Object>(url, { headers: headers });
  }

  addNewRun(run: Run) {
    this.newRunSource.next(run);
  }

  updateProfile(
    username,
    displayName,
    email,
    city,
    state,
    country,
    schoolName,
    schoolLevel,
    language
  ) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('displayName', displayName);
    body = body.set('email', email);
    body = body.set('city', city);
    body = body.set('state', state);
    body = body.set('country', country);
    body = body.set('schoolName', schoolName);
    body = body.set('schoolLevel', schoolLevel);
    body = body.set('language', language);
    return this.http.post<any>(this.updateProfileUrl, body, { headers: headers });
  }

  addPeriodToRun(runId: number, periodName: string) {
    const url = `${this.addPeriodToRunUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', runId + '');
    body = body.set('periodName', periodName);
    return this.http.post<Object>(url, body, { headers: headers });
  }

  deletePeriodFromRun(runId: number, periodName: string) {
    const url = `${this.deletePeriodFromRunUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', runId + '');
    body = body.set('periodName', periodName);
    return this.http.post<Object>(url, body, { headers: headers });
  }

  updateRunStudentsPerTeam(runId: number, maxStudentsPerTeam: number) {
    const url = `${this.updateRunStudentsPerTeamUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', runId + '');
    body = body.set('maxStudentsPerTeam', maxStudentsPerTeam + '');
    return this.http.post<Object>(url, body, { headers: headers });
  }

  updateRunStartTime(runId: number, startTime: number) {
    const url = `${this.updateRunStartTimeUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', runId + '');
    body = body.set('startTime', startTime + '');
    return this.http.post<Object>(url, body, { headers: headers });
  }

  updateRunEndTime(runId: number, endTime: number) {
    const url = `${this.updateRunEndTimeUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', runId + '');
    if (endTime != null) {
      body = body.set('endTime', endTime + '');
    }
    return this.http.post<Object>(url, body, { headers: headers });
  }

  updateIsLockedAfterEndDate(runId: number, isLockedAfterEndDate: boolean) {
    const url = `${this.updateRunIsLockedAfterEndDateUrl}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = new HttpParams()
      .set('runId', runId + '')
      .set('isLockedAfterEndDate', isLockedAfterEndDate + '');
    return this.http.post<Object>(url, body, { headers: headers });
  }

  sendForgotUsernameEmail(email) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const params = new HttpParams().set('email', email);
    return this.http.post<any>(this.forgotUsernameUrl, params, { headers: headers });
  }

  sendForgotPasswordEmail(username) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const params = new HttpParams().set('username', username);
    return this.http.post<any>(this.forgotPasswordUrl, params, { headers: headers });
  }

  getVerificationCodeEmail(username) {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(this.getVerificationCodeUrl, { headers: headers, params: params });
  }

  checkVerificationCode(username, verificationCode) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params = params.set('username', username);
    params = params.set('verificationCode', verificationCode);
    return this.http.post<any>(this.checkVerificationCodeUrl, params, { headers: headers });
  }

  changePassword(username, verificationCode, password, confirmPassword) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams();
    params = params.set('username', username);
    params = params.set('verificationCode', verificationCode);
    params = params.set('password', password);
    params = params.set('confirmPassword', confirmPassword);
    return this.http.post<any>(this.changePasswordUrl, params, { headers: headers });
  }

  getClassroomAuthorizationUrl(username: string): Observable<any> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    let params = new HttpParams();
    params = params.set('username', username);
    return this.http.get<any>(this.classroomAuthorizationUrl, { headers, params });
  }

  getClassroomCourses(username: string): Observable<Course[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    let params = new HttpParams();
    params = params.set('username', username);
    return this.http.get<Course[]>(this.listCoursesUrl, { headers, params });
  }

  addToClassroom(
    accessCode: string,
    unitTitle: string,
    courseIds: string[],
    username: string,
    endTime: string,
    description: string
  ): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    let params = new HttpParams()
      .set('accessCode', accessCode)
      .set('unitTitle', unitTitle)
      .set('username', username)
      .set('endTime', endTime)
      .set('description', description)
      .set('courseIds', JSON.stringify(courseIds));
    return this.http.post<any>(this.addAssignmentUrl, params, { headers });
  }
}

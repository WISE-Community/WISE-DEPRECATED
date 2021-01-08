import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { RunInfo } from './run-info';
import { Student } from '../domain/student';
import { StudentRun } from './student-run';
import { Run } from '../domain/run';

@Injectable()
export class StudentService {
  private runsUrl = 'api/student/runs';
  private runInfoUrl = 'api/student/run/info';
  private runInfoByIdUrl = 'api/student/run/info-by-id';
  private addRunUrl = 'api/student/run/register';
  private launchRunUrl = 'api/student/run/launch';
  private registerUrl = 'api/student/register';
  private securityQuestionsUrl = 'api/student/register/questions';
  private updateProfileUrl = 'api/student/profile/update';
  private teacherListUrl = 'api/student/teacher-list';
  private usernameSearchUrl = 'api/student/forgot/username/search';
  private getSecurityQuestionUrl = 'api/student/forgot/password/security-question';
  private checkSecurityAnswerUrl = 'api/student/forgot/password/security-question';
  private changePasswordUrl = 'api/student/forgot/password/change';
  private canBeAddedToWorkgroupUrl = 'api/student/can-be-added-to-workgroup';

  private newRunSource = new Subject<StudentRun>();
  newRunSource$ = this.newRunSource.asObservable();

  constructor(private http: HttpClient) {}

  getRuns(): Observable<StudentRun[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http
      .get<StudentRun[]>(this.runsUrl, { headers: headers })
      .pipe(tap((runs) => this.log(`fetched runs`)));
  }

  getRunInfo(runCode: string): Observable<RunInfo> {
    let params = new HttpParams().set('runCode', runCode);
    return this.http.get<RunInfo>(this.runInfoUrl, { params: params });
  }

  getRunInfoById(runId: number): Observable<RunInfo> {
    let params = new HttpParams().set('runId', String(runId));
    return this.http.get<RunInfo>(this.runInfoByIdUrl, { params });
  }

  addRun(runCode: string, period: string): Observable<StudentRun> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runCode', runCode);
    body = body.set('period', period);
    return this.http.post<StudentRun>(this.addRunUrl, body, { headers: headers });
  }

  launchRun(runId: number, workgroupId: number, presentUserIds: number[], absentUserIds: number[]) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runId', String(runId));
    if (workgroupId != null) {
      body = body.set('workgroupId', String(workgroupId));
    }
    body = body.set('presentUserIds', JSON.stringify(presentUserIds));
    body = body.set('absentUserIds', JSON.stringify(absentUserIds));
    return this.http.post(this.launchRunUrl, body, { headers: headers });
  }

  private log(message: string) {
    console.log('StudentService: ' + message);
  }

  addNewProject(run: StudentRun) {
    this.newRunSource.next(run);
  }

  registerStudentAccount(studentUser: Student): Observable<any> {
    const headers = {
      'Content-Type': 'application/json'
    };
    return this.http.post(this.registerUrl, studentUser, {
      headers: headers,
      responseType: 'json'
    });
  }

  retrieveSecurityQuestions(): Observable<Object> {
    return this.http.get(this.securityQuestionsUrl);
  }

  updateProfile(username, language) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('language', language);
    return this.http.post<any>(this.updateProfileUrl, body, { headers: headers });
  }

  getTeacherList() {
    return this.http.get<any>(this.teacherListUrl);
  }

  getStudentUsernames(firstName, lastName, birthMonth, birthDay) {
    let params = new HttpParams().set('firstName', firstName);
    params = params.set('lastName', lastName);
    params = params.set('birthMonth', birthMonth);
    params = params.set('birthDay', birthDay);
    return this.http.get<string[]>(this.usernameSearchUrl, { params: params });
  }

  getSecurityQuestion(username) {
    const params = new HttpParams().set('username', username);
    return this.http.get<any>(this.getSecurityQuestionUrl, { params: params });
  }

  checkSecurityAnswer(username, answer) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams().set('username', username);
    params = params.set('answer', answer);
    return this.http.post<any>(this.checkSecurityAnswerUrl, params, { headers: headers });
  }

  changePassword(username, answer, password, confirmPassword) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let params = new HttpParams().set('username', username);
    params = params.set('answer', answer);
    params = params.set('password', password);
    params = params.set('confirmPassword', confirmPassword);
    return this.http.post<any>(this.changePasswordUrl, params, { headers: headers });
  }

  canBeAddedToWorkgroup(runId, workgroupId, userId) {
    let params = new HttpParams().set('runId', runId);
    params = params.set('userId', userId);
    if (workgroupId != null) {
      params = params.set('workgroupId', workgroupId);
    }
    return this.http.get<any>(this.canBeAddedToWorkgroupUrl, { params: params });
  }
}

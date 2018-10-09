import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { tap } from 'rxjs/operators';

import { RunInfo } from './run-info';
import { Student } from "../domain/student";
import { StudentRun } from './student-run';
import { Subject } from "rxjs";

@Injectable()
export class StudentService {

  private runsUrl = 'api/student/runs';
  private runInfoUrl = 'api/student/run/info';
  private addRunUrl = 'api/student/run/register';
  private registerUrl = 'api/student/register';
  private securityQuestionsUrl = 'api/student/register/questions';
  private updateProfileUrl = 'api/student/profile/update';

  private newRunSource = new Subject<StudentRun>();
  newRunSource$ = this.newRunSource.asObservable();

  constructor(private http: HttpClient) { }

  getRuns(): Observable<StudentRun[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<StudentRun[]>(this.runsUrl, { headers: headers })
      .pipe(
        tap(runs => this.log(`fetched runs`))
      );
  }

  getRunInfo(runCode: string): Observable<RunInfo> {
    let params = new HttpParams().set("runCode", runCode);
    return this.http.get<RunInfo>(this.runInfoUrl, { params: params });
  }

  addRun(runCode: string, period: string): Observable<StudentRun> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('runCode', runCode);
    body = body.set('period', period);
    return this.http.post<StudentRun>(this.addRunUrl, body, { headers: headers });
  }

  private log(message: string) {
    console.log('StudentService: ' + message);
  }

  addNewProject(run: StudentRun) {
    this.newRunSource.next(run);
  }

  registerStudentAccount(studentUser: Student, callback: any): void {
    const headers = {
      'Content-Type': 'application/json'
    };
    this.http.post(this.registerUrl,
      studentUser,
      { headers: headers, responseType: "text" })
      .subscribe(response => {
        const userName = response;
        callback(userName);
      });
  }

  retrieveSecurityQuestions(): Observable<Object> {
    return this.http.get(this.securityQuestionsUrl);
  }

  updateProfile(username, language) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('language', language);
    return this.http.post<any>(this.updateProfileUrl, body, { headers: headers });
  }
}

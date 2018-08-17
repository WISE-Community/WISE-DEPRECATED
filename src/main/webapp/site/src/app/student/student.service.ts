import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { RunInfo } from './run-info';
import { StudentRun } from './student-run';
import { Student } from "../domain/student";

@Injectable()
export class StudentService {

  private runsUrl = 'api/student/runs';
  private runInfoUrl = 'api/student/run/info';
  private addRunUrl = 'api/student/run/register';
  private registerUrl = 'api/student/register';
  private securityQuestionsUrl = 'api/student/register/questions';

  constructor(private http: HttpClient) { }

  getRuns(): Observable<StudentRun[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<StudentRun[]>(this.runsUrl, { headers: headers })
      .pipe(
          tap(runs => this.log(`fetched runs`)),
          catchError(this.handleError('getRuns', []))
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

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('StudentService: ' + message);
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
}

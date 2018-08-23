import { Injectable } from '@angular/core';
import { Observable ,  of } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, tap } from "rxjs/operators";
import { Project } from "./project";
import { Teacher } from "../domain/teacher";
import { User } from "../domain/user";
import { Run } from "../domain/run";
import { Subject } from "rxjs";

@Injectable()
export class TeacherService {

  private projectsUrl = 'api/teacher/projects';
  private registerUrl = 'api/teacher/register';
  private createRunUrl = 'api/teacher/run/create';
  private newProjectSource = new Subject<Project>();
  public newProjectSource$ = this.newProjectSource.asObservable();

  constructor(private http: HttpClient) { }

  getProjects(): Observable<Project[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<Project[]>(this.projectsUrl, { headers: headers })
      .pipe(
        tap(runs => this.log(`fetched projects`)),
        catchError(this.handleError('getProjects', []))
      );
  }

  registerTeacherAccount(teacherUser: Teacher, callback: any) {
    const headers = {
      'Content-Type': 'application/json'
    };
    this.http.post(this.registerUrl,
      teacherUser,
      { headers: headers, responseType: "text" })
      .subscribe(response => {
        const userName = response;
        callback(userName);
      });
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      this.log(`${operation} failed: ${error.message}`);
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('TeacherService: ' + message);
  }

  createRun(projectId: number, periods: string, studentsPerTeam: number, startDate: number): Observable<Run> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('projectId', projectId + "");
    body = body.set('periods', periods);
    body = body.set('studentsPerTeam', studentsPerTeam + "");
    body = body.set('startDate', startDate + "");
    return this.http.post<Run>(this.createRunUrl, body, { headers: headers });
  }

  addNewProject(project: Project) {
    this.newProjectSource.next(project);
  }
}

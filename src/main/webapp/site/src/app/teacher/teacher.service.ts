import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Project } from "../domain/project";
import { Teacher } from "../domain/teacher";
import { Run } from "../domain/run";

@Injectable()
export class TeacherService {

  private runsUrl = 'api/teacher/runs';
  private sharedRunsUrl = 'api/teacher/sharedruns';
  private registerUrl = 'api/teacher/register';
  private runPermissionUrl = 'api/teacher/run/permission';
  private projectPermissionUrl = 'api/teacher/project/permission';
  private usernamesUrl = 'api/teacher/usernames';
  private createRunUrl = 'api/teacher/run/create';
  private runUrl = 'api/teacher/run';
  private newProjectSource = new Subject<Project>();
  public newProjectSource$ = this.newProjectSource.asObservable();
  private newRunSource = new Subject<Run>();
  public newRunSource$ = this.newRunSource.asObservable();
  private updateProfileUrl = 'api/teacher/profile/update';
  private tabIndexSource = new Subject<number>();
  public tabIndexSource$ = this.tabIndexSource.asObservable();

  constructor(private http: HttpClient) { }

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

  createRun(projectId: number, periods: string, studentsPerTeam: number, startDate: number): Observable<Run> {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('projectId', projectId + "");
    body = body.set('periods', periods);
    body = body.set('studentsPerTeam', studentsPerTeam + "");
    body = body.set('startDate', startDate + "");
    return this.http.post<Run>(this.createRunUrl, body, { headers: headers });
  }

  retrieveAllTeacherUsernames(): Observable<string[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<string[]>(this.usernamesUrl, { headers: headers })
  }

  addSharedOwner(runId: number, teacherUsername: string) {
    const url = `${this.runPermissionUrl}/${runId}/${teacherUsername}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<Object>(url, null, {headers: headers});
  }

  removeSharedOwner(runId: number, username: string) {
    const url = `${this.runPermissionUrl}/${runId}/${username}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<Object>(url, {headers: headers});
  }

  addSharedOwnerRunPermission(runId: number, userId: string, permissionId: number) {
    const url = `${this.runPermissionUrl}/${runId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.put<any>(url, null, {headers: headers});
  }

  removeSharedOwnerRunPermission(runId: number, userId: string, permissionId: number) {
    const url = `${this.runPermissionUrl}/${runId}/${userId}/${permissionId}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<any>(url, {headers: headers});
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
    return this.http.put<Object>(url, null, {headers: headers});
  }

  removeSharedProjectOwner(projectId: number, username: string) {
    const url = `${this.projectPermissionUrl}/${projectId}/${username}`;
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.http.delete<Object>(url, {headers: headers});
  }

  addNewRun(run: Run) {
    this.newRunSource.next(run);
  }

  updateProfile(username, displayName, email, city, state, country, schoolName, schoolLevel, language) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('username', username);
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

  setTabIndex(index: number) {
    this.tabIndexSource.next(index);
  }
}

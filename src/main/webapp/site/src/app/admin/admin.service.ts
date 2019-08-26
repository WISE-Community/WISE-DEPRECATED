import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private searchStudentsUrl = 'api/admin/search-students';
  private searchTeachersUrl = 'api/admin/search-teachers';
  private changePasswordUrl = '/api/admin/change-user-password';

  constructor(private http: HttpClient) { }

  searchStudents(firstName: string, lastName: string, username: string, userId: string,
                 runId: string, workgroupId: string, teacherUsername: string): Observable<any []> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('lastName', lastName)
      .set('username', username)
      .set('userId', userId)
      .set('runId', runId)
      .set('workgroupId', workgroupId)
      .set('teacherUsername', teacherUsername);
    return this.http.get<any[]>(this.searchStudentsUrl, { headers, params });
  }

  searchTeachers(firstName: string, lastName: string, username: string, userId: string,
                 displayName: string, city: string, state: string, country: string, schoolName: string,
                 schoolLevel: string, curriculumSubjects: string,
                 email: string, runId: string): Observable<any []> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams()
      .set('firstName', firstName)
      .set('lastName', lastName)
      .set('username', username)
      .set('userId', userId)
      .set('displayName', displayName)
      .set('city', city)
      .set('state', state)
      .set('country', country)
      .set('schoolName', schoolName)
      .set('schoolLevel', schoolLevel)
      .set('curriculumSubjects', curriculumSubjects)
      .set('email', email)
      .set('runId', runId);
    return this.http.get<any[]>(this.searchTeachersUrl, { headers, params });
  }

  changeUserPassword(username: string, adminPassword: string, newPassword: string) {
    const headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const params = new HttpParams()
      .set('username', username)
      .set('adminPassword', adminPassword)
      .set('newPassword', newPassword);
    return this.http.post<any>(this.changePasswordUrl, params, { headers: headers });
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private searchStudentsUrl = 'api/admin/search-students';
  private searchTeachersUrl = 'api/admin/search-teachers';

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

  searchTeachers(): Observable<any []> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams();
    return this.http.get<any[]>(this.searchTeachersUrl, { headers, params });
  }
}

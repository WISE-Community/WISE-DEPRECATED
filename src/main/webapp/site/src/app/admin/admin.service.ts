import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { Student } from '../domain/student';
import { Teacher } from '../domain/teacher';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private searchStudentsUrl = 'api/admin/search-students';
  private searchTeachersUrl = 'api/admin/search-teachers';

  constructor(private http: HttpClient) { }

  searchStudents(firstName: string, lastName: string, username: string, userId: string,
                 runId: string, workgroupId: string, teacherUsername: string): Observable<Student []> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams();
    params.append('firstName', firstName);
    params.append('lastName', lastName);
    params.append('username', username);
    params.append('userId', userId);
    params.append('runId', runId);
    params.append('workgroupId', workgroupId);
    params.append('teacherUsername', teacherUsername);
    return this.http.get<Student[]>(this.searchStudentsUrl, { headers, params });
  }

  searchTeachers(): Observable<Teacher []> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    const params = new HttpParams();
    return this.http.get<Teacher []>(this.searchTeachersUrl, { headers, params });
  }
}

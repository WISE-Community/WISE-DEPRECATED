import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { User } from '../domain/user';
import { HttpParams } from "@angular/common/http";
import { ConfigService } from './config.service';
import { Teacher } from "../domain/teacher";
import { Student } from "../domain/student";

@Injectable()
export class UserService {

  private userUrl = 'api/user/user';
  private user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private checkGoogleUserExistsUrl = 'api/user/check-google-user-exists';
  private checkGoogleUserMatchesUrl = 'api/user/check-google-user-matches';
  private googleUserUrl = 'api/user/google-user';
  private userByIdUrl = 'api/user/by-id';
  private checkAuthenticationUrl = 'api/user/check-authentication';
  private changePasswordUrl = 'api/user/password';
  private languagesUrl = 'api/user/languages';
  private contactUrl = 'api/contact';
  isAuthenticated = false;
  isRecaptchaRequired = false;
  redirectUrl: string; // redirect here after logging in

  constructor(private http: HttpClient, private configService: ConfigService) {
  }

  getUser(): BehaviorSubject<User> {
    return this.user$;
  }

  getUserId(): number {
    return this.getUser().getValue().id;
  }

  isSignedIn(): boolean {
    return this.isAuthenticated;
  }

  isStudent(): boolean {
    return this.isAuthenticated &&
      this.user$.getValue().role === 'student';
  }

  isTeacher(): boolean {
    const role = this.user$.getValue().role;
    return this.isSignedIn() &&
      (role === 'teacher' || role === 'researcher');
  }

  isAdmin(): boolean {
    return this.isSignedIn() && this.user$.getValue().role === 'admin';
  }

  isGoogleUser(): boolean {
    return this.getUser().getValue().isGoogleUser;
  }

  retrieveUserPromise(): Promise<User> {
    return this.retrieveUser().toPromise();
  }

  retrieveUser(username?: string): Observable<User> {
    //const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    let params = new HttpParams().set("username", username);
    return this.http.get<User>(this.userUrl, { params: params })
        .pipe(
          tap((user) => {
            if (user != null && user.id != null) {
              this.isAuthenticated = true;
            }
            this.isRecaptchaRequired = user.isRecaptchaRequired;
            this.user$.next(user);
          })
        );
  }

  checkAuthentication(username, password) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('password', password);
    return this.http.post<any>(this.checkAuthenticationUrl, body, { headers: headers });
  }

  authenticate(credentials, callback) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    let formData = `username=${credentials.username}&password=${credentials.password}&site=new`;
    if (credentials.recaptchaResponse != null) {
      formData += `&g-recaptcha-response=${credentials.recaptchaResponse}`;
    }
    const logInURL = `${this.configService.getContextPath()}/j_acegi_security_check`;
    this.http.post(logInURL,
        formData,
        { headers: headers, responseType: 'text' })
        .subscribe((response) => {
          try {
            response = JSON.parse(response);
          } catch(e) {

          }
          this.retrieveUser(credentials.username).subscribe((user) => {
            return callback && callback(response);
          });
        });
  }

  getRedirectUrl(): string {
    if (this.redirectUrl) {
      return this.redirectUrl;
    } else if (this.isStudent()) {
      return '/student';
    } else if (this.isTeacher()) {
      return '/teacher';
    } else {
      return '/';
    }
  }

  isGoogleIdExists(googleUserId: string) {
    let params = new HttpParams().set("googleUserId", googleUserId);
    return this.http.get<User>(this.checkGoogleUserExistsUrl, { params: params });
  }

  isGoogleIdCorrect(googleUserId: string, userId: string) {
    let params = new HttpParams();
    params = params.set("googleUserId", googleUserId);
    params = params.set("userId", userId);
    return this.http.get<User>(this.checkGoogleUserMatchesUrl, { params: params });
  }

  getUserByGoogleId(googleUserId: string) {
    let params = new HttpParams();
    params = params.set("googleUserId", googleUserId);
    return this.http.get<any>(this.googleUserUrl, { params: params });
  }

  getUserById(userId: string) {
    let params = new HttpParams();
    params = params.set('userId', userId);
    return this.http.get<any>(this.userByIdUrl, { params });
  }

  changePassword(username, oldPassword, newPassword) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    let body = new HttpParams();
    body = body.set('username', username);
    body = body.set('oldPassword', oldPassword);
    body = body.set('newPassword', newPassword);
    return this.http.post<any>(this.changePasswordUrl, body, { headers: headers });
  }

  getLanguages() {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<any>(this.languagesUrl, { headers: headers });
  }

  updateTeacherUser(displayName, email, city, state, country, schoolName, schoolLevel, language) {
    const user: Teacher = <Teacher>this.getUser().getValue();
    user.displayName = displayName;
    user.email = email;
    user.city = city;
    user.state = state;
    user.country = country;
    user.schoolName = schoolName;
    user.schoolLevel = schoolLevel;
    user.language = language;
  }

  updateStudentUser(language) {
    const user = <Student>this.getUser().getValue();
    user.language = language;
  }

  sendContactMessage(name, email, teacherUsername, issueType, summary, description, runId,
        projectId, userAgent, recaptchaResponse) {
    const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    const body = this.generateContactMessageParams(name, email, teacherUsername, issueType,
          summary, description, runId, projectId, userAgent, recaptchaResponse);
    return this.http.post<any>(this.contactUrl, body, { headers: headers });
  }

  generateContactMessageParams(name, email, teacherUsername, issueType, summary, description, runId,
        projectId, userAgent, recaptchaResponse) {
    let body = new HttpParams();
    body = body.set('name', name);
    if (email != null) {
      body = body.set('email', email);
    }
    if (teacherUsername != null) {
      body = body.set('teacherUsername', teacherUsername);
    }
    body = body.set('issueType', issueType);
    body = body.set('summary', summary);
    body = body.set('description', description);
    if (runId != null) {
      body = body.set('runId', runId);
    }
    if (projectId != null) {
      body = body.set('projectId', projectId);
    }
    body = body.set('userAgent', userAgent);
    if (recaptchaResponse != null) {
      body = body.set('recaptchaResponse', recaptchaResponse);
    }
    return body;
  }
}

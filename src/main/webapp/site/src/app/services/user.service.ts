import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable ,  of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { User } from '../domain/user';
import { HttpParams } from "../../../../../../../node_modules/@angular/common/http";

@Injectable()
export class UserService {

  private userUrl = 'api/user/user';
  private user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private logInURL = '/wise/j_acegi_security_check';
  private checkGoogleUserIdUrl = 'api/teacher/checkGoogleUserId';
  private changePasswordUrl = 'api/user/password';
  private languagesUrl = 'api/user/languages';
  isAuthenticated = false;
  redirectUrl: string; // redirect here after logging in

  constructor(private http: HttpClient) {
  }

  getUser(): BehaviorSubject<User> {
    return this.user$;
  }

  getUserId(): number {
    return this.getUser().getValue().id;
  }

  isStudent(): boolean {
    return this.isAuthenticated &&
      this.user$.getValue().role === 'student';
  }

  isTeacher(): boolean {
    const role = this.user$.getValue().role;
    return this.isAuthenticated &&
      (role === 'teacher' || role === 'admin' || role === 'researcher');
  }

  retrieveUserPromise(): Promise<User> {
    return this.retrieveUser().toPromise();
  }

  retrieveUser(): Observable<User> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<User>(this.userUrl, { headers: headers })
      .pipe(
        tap((user) => {
          if (user != null && user.id != null) {
            this.isAuthenticated = true;
          }
          this.user$.next(user);
        }),
        catchError(this.handleError('getUser', new User())));
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

  authenticate(credentials, callback) {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded'
    };
    let formData = "username=" + credentials.username + "&password=" + credentials.password;
    this.http.post(this.logInURL,
        formData,
        { headers: headers, responseType: "text" })
        .subscribe(response => {
          if (response.includes("WISE Student")) {
            this.isAuthenticated = true;
          } else {
            this.isAuthenticated = false;
          }
          this.retrieveUser().subscribe((user) => {
            return callback && callback();
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
    return this.http.get<User>(this.checkGoogleUserIdUrl, { params: params });
  }

  private log(message: string) {
    console.log('UserService: ' + message);
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
}

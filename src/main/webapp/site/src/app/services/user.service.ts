import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, finalize, tap, map } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';
import { User } from '../domain/user';

@Injectable()
export class UserService {

  private userUrl = 'api/user/user';
  private user$: BehaviorSubject<User> = new BehaviorSubject<User>(null);
  private authenticated = false;
  private logInURL = '/wise/j_acegi_security_check';

  constructor(private http: HttpClient) {
  }

  getUser(): Observable<User> {
    return this.user$;
  }

  retrieveUser(): Observable<User> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<User>(this.userUrl, { headers: headers })
      .pipe(
        tap((user) => {
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
            this.authenticated = true;
          } else {
            this.authenticated = false;
          }
          this.retrieveUser().subscribe((user) => {
            return callback && callback();
          });
        });
  }

  private log(message: string) {
    console.log('UserService: ' + message);
  }
}

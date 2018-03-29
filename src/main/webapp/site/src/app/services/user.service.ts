import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { User } from '../domain/user';

@Injectable()
export class UserService {

  private userUrl = 'api/user/user';
  private user: Observable<User>;
  private authenticated = false;

  constructor(private http: HttpClient) { }

  getUser(): Observable<User> {
    return this.user
      ? this.user
      : this.http.get<User>(this.userUrl)
        .pipe(
          tap(user => this.log(`fetched user`)),
          catchError(this.handleError('getUser', new User()))
        );
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
    this.http.post('/wise/j_acegi_security_check',
        formData,
        { headers: headers }).subscribe(response => {
      if (response['name']) {
        this.authenticated = true;
      } else {
        this.authenticated = false;
      }
      return callback && callback();
    });

  }

  private log(message: string) {
    console.log('UserService: ' + message);
  }
}

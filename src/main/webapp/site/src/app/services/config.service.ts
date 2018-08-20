import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable ,  of } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Config } from "../domain/config";
import { UserService } from "./user.service";
import { User } from "../domain/user";

@Injectable()
export class ConfigService {

  private userConfigUrl = 'api/user/config';
  private studentConfigUrl = 'api/student/config';
  private teacherConfigUrl = 'api/teacher/config';
  private config$: BehaviorSubject<Config> = new BehaviorSubject<Config>(null);

  constructor(private http: HttpClient, private userService: UserService) {
  }

  subscribeToGetUser() {
    this.userService.getUser().subscribe((user) => {
      this.retrieveConfig(user);
    });
  }

  getConfig(): Observable<Config> {
    return this.config$;
  }

  retrieveConfig(user: User) {
    let configUrl = this.userConfigUrl;
    if (user.role == 'student') {
      configUrl = this.studentConfigUrl;
    } else if (user.role == 'teacher' || user.role == 'researcher' || user.role == 'admin') {
      configUrl = this.teacherConfigUrl;
    }
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    this.http.get<Config>(configUrl, { headers: headers })
      .pipe(catchError(this.handleError('getConfig', new Config())))
      .subscribe(config => {
        this.config$.next(config);
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

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for config consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('ConfigService: ' + message);
  }

  getGoogleClientId() {
    return this.config$.getValue().googleClientId;
  }
}

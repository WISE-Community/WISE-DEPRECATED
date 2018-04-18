import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { Config } from "../domain/config";
import { of } from 'rxjs/observable/of';
import { UserService } from "./user.service";
import { User } from "../domain/user";

@Injectable()
export class ConfigService {

  private userConfigUrl = 'api/user/config';
  private studentConfigUrl = 'api/student/config';
  private teacherConfigUrl = 'api/teacher/config';
  private config: Config = null;
  private config$: BehaviorSubject<Config> = new BehaviorSubject<Config>(this.config);

  constructor(private http: HttpClient, private userService: UserService) {
  }

  subscribeToGetUser() {
    this.userService.getUser().subscribe((user) => {
      this.config = null;
      this.retrieveConfig(user).subscribe();
    });
  }

  getConfig(): Observable<Config> {
    return this.config$;
  }

  retrieveConfig(user: User): Observable<Config> {
    let configUrl = this.userConfigUrl;
    if (user.role == 'student') {
      configUrl = this.studentConfigUrl;
    } else if (user.role == 'teacher' || user.role == 'researcher' || user.role == 'admin') {
      configUrl = this.teacherConfigUrl;
    }
    return this.http.get<Config>(configUrl)
      .pipe(
        tap(config => {
          this.config = config;
          this.config$.next(this.config);
        }),
        catchError(this.handleError('getConfig', new Config()))
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

      // TODO: better job of transforming error for config consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  private log(message: string) {
    console.log('ConfigService: ' + message);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { catchError, tap } from "rxjs/operators";
import { Config } from "../domain/config";
import { of } from "rxjs/observable/of";

@Injectable()
export class ConfigService {

  private configUrl = 'api/student/config';
  private config: Observable<Config>;

  constructor(private http: HttpClient) {
  }

  getConfig(): Observable<Config> {
    return this.config
      ? this.config
      : this.http.get<Config>(this.configUrl)
        .pipe(
          tap(config => this.log(`fetched config`)),
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

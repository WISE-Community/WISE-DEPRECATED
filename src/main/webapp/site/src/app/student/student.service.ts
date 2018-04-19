import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import { StudentRun } from './student-run';

@Injectable()
export class StudentService {

  private runsUrl = 'api/student/runs';

  constructor(private http: HttpClient) { }

  getRuns(): Observable<StudentRun[]> {
    const headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });
    return this.http.get<StudentRun[]>(this.runsUrl, { headers: headers })
      .pipe(
          tap(runs => this.log(`fetched runs`)),
          catchError(this.handleError('getRuns', []))
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

  private log(message: string) {
    console.log('RunService: ' + message);
  }
}

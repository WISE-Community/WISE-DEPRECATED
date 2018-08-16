import { Injectable } from '@angular/core';
import { Observable ,  of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, tap } from 'rxjs/operators';

import { LibraryGroup } from "../modules/library/libraryGroup";

@Injectable()
export class LibraryService {

  private libraryGroupsUrl = 'api/project/library';
  private libraryGroups: Observable<LibraryGroup[]>;

  constructor(private http: HttpClient) { }

  getLibraryGroups(): Observable<LibraryGroup[]> {
    return this.libraryGroups
      ? this.libraryGroups
      : this.http.get<LibraryGroup[]>(this.libraryGroupsUrl)
        .pipe(
          tap(libraryGroups => this.log(`fetched project library groups`)),
          catchError(this.handleError('getLibraryGroups', new Array<LibraryGroup>()))
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
    console.log('LibraryService: ' + message);
  }
}

import { Injectable } from '@angular/core';
import { Observable ,  of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { LibraryGroup } from "../modules/library/libraryGroup";
import { ProjectFilterOptions } from "../domain/projectFilterOptions";

@Injectable()
export class LibraryService {

  private libraryGroupsUrl = 'api/project/library';
  private libraryGroups: Observable<LibraryGroup[]>;
  private projectFilterOptionsSource = new Subject<ProjectFilterOptions>();
  public projectFilterOptionsSource$ = this.projectFilterOptionsSource.asObservable();

  constructor(private http: HttpClient) { }

  getLibraryGroups(): Observable<LibraryGroup[]> {
    return this.libraryGroups
      ? this.libraryGroups
      : this.http.get<LibraryGroup[]>(this.libraryGroupsUrl);
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

  filterOptions(projectFilterOptions: ProjectFilterOptions) {
    this.projectFilterOptionsSource.next(projectFilterOptions);
  }
}

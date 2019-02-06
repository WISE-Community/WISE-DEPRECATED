import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpErrorResponse, HttpHandler,
  HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(public snackBar: MatSnackBar,
              private i18n: I18n) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
          // A client-side or network error occurred. Handle it accordingly.
          console.error(this.i18n('An error occurred: '), err.error.message);
        } else {
          // The backend returned an unsuccessful response code.
          // The response body may contain clues as to what went wrong.
          console.error(this.i18n('Backend returned code {{status}}, body was: {{error}}', {status: err.status, error: err.error}));
        }

        this.snackBar.open(this.i18n(`An error occurred. Please check your connection and try again.`));

        // return an observable with an empty result
        return throwError('');
      })
    )
  }
}

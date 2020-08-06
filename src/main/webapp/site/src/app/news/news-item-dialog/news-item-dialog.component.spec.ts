import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsItemDialogComponent } from './news-item-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { NO_ERRORS_SCHEMA, TRANSLATIONS, LOCALE_ID, TRANSLATIONS_FORMAT } from '@angular/core';
import { NewsItemMode } from '../news-item-mode';
import { Observable } from 'rxjs';
import { NewsService } from '../../services/news.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { translationsFactory } from '../../app.module';

export class MockNewsService {
  getConfig(): Observable<any> {
    return Observable.create(observer => {
      const response = { newsUploadsBaseURL: '/mockBaseURL' };
      observer.next(response);
      observer.complete();
    });
  }

  createNewsItem(date: number, title: string, news: string, type: string): Observable<any> {
    return Observable.create(observer => {
      const response = { status: 'success' };
      observer.next(response);
      observer.complete();
    });
  }

  updateNewsItem(id: number, date: number, title: string, news: string, type: string): Observable<any> {
    return Observable.create(observer => {
      const response = { status: 'success' };
      observer.next(response);
      observer.complete();
    });
  }

  deleteNewsItem(id: number): Observable<any> {
    return Observable.create(observer => {
      const response = { status: 'success' };
      observer.next(response);
      observer.complete();
    });
  }
}

describe('NewsItemDialogComponent', () => {
  let component: NewsItemDialogComponent;
  let fixture: ComponentFixture<NewsItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewsItemDialogComponent ],
      providers: [
        { provide: NewsService, useClass: MockNewsService },
        { provide: MAT_DIALOG_DATA, useValue: { mode: NewsItemMode.ADD }},
        { provide: MatDialogRef, useValue: { close: () => {} }},
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        { provide: MatSnackBar, useValue: { open: msg => { }} },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewsItemDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

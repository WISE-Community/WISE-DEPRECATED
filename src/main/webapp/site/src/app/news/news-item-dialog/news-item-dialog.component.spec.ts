import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsItemDialogComponent } from './news-item-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef, MatSnackBar } from '@angular/material';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { NewsItemMode } from '../news-item-mode';
import { Observable } from 'rxjs';
import { NewsService } from '../../services/news.service';

export class MockNewsService {
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
        { provide: MatSnackBar, useValue: { open: msg => { }} }
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherProjectLibraryComponent } from './teacher-project-library.component';
import { MatDialogModule } from "@angular/material/dialog";
import { MatMenuModule } from '@angular/material/menu';
import { NO_ERRORS_SCHEMA, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { LibraryService } from '../../../services/library.service';
import { translationsFactory } from '../../../app.module';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { defer } from 'rxjs';

export function fakeAsyncResponse<T>(data: T) {
  return defer(() => Promise.resolve(data));
}

export class MockLibraryService {
  numberOfOfficialProjectsVisible$ = fakeAsyncResponse(0)
  numberOfCommunityProjectsVisible$ = fakeAsyncResponse(0);
  numberOfPersonalProjectsVisible$ = fakeAsyncResponse(0);
  newProjectSource$ = fakeAsyncResponse(0);
  getOfficialLibraryProjects(){}
  getCommunityLibraryProjects(){}
  getPersonalLibraryProjects(){}
  getSharedLibraryProjects(){}
}

describe('TeacherProjectLibraryComponent', () => {
  let component: TeacherProjectLibraryComponent;
  let fixture: ComponentFixture<TeacherProjectLibraryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ MatMenuModule, RouterTestingModule, MatDialogModule ],
      declarations: [ TeacherProjectLibraryComponent ],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectLibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

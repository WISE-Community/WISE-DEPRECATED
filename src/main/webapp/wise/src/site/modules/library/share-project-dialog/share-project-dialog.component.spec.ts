import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ShareProjectDialogComponent } from './share-project-dialog.component';
import { TeacherService } from "../../../teacher/teacher.service";
import { Observable } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatAutocompleteModule,
  MatSnackBarModule,
  MatTableModule } from '@angular/material';
import { LibraryService } from "../../../services/library.service";
import { NO_ERRORS_SCHEMA, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from "@angular/core";
import { Project } from "../../../domain/project";
import { User } from "../../../domain/user";
import { translationsFactory } from '../../../app.module';
import { I18n } from '@ngx-translate/i18n-polyfill';

export class MockLibraryService {
  getProjectInfo() {
    return Observable.create(observer => {
      const project = new Project();
      project.id = 1;
      project.name = "Test";
      project.owner = new User();
      project.owner.id = 1;
      project.sharedOwners = [];
      observer.next(project);
      observer.complete();
    });
  }
}

export class MockTeacherService {
  retrieveAllTeacherUsernames() {
    return Observable.create(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

describe('ShareProjectDialogComponent', () => {
  const projectObj = {
    id: 1,
    name: "Test",
    owner: {
      id: 123456,
      displayName: "Spongebob Squarepants"
    },
    sharedOwners: []
  };

  let component: ShareProjectDialogComponent;
  let fixture: ComponentFixture<ShareProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareProjectDialogComponent ],
      imports: [
        BrowserAnimationsModule,
        MatAutocompleteModule,
        MatSnackBarModule,
        MatTableModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            project: projectObj
          }
        },
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
    fixture = TestBed.createComponent(ShareProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareProjectDialogComponent } from './share-project-dialog.component';
import { TeacherService } from "../../../teacher/teacher.service";
import { Observable } from 'rxjs';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatAutocompleteModule,
  MatTableModule } from '@angular/material';
import { LibraryService } from "../../../services/library.service";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { Project } from "../../../domain/project";
import { User } from "../../../domain/user";

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
        MatAutocompleteModule,
        MatTableModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            project: projectObj
          }
        }
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareRunDialogComponent } from './share-run-dialog.component';
import { Observable } from "rxjs";
import { TeacherModule } from "../teacher.module";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Project } from "../project";
import { TeacherService } from "../teacher.service";
import { BrowserAnimationsModule } from "../../../../../../../../node_modules/@angular/platform-browser/animations";
import { Run } from "../../domain/run";
import { MatAutocompleteModule, MatButtonModule } from "@angular/material";
import { NO_ERRORS_SCHEMA } from "@angular/core";

describe('ShareRunDialogComponent', () => {
  let component: ShareRunDialogComponent;
  let fixture: ComponentFixture<ShareRunDialogComponent>;

  beforeEach(async(() => {
    const teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
          observer.complete();
        });
      },
      retrieveAllTeacherUsernames(): Observable<string[]> {
        let usernames : any[] = [
          "Spongebob Squarepants",
          "Patrick Star"
        ];
        return Observable.create( observer => {
          observer.next(usernames);
          observer.complete();
        });
      },
      getRun(runId: string): Observable<Run> {
        return Observable.create( observer => {
          const run: any = runObj;
          observer.next(run);
          observer.complete();
        });
      }
    };
    const runObj = {
      id: 1,
      name: "Photosynthesis",
      sharedOwners: [{
        id:4,
        firstName: "spongebob",
        lastName: "squarepants",
        permissions: [1,3]
      }],
      project: {
        id: 9,
        sharedOwners: [{
          id:4,
          firstName: "spongebob",
          lastName: "squarepants",
          permissions: [2]
        }]
      }
    };
    TestBed.configureTestingModule({
      declarations: [ ShareRunDialogComponent ],
      imports: [ BrowserAnimationsModule, MatAutocompleteModule ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            run: runObj
          }
        }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRunDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

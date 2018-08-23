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
      }
    };

    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ TeacherModule, BrowserAnimationsModule ],
      providers: [
        { provide: TeacherService, useValue: teacherServiceStub },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {
            project: {
              id: 1,
              name: "Photosynthesis",
              run: {
                id: 1,
                sharedOwners: []
              }
            }
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRunDialogComponent);
    component = fixture.componentInstance;
    const run: Run = new Run();
    run.id = 1;
    run.name = "Photosynthesis";
    component.run = run;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});

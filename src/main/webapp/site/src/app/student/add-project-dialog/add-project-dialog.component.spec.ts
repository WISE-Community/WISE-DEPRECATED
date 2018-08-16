import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProjectDialogComponent } from './add-project-dialog.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StudentModule } from "../student.module";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs/Observable";
import { StudentService } from "../student.service";
import { StudentRun } from "../student-run";

describe('AddProjectDialogComponent', () => {
  let component: AddProjectDialogComponent;
  let fixture: ComponentFixture<AddProjectDialogComponent>;

  beforeEach(async(() => {
    let studentServiceStub = {
      isLoggedIn: true,
      getRuns(): Observable<StudentRun[]> {
        let runs : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(runs);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [],
      imports: [ StudentModule, BrowserAnimationsModule ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: StudentService, useValue: studentServiceStub }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddProjectDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('should detect valid project code', () => {
    const projectCode = 'Cat123';
    expect(component.isValidRunCodeSyntax(projectCode)).toEqual(true);
  })

  it ('should detect invalid project code', () => {
    const projectCode = 'Cat12';
    expect(component.isValidRunCodeSyntax(projectCode)).toEqual(false);
  })
});

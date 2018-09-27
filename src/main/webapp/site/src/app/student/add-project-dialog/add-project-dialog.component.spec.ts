import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProjectDialogComponent } from './add-project-dialog.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatDialogRef } from "@angular/material/dialog";
import { StudentService } from "../student.service";
import {
  MatInputModule,
  MatSelectModule
} from "@angular/material";
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockStudentService {

}

describe('AddProjectDialogComponent', () => {
  let component: AddProjectDialogComponent;
  let fixture: ComponentFixture<AddProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProjectDialogComponent ],
      imports: [ BrowserAnimationsModule, MatSelectModule, MatInputModule ],
      providers: [
        { provide: StudentService, useClass: MockStudentService },
        { provide: MatDialogRef, useValue: {} }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
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

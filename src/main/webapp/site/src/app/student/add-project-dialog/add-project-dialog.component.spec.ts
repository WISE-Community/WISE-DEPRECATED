import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { AddProjectDialogComponent } from './add-project-dialog.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { StudentModule } from "../student.module";
import { MatDialogRef } from "@angular/material/dialog";
import { Observable } from "rxjs";
import { StudentService } from "../student.service";
import { StudentRun } from "../student-run";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatError,
  MatFormFieldModule, MatInputModule,
  MatSelectModule
} from "@angular/material";

describe('AddProjectDialogComponent', () => {
  let component: AddProjectDialogComponent;
  let fixture: ComponentFixture<AddProjectDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddProjectDialogComponent ],
      imports: [ BrowserAnimationsModule, ReactiveFormsModule, MatFormFieldModule, MatSelectModule, MatInputModule ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: StudentService }
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

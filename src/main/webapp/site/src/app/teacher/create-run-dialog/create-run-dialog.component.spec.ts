import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "./create-run-dialog.component";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatCheckboxModule, MatRadioModule } from "@angular/material";
import { ReactiveFormsModule } from "@angular/forms";
import { Observable } from 'rxjs';
import { Project } from "../../domain/project";
import { Run } from "../../domain/run";
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { By } from '@angular/platform-browser';

export class MockTeacherService {
  createRun() {
    return Observable.create(observer => {
      const run: Run = new Run();
      observer.next(run);
      observer.complete();
    });
  }

  addNewRun() {}

  setTabIndex() {}
}

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;
  const project: Project = new Project();
  project.id = 1;
  project.metadata = {
    "title": "Photosynthesis"
  };
  project.projectThumb = "photo.png";

  const getSubmitButton = () => {
    return fixture.debugElement.nativeElement.querySelector('button[type="submit"]');
  };

  const getForm = () => {
    return fixture.debugElement.query(By.css('form'));
  };
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MatRadioModule,
        MatCheckboxModule
      ],
      declarations: [ CreateRunDialogComponent ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: MatDialog, useValue: {
            closeAll: () => {}
          }},
        {
          provide: MatDialogRef, useValue: {
            afterClosed: () => {
              return Observable.create(observer => {
                observer.next({});
                observer.complete();
              });
            },
            close: () => {

            }
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: { project: project } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRunDialogComponent);
    component = fixture.componentInstance;
    component.project = project;
    component.dialog = TestBed.get(MatDialog);
    spyOn(component.dialog, 'closeAll').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
  });

  it('should get periods string', () => {
    component.periodsGroup.controls[0].get("checkbox").setValue(true);
    component.periodsGroup.controls[2].get("checkbox").setValue(true);
    component.periodsGroup.controls[4].get("checkbox").setValue(true);
    component.customPeriods.setValue('hello');
    expect(component.getPeriodsString()).toEqual("1,3,5,hello");
  });

  it('should disable submit button and invalidate form on initial state (when no period is selected)', () => {
    const submitButton = getSubmitButton();
    expect(component.form.valid).toBeFalsy();
    expect(submitButton.disabled).toBe(true);
  });

  it('should validate form when period is selected or custom period is entered', () => {
    component.periodsGroup.controls[0].get("checkbox").setValue(true);
    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
    component.periodsGroup.controls[0].get("checkbox").setValue(false);
    component.customPeriods.setValue('Section A, Section B');
    fixture.detectChanges();
    expect(component.form.valid).toBeTruthy();
  });

  it('should enable submit button when form is valid', () => {
    const submitButton = getSubmitButton();
    component.periodsGroup.controls[0].get("checkbox").setValue(true);
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should close the dialog when form is successfully submitted', async() => {
    component.periodsGroup.controls[0].get("checkbox").setValue(true);
    const form = getForm();
    form.triggerEventHandler('submit', null);
    fixture.detectChanges();
    expect(component.dialog.closeAll).toHaveBeenCalled();
  });
});

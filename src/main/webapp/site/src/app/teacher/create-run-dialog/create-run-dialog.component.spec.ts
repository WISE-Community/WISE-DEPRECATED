import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "./create-run-dialog.component";
import { MatDialogRef, MatDialog } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  MatCheckboxModule, MatRadioModule
} from "@angular/material";
import {
  FormArray, FormControl,
  FormGroup,
  ReactiveFormsModule
} from "@angular/forms";
import { Project } from "../../domain/project";
import { NO_ERRORS_SCHEMA } from '@angular/core';

export class MockTeacherService {

}

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;
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
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MatDialog, useValue: {} }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateRunDialogComponent);
    component = fixture.componentInstance;
    const project: Project = new Project();
    project.id = 1;
    project.metadata = {
      "title": "Photosynthesis"
    };
    project.projectThumb = "photo.png";
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
  });

  it('should getPeriodsString', () => {
    component.periodOptions = ["1","2","3","4","5","6","7","8"];
    component.periodsGroup = new FormArray(component.periodOptions.map(period =>
      new FormGroup({
      name: new FormControl(period),
      checkbox: new FormControl(false)
    })));
    component.periodsGroup.controls[0].get("checkbox").setValue(true);
    component.periodsGroup.controls[2].get("checkbox").setValue(true);
    component.periodsGroup.controls[4].get("checkbox").setValue(true);
    component.customPeriods = new FormControl('hello');
    expect(component.getPeriodsString()).toEqual("1,3,5,hello");
  });

  //it('should invalidate form when no period is selected', () => {
  // TODO: jon implement me
  //});
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "./create-run-dialog.component";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  MatCheckboxModule, MatDatepickerModule, MatDialogModule,
  MatDividerModule, MatNativeDateModule, MatRadioModule
} from "@angular/material";
import { SharedModule } from "../../modules/shared/shared.module";
import {
  FormArray, FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule
} from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { Project } from "../../domain/project";

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        FormsModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatNativeDateModule,
        MatRadioModule,
        NoopAnimationsModule
      ],
      declarations: [ CreateRunDialogComponent ],
      providers: [
        {provide: TeacherService},
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
        ]
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

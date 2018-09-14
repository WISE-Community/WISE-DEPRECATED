import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherService } from "../teacher.service";
import { CreateRunDialogComponent } from "./create-run-dialog.component";
import { MatDialogRef } from "@angular/material/dialog";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import {
  MatCheckboxModule,
  MatDatepickerModule, MatNativeDateModule,
  MatRadioModule
} from "@angular/material";
import { SharedModule } from "../../modules/shared/shared.module";
import { FormsModule } from "@angular/forms";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";

describe('CreateRunDialogComponent', () => {
  let component: CreateRunDialogComponent;
  let fixture: ComponentFixture<CreateRunDialogComponent>;
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ SharedModule, FormsModule, MatCheckboxModule, MatRadioModule, MatDatepickerModule, MatNativeDateModule, NoopAnimationsModule ],
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
    project.name = "Photosynthesis";
    project.thumbIconPath = "photo.png";
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
    component.periods[1] = true;
    component.periods[3] = true;
    component.periods[5] = true;
    component.customPeriods = "hello"
    expect(component.getPeriodsString()).toEqual("1,3,5,hello");
  });

  it('should invalidate form when period change', () => {
    expect(component.isFormValid).toBeFalsy();
    component.periods[1] = true;
    component.periodChanged();
    expect(component.isFormValid).toBeTruthy();
  });

});

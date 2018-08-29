import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherModule } from "../teacher.module";
import { RunMenuComponent } from "./run-menu.component";
import { TeacherService } from "../teacher.service";
import { Run } from "../../domain/run";
import { Project } from "../project";
import { FormsModule } from "@angular/forms";
import {
  MatDialog,
  MatFormFieldModule,
  MatIconModule,
  MatMenuModule
} from "@angular/material";

describe('RunMenuComponent', () => {
  let component: RunMenuComponent;
  let fixture: ComponentFixture<RunMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, MatFormFieldModule, MatMenuModule, MatIconModule ],
      declarations: [ RunMenuComponent ],
      providers: [ { provide: TeacherService }, { provide: MatDialog }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RunMenuComponent);
    component = fixture.componentInstance;
    const run: Run = new Run();
    run.id = 1;
    run.name = "Photosynthesis";
    const project = new Project();
    project.id = 1;
    run.project = project;
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LibraryProjectMenuComponent } from "./library-project-menu.component";
import { TeacherService } from "../../../teacher/teacher.service";
import { Project } from "../../../domain/project";
import {
  MatDialog,
  MatDividerModule,
  MatIconModule,
  MatMenuModule
} from "@angular/material";

describe('LibraryProjectMenuComponent', () => {
  let component: LibraryProjectMenuComponent;
  let fixture: ComponentFixture<LibraryProjectMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDividerModule,
        MatMenuModule,
        MatIconModule
      ],
      declarations: [ LibraryProjectMenuComponent ],
      providers: [ { provide: TeacherService }, { provide: MatDialog }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectMenuComponent);
    component = fixture.componentInstance;
    const project: Project = new Project();
    project.id = 1;
    project.name = "Photosynthesis";
    component.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

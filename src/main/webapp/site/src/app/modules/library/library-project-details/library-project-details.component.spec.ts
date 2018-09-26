import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { Observable } from "rxjs";
import { MatDialog } from "@angular/material/dialog";
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LibraryProjectDetailsComponent } from './library-project-details.component';
import { UserService } from "../../../services/user.service";
import { Project } from "../../../domain/project";
import { NGSSStandards } from "../ngssStandards";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { LibraryService } from "../../../services/library.service";

@Component({ selector: 'app-library-project-menu', template: '' })
export class LibraryProjectMenuStubComponent {
  @Input()
  project: Project;
}

export class MockMatDialog {

}

export class MockLibraryService {

}

export class MockUserService {
  isTeacher(): Observable<boolean> {
    const isTeacher: boolean = true;
    return Observable.create( observer => {
      observer.next(isTeacher);
      observer.complete();
    });
  }
}

describe('LibraryProjectDetailsComponent', () => {
  let component: LibraryProjectDetailsComponent;
  let fixture: ComponentFixture<LibraryProjectDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryProjectDetailsComponent ],
      imports: [ ],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: UserService, useClass: MockUserService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] },
        { provide: MatDialog, useClass: MockMatDialog }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryProjectDetailsComponent);
    component = fixture.componentInstance;
    const project: Project = new Project();
    project.id = 1;
    project.name = "Photosynthesis & Cellular Respiration";
    project.projectThumb = "photo.png";
    const ngssObject: any = {
      "disciplines": [{
        "name": "Life Sciences",
        "id": "LS"
      }],
      "dciArrangements": [{
        "children": [{
          "name": "Construct a scientific explanation...",
          "id": "MS-LS1-6"
        }, {
          "name": "Develop a model...",
          "id": "MS-LS1-7"
        }],
        "name": "From Molecules to Organisms: Structures and Processes",
        "id": "MS-LS1"
      }]
    };
    const ngss: NGSSStandards = new NGSSStandards();
    ngss.disciplines = ngssObject.disciplines;
    ngss.dciArrangements = ngssObject.dciArrangements;
    project.metadata = {
      "grades": ["7"],
      "title": "Photosynthesis & Cellular Respiration",
      "summary": "A really great unit.",
      "author": {"fullname": "ad min", "username": "admin"},
      "totalTime": "6-7 hours",
      "lessonPlan": null
    };
    component.ngss = ngss;
    component.data.project = project;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show project title', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis & Cellular Respiration');
  });

  it('should show project performance expectations', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('MS-LS1-6');
  });
});

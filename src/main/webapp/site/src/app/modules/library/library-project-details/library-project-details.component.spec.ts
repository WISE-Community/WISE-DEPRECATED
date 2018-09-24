import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { defer, Observable } from "rxjs";
import { MatDialogRef } from '@angular/material/dialog';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDialogModule, MatIconModule, MatTooltipModule } from '@angular/material';
import { LibraryProjectDetailsComponent } from './library-project-details.component';
import { LibraryService } from "../../../services/library.service";
import { UserService } from "../../../services/user.service";
import { Project } from "../../../domain/project";
import { NGSSStandards } from "../ngssStandards";

@Component({ selector: 'app-library-project-menu', template: '' })
export class LibraryProjectMenuStubComponent {
  @Input()
  project: Project;
}

describe('LibraryProjectDetailsComponent', () => {
  let component: LibraryProjectDetailsComponent;
  let fixture: ComponentFixture<LibraryProjectDetailsComponent>;

  beforeEach(async(() => {
    let userServiceStub = {
      isTeacher(): Observable<boolean> {
        const isTeacher: boolean = true;
        return Observable.create( observer => {
          observer.next(isTeacher);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [
        LibraryProjectDetailsComponent, LibraryProjectMenuStubComponent
      ],
      imports: [ MatDialogModule, MatIconModule, MatTooltipModule ],
      providers: [
        { provide: LibraryService },
        { provide: UserService, useValue: userServiceStub },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
      ]
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherProjectListComponent } from './teacher-project-list.component';
import { TeacherService } from "../teacher.service";
import { Observable } from "rxjs/Observable";
import { Project } from "../project";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import {
  MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatSelectModule, MatMenuModule
} from "@angular/material";
import { SearchBarComponent } from "../../modules/shared/search-bar/search-bar.component";
import { SelectMenuComponent } from "../../modules/shared/select-menu/select-menu.component";
import { MomentModule } from "angular2-moment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { TeacherProjectListItemComponent } from "../teacher-project-list-item/teacher-project-list-item.component";
import { ProjectRunMenuComponent } from "../project-run-menu/project-run-menu.component";

describe('TeacherProjectListComponent', () => {
  let component: TeacherProjectListComponent;
  let fixture: ComponentFixture<TeacherProjectListComponent>;

  beforeEach(async(() => {
    let teacherServiceStub = {
      isLoggedIn: true,
      getProjects(): Observable<Project[]> {
        let projects : any[] = [
          {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
        ];
        return Observable.create( observer => {
          observer.next(projects);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [
        SearchBarComponent,
        SelectMenuComponent,
        TeacherProjectListComponent,
        TeacherProjectListItemComponent,
        ProjectRunMenuComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MomentModule,
        ReactiveFormsModule
      ],
      providers: [ {provide: TeacherService, useValue: teacherServiceStub}]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

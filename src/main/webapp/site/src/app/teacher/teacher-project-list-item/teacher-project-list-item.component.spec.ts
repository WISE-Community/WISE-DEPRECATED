import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { Project } from '../project';
import { TeacherProjectListItemComponent } from './teacher-project-list-item.component';
import {
  MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule,
  MatSelectModule, MatMenuModule
} from "@angular/material";
import {MomentModule} from "angular2-moment";
import { ProjectRunMenuComponent } from "../project-run-menu/project-run-menu.component";

describe('TeacherProjectListItemComponent', () => {
  let component: TeacherProjectListItemComponent;
  let fixture: ComponentFixture<TeacherProjectListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeacherProjectListItemComponent,
        ProjectRunMenuComponent
      ],
      imports: [
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatSelectModule,
        MomentModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherProjectListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherProjectListItemComponent } from './teacher-project-list-item.component';
import { TeacherModule } from "../teacher.module";

describe('TeacherProjectListItemComponent', () => {
  let component: TeacherProjectListItemComponent;
  let fixture: ComponentFixture<TeacherProjectListItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [ TeacherModule ]
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

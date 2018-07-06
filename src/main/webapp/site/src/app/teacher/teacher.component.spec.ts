import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherComponent } from './teacher.component';
import { RouterTestingModule } from "@angular/router/testing";
import { APP_BASE_HREF } from "@angular/common";
import { TeacherModule } from "./teacher.module";

describe('TeacherComponent', () => {
  let component: TeacherComponent;
  let fixture: ComponentFixture<TeacherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TeacherModule,
        RouterTestingModule.withRoutes([])
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      declarations: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

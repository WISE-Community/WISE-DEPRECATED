import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherComponent } from './teacher.component';
import { RouterTestingModule } from "@angular/router/testing";
import { Router } from '@angular/router';
import { APP_BASE_HREF } from "@angular/common";
import { TeacherModule } from "./teacher.module";

describe('TeacherComponent', () => {
  let component: TeacherComponent;
  let fixture: ComponentFixture<TeacherComponent>;
  let router: Router;

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
    router = TestBed.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { StudentComponent } from './student.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

import { StudentModule } from "./student.module";

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        StudentModule,
        RouterTestingModule.withRoutes([]) ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      declarations: []
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

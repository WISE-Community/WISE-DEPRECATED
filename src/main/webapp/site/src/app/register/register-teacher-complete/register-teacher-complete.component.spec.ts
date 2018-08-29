import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherCompleteComponent } from './register-teacher-complete.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RegisterModule } from "../register.module";
import { RouterTestingModule } from "@angular/router/testing";

describe('RegisterTeacherCompleteComponent', () => {
  let component: RegisterTeacherCompleteComponent;
  let fixture: ComponentFixture<RegisterTeacherCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterTeacherCompleteComponent ],
      imports: [ BrowserAnimationsModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStudentCompleteComponent } from './register-student-complete.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RegisterModule } from "../register.module";
import { RouterTestingModule } from "@angular/router/testing";

describe('RegisterStudentCompleteComponent', () => {
  let component: RegisterStudentCompleteComponent;
  let fixture: ComponentFixture<RegisterStudentCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule, RouterTestingModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterStudentCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

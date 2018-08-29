import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterStudentCompleteComponent } from './register-student-complete.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterTestingModule } from "@angular/router/testing";
import { MatCardModule } from "@angular/material";

describe('RegisterStudentCompleteComponent', () => {
  let component: RegisterStudentCompleteComponent;
  let fixture: ComponentFixture<RegisterStudentCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterStudentCompleteComponent ],
      imports: [ BrowserAnimationsModule, RouterTestingModule, MatCardModule ]
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

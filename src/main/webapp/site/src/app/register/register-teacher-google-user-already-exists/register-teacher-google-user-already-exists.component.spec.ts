import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterTeacherGoogleUserAlreadyExistsComponent } from './register-teacher-google-user-already-exists.component'
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";;
import { RegisterModule } from "../register.module";

describe('RegisterTeacherGoogleUserAlreadyExistsComponent', () => {
  let component: RegisterTeacherGoogleUserAlreadyExistsComponent;
  let fixture: ComponentFixture<RegisterTeacherGoogleUserAlreadyExistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ BrowserAnimationsModule, RegisterModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherGoogleUserAlreadyExistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists.component';
import { RegisterModule } from "../register.module";

describe('RegisterGoogleUserAlreadyExistsComponent', () => {
  let component: RegisterGoogleUserAlreadyExistsComponent;
  let fixture: ComponentFixture<RegisterGoogleUserAlreadyExistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ RegisterModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterGoogleUserAlreadyExistsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

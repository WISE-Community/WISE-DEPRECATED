import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists.component';

describe('RegisterGoogleUserAlreadyExistsComponent', () => {
  let component: RegisterGoogleUserAlreadyExistsComponent;
  let fixture: ComponentFixture<RegisterGoogleUserAlreadyExistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterGoogleUserAlreadyExistsComponent ]
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

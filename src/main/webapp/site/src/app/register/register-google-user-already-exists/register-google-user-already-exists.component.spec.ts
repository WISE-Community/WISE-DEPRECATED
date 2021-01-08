import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterGoogleUserAlreadyExistsComponent } from './register-google-user-already-exists.component';
import { ConfigService } from '../../services/config.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterGoogleUserAlreadyExistsComponent', () => {
  let component: RegisterGoogleUserAlreadyExistsComponent;
  let fixture: ComponentFixture<RegisterGoogleUserAlreadyExistsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterGoogleUserAlreadyExistsComponent],
      imports: [HttpClientTestingModule],
      providers: [ConfigService],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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

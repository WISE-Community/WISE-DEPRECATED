import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterTeacherCompleteComponent } from './register-teacher-complete.component';
import { RouterTestingModule } from '@angular/router/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Observable } from 'rxjs';
import { Config } from '../../domain/config';
import { ConfigService } from '../../services/config.service';

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
}

describe('RegisterTeacherCompleteComponent', () => {
  let component: RegisterTeacherCompleteComponent;
  let fixture: ComponentFixture<RegisterTeacherCompleteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterTeacherCompleteComponent],
      imports: [RouterTestingModule],
      providers: [{ provide: ConfigService, useClass: MockConfigService }],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
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

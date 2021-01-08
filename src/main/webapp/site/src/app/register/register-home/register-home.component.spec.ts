import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterHomeComponent } from './register-home.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterHomeComponent', () => {
  let component: RegisterHomeComponent;
  let fixture: ComponentFixture<RegisterHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RegisterHomeComponent],
      imports: [],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

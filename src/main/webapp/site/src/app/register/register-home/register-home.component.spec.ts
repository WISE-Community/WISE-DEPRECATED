import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { RegisterHomeComponent } from './register-home.component';
import { SharedModule } from "../../modules/shared/shared.module";

describe('RegisterHomeComponent', () => {
  let component: RegisterHomeComponent;
  let fixture: ComponentFixture<RegisterHomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterHomeComponent ],
      imports: [ SharedModule, RouterTestingModule ]
    })
    .compileComponents();
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

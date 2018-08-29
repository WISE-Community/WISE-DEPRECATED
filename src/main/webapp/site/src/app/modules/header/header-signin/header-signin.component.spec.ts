import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderSigninComponent } from './header-signin.component';
import { HeaderModule } from "../header.module";
import { APP_BASE_HREF } from "@angular/common";

describe('HeaderSigninComponent', () => {
  let component: HeaderSigninComponent;
  let fixture: ComponentFixture<HeaderSigninComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderSigninComponent ],
      imports: [ ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderSigninComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

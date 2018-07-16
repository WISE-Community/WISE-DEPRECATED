import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { APP_BASE_HREF } from "@angular/common";
import { UserService } from "../../services/user.service";
import { HttpClient, HttpHandler } from "@angular/common/http";
import { HeaderModule } from "./header.module";

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ HeaderModule ],
      declarations: [],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        HttpClient,
        HttpHandler,
        UserService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

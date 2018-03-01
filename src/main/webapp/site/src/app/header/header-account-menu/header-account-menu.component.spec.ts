import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HeaderAccountMenuComponent } from './header-account-menu.component';
import { MatMenuModule, MatIconModule, MatDividerModule } from "@angular/material";
import {StudentRun} from "../../student/student-run";
import {StudentRunListItemComponent} from "../../student/student-run-list-item/student-run-list-item.component";
import {User} from "../../user";

describe('HeaderAccountMenuComponent', () => {
  let component: HeaderAccountMenuComponent;
  let fixture: ComponentFixture<HeaderAccountMenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HeaderAccountMenuComponent ],
      imports: [ MatDividerModule, MatMenuModule, MatIconModule ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderAccountMenuComponent);
    component = fixture.componentInstance;
    const user: User = new User();
    user.id = 1;
    user.firstName = "Amanda";
    user.lastName = "Panda";
    user.role = "student";
    user.userName = "AmandaP0101";
    component.user = user;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditPasswordComponent } from './edit-password.component';
import { UserService } from "../../../services/user.service";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ReactiveFormsModule } from '@angular/forms';
import { MatCardModule, MatInputModule } from '@angular/material';

export class MockUserService {

}

describe('EditPasswordComponent', () => {
  let component: EditPasswordComponent;
  let fixture: ComponentFixture<EditPasswordComponent>;

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      declarations: [ EditPasswordComponent ],
      imports: [
        BrowserAnimationsModule,
        ReactiveFormsModule,
        MatCardModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useClass: MockUserService }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

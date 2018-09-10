import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPasswordComponent } from './edit-password.component';
import { User } from "../../../domain/user";
import { Observable } from '../../../../../../../../../node_modules/rxjs';
import { UserService } from "../../../services/user.service";
import { BrowserAnimationsModule } from '../../../../../../../../../node_modules/@angular/platform-browser/animations';
import { ReactiveFormsModule } from '../../../../../../../../../node_modules/@angular/forms';
import { RouterTestingModule } from '../../../../../../../../../node_modules/@angular/router/testing';
import { MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatCardModule, MatInputModule } from '../../../../../../../../../node_modules/@angular/material';

describe('EditPasswordComponent', () => {
  let component: EditPasswordComponent;
  let fixture: ComponentFixture<EditPasswordComponent>;

  beforeEach(async(() => {
    const userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'Teacher';
        user.role = 'teacher';
        user.userName = 'DemoTeacher';
        user.id = 123456;
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [ EditPasswordComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatSelectModule,
        MatCheckboxModule,
        MatCardModule,
        MatInputModule
      ],
      providers: [
        { provide: UserService, useValue: userServiceStub }
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

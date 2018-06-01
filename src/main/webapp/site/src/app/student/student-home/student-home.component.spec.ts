import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentHomeComponent } from './student-home.component';
import { StudentRunListComponent } from '../student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from '../student-run-list-item/student-run-list-item.component';
import { SelectMenuComponent } from "../../modules/shared/select-menu/select-menu.component";
import { SearchBarComponent } from "../../modules/shared/search-bar/search-bar.component";
import { User } from "../../domain/user";
import { UserService } from "../../services/user.service";

import { MatCardModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule } from "@angular/material";
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MomentModule } from "angular2-moment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";


describe('StudentHomeComponent', () => {
  let component: StudentHomeComponent;
  let fixture: ComponentFixture<StudentHomeComponent>;

  beforeEach(async(() => {
    let studentServiceStub = {
        isLoggedIn: true,
        getRuns(): Observable<StudentRun[]> {
          let runs : any[] = [
            {id: 1, name: "Photosynthesis"}, {id: 2, name: "Plate Tectonics"}
          ];
          return Observable.create( observer => {
              observer.next(runs);
              observer.complete();
          });
        }
    };

    let userServiceStub = {
      getUser(): Observable<User[]> {
        const user: User = new User();
        user.firstName = 'Demo';
        user.lastName = 'User';
        user.role = 'student';
        user.userName = 'DemoUser0101';
        user.id = 123456;
        return Observable.create( observer => {
          observer.next(user);
          observer.complete();
        });
      }
    };

    TestBed.configureTestingModule({
      declarations: [
        SearchBarComponent,
        SelectMenuComponent,
        StudentHomeComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      providers: [
        { provide: StudentService, useValue: studentServiceStub },
        { provide: UserService, useValue: userServiceStub }
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MomentModule,
        ReactiveFormsModule,
        RouterTestingModule
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show student home page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('#studentName').textContent)
      .toContain('Demo User');
  });
});

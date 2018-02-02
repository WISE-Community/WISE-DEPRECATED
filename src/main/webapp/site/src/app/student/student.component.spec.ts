import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { StudentComponent } from './student.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentRoutingModule } from './student-routing.module';
import { StudentRunListComponent } from './student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from './student-run-list-item/student-run-list-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      declarations: [
        StudentComponent,
        StudentEditProfileComponent,
        StudentHomeComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      imports: [ RouterTestingModule.withRoutes([]) ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentComponent);
    component = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    router = TestBed.get(Router);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

/*
  it('should navigate', () => {
    let navigateSpy = spyOn(router, 'navigate');
    component.showHome();
    expect(navigateSpy).toHaveBeenCalledWith(['/student']);
  })
  */
});

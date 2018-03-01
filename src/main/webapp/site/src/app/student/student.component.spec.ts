import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { SearchBarComponent } from "../shared/search-bar/search-bar.component";
import { SelectMenuComponent } from "../shared/select-menu/select-menu.component";
import { StudentComponent } from './student.component';
import { StudentEditProfileComponent } from './student-edit-profile/student-edit-profile.component';
import { StudentHomeComponent } from './student-home/student-home.component';
import { StudentRoutingModule } from './student-routing.module';
import { StudentRunListComponent } from './student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from './student-run-list-item/student-run-list-item.component';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { MatCardModule, MatFormFieldModule, MatIconModule, MatSelectModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { MomentModule } from "angular2-moment";

describe('StudentComponent', () => {
  let component: StudentComponent;
  let fixture: ComponentFixture<StudentComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatSelectModule,
        MomentModule,
        StudentRoutingModule,
        RouterTestingModule.withRoutes([]) ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' }
      ],
      declarations: [
        SearchBarComponent,
        SelectMenuComponent,
        StudentComponent,
        StudentEditProfileComponent,
        StudentHomeComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ]
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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentHomeComponent } from './student-home.component';
import { StudentRunListComponent } from '../student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from '../student-run-list-item/student-run-list-item.component';
import { SelectMenuComponent } from "../../modules/shared/select-menu/select-menu.component";
import { SearchBarComponent } from "../../modules/shared/search-bar/search-bar.component";

import { MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule } from "@angular/material";
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
        user: { name: 'Test User'},
        getRuns(): Observable<StudentRun[]> {
          let runs : any[] = [{id:1,name:"Photosynthesis"},{id:2,name:"Plate Tectonics"}];
          return Observable.create( observer => {
              observer.next(runs);
              observer.complete();
          });
        }
    }

    TestBed.configureTestingModule({
      declarations: [
        SearchBarComponent,
        SelectMenuComponent,
        StudentHomeComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      providers: [ {provide: StudentService, useValue: studentServiceStub } ],
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

  it('should show home page', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Demo User');
  });
});

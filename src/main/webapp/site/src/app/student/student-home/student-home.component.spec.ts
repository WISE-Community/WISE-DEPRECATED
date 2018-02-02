import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';
import { StudentHomeComponent } from './student-home.component';
import { StudentRunListComponent } from '../student-run-list/student-run-list.component';
import { StudentRunListItemComponent } from '../student-run-list-item/student-run-list-item.component';

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
          });}
    }

    TestBed.configureTestingModule({
      declarations: [
        StudentHomeComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      providers: [ {provide: StudentService, useValue: studentServiceStub } ]
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
    expect(compiled.querySelector('p').textContent).toContain('student-home works!');
  });
});

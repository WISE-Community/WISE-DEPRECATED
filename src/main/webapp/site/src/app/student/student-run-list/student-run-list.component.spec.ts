import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';

import { StudentRunListComponent } from './student-run-list.component';
import { StudentRunListItemComponent } from '../student-run-list-item/student-run-list-item.component';

describe('StudentRunListComponent', () => {
  let component: StudentRunListComponent;
  let fixture: ComponentFixture<StudentRunListComponent>;

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
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      providers: [ {provide: StudentService, useValue: studentServiceStub } ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentRunListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show runs', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('ul').textContent).toContain('Plate Tectonics');
  })
});

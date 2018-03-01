import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable } from "rxjs/Observable";

import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';

import { StudentRunListComponent } from './student-run-list.component';
import { StudentRunListItemComponent } from '../student-run-list-item/student-run-list-item.component';
import { MatCardModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule } from "@angular/material";
import { SelectMenuComponent } from "../../shared/select-menu/select-menu.component";
import { SearchBarComponent } from "../../shared/search-bar/search-bar.component";
import { FormsModule } from "@angular/forms";
import { MomentModule } from "angular2-moment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

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
        SelectMenuComponent,
        SearchBarComponent,
        StudentRunListComponent,
        StudentRunListItemComponent
      ],
      imports: [
        BrowserAnimationsModule,
        FormsModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MomentModule
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
    expect(compiled.querySelector('#studentRuns').textContent).toContain('Photosynthesis');
  })
});

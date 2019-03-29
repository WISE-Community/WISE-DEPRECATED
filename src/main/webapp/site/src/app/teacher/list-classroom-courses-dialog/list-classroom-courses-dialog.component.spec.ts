import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ListClassroomCoursesDialogComponent } from './list-classroom-courses-dialog.component';
import { TeacherService } from '../teacher.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';

export class MockTeacherService {
  addToClassroom: (accessCode: string, unitTitle: number, courseId: number) => {};
}

describe('ListClassroomCoursesDialogComponent', () => {
  let component: ListClassroomCoursesDialogComponent;
  let fixture: ComponentFixture<ListClassroomCoursesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListClassroomCoursesDialogComponent ],
      providers: [
        { provide: MatDialog },
        { provide: MatDialogRef, useValue: { close: () => {} }},
        { provide: MAT_DIALOG_DATA, useValue: { accessCode: 'test', unitTitle: 'test', courses: [{ id: '1', name: 'test' }] }},
        { provide: TeacherService, useClass: MockTeacherService }
        ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListClassroomCoursesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

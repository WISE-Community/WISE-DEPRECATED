import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareItemDialogComponent } from './share-item-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { TeacherService } from "../../../teacher/teacher.service";
import { Observable } from 'rxjs';

export class MockTeacherService {
  retrieveAllTeacherUsernames() {
    return Observable.create(observer => {
      observer.next([]);
      observer.complete();
    });
  }
}

describe('ShareItemDialogComponent', () => {
  let component: ShareItemDialogComponent;
  let fixture: ComponentFixture<ShareItemDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareItemDialogComponent ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: [] }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  // beforeEach(() => {
  //   fixture = TestBed.createComponent(ShareItemDialogComponent);
  //   component = fixture.componentInstance;
  //   fixture.detectChanges();
  // });
  //
  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});

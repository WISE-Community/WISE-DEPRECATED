import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ShareRunDialogComponent } from './share-run-dialog.component';
import { Observable } from 'rxjs';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TeacherService } from '../teacher.service';
import { Run } from '../../domain/run';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { UserService } from '../../services/user.service';

const runObj = {
  id: 1,
  name: 'Photosynthesis',
  periods: ['1'],
  numStudents: 4,
  owner: {
    id: 2,
    displayName: 'Patrick Star'
  },
  sharedOwners: [
    {
      id: 4,
      firstName: 'Spongebob',
      lastName: 'Squarepants',
      permissions: [1, 3]
    }
  ],
  project: {
    id: 9,
    owner: {
      id: 2,
      displayName: 'Patrick Star'
    },
    sharedOwners: [
      {
        id: 4,
        firstName: 'Spongebob',
        lastName: 'Squarepants',
        permissions: [2]
      }
    ]
  },
  isOwner: () => true
};

export class MockTeacherService {
  retrieveAllTeacherUsernames(): Observable<string[]> {
    let usernames: any[] = ['Spongebob Squarepants', 'Patrick Star'];
    return Observable.create((observer) => {
      observer.next(usernames);
      observer.complete();
    });
  }
  getRun(runId: string): Observable<Run> {
    return Observable.create((observer) => {
      const run: any = runObj;
      observer.next(run);
      observer.complete();
    });
  }
}

export class MockUserService {
  getUserId() {
    return 1;
  }
}

describe('ShareRunDialogComponent', () => {
  let component: ShareRunDialogComponent;
  let fixture: ComponentFixture<ShareRunDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ShareRunDialogComponent],
      imports: [BrowserAnimationsModule, MatAutocompleteModule, MatSnackBarModule, MatTableModule],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: { run: runObj } },
        {
          provide: MatDialog,
          useValue: {
            closeAll: () => {}
          }
        },
        { provide: UserService, useClass: MockUserService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRunDialogComponent);
    component = fixture.componentInstance;
    component.dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

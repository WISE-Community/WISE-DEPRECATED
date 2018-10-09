import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CopyProjectDialogComponent } from './copy-project-dialog.component';
import { LibraryService } from "../../../services/library.service";
import { fakeAsyncResponse } from "../../../student/student-run-list/student-run-list.component.spec";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Project } from "../../../domain/project";
import { Observable, throwError } from 'rxjs';
import { NO_ERRORS_SCHEMA } from "@angular/core";

export class MockLibraryService {
  newProjectSource$ = fakeAsyncResponse({});
  copyProject() {
    return Observable.create(observer => {
      const project: Project = new Project();
      observer.next(project);
      observer.complete();
    });
  }
}

describe('CopyProjectDialogComponent', () => {
  let component: CopyProjectDialogComponent;
  let fixture: ComponentFixture<CopyProjectDialogComponent>;
  const projectObj = {
    id: 1,
    name: "Test",
    owner: {
      id: 123456,
      displayName: "Spongebob Squarepants"
    },
    sharedOwners: []
  };

  const getCopyButton = () => {
    const buttons =  fixture.debugElement.nativeElement.querySelectorAll('button');
    return buttons[1];
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CopyProjectDialogComponent ],
      providers: [
        { provide: LibraryService, useClass: MockLibraryService },
        { provide: MatDialog, useValue: {
            closeAll: () => {

            }
          }
        },
        {
          provide: MatDialogRef, useValue: {
            afterClosed: () => {
              return Observable.create(observer => {
                observer.next({});
                observer.complete();
              });
            },
            close: () => {

            }
          }
        },
        { provide: MAT_DIALOG_DATA, useValue: { project: projectObj } }
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CopyProjectDialogComponent);
    component = fixture.componentInstance;
    component.dialog = TestBed.get(MatDialog);
    spyOn(component.dialog, 'closeAll').and.callThrough();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close the dialog when copy is successful', async() => {
    const copyButton = getCopyButton();
    copyButton.click();
    fixture.detectChanges();
    expect(component.dialog.closeAll).toHaveBeenCalled();
  });
});

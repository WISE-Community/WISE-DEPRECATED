import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ShareRunCodeDialogComponent } from './share-run-code-dialog.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { TeacherService } from '../teacher.service';
import { UserService } from '../../services/user.service';
import { TeacherRun } from '../teacher-run';
import { Project } from '../../domain/project';

const runObj = new TeacherRun();
runObj.id = 1;
runObj.runCode = 'Dog123';
const project = new Project();
project.id = 1;
project.name = 'Photosynthesis';
runObj.project = project;

export class MockConfigService {
  getWISEHostname(): string {
    return 'http://localhost:8080';
  }

  getContextPath(): string {
    return '';
  }

  isGoogleClassroomEnabled() {
    return true;
  }
}

export class MockTeacherService {}

export class MockUserService {
  isGoogleUser() {
    return true;
  }
}

describe('ShareRunCodeDialogComponent', () => {
  let component: ShareRunCodeDialogComponent;
  let fixture: ComponentFixture<ShareRunCodeDialogComponent>;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [ShareRunCodeDialogComponent],
        imports: [BrowserAnimationsModule, MatDialogModule, MatSnackBarModule],
        providers: [
          { provide: ConfigService, useClass: MockConfigService },
          { provide: TeacherService, useClass: MockTeacherService },
          { provide: UserService, useClass: MockUserService },
          { provide: MatDialogRef, useValue: {} },
          { provide: MAT_DIALOG_DATA, useValue: { run: runObj } }
        ],
        schemas: [NO_ERRORS_SCHEMA]
      }).compileComponents();
    })
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareRunCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info and sharing url', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis (Run ID: 1)');
    const url = `http://localhost:8080/login?accessCode=${component.run.runCode}`;
    expect(compiled.textContent).toContain(url);
  });
});

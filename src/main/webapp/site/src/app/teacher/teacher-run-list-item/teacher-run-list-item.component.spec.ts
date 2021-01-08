import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TeacherRunListItemComponent } from './teacher-run-list-item.component';
import { Project } from '../../domain/project';
import { TeacherService } from '../teacher.service';
import { TeacherRun } from '../teacher-run';
import { ConfigService } from '../../services/config.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MomentModule } from 'ngx-moment';
import { MatDialogModule } from '@angular/material/dialog';
import { configureTestSuite } from 'ng-bullet';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';

export class MockTeacherService {}

export class MockConfigService {
  getContextPath(): string {
    return '/wise';
  }
  getCurrentServerTime(): number {
    return new Date('2018-08-24T00:00:00.0').getTime();
  }
  getWISE4Hostname(): string {
    return 'http://localhost:8080/legacy';
  }
}

describe('TeacherRunListItemComponent', () => {
  let component: TeacherRunListItemComponent;
  let fixture: ComponentFixture<TeacherRunListItemComponent>;

  configureTestSuite(() => {
    TestBed.configureTestingModule({
      declarations: [TeacherRunListItemComponent],
      imports: [MatDialogModule, MomentModule, BrowserAnimationsModule, RouterTestingModule],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: ConfigService, useClass: MockConfigService }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TeacherRunListItemComponent);
    component = fixture.componentInstance;
    const run = new TeacherRun();
    run.id = 1;
    run.name = 'Photosynthesis';
    run.startTime = new Date('2018-10-17T00:00:00.0').getTime();
    run.endTime = new Date('2018-10-18T23:59:59.0').getTime();
    run.numStudents = 30;
    run.periods = ['1', '2'];
    run.runCode = 'Dog123';
    const project = new Project();
    project.id = 1;
    project.name = 'Photosynthesis';
    project.projectThumb = '';
    run.project = project;
    component.run = run;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show run info', () => {
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.textContent).toContain('Photosynthesis');
    expect(compiled.textContent).toContain('2 periods');
    expect(compiled.textContent).toContain('30 students');
    expect(compiled.textContent).toContain('Access Code: Dog123');
  });
});

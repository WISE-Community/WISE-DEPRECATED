import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, TRANSLATIONS_FORMAT, TRANSLATIONS, LOCALE_ID } from '@angular/core';
import { RegisterTeacherFormComponent } from './register-teacher-form.component';
import { RouterTestingModule } from "@angular/router/testing";
import { TeacherService } from "../../teacher/teacher.service";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UserService } from '../../services/user.service';
import { ReactiveFormsModule } from "@angular/forms";
import {
  MatCheckboxModule,
  MatInputModule,
  MatSelectModule
} from "@angular/material";
import { NO_ERRORS_SCHEMA } from "@angular/core";
import { translationsFactory } from '../../app.module';
import { I18n } from '@ngx-translate/i18n-polyfill';


export class MockTeacherService {

}

export class MockUserService {

}

@Component({selector: 'mat-card', template: ''})
class MatCardComponent {}

describe('RegisterTeacherFormComponent', () => {
  let component: RegisterTeacherFormComponent;
  let fixture: ComponentFixture<RegisterTeacherFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterTeacherFormComponent ],
      imports: [
        BrowserAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatCheckboxModule,
        MatSelectModule,
        MatInputModule
      ],
      providers: [
        { provide: TeacherService, useClass: MockTeacherService },
        { provide: UserService, useClass: MockUserService },
        { provide: TRANSLATIONS_FORMAT, useValue: "xlf" },
        {
          provide: TRANSLATIONS,
          useFactory: translationsFactory,
          deps: [LOCALE_ID]
        },
        I18n
      ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterTeacherFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

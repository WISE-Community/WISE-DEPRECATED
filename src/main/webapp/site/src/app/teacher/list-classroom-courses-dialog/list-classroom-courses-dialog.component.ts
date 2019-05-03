import { Component, Inject, OnInit } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { Course } from '../../domain/course';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { UserService } from '../../services/user.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn } from "@angular/forms";
import { finalize } from "rxjs/operators";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-list-classroom-courses-dialog',
  templateUrl: './list-classroom-courses-dialog.component.html',
  styleUrls: ['./list-classroom-courses-dialog.component.scss']
})
export class ListClassroomCoursesDialogComponent implements OnInit {
  courses: Course[] = [];
  courseIds: string[] = [];
  accessCode: string = '';
  unitTitle: string = '';
  endTime: string = '';
  isAdded: boolean = false;
  isAdding: boolean = false;
  form: FormGroup;
  coursesControl: FormArray;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<ListClassroomCoursesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              private userService: UserService,
              private fb: FormBuilder,
              private i18n: I18n) {
    this.accessCode = data.accessCode;
    this.unitTitle = data.unitTitle;
    if (data.endTime != null) {
      this.endTime = data.endTime;
    }
    for (const course of data.courses) {
      this.courses.push(new Course(course));
    }
  }

  ngOnInit() {
    const descriptionText = this.i18n(`Hi class! Please complete the "{{unitTitle}}" WISE unit. (Access Code: {{accessCode}})`,
      {unitTitle: this.unitTitle, accessCode: this.accessCode});
    const description = new FormControl(descriptionText, Validators.required);
    this.coursesControl = new FormArray(this.courses.map(() =>
      new FormControl(false)
    ));
    this.coursesControl.valueChanges.subscribe((controls) => {
      this.courseIds = [];
      controls.forEach((value, index) => {
        if (value) {
          this.courseIds.push(this.courses[index].id);
        }
      });
    });
    this.form = this.fb.group({
      selectedCourses: this.coursesControl,
      description: description
    }, { validator: this.isCourseSelected() });
  }

  isCourseSelected(): ValidatorFn {
    const validator: ValidatorFn = () => {
      return this.courseIds.length > 0 ? null : { required: true };
    };
    return validator;
  }

  addToClassroom() {
    this.isAdding = true;
    let endTime = '';
    if (this.endTime) {
      const date = new Date(this.endTime).getTime();
      if (date > Date.now()) {
        endTime = date.toString();
      }
    }
    this.teacherService.addToClassroom(this.accessCode, this.unitTitle, this.courseIds, this.userService.getUser()
      .getValue().username, endTime, this.form.controls['description'].value)
      .pipe(
        finalize(() => {
          this.isAdding = false;
        })
      )
      .subscribe(({ errors }) => {
        if (errors.length === 0) {
          this.isAdded = true;
        } else {
          alert('an error occurred while adding to courses!');
          console.log(errors);
        }
    });
  }

  get selectedCoursesControl() {
    return <FormArray>this.form.get("selectedCourses");
  }

  closeAll() {
    this.dialog.closeAll();
  }
}

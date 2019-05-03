import { Component, Inject, OnInit } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { Course } from '../../domain/course';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { UserService } from '../../services/user.service';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators, ValidatorFn } from "@angular/forms";
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'app-list-classroom-courses-dialog',
  templateUrl: './list-classroom-courses-dialog.component.html',
  styleUrls: ['./list-classroom-courses-dialog.component.scss']
})
export class ListClassroomCoursesDialogComponent implements OnInit {
  courses: Course[] = [];
  courseIds: string[] = [];
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
    if (data.endTime != null) {
      this.endTime = data.run.endTime;
    }
    for (const course of data.courses) {
      this.courses.push(new Course(course));
    }
  }

  ngOnInit() {
    const descriptionText = this.i18n(`Hi class! Please complete the "{{unitTitle}}" WISE unit. (Access Code: {{accessCode}})`,
      {unitTitle: this.data.run.name, accessCode: this.data.run.runCode});
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
    return () => {
      return this.courseIds.length > 0 ? null : { required: true };
    };
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
    this.teacherService.addToClassroom(this.data.run.runCode, this.data.run.name, this.courseIds, this.userService.getUser()
      .getValue().username, endTime, this.form.controls['description'].value)
      .then(() => {
        this.isAdded = true;
        this.isAdding = false;
      })
      .catch(errors => {
        console.error(errors);
        const erroredCourses: string[] = [];
        for (const id of errors) {
          const name = this.getCourseNameAndSection(id);
          erroredCourses.push(name);
        }
        alert(this.i18n(`There was an error adding an assignment to the following courses:\n\n{{courses}}`,
            {courses: erroredCourses.join('\n')}));
        this.isAdding = false;
      });
  }

  getCourseNameAndSection(courseId: string): string {
    for (const course of this.courses) {
      if (course.id === courseId) {
        let courseNameAndSection = course.name;
        if (course.section) {
          courseNameAndSection += this.i18n(` (Section {{section}})`, {section: course.section});
        }
        return courseNameAndSection;
      }
    }
  }

  get selectedCoursesControl() {
    return <FormArray>this.form.get("selectedCourses");
  }

  closeAll() {
    this.dialog.closeAll();
  }
}

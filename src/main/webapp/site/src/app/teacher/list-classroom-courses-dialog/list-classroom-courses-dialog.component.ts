import { Component, Inject, OnInit } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { Course } from '../../domain/course';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import { UserService } from '../../services/user.service';
import { FormArray, FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { finalize } from "rxjs/operators";

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
  coursesGroup: FormArray;

  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<ListClassroomCoursesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              private userService: UserService,
              private fb: FormBuilder) {
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
    this.coursesGroup = new FormArray(this.courses.map(course =>
      new FormGroup({
        name: new FormControl(course),
        checkbox: new FormControl(false)
      })
    ));
    this.form = this.fb.group({
      selectedCourses: this.coursesGroup
    });
  }

  addCourseId(courseId: string) {
    if (this.courseIds.includes(courseId)) {
      document.getElementById(courseId).style.backgroundColor = 'transparent';
      const index = this.courseIds.indexOf(courseId);
      this.courseIds.splice(index, 1);
    } else {
      document.getElementById(courseId).style.backgroundColor = '#ddd';
      this.courseIds.push(courseId);
    }
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
      .getValue().username, endTime)
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

import { Component, Inject, OnInit } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { Course } from '../../domain/course';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { UserService } from '../../services/user.service';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
  ValidatorFn
} from '@angular/forms';
import { Run } from '../../domain/run';

@Component({
  selector: 'app-list-classroom-courses-dialog',
  templateUrl: './list-classroom-courses-dialog.component.html',
  styleUrls: ['./list-classroom-courses-dialog.component.scss']
})
export class ListClassroomCoursesDialogComponent implements OnInit {
  run: Run;
  courses: Course[] = [];
  courseIds: string[] = [];
  endTime: string = '';
  isAdded: boolean = false;
  isAdding: boolean = false;
  form: FormGroup;
  coursesControl: FormArray;
  addSuccessCount: number = 0;
  addFailureCount: number = 0;
  coursesSuccessfullyAdded: any[] = [];
  coursesFailedToAdd: any[] = [];

  constructor(
    public dialog: MatDialog,
    public dialogRef: MatDialogRef<ListClassroomCoursesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private teacherService: TeacherService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.run = data.run;
    for (const course of data.courses) {
      this.courses.push(new Course(course));
    }
  }

  ngOnInit() {
    const descriptionText = $localize`Hi class! Please complete the "${this.data.run.name}:unitTitle:" WISE unit. (Access Code: ${this.data.run.runCode}:accessCode:)`;
    const description = new FormControl(descriptionText, Validators.required);
    this.coursesControl = new FormArray(this.courses.map(() => new FormControl(false)));
    this.coursesControl.valueChanges.subscribe((controls) => {
      this.courseIds = [];
      controls.forEach((value, index) => {
        if (value) {
          this.courseIds.push(this.courses[index].id);
        }
      });
    });
    this.form = this.fb.group(
      {
        selectedCourses: this.coursesControl,
        description: description
      },
      { validator: this.isCourseSelected() }
    );
  }

  isCourseSelected(): ValidatorFn {
    return () => {
      return this.courseIds.length > 0 ? null : { required: true };
    };
  }

  addToClassroom() {
    this.isAdding = true;
    let endTime = '';
    if (this.run.endTime) {
      const date = new Date(this.run.endTime).getTime();
      if (date > Date.now()) {
        endTime = date.toString();
      }
    }
    this.teacherService
      .addToClassroom(
        this.data.run.runCode,
        this.data.run.name,
        this.courseIds,
        this.userService.getUser().getValue().username,
        endTime,
        this.form.controls['description'].value
      )
      .subscribe((response) => {
        this.showAddToClassroomResults(response.courses);
      });
  }

  showAddToClassroomResults(courses) {
    this.isAdded = true;
    this.isAdding = false;
    this.addSuccessCount = 0;
    this.addFailureCount = 0;
    this.coursesSuccessfullyAdded = [];
    this.coursesFailedToAdd = [];
    for (const course of courses) {
      course.name = this.getCourseNameAndSection(course.id);
      if (course.success) {
        this.coursesSuccessfullyAdded.push(course);
        this.addSuccessCount++;
      } else {
        this.coursesFailedToAdd.push(course);
        this.addFailureCount++;
      }
    }
  }

  getCourseNameAndSection(courseId: string): string {
    for (const course of this.courses) {
      if (course.id === courseId) {
        let courseNameAndSection = course.name;
        if (course.section) {
          courseNameAndSection += ' ' + $localize`(Section ${course.section}:section:)`;
        }
        return courseNameAndSection;
      }
    }
  }

  get selectedCoursesControl() {
    return <FormArray>this.form.get('selectedCourses');
  }

  closeAll() {
    this.dialog.closeAll();
  }
}

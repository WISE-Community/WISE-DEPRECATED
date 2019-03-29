import { Component, Inject, OnInit } from '@angular/core';
import { TeacherService } from '../teacher.service';
import { Course } from '../../domain/course';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material';
import {UserService} from '../../services/user.service';

@Component({
  selector: 'app-list-classroom-courses-dialog',
  templateUrl: './list-classroom-courses-dialog.component.html',
  styleUrls: ['./list-classroom-courses-dialog.component.scss']
})
export class ListClassroomCoursesDialogComponent implements OnInit {
  courses: Course[] = [];
  accessCode: string = '';
  unitTitle: string = '';
  isAdded: boolean = false;
  constructor(public dialog: MatDialog,
              public dialogRef: MatDialogRef<ListClassroomCoursesDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private teacherService: TeacherService,
              private userService: UserService) {
    this.accessCode = data.accessCode;
    this.unitTitle = data.unitTitle;
    for (let course of data.courses) {
      this.courses.push(new Course(course));
    }
  }

  ngOnInit() {
  }

  addToClassroom(courseId: string) {
    this.teacherService.addToClassroom(this.accessCode, this.unitTitle, courseId, this.userService.getUser().getValue().username);
    this.isAdded = true;
  }

  closeAll() {
    this.dialog.closeAll();
  }
}
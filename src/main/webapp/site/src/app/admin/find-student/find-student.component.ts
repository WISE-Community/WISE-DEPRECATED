import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { AdminService } from '../admin.service';
import { UserService } from '../../services/user.service';
import { Student } from '../../domain/student';

@Component({
  selector: 'app-find-student',
  templateUrl: './find-student.component.html',
  styleUrls: ['./find-student.component.scss']
})
export class FindStudentComponent implements OnInit {

  fistName: string = null;
  lastName: string = null;
  username: string = '';
  id: string = '';
  runId: string = '';
  workgroupId: string = '';
  teacherUsername: string = '';
  showSearchById: boolean = false;
  searchResultsAvailable: boolean = false;
  dataSource: MatTableDataSource<Student> = new MatTableDataSource<Student>();

  constructor(private adminService: AdminService, private userService: UserService) { }

  ngOnInit() {
    this.showSearchById = this.userService.isAdmin();
    const student = [new Student({ username: 'test' })];
    this.dataSource = new MatTableDataSource<Student>(student);
    this.searchResultsAvailable = true;
  }

  search() {
    if (!this.fistName && !this.lastName && !this.username && !this.id &&
        !this.runId && !this.workgroupId && !this.teacherUsername) {
      alert('You must enter at least one field.');
    } else {
      this.adminService.searchStudents(this.fistName, this.lastName, this.username, this.id, this.runId, this.workgroupId,
        this.teacherUsername).subscribe(students => {
          this.dataSource = new MatTableDataSource(students);
          this.searchResultsAvailable = true;
      });
    }
  }

  clearFormFields() {
  }
}

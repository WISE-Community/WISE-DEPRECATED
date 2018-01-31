import { Component, OnInit } from '@angular/core';
import { StudentRun } from '../student-run';
import { StudentService } from '../student.service';

@Component({
  selector: 'app-student-run-list',
  templateUrl: './student-run-list.component.html',
  styleUrls: ['./student-run-list.component.scss']
})
export class StudentRunListComponent implements OnInit {

  runs: StudentRun[];

  constructor(private studentService: StudentService) { }

  ngOnInit() {
    this.getRuns();
  }

  getRuns() {
    this.studentService.getRuns()
      .subscribe(runs => this.runs = runs);
  }
}

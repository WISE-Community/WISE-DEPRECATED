import { Component, OnInit, Input } from '@angular/core';
import { StudentRun } from '../student-run';

@Component({
  selector: 'app-student-run-list-item',
  templateUrl: './student-run-list-item.component.html',
  styleUrls: ['./student-run-list-item.component.scss']
})
export class StudentRunListItemComponent implements OnInit {

  @Input()
  run: StudentRun;

  constructor() { }

  ngOnInit() {
  }

}

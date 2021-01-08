import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-teacher',
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.scss']
})
export class TeacherComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {}

  isShowingAngularJSApp() {
    return this.router.url.includes('/teacher/edit') || this.router.url.includes('/teacher/manage');
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from "@angular/router";
import { switchMap } from "rxjs/operator/switchMap";
import { Teacher } from "../../domain/teacher";
import { TeacherService } from "app/teacher/teacher.service";

@Component({
  selector: 'app-register-teacher-form',
  templateUrl: './register-teacher-form.component.html',
  styleUrls: ['./register-teacher-form.component.scss']
})
export class RegisterTeacherFormComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute,
      private teacherService: TeacherService) { }

  teacherUser: Teacher = new Teacher();
  schoolLevels: string[] = ["ELEMENTARY_SCHOOL", "MIDDLE_SCHOOL", "HIGH_SCHOOL", "COLLEGE", "OTHER"];

  private sub: any;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.teacherUser.googleUserId = params['gID'];
      const name = params['name'];
      if (name != null) {
        this.teacherUser.firstName = name.substring(0, name.indexOf(" "));
        this.teacherUser.lastName = name.substring(name.indexOf(" ") + 1);
      }
      this.teacherUser.email = params['email'];
    });
  }

  createAccount() {
    this.teacherService.registerTeacherAccount(this.teacherUser, (userName) => {
      this.router.navigate(['join/teacher/complete',
        { username: userName }
      ]);
    });
  }
}

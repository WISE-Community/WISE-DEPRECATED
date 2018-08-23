import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-register-teacher-complete',
  templateUrl: './register-teacher-complete.component.html',
  styleUrls: ['./register-teacher-complete.component.scss']
})
export class RegisterTeacherCompleteComponent implements OnInit {

  constructor(private router: Router, private route: ActivatedRoute) { }

  username: string;
  isUsingGoogleId: boolean;
  private sub: any;

  ngOnInit() {
    this.sub = this.route.params.subscribe(params => {
      this.username = params['username'];
      this.isUsingGoogleId = params['isUsingGoogleId'];
    });
  }
}

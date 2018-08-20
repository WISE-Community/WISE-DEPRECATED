import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-teacher-google-user-already-exists',
  templateUrl: './register-teacher-google-user-already-exists.component.html',
  styleUrls: ['./register-teacher-google-user-already-exists.component.scss']
})
export class RegisterTeacherGoogleUserAlreadyExistsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public socialSignIn(socialPlatform : string) {
    window.location.href = "/wise/google-login";
  }
}

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register-google-user-already-exists',
  templateUrl: './register-google-user-already-exists.component.html',
  styleUrls: ['./register-google-user-already-exists.component.scss']
})
export class RegisterGoogleUserAlreadyExistsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  public socialSignIn(socialPlatform : string) {
    window.location.href = "/wise/google-login";
  }
}

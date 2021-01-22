import { Component, OnInit } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-register-google-user-already-exists',
  templateUrl: './register-google-user-already-exists.component.html',
  styleUrls: ['./register-google-user-already-exists.component.scss']
})
export class RegisterGoogleUserAlreadyExistsComponent implements OnInit {
  constructor(private configService: ConfigService) {}

  ngOnInit() {}

  public socialSignIn(socialPlatform: string) {
    window.location.href = `${this.configService.getContextPath()}/google-login`;
  }
}

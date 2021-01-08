import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-register-student-complete',
  templateUrl: './register-student-complete.component.html',
  styleUrls: ['./register-student-complete.component.scss']
})
export class RegisterStudentCompleteComponent implements OnInit {
  username: string;
  isUsingGoogleId: boolean;
  googleLogInURL = `${this.configService.getContextPath()}/google-login`;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.username = params['username'];
      this.isUsingGoogleId = params['isUsingGoogleId'] == 'true';
    });
  }

  login() {
    this.router.navigate(['/login', { username: this.username }]);
  }
}

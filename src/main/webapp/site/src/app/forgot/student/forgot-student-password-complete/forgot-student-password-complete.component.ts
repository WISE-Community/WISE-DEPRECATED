import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-student-password-complete',
  templateUrl: './forgot-student-password-complete.component.html',
  styleUrls: ['./forgot-student-password-complete.component.scss']
})
export class ForgotStudentPasswordCompleteComponent implements OnInit {
  username: string = null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    const username = this.route.snapshot.queryParamMap.get('username');
    if (username != null) {
      this.username = username;
    }
  }

  goToLoginPage() {
    const params: any = {};
    if (this.username != null) {
      params.username = this.username;
    }
    this.router.navigate(['/login', params]);
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-forgot-teacher-password-complete',
  templateUrl: './forgot-teacher-password-complete.component.html',
  styleUrls: ['./forgot-teacher-password-complete.component.scss']
})
export class ForgotTeacherPasswordCompleteComponent implements OnInit {
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

import { Component } from '@angular/core';
import { Teacher } from '../../../domain/teacher';
import { UserService } from '../../../services/user.service';

@Component({
  styleUrls: ['unlink-google-account-success.component.scss'],
  templateUrl: 'unlink-google-account-success.component.html'
})
export class UnlinkGoogleAccountSuccessComponent {
  username: string;

  constructor(private userService: UserService) {}

  ngOnInit() {
    const user = <Teacher>this.userService.getUser().getValue();
    this.username = user.username;
  }
}

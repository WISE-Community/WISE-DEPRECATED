import { Component, OnInit, Input } from '@angular/core';
import { User } from '../../../domain/user';
@Component({
  selector: 'app-header-links',
  templateUrl: './header-links.component.html',
  styleUrls: ['./header-links.component.scss']
})
export class HeaderLinksComponent implements OnInit {
  @Input()
  user: User;

  @Input()
  location: string;

  role: string = '';

  constructor() {}

  ngOnInit() {}

  ngOnChanges(changes) {
    if (changes.user) {
      let user = changes.user.currentValue;
      if (user) {
        this.role = user.role;
      }
    }
  }
}

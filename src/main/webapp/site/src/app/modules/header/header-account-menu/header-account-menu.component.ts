import { Component, OnInit, Input } from '@angular/core';
import { User } from "../../../domain/user";

@Component({
  selector: 'app-header-account-menu',
  templateUrl: './header-account-menu.component.html',
  styleUrls: ['./header-account-menu.component.scss']
})
export class HeaderAccountMenuComponent implements OnInit {

  @Input()
  user: User;

  constructor() { }

  ngOnInit() {
  }

}

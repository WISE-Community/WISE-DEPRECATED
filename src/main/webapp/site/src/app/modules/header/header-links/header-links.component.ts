import { Component, OnInit, Input } from '@angular/core';
import { User } from "../../../domain/user";
@Component({
  selector: 'app-header-links',
  templateUrl: './header-links.component.html',
  styleUrls: ['./header-links.component.scss']
})
export class HeaderLinksComponent implements OnInit {

  @Input()
  user: User;

  @Input()
  location: string; // the current location

  constructor() { }

  ngOnInit() {
  }

}

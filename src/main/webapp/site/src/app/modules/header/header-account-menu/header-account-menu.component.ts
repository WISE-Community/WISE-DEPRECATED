import { Component, OnInit, Input } from '@angular/core';
import { ConfigService } from "../../../services/config.service";
import { User } from "../../../domain/user";

@Component({
  selector: 'app-header-account-menu',
  templateUrl: './header-account-menu.component.html',
  styleUrls: ['./header-account-menu.component.scss']
})
export class HeaderAccountMenuComponent implements OnInit {

  @Input()
  user: User;

  logOutURL: string;

  constructor(private configService: ConfigService) {
    this.configService = configService;
  }

  ngOnInit() {
    this.configService.getConfig().subscribe(config => {
      this.logOutURL = config.logOutURL;
    });
  }
}

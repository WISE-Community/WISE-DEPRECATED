import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Subscription } from 'rxjs';
import { MediaChange, ObservableMedia } from '@angular/flex-layout';
import { UtilService } from "./services/util.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  showMobileMenu: boolean = false;
  mediaWatcher: Subscription;

  constructor(private router: Router,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              utilService: UtilService,
              media: ObservableMedia) {
    iconRegistry.addSvgIcon(
      'ki-elicit',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ki-elicit.svg')
    );
    iconRegistry.addSvgIcon(
      'ki-add',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ki-add.svg')
    );
    iconRegistry.addSvgIcon(
      'ki-distinguish',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ki-distinguish.svg')
    );
    iconRegistry.addSvgIcon(
      'ki-connect',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ki-connect.svg')
    );
    iconRegistry.addSvgIcon(
      'facebook',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/facebook.svg')
    );
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/twitter.svg')
    );
    utilService.getMobileMenuState()
      .subscribe(state => {
        this.showMobileMenu = state;
      });
    this.mediaWatcher = media.subscribe((change: MediaChange) => {
      if (media.isActive('gt-sm')) {
        utilService.showMobileMenu(false);
      }
    });
    router.events.subscribe((event) => {
      utilService.showMobileMenu(false);
    });
  }

  showHeaderAndFooter(): boolean {
    return !this.router.url.includes('/login') &&
      !this.router.url.includes('/join');
  }
}

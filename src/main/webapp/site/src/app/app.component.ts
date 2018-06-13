import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';

  constructor(private router: Router, iconRegistry: MatIconRegistry,
      sanitizer: DomSanitizer) {
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
      'ki-sort',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/ki-sort.svg')
    );
  }

  showHeaderAndFooter(): boolean {
    return !this.router.url.includes('/login');
  }
}

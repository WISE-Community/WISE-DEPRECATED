import { Component } from '@angular/core';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { MatDialog, MatDialogRef } from "@angular/material";
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UtilService } from "./services/util.service";
import { ConfigService } from "./services/config.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  showMobileMenu: boolean = false;
  mediaWatcher: Subscription;
  hasAnnouncement: boolean = true;
  popstate: boolean = false;
  pageY: number = 0;
  prevPageY: number = 0;
  scroll: boolean = false;

  constructor(private router: Router,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              utilService: UtilService,
              media: MediaObserver,
              public dialog: MatDialog) {
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
      'facebook-ffffff',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/facebook-ffffff.svg')
    );
    iconRegistry.addSvgIcon(
      'twitter',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/twitter.svg')
    );
    iconRegistry.addSvgIcon(
      'twitter-ffffff',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/twitter-ffffff.svg')
    );
    iconRegistry.addSvgIcon(
      'github',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/github.svg')
    );
    iconRegistry.addSvgIcon(
      'github-ffffff',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/github-ffffff.svg')
    );
    iconRegistry.addSvgIcon(
      'google-classroom',
      sanitizer.bypassSecurityTrustResourceUrl('assets/img/icons/google-classroom.svg')
    );
    utilService.getMobileMenuState()
      .subscribe(state => {
        this.showMobileMenu = state;
      });
    this.mediaWatcher = media.asObservable().subscribe((change: MediaChange[]) => {
      if (media.isActive('gt-sm')) {
        utilService.showMobileMenu(false);
      }
    });
    router.events.subscribe((event) => {
      utilService.showMobileMenu(false);
    });
  }

  ngOnInit() {
    /** Temporary hack to ensure scroll to top on router navigation (excluding
     * back/forward browser button presses)
     * TODO: remove when https://github.com/angular/material2/issues/4280 is resolved
     */
    this.router.events.subscribe((ev: any) => {
      const topElement = document.querySelector('.top-content',);
      if (!topElement) {
        return;
      }
      if (ev instanceof NavigationStart) {
        this.popstate = ev.navigationTrigger === 'popstate';
      } else if (ev instanceof NavigationEnd) {
        if (!this.popstate) {
          topElement.scrollIntoView();
        }
      }
    });
  }

  showHeaderAndFooter(): boolean {
    return !this.router.url.includes('/login') &&
      !this.router.url.includes('/join') &&
      !this.router.url.includes('/contact') &&
      !this.router.url.includes('/forgot');
  }

  showAnnouncementDetails() {
    this.dialog.open(AnnouncementDialogComponent, {
      panelClass: 'mat-dialog--md'
    });
  }

  dismissAnnouncement() {
    this.hasAnnouncement = false;
  }

  onYPositionChange(pageY:number) {
    this.pageY = pageY;
    this.scroll = this.pageY > 360 && this.pageY < this.prevPageY;
    this.prevPageY = pageY;
  }

  scrollToTop() {
    document.querySelector('.top-content').scrollIntoView();
  }
}

@Component({
  selector: 'announcement-dialog',
  templateUrl: 'announcement-dialog.component.html',
})
export class AnnouncementDialogComponent {
  constructor(public dialogRef: MatDialogRef<AnnouncementDialogComponent>,
              private router: Router,
              public configService: ConfigService) {
  }

  contact() {
    this.dialogRef.close();
    this.router.navigate(['/contact']);
  }

  visitLegacy() {
    document.location.href = this.configService.getContextPath() + '/legacy';
  }
}

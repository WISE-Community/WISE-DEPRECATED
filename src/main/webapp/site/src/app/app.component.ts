import { Component, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd, NavigationStart } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material';
import { Subscription } from 'rxjs';
import { MediaChange, MediaObserver } from '@angular/flex-layout';
import { UtilService } from "./services/util.service";
import { ConfigService } from "./services/config.service";
import { Announcement } from './domain/announcement';
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  showMobileMenu: boolean = false;
  mediaWatcher: Subscription;
  hasAnnouncement: boolean = false;
  isAngularJSPath: boolean = false;
  showDefaultMode: boolean = true;
  showHeaderAndFooter: boolean = true;
  popstate: boolean = false;
  pageY: number = 0;
  prevPageY: number = 0;
  scroll: boolean = false;
  announcement: Announcement = new Announcement();

  constructor(private router: Router,
              iconRegistry: MatIconRegistry,
              sanitizer: DomSanitizer,
              utilService: UtilService,
              media: MediaObserver,
              private configService: ConfigService,
              @Inject(DOCUMENT) private document: Document) {
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
    this.router.events.subscribe((ev: any) => {
      if (ev instanceof NavigationEnd) {
        gtag('config', 'UA-789725-1', { 'page_path': ev.urlAfterRedirects });
        this.showDefaultMode = this.isShowDefaultMode();
        this.showHeaderAndFooter = this.isShowHeaderAndFooter();
        this.isAngularJSPath = this.isAngularJSRoute();
        this.toggleSiteStyles(this.isAngularJSPath);
        this.scroll = false;
      }

      /** Temporary hack to ensure scroll to top on router navigation (excluding
       * back/forward browser button presses)
       * TODO: remove when https://github.com/angular/material2/issues/4280 is resolved
       */
      this.fixScrollTop(ev);
    });

    this.configService.getAnnouncement().subscribe((announcement: Announcement) => {
      this.announcement = announcement;
      this.hasAnnouncement = announcement.visible;
    });
  }

  toggleSiteStyles(disable: boolean) {
    const siteStylesheet = this.document.querySelector('[href^="siteStyles"]') as HTMLLinkElement;
    siteStylesheet.disabled = disable;
  }

  fixScrollTop(ev: any) {
    const topElement = document.querySelector('.top-content',);
    if (!topElement) {
      return;
    }
    if (ev instanceof NavigationStart) {
      this.popstate = ev.navigationTrigger === 'popstate';
    }
    if (ev instanceof NavigationEnd) {
      if (!this.popstate) {
        topElement.scrollIntoView();
      }
    }
  }

  isShowDefaultMode(): boolean {
    return !this.router.url.includes('/login') &&
      !this.router.url.includes('/join') &&
      !this.router.url.includes('/contact') &&
      !this.router.url.includes('/forgot');
  }

  isShowHeaderAndFooter() {
    return this.isShowDefaultMode() && !this.isAngularJSRoute();
  }

  isAngularJSRoute() {
    return this.router.url.includes('/teacher/manage') ||
      this.router.url.includes('/teacher/edit') ||
      this.router.url.includes('/student/unit') ||
      this.router.url.includes('/preview/unit');
  }

  dismissAnnouncement() {
    this.hasAnnouncement = false;
  }

  onYPositionChange(el:HTMLElement) {
    this.pageY = el.scrollTop;
    const isAtBottom = this.pageY >= el.scrollHeight - el.offsetHeight - 2;
    this.scroll = isAtBottom || (this.pageY > 360 && this.pageY < this.prevPageY);
    this.prevPageY = this.pageY;
  }

  scrollToTop() {
    document.querySelector('.top-content').scrollIntoView();
  }
}

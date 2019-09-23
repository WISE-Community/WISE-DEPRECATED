import * as angular from 'angular';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule }              from './app/app.module';
import { setAngularJSGlobal } from '@angular/upgrade/static';

setAngularJSGlobal(angular);
platformBrowserDynamic().bootstrapModule(AppModule);

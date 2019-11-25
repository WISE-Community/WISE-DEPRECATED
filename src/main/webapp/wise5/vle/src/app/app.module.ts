import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { UpgradeModule } from '@angular/upgrade/static';
import VLEModule from './app.module.ajs';
import { Html } from '../../../components/html/html.component';
import { SessionService } from '../../../services/sessionService';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    BrowserModule,
    HttpClientModule,
    UpgradeModule
  ],
  providers: [
    SessionService
  ],
  declarations: [
    Html
  ],
  entryComponents: [
    Html
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [VLEModule.name], { strictDi: true });
  }
}

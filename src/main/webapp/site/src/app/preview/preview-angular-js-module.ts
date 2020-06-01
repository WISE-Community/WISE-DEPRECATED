
import {Component, NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';

import preview from '../../../../wise5/vle/preview';
import {UpgradeModule} from '@angular/upgrade/static';
import {setUpLocationSync} from '@angular/router/upgrade';
import { UtilService } from '../../../../wise5/services/utilService';

@Component({template: ``})
export class EmptyComponent {}

@NgModule({
  declarations: [
    EmptyComponent
  ],
  imports: [
    UpgradeModule,
    RouterModule.forChild([
      {path: '**', component: EmptyComponent}
    ])
  ],
  providers: [
    UtilService
  ]
})
export class PreviewAngularJSModule {
  // The constructor is called only once, so we bootstrap the application
  // only once, when we first navigate to the legacy part of the app.
  constructor(upgrade: UpgradeModule) {
    upgrade.bootstrap(document.body, [preview.name]);
    setUpLocationSync(upgrade);
  }
}

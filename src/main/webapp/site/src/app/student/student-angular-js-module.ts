
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import vle from '../../../../wise5/vle/vle';
import { UpgradeModule } from '@angular/upgrade/static';
import { setUpLocationSync } from '@angular/router/upgrade';
import { UtilService } from '../../../../wise5/services/utilService';
import { ConfigService } from '../../../../wise5/services/configService';
import { ProjectService } from '../../../../wise5/services/projectService';
import { AuthoringToolProjectService } from '../../../../wise5/authoringTool/authoringToolProjectService';
import { VLEProjectService } from '../../../../wise5/vle/vleProjectService';
import { ClassroomMonitorProjectService } from '../../../../wise5/classroomMonitor/classroomMonitorProjectService';

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
    UtilService,
    ConfigService,
    ProjectService,
    AuthoringToolProjectService,
    ClassroomMonitorProjectService,
    VLEProjectService
  ]
})
export class StudentAngularJSModule {
  // The constructor is called only once, so we bootstrap the application
  // only once, when we first navigate to the legacy part of the app.
  constructor(upgrade: UpgradeModule) {
    upgrade.bootstrap(document.body, [vle.name]);
    setUpLocationSync(upgrade);
  }
}

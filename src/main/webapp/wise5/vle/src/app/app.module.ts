import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { UpgradeModule } from '@angular/upgrade/static';
import VLEModule from './app.module.ajs';
import { Html } from '../../../components/html/html.component';
import { SessionService } from '../../../session/session-service';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DEFAULT_OPTIONS } from '@angular/material/dialog';
import { SessionWarningDialogComponent } from '../../../session/session-warning-dialog.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import {
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule,
  MatDatepickerModule, MatDialogModule, MatDividerModule, MatIconModule,
  MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatRadioModule,
  MatSnackBarModule, MatTableModule, MatTabsModule, MatTooltipModule
} from '@angular/material';

const materialModules = [
  MatAutocompleteModule, MatButtonModule, MatCardModule, MatCheckboxModule,
  MatDatepickerModule, MatDialogModule, MatDividerModule, MatIconModule,
  MatMenuModule, MatNativeDateModule, MatProgressBarModule, MatRadioModule,
  MatSnackBarModule, MatTabsModule, MatTableModule, MatTooltipModule
];
@NgModule({
  imports: [
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    HttpClientModule,
    materialModules,
    UpgradeModule
  ],
  providers: [
    SessionService,
    {provide: MAT_DIALOG_DEFAULT_OPTIONS, useValue: {hasBackdrop: false}}
  ],
  declarations: [
    Html,
    SessionWarningDialogComponent
  ],
  entryComponents: [
    Html,
    SessionWarningDialogComponent
  ]
})
export class AppModule {
  constructor(private upgrade: UpgradeModule) { }
  ngDoBootstrap() {
    this.upgrade.bootstrap(document.body, [VLEModule.name], { strictDi: true });
  }
}

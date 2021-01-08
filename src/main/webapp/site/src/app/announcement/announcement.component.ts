import { Component, EventEmitter, Input, Output, ViewEncapsulation, Inject } from '@angular/core';
import { Announcement } from '../domain/announcement';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-announcement',
  templateUrl: './announcement.component.html',
  styleUrls: ['./announcement.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AnnouncementComponent {
  @Input()
  announcement: Announcement = new Announcement();

  @Output('callback')
  doCallback: EventEmitter<any> = new EventEmitter<any>();

  @Output('dismiss')
  doDismiss: EventEmitter<any> = new EventEmitter<any>();

  constructor(public dialog: MatDialog) {}

  dismiss() {
    this.doDismiss.emit();
  }

  showAnnouncementDetails() {
    this.dialog.open(AnnouncementDialogComponent, {
      data: this.announcement,
      panelClass: 'mat-dialog--md'
    });
  }
}

@Component({
  selector: 'announcement-dialog',
  templateUrl: 'announcement-dialog.component.html'
})
export class AnnouncementDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<AnnouncementDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Announcement
  ) {}
}

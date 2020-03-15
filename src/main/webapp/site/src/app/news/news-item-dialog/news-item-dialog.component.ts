import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-news-item-dialog',
  templateUrl: './news-item-dialog.component.html',
  styleUrls: ['./news-item-dialog.component.scss']
})
export class NewsItemDialogComponent implements OnInit {

  isEditMode: boolean;

  constructor(private dialogRef: MatDialogRef<NewsItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) {
                this.isEditMode = data.isEditMode;
              }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }
}

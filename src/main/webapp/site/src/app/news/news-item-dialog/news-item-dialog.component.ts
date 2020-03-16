import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-news-item-dialog',
  templateUrl: './news-item-dialog.component.html',
  styleUrls: ['./news-item-dialog.component.scss']
})
export class NewsItemDialogComponent implements OnInit {

  isEditMode: boolean;
  public Editor = ClassicEditor;

  formGroup: FormGroup = new FormGroup({
    title: new FormControl(''),
    content: new FormControl('')
  });

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

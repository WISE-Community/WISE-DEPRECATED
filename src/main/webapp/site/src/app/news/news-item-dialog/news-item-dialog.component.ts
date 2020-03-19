import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-news-item-dialog',
  templateUrl: './news-item-dialog.component.html',
  styleUrls: ['./news-item-dialog.component.scss']
})
export class NewsItemDialogComponent implements OnInit {

  isEditMode: boolean;
  public Editor = ClassicEditor;

  title = new FormControl('');
  type = new FormControl('');
  content = new FormControl('');

  constructor(private dialogRef: MatDialogRef<NewsItemDialogComponent>,
              @Inject(MAT_DIALOG_DATA) private data: any) {
                this.isEditMode = !!data.isEditMode;
                if (data.newsItem) {
                  this.title.setValue(data.newsItem.title);
                  this.type.setValue(data.newsItem.type);
                  this.content.setValue(data.newsItem.news);
                }
              }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  onChange({ editor }: ChangeEvent) {
    const data = editor.getData();
    this.content.setValue(data);
  }

  publish() {
    console.log(this.title.value);
    console.log(this.type.value);
    console.log(this.content.value);
  }

  save() {
    this.data.title = this.title.value;
    this.data.type = this.type.value;
    this.data.news = this.content.value;
    this.close();
  }
}

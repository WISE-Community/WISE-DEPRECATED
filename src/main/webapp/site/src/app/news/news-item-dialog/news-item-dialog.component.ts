import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { NewsItemMode } from '../news-item-mode';
import { NewsService } from '../../services/news.service';
import { News } from '../../domain/news';

@Component({
  selector: 'app-news-item-dialog',
  templateUrl: './news-item-dialog.component.html',
  styleUrls: ['./news-item-dialog.component.scss']
})
export class NewsItemDialogComponent implements OnInit {

  @Output() onCreate = new EventEmitter();
  @Output() onHide = new EventEmitter();
  @Output() onUpdate = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  isAddMode: boolean;
  isHideMode: boolean;
  isEditMode: boolean;
  isDeleteMode: boolean;
  public Editor = ClassicEditor;
  
  newsItemFormGroup: FormGroup = new FormGroup({
    id: new FormControl(null),
    date: new FormControl(null),
    title: new FormControl(null, [Validators.required]),
    type: new FormControl(null, [Validators.required])
  });
  news = new FormControl(null, [Validators.required]);

  hideConfirmationMsg: string;

  constructor(private dialogRef: MatDialogRef<NewsItemDialogComponent>,
              private newsService: NewsService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) private data: any) {
                this.isAddMode = NewsItemMode.ADD == data.mode;
                this.isHideMode = NewsItemMode.HIDE == data.mode;
                this.isEditMode = NewsItemMode.EDIT == data.mode;
                this.isDeleteMode = NewsItemMode.DELETE == data.mode;
                if (data.newsItem) {
                  this.newsItemFormGroup.controls.id.setValue(data.newsItem.id);
                  this.newsItemFormGroup.controls.date.setValue(data.newsItem.date);
                  this.newsItemFormGroup.controls.title.setValue(data.newsItem.title);
                  this.newsItemFormGroup.controls.type.setValue(data.newsItem.type);
                  this.news.setValue(data.newsItem.news);
                  if (data.newsItem.type === 'hidden') {
                    this.hideConfirmationMsg = 'Are you sure you want to show this news item? This news item will be visible to everyone.';
                  } else {
                    this.hideConfirmationMsg = 'Are you sure you want to hide this news item? This news item will nolonger be visible to non-admin users.';
                  }
                }
              }

  ngOnInit() {
  }

  close() {
    this.dialogRef.close();
  }

  onChange({ editor }: ChangeEvent) {
    const data = editor.getData();
    this.news.setValue(data);
  }

  create() {
    const date = this.newsItemFormGroup.controls.date.value;
    const title = this.newsItemFormGroup.controls.title.value;
    const news = this.news.value;
    const type = this.newsItemFormGroup.controls.type.value;
    this.newsService.createNewsItem(date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onCreate.emit(response.newsItem as News);
      }
      this.openSnackBar(response, 'News item created');
    });
  }

  update() {
    const id = this.newsItemFormGroup.controls.id.value;
    const date = this.newsItemFormGroup.controls.date.value;
    const title = this.newsItemFormGroup.controls.title.value;
    const news = this.news.value;
    const type = this.newsItemFormGroup.controls.type.value;
    this.newsService.updateNewsItem(id, date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onUpdate.emit({ id, date, title, news, type });
      }
      this.openSnackBar(response, 'News item updated');
    });
  }

  proceed() {
    if (this.isDeleteMode) {
      this.delete();
    } else if (this.isHideMode) {
      this.toggleHide();
    }
  }

  private toggleHide() {
    const id = this.newsItemFormGroup.controls.id.value;
    const date = this.newsItemFormGroup.controls.date.value;
    const title = this.newsItemFormGroup.controls.title.value;
    const news = this.news.value;
    const type = this.newsItemFormGroup.controls.type.value !== 'hidden' ? 'hidden' : 'public';
    this.newsService.updateNewsItem(id, date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onHide.emit({ id, type });
      }
      this.openSnackBar(response, `News item type changed to ${type}`);
    });
  }

  private delete() {
    const id = this.newsItemFormGroup.controls.id.value;
    this.newsService.deleteNewsItem(id).subscribe(response => {
      if (response.status == 'success') {
        this.onDelete.emit(id);
      }
      this.openSnackBar(response, 'News item deleted');
    });
  }

  private openSnackBar(response: any, defaultMsg: string) {
    if (response.status == 'success') {
      this.snackBar.open(defaultMsg);
    } else if (response.status == 'error') {
      this.snackBar.open(response.message);
    } else {
      this.snackBar.open('Unknown error occurred');
    }
    this.newsItemFormGroup.reset();
    this.close();
  }
}

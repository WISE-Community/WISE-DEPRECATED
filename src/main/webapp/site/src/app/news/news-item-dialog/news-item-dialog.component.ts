import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import * as ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { ChangeEvent } from '@ckeditor/ckeditor5-angular/ckeditor.component';
import { FormControl } from '@angular/forms';
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
  @Output() onUpdate = new EventEmitter();
  @Output() onDelete = new EventEmitter();

  isAddMode: boolean;
  isEditMode: boolean;
  isDeleteMode: boolean;
  public Editor = ClassicEditor;

  id = new FormControl();
  date = new FormControl();
  title = new FormControl();
  type = new FormControl();
  news = new FormControl();

  constructor(private dialogRef: MatDialogRef<NewsItemDialogComponent>,
              private newsService: NewsService,
              private snackBar: MatSnackBar,
              @Inject(MAT_DIALOG_DATA) private data: any) {
                this.isAddMode = NewsItemMode.ADD == data.mode;
                this.isEditMode = NewsItemMode.EDIT == data.mode;
                this.isDeleteMode = NewsItemMode.DELETE == data.mode;
                if (data.newsItem) {
                  this.id.setValue(data.newsItem.id);
                  this.date.setValue(data.newsItem.date);
                  this.title.setValue(data.newsItem.title);
                  this.type.setValue(data.newsItem.type);
                  this.news.setValue(data.newsItem.news);
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
    const date = this.date.value;
    const title = this.title.value;
    const news = this.news.value;
    const type = this.type.value;
    this.newsService.createNewsItem(date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onCreate.emit(response.newsItem as News);
      }
      this.openSnackBar(response, 'News item created');
    });
  }

  update() {
    const id = this.id.value;
    const date = this.date.value;
    const title = this.title.value;
    const news = this.news.value;
    const type = this.type.value;
    this.newsService.updateNewsItem(id, date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onUpdate.emit({ id, date, title, news, type });
      }
      this.openSnackBar(response, 'News item updated');
    });
  }

  delete() {
    this.newsService.deleteNewsItem(this.id.value).subscribe(response => {
      if (response.status == 'success') {
        this.onDelete.emit(this.id.value);
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
    this.close();
  }
}

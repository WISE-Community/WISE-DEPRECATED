import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormControl, Validators } from '@angular/forms';
import { NewsItemMode } from '../news-item-mode';
import { NewsService } from '../../services/news.service';
import { News } from '../../domain/news';
import { I18n } from '@ngx-translate/i18n-polyfill';
import * as Quill from 'quill';

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

  id = new FormControl(null);
  date = new FormControl(null);
  title = new FormControl(null, [Validators.required]);
  type = new FormControl(null, [Validators.required]);
  news = new FormControl(null, [Validators.required]);

  hideConfirmationMsg: string;

  editor: Quill;

  editorConfig = {
    modules: {
      toolbar: {
        container: [
          ['bold', 'italic', 'underline'],
          [{ header: 1 }, { header: 2 }, { header: 3 }],
          [{ align: [] }],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          [{ script: 'sub' }, { script: 'super' }],
          [{ color: [] }, { background: [] }],
          ['link', 'image', 'video']
        ],
        handlers: {
          image: this.imageHandler.bind(this)
        }
      }
    },
    placeholder: 'Enter news content here ...',
    theme: 'snow'
  };

  constructor(
    private dialogRef: MatDialogRef<NewsItemDialogComponent>,
    private newsService: NewsService,
    private snackBar: MatSnackBar,
    private i18n: I18n,
    @Inject(MAT_DIALOG_DATA) private data: any
  ) {
    this.isAddMode = NewsItemMode.ADD == data.mode;
    this.isHideMode = NewsItemMode.HIDE == data.mode;
    this.isEditMode = NewsItemMode.EDIT == data.mode;
    this.isDeleteMode = NewsItemMode.DELETE == data.mode;
    if (data.newsItem) {
      this.id.setValue(data.newsItem.id);
      this.date.setValue(data.newsItem.date);
      this.title.setValue(data.newsItem.title);
      this.type.setValue(data.newsItem.type);
      this.news.setValue(data.newsItem.news);
      if (data.newsItem.type === 'hidden') {
        this.hideConfirmationMsg = this.i18n(
          'Are you sure you want to show this news item to users?'
        );
      } else {
        this.hideConfirmationMsg = this.i18n(
          'Are you sure you want to hide this news item from users?'
        );
      }
    }
  }

  ngOnInit() {}

  ngAfterViewInit() {
    if (this.isAddMode || this.isEditMode) {
      this.editor = new Quill('#quill-editor', this.editorConfig);
      this.editor.root.innerHTML = this.news.value;
      this.editor.on('text-change', () => {
        const editorContent = this.editor.root.innerHTML;
        this.news.setValue(editorContent);
        if (editorContent === '<p><br></p>') {
          this.news.setValue(null);
        }
      });
      // hack to include H3 tag not supported by Quill
      const h3Elem = document.querySelector(".ql-toolbar .ql-formats button.ql-header[value='3']");
      if (!!h3Elem) {
        h3Elem.innerHTML = `
        <svg viewBox="0 0 18 18">
          <path class="ql-fill" d="M16.65186,12.30664a2.6742,2.6742,0,0,1-2.915,2.68457,3.96592,3.96592,0,0,1-2.25537-.6709.56007.56007,0,0,1-.13232-.83594L11.64648,13c.209-.34082.48389-.36328.82471-.1543a2.32654,2.32654,0,0,0,1.12256.33008c.71484,0,1.12207-.35156,1.12207-.78125,0-.61523-.61621-.86816-1.46338-.86816H13.2085a.65159.65159,0,0,1-.68213-.41895l-.05518-.10937a.67114.67114,0,0,1,.14307-.78125l.71533-.86914a8.55289,8.55289,0,0,1,.68213-.7373V8.58887a3.93913,3.93913,0,0,1-.748.05469H11.9873a.54085.54085,0,0,1-.605-.60547V7.59863a.54085.54085,0,0,1,.605-.60547h3.75146a.53773.53773,0,0,1,.60547.59375v.17676a1.03723,1.03723,0,0,1-.27539.748L14.74854,10.0293A2.31132,2.31132,0,0,1,16.65186,12.30664ZM9,3A.99974.99974,0,0,0,8,4V8H3V4A1,1,0,0,0,1,4V14a1,1,0,0,0,2,0V10H8v4a1,1,0,0,0,2,0V4A.99974.99974,0,0,0,9,3Z"/>
        </svg>`;
      }
    }
  }

  close() {
    this.dialogRef.close();
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

  proceed() {
    if (this.isDeleteMode) {
      this.delete();
    } else if (this.isHideMode) {
      this.toggleHide();
    }
  }

  private toggleHide() {
    const id = this.id.value;
    const date = this.date.value;
    const title = this.title.value;
    const news = this.news.value;
    const type = this.type.value !== 'hidden' ? 'hidden' : 'public';
    this.newsService.updateNewsItem(id, date, title, news, type).subscribe(response => {
      if (response.status == 'success') {
        this.onHide.emit({ id, type });
      }
      this.openSnackBar(response, `News item type changed to ${type}`);
    });
  }

  private delete() {
    const id = this.id.value;
    this.newsService.deleteNewsItem(id).subscribe(response => {
      if (response.status == 'success') {
        this.onDelete.emit(id);
      }
      this.openSnackBar(response, 'News item deleted');
    });
  }

  private imageHandler() {
    const imageInput = document.createElement('input');
    imageInput.setAttribute('type', 'file');
    imageInput.setAttribute('accept', 'image/png, image/gif, image/jpg');
    imageInput.classList.add('ql-image');

    imageInput.addEventListener('change', () => {
      if (imageInput.files != null && imageInput.files[0] != null) {
        const file = imageInput.files[0];
        this.newsService.saveNewsUpload(file).subscribe(response => {
          if (response != null && !!response.filename) {
            this.pushImageToEditor(response.filename);
          } else {
            this.snackBar.open('an error occurred while uploading the file.');
          }
        });
      }
    });
    imageInput.click();
  }

  private pushImageToEditor(imageName: string) {
    const range = this.editor.getSelection(true);
    const imageUrl = `http://localhost:8080/news-uploads/${imageName}`;
    this.editor.insertEmbed(range.index, 'image', imageUrl);
  }

  private openSnackBar(response: any, defaultMsg: string) {
    if (response.status == 'success') {
      this.snackBar.open(this.i18n(defaultMsg));
    } else if (response.status == 'error') {
      this.snackBar.open(this.i18n(response.message));
    } else {
      this.snackBar.open(this.i18n('Unknown error occurred'));
    }
    this.close();
  }
}

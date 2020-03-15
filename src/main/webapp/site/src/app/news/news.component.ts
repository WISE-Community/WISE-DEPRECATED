import { Component, OnInit, Input } from '@angular/core';
import { NewsService } from "../services/news.service";
import { News } from "../domain/news";
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';
import { NewsItemDialogComponent } from './news-item-dialog/news-item-dialog.component';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  @Input() isAdmin: boolean = false;

  allNewsItems: any = [];
  showAll: boolean = false;
  searchValue: string = '';

  constructor(private newsService: NewsService,
              private sanitizer: DomSanitizer,
              private dialog: MatDialog) { }

  ngOnInit() {
    this.newsService.getAllNews().subscribe((allNewsItems: News[]) => {
      this.allNewsItems = allNewsItems;
    });
  }

  searchUpdated(value: string) {
    this.searchValue = value.toLowerCase();
    this.emitFilterValues();
  }

  emitFilterValues() {
    console.log(`emitting value: ${this.searchValue}`);
  }

  addNewsItem() {
    this.dialog.open(NewsItemDialogComponent, {
      data: { isEditMode: true },
      panelClass: 'mat-dialog--md',
      disableClose: true
    })
  }

  hideNewsItem(id: number) {

  }

  editNewsItem(id: number) {

  }

  deleteNewsItem(id: number) {

  }
}

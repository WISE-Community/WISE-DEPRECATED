import { Component, OnInit, Input } from '@angular/core';
import { NewsService } from "../services/news.service";
import { News } from "../domain/news";
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog, MatSnackBar } from '@angular/material';
import { NewsItemDialogComponent } from './news-item-dialog/news-item-dialog.component';
import { NewsItemMode } from './news-item-mode';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {

  @Input() isAdmin: boolean = false;

  allNewsItems: any = [];
  filteredNewsItems: any = [];
  showAll: boolean = false;
  searchValue: string = '';

  constructor(private newsService: NewsService,
              private sanitizer: DomSanitizer,
              private dialog: MatDialog,
              private snackBar: MatSnackBar) { }

  ngOnInit() {
    this.newsService.getAllNews().subscribe((allNewsItems: News[]) => {
      this.allNewsItems = allNewsItems;
      this.applyFilter();
    });
  }

  private applyFilter() {
    this.filteredNewsItems = this.allNewsItems.filter(newsItem => {
      const filterTitle = !!newsItem.title && newsItem.title.trim().toLowerCase().includes(this.searchValue);
      const filterNews = !!newsItem.news && newsItem.news.trim().toLowerCase().includes(this.searchValue);
      return (filterTitle || filterNews) && newsItem.type !== 'hidden';
    });
  }

  searchUpdated(value: string) {
    this.searchValue = value.trim().toLowerCase();
    this.applyFilter();
  }

  createNewsItem() {
    const dialogRef = this.dialog.open(NewsItemDialogComponent, {
      data: { mode: NewsItemMode.ADD },
      panelClass: 'mat-dialog--md',
      disableClose: true
    });
    const sub = dialogRef.componentInstance.onCreate.subscribe(newsItem => {
      this.allNewsItems.unshift(newsItem);
      this.applyFilter();
    });
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe());
  }

  hideNewsItem(index: number) {
    const newsItem = this.filteredNewsItems[index]
    this.newsService.updateNewsItem(newsItem.id, newsItem.date, newsItem.title, newsItem.news, 'hidden').subscribe(response => {
      if (response.status == 'success') {
        newsItem.type = 'hidden';
        this.applyFilter();
        this.snackBar.open('News item changed to hidden');
      } else if (response.status == 'error') {
        this.snackBar.open(response.message);
      } else {
        this.snackBar.open('Unknown error occurred');
      }
    });
  }

  editNewsItem(index: number) {
    const dialogRef = this.dialog.open(NewsItemDialogComponent, {
      data: { mode: NewsItemMode.EDIT, newsItem: this.filteredNewsItems[index] },
      panelClass: 'mat-dialog--md',
      disableClose: true
    });
    const sub = dialogRef.componentInstance.onUpdate.subscribe(updatedNewsItem => {
      this.allNewsItems.forEach((newsItem, index) => {
        if (newsItem.id === updatedNewsItem.id) {
          this.allNewsItems[index] = updatedNewsItem;
          this.applyFilter();
        }
      });
    });
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe());
  }

  deleteNewsItem(index: number) {
    const dialogRef = this.dialog.open(NewsItemDialogComponent, {
      data: { mode: NewsItemMode.DELETE, newsItem: this.filteredNewsItems[index] },
      panelClass: 'mat-dialog--sm'
    });
    const sub = dialogRef.componentInstance.onDelete.subscribe(id => {
      this.allNewsItems.forEach((newsItem, index) => {
        if (newsItem.id === id) {
          this.allNewsItems.splice(index, 1);
          this.applyFilter();
        }
      });
    });
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe());
  }
}

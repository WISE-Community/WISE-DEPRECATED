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
      const showNewsItem = this.isAdmin || newsItem.type !== 'hidden';
      return (filterTitle || filterNews) && showNewsItem;
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

  toggleHideNewsItem(index: number) {
    const dialogRef = this.dialog.open(NewsItemDialogComponent, {
      data: { mode: NewsItemMode.HIDE, newsItem: this.filteredNewsItems[index] },
      panelClass: 'mat-dialog--sm'
    });
    const sub = dialogRef.componentInstance.onHide.subscribe(({ id, type }) => {
      this.allNewsItems.forEach(newsItem => {
        if (newsItem.id === id) {
          newsItem.type = type;
          this.applyFilter();
        }
      });
    });
    dialogRef.afterClosed().subscribe(() => sub.unsubscribe());
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

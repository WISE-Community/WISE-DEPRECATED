import { Component, OnInit } from '@angular/core';
import { NewsService } from '../services/news.service';
import { News } from '../domain/news';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  allNewsItems: any = [];
  showAll: boolean = false;

  constructor(private newsService: NewsService, private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.newsService.getAllNews().subscribe((allNewsItems: News[]) => {
      this.allNewsItems = allNewsItems;
    });
  }
}

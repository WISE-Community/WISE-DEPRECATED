import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { News } from '../domain/news';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private newsUrl = 'api/news';
  private createNewsItemUrl = 'api/news/create';
  private updateNewsItemUrl = 'api/news/update';
  private deleteNewsItemUrl = 'api/news/delete';

  private headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });

  constructor(private http: HttpClient) {}

  getAllNews(): Observable<News[]> {
    return this.http.get(this.newsUrl, { headers: this.headers }) as Observable<News[]>;
  }

  createNewsItem(date: any, title: string, news: string, type: string): Observable<any> {
    const body = new HttpParams()
      .set('date', this.getISODate(date))
      .set('title', title)
      .set('news', news)
      .set('type', type);
    return this.http.post(this.createNewsItemUrl, body, { headers: this.headers }) as Observable<any>;
  }

  updateNewsItem(id: number, date: any, title: string, news: string, type: string): Observable<any> {
    const body = new HttpParams()
      .set('id', id.toString())
      .set('date', this.getISODate(date))
      .set('title', title)
      .set('news', news)
      .set('type', type);
    return this.http.post(this.updateNewsItemUrl, body, { headers: this.headers }) as Observable<News>;
  }

  private getISODate(date: any): string {
    if (!!date) {
      return new Date(date).toISOString();
    }
    return new Date().toISOString();
  }

  deleteNewsItem(id: number): Observable<any> {
    return this.http.delete(`${this.deleteNewsItemUrl}/${id}`, { headers: this.headers }) as Observable<any>;
  }
}

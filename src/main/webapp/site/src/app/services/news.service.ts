import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { News } from '../domain/news';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private newsUrl = 'api/news';
  private configUrl = 'api/news/config';
  private createNewsItemUrl = 'api/news/create';
  private updateNewsItemUrl = 'api/news/update';
  private deleteNewsItemUrl = 'api/news/delete';
  private saveNewsUploadUrl = 'api/news/news-upload/save';

  private headers = new HttpHeaders({ 'Cache-Control': 'no-cache' });

  constructor(private http: HttpClient) {}

  getConfig(): Observable<any> {
    return this.http.get(this.configUrl, { headers: this.headers });
  }

  getAllNews(): Observable<News[]> {
    return this.http.get(this.newsUrl, { headers: this.headers }) as Observable<News[]>;
  }

  createNewsItem(date: any, title: string, news: string, type: string): Observable<any> {
    const body = new HttpParams()
      .set('date', this.getISODate(date))
      .set('title', title)
      .set('news', news)
      .set('type', type);
    return this.http.post(this.createNewsItemUrl, body, { headers: this.headers });
  }

  updateNewsItem(id: number, date: any, title: string, news: string, type: string): Observable<any> {
    const body = new HttpParams()
      .set('id', id.toString())
      .set('date', this.getISODate(date))
      .set('title', title)
      .set('news', news)
      .set('type', type);
    return this.http.post(this.updateNewsItemUrl, body, { headers: this.headers });
  }

  private getISODate(date: any): string {
    if (!!date) {
      return new Date(date).toISOString();
    }
    return new Date().toISOString();
  }

  deleteNewsItem(id: number): Observable<any> {
    return this.http.delete(`${this.deleteNewsItemUrl}/${id}`, { headers: this.headers });
  }

  saveNewsUpload(file: File): Observable<any> {
    const data = new FormData();
    data.append('file', file);
    return this.http.post(this.saveNewsUploadUrl, data);
  }
}

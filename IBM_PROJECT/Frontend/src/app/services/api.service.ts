import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private BASE_URL = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // Upload CSV File
  uploadCSV(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.BASE_URL}/upload/csv`, formData);
  }

  // Get statistical summary
  getStats(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/reviews/stats`);
  }

  // Get all reviews
  getReviews(): Observable<any> {
    return this.http.get(`${this.BASE_URL}/reviews`);
  }

  // For single text sentiment analysis (if needed), not yet implemented in the UI
  analyzeText(text: string): Observable<any> {
    return this.http.post(`${this.BASE_URL}/analyze/text`, { text });
  }

  // For word cloud
  analyzeWordCloud(text: string, max_words: number = 50): Observable<any> {
    return this.http.post(`${this.BASE_URL}/analyze/wordcloud`, { text, max_words });
  }  
  
}

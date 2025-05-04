import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxEchartsModule } from 'ngx-echarts';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Review } from '../models/review.model';
import { LinebreakPipe } from '../linebreak.pipe';
import { AuthService } from '../services/auth.service';
import WordCloud from 'wordcloud';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgxEchartsModule, LinebreakPipe, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  @ViewChild('wordCloudCanvas', { static: false }) wordCloudCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  totalReviews = 0;
  positivePercentage = 0.00;
  negativePercentage = 0.00;
  neutralPercentage = 0.00;
  reviews: Review[] = [];
  productName: string = 'Loading...';
  averageRating: number = 0;
  positiveReviews: Review[] = [];
  negativeReviews: Review[] = [];
  neutralReviews: Review[] = [];
  positiveChartOptions: any = {};
  negativeChartOptions: any = {};
  neutralChartOptions: any = {};

  constructor(private apiService: ApiService, private router: Router, private authService: AuthService) {}

  ngOnInit(): void {
    this.fetchDataWithDelay();
  }

  fetchDataWithDelay(): void {
    this.loading = true;
    // Add 5-second delay before fetching for giving the Backend time to start and process the request.
    // This is a temporary solution. Ideally, we should check if the backend is ready before making requests.
    setTimeout(() => this.fetchData(), 5000);
  }

  fetchData(): void {
    forkJoin({
      stats: this.apiService.getStats(),
      reviews: this.apiService.getReviews()
    }).subscribe({
      next: ({ stats, reviews }) => {
        console.log('--- New Data Received ---');
        console.log('Stats:', stats); // Log the entire stats object
        const pos = stats.sentiment_distribution?.positive || 0;
        const neu = stats.sentiment_distribution?.neutral || 0;
        const neg = stats.sentiment_distribution?.negative || 0;
        const total = pos + neu + neg;

        this.totalReviews = total;
        this.positivePercentage = total ? parseFloat(((pos / total) * 100).toFixed(2)) : 0.00;
        this.negativePercentage = total ? parseFloat(((neg / total) * 100).toFixed(2)) : 0.00;
        this.neutralPercentage = total ? parseFloat(((neu / total) * 100).toFixed(2)) : 0.00;
        this.averageRating = +stats.average_rating.toFixed(1);

        this.reviews = reviews;
        this.positiveReviews = reviews.filter((r: Review) => r.sentiment_label.toLowerCase() === 'positive');
        this.negativeReviews = reviews.filter((r: Review) => r.sentiment_label.toLowerCase() === 'negative');
        this.neutralReviews = reviews.filter((r: Review) => r.sentiment_label.toLowerCase() === 'neutral');


        if (reviews.length > 0) {
          this.productName = reviews[0].product_name;
        }

        this.setChartOptions();
        this.generateWordCloud();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }

  setChartOptions(): void {
    this.positiveChartOptions = this.createGaugeChart(this.positivePercentage, '#228B22');
    this.negativeChartOptions = this.createGaugeChart(this.negativePercentage, '#CC5500');
    this.neutralChartOptions = this.createGaugeChart(this.neutralPercentage, '#ADD8E6');
  }

  createGaugeChart(percentage: number, color: string): any {
    return {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          radius: '100%',
          pointer: { show: false },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: { color: color }
          },
          axisLine: {
            lineStyle: {
              width: 20,
              color: [
                [percentage / 100, color],
                [1, '#F0F0F0']
              ]
            }
          },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false },
          detail: {
            valueAnimation: true,
            formatter: '{value}%',
            color: '#000000',
            fontSize: 30,
            fontWeight: 'bold',
            fontFamily: 'Roboto Slab, serif',
            offsetCenter: [0, '0%']
          },
          data: [{ value: percentage }]
        }
      ]
    };
  }

  generateWordCloud(): void {
    const wordCounts: { [word: string]: number } = {};

    this.reviews.forEach(review => {
      const words = review.review_text.toLowerCase().match(/\b\w{4,}\b/g);
      if (words) {
        words.forEach(word => {
          wordCounts[word] = (wordCounts[word] || 0) + 1;
        });
      }
    });

    const entries = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100);

    const wordList: [string, number][] = entries.map(([text, size]) => [text, size]);


    setTimeout(() => {
      if (this.wordCloudCanvas) {
        WordCloud(this.wordCloudCanvas.nativeElement, {
          list: wordList,
          gridSize: 8,
          weightFactor: 3,
          fontFamily: 'Roboto Slab',
          color: () => this.getRandomColor(),
          rotateRatio: 0.5,
          backgroundColor: '#ffffff',
        });
      }
    }, 200);
  }

  getRandomColor(): string {
    const colors = ['#ff6b81', '#1e90ff', '#ffa502', '#2ed573', '#a55eea', '#ff4757'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  refreshStats(): void {
    this.fetchData();
  }

  logout(): void {
    this.authService.logout();
  }
}

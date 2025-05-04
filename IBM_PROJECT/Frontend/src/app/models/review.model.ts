export interface Review {
    review_text: string;
    sentiment_label: 'Positive' | 'Negative' | 'Neutral';
    sentiment_score: number;
    product_name: string;
  }
  
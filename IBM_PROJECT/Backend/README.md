# Sentiment Analysis API

This API provides sentiment analysis capabilities using RoBERTa model. It offers endpoints for analyzing text sentiment and managing review datasets.

## Setup

1. Install the required dependencies:
```bash
pip install -r requirements.txt
```

2. Run the API:
```bash
python api.py
```

The API will be available at `http://localhost:8000`

## API Endpoints

### 1. Text Analysis
- **Endpoint**: `/analyze/text`
- **Method**: POST
- **Input**: JSON with "text" field
- **Returns**: Sentiment analysis results using RoBERTa model

### 2. Word Cloud Analysis
- **Endpoint**: `/analyze/wordcloud`
- **Method**: POST
- **Input**: JSON with "text" field and optional "max_words" parameter (default: 100)
- **Returns**: Word frequencies and total word count
- **Features**:
  - Removes stopwords and short words
  - Filters special characters and numbers
  - Returns most frequent words in descending order

### 3. CSV Upload
- **Endpoint**: `/upload/csv`
- **Method**: POST
- **Input**: CSV file with columns:
  - ID
  - UserID
  - ProductID
  - Category
  - Product_name
  - Rating
  - Description
  - Text
- **Returns**: Upload status and number of processed rows
- **Note**: Uploading a new CSV will clear existing data in the database

### 4. Get Reviews
- **Endpoint**: `/reviews`
- **Method**: GET
- **Returns**: List of all reviews with sentiment analysis

### 5. Get Statistics
- **Endpoint**: `/reviews/stats`
- **Method**: GET
- **Returns**: Statistical summary of reviews including:
  - Total number of reviews
  - Sentiment distribution
  - Average rating

## Example Usage

### Analyzing Single Text
```python
import requests

# API endpoint
url = "http://localhost:8000/analyze/text"

# Text to analyze
data = {
    "text": "This product is amazing! I love it."
}

# Make the request
response = requests.post(url, json=data)
print(response.json())
```

### Generating Word Cloud
```python
import requests

# API endpoint
url = "http://localhost:8000/analyze/wordcloud"

# Text to analyze
data = {
    "text": "Your text here for word cloud analysis",
    "max_words": 50  # Optional parameter
}

# Make the request
response = requests.post(url, json=data)
print(response.json())
```

### Uploading CSV File
```python
import requests

url = "http://localhost:8000/upload/csv"
files = {'file': open('reviews.csv', 'rb')}
response = requests.post(url, files=files)
print(response.json())
```

### Getting Reviews
```python
import requests

url = "http://localhost:8000/reviews"
response = requests.get(url)
reviews = response.json()
print(reviews)
```

## Database Schema

The API uses SQLite database with the following schema for reviews:

- id (Integer, Primary Key)
- user_id (String)
- product_id (String)
- category (String)
- product_name (String)
- rating (Float)
- description (Text)
- review_text (Text)
- sentiment_score (Float)
- sentiment_label (String)
- positive_score (Float)
- neutral_score (Float)
- negative_score (Float)

## API Documentation

Once the API is running, you can access the interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Model Used

**RoBERTa**
- Using the "cardiffnlp/twitter-roberta-base-sentiment-latest" model
- Deep learning-based approach
- Provides nuanced sentiment analysis with scores for positive, neutral, and negative sentiments 
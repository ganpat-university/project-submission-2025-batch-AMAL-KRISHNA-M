from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from scipy.special import softmax
import numpy as np
import torch
import pandas as pd
from io import StringIO
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
import models
from collections import Counter
import re
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Download required NLTK data
nltk.download('vader_lexicon')
nltk.download('punkt')
nltk.download('stopwords')

# Initialize FastAPI app
app = FastAPI(
    title="Sentiment Analysis API",
    description="API for analyzing sentiment using RoBERTa model",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize models
roberta_model_name = "cardiffnlp/twitter-roberta-base-sentiment-latest"
tokenizer = AutoTokenizer.from_pretrained(roberta_model_name)
model = AutoModelForSequenceClassification.from_pretrained(roberta_model_name)

class TextInput(BaseModel):
    text: str

class ReviewResponse(BaseModel):
    id: int
    user_id: str
    product_id: str
    category: str
    product_name: str
    rating: float
    description: str
    review_text: str
    sentiment_score: float
    sentiment_label: str
    positive_score: float
    neutral_score: float
    negative_score: float

    class Config:
        from_attributes = True

class WordCloudInput(BaseModel):
    text: str
    max_words: int = 100

def analyze_sentiment_roberta(text):
    # Preprocess text
    encoded_text = tokenizer(text, return_tensors='pt', max_length=512, truncation=True)
    
    # Get model output
    with torch.no_grad():
        output = model(**encoded_text)
    
    # Get scores
    scores = output[0][0].numpy()
    scores = softmax(scores)
    
    return {
        'negative': float(scores[0]),
        'neutral': float(scores[1]),
        'positive': float(scores[2]),
        'sentiment': ['negative', 'neutral', 'positive'][np.argmax(scores)],
        'sentiment_score': float(scores[np.argmax(scores)])
    }

@app.get("/")
async def root():
    return {"message": "Welcome to the Sentiment Analysis API"}

@app.post("/analyze/text")
async def analyze_text(text_input: TextInput):
    try:
        return analyze_sentiment_roberta(text_input.text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(models.get_db)):
    try:
        # Read CSV content
        contents = await file.read()
        csv_data = pd.read_csv(StringIO(contents.decode()))
        
        # Validate required columns
        required_columns = ["ID", "UserID", "ProductID", "Category", "Product_name", "Rating", "Description", "Text"]
        missing_columns = [col for col in required_columns if col not in csv_data.columns]
        if missing_columns:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {', '.join(missing_columns)}"
            )
        
        # Clear existing data
        db.query(models.Review).delete()
        
        # Process each review and add to database
        for _, row in csv_data.iterrows():
            # Analyze sentiment
            sentiment_results = analyze_sentiment_roberta(row['Text'])
            
            # Create review object
            review = models.Review(
                id=row['ID'],
                user_id=row['UserID'],
                product_id=row['ProductID'],
                category=row['Category'],
                product_name=row['Product_name'],
                rating=float(row['Rating']),
                description=row['Description'],
                review_text=row['Text'],
                sentiment_score=sentiment_results['sentiment_score'],
                sentiment_label=sentiment_results['sentiment'],
                positive_score=sentiment_results['positive'],
                neutral_score=sentiment_results['neutral'],
                negative_score=sentiment_results['negative']
            )
            db.add(review)
        
        # Commit changes
        db.commit()
        
        return {"message": "CSV processed successfully", "rows_processed": len(csv_data)}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews", response_model=List[ReviewResponse])
async def get_reviews(db: Session = Depends(models.get_db)):
    try:
        reviews = db.query(models.Review).all()
        return reviews
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/reviews/stats")
async def get_review_stats(db: Session = Depends(models.get_db)):
    try:
        total_reviews = db.query(models.Review).count()
        sentiment_distribution = (
            db.query(
                models.Review.sentiment_label,
                func.count(models.Review.id).label('count')
            )
            .group_by(models.Review.sentiment_label)
            .all()
        )
        
        avg_rating = db.query(func.avg(models.Review.rating)).scalar()
        
        return {
            "total_reviews": total_reviews,
            "sentiment_distribution": dict(sentiment_distribution),
            "average_rating": float(avg_rating) if avg_rating else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def generate_word_cloud(text: str, max_words: int = 100) -> Dict[str, int]:
    # Convert to lowercase
    text = text.lower()
    
    # Remove special characters and numbers
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\d+', '', text)
    
    # Tokenize the text
    tokens = word_tokenize(text)
    
    # Remove stopwords
    stop_words = set(stopwords.words('english'))
    filtered_tokens = [word for word in tokens if word not in stop_words and len(word) > 2]
    
    # Count word frequencies
    word_freq = Counter(filtered_tokens)
    
    # Get top N words
    top_words = dict(word_freq.most_common(max_words))
    
    return top_words

@app.post("/analyze/wordcloud")
async def analyze_wordcloud(input_data: WordCloudInput):
    try:
        if not input_data.text.strip():
            raise HTTPException(status_code=400, detail="Text cannot be empty")
            
        if input_data.max_words <= 0:
            raise HTTPException(status_code=400, detail="max_words must be greater than 0")
            
        word_frequencies = generate_word_cloud(input_data.text, input_data.max_words)
        return {
            "word_frequencies": word_frequencies,
            "total_words": len(word_frequencies)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating word cloud: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8080)
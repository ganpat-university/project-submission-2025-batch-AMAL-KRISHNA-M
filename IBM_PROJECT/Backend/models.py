from sqlalchemy import Column, Integer, String, Float, Text, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

Base = declarative_base()

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String)
    product_id = Column(String)
    category = Column(String)
    product_name = Column(String)
    rating = Column(Float)
    description = Column(Text)
    review_text = Column(Text)
    sentiment_score = Column(Float)
    sentiment_label = Column(String)
    positive_score = Column(Float)
    neutral_score = Column(Float)
    negative_score = Column(Float)

# Create SQLite database
SQLALCHEMY_DATABASE_URL = "sqlite:///./reviews.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Create tables
Base.metadata.create_all(bind=engine)

# SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 
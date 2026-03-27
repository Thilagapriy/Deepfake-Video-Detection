import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Load the production database URL from the .env file
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Fallback to local SQLite if no online database is provided
if not DATABASE_URL:
    DATABASE_URL = "sqlite:///./deepfake.db"

# Fix legacy "postgres://" URLs to "postgresql://" for SQLAlchemy 1.4+
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite requires "check_same_thread": False, but Postgres/MySQL do not
if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

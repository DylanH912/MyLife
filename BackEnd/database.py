from sqlalchemy import create_engine, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

databaseURL = "postgresql://neondb_owner:npg_Eeiwx1QKqZT9@ep-falling-cherry-amwmudme-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"


engine = create_engine(databaseURL)
with engine.connect() as conn:
    result = conn.execute(text("SELECT * FROM users"))

    # Create SessionLocal class
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    # Create a Base class for models
    Base = declarative_base()

    # Dependency to get DB session
    def get_db():
        db = SessionLocal()
        try:
            yield db
        finally:
            db.close()
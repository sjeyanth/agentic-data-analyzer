from app.database.connection import engine
from app.database.base import Base

# Import models
from app.models.report import Report


Base.metadata.create_all(bind=engine)

print("Tables created successfully!")
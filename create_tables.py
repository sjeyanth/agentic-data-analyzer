from app.database.base import Base
from app.database.connection import engine

# Import models so SQLAlchemy knows about them
from app.models.report import Report


def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")


if __name__ == "__main__":
    create_tables() 
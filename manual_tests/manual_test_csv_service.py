from app.services.csv_service import CSVService

service = CSVService()

df = service.load_csv(
    "data/manufacturing_data.csv"
)

service.validate_dataframe(df)

print(df)

print("\nRows:", len(df))
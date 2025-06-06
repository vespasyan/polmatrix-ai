# Polmatrix ETL Pipeline

This ETL (Extract, Transform, Load) pipeline fetches data from multiple sources (World Bank, WHO, UNICEF, OECD) and loads it into the Polmatrix database.

## Project Structure

```
polmatrix-etl/
├── extract/              # Data fetchers for each source
│   ├── worldbank_fetch.py
│   ├── who_fetch.py
│   ├── unicef_fetch.py
│   └── oecd_fetch.py
├── transform/           # Data transformation and normalization
│   └── normalize.py
├── load/               # Database loading logic
│   └── db_loader.py
├── orchestrator/       # ETL orchestration and scheduling
│   └── run_all_fetchers.py
├── tests/              # Unit tests
│   ├── test_extract.py
│   ├── test_transform.py
│   └── test_load.py
├── etl_logs/          # Log files
├── data_cache/        # Cached data files
├── requirements.txt   # Python dependencies
├── .env              # Environment variables (create from .env.example)
└── README.md         # This file
```

## Installation

1. Clone the repository and navigate to the ETL directory:
```bash
cd Projects/polmatrix-etl
```

2. Create a virtual environment:
```bash
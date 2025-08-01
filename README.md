# 🌐 PolMatrix

**AI-powered Policy Simulation Platform for U.S. Policy Questions**  
Analyze and visualize the real-world effects of policy decisions across **Economy**, **Health**, **Education**, **Environment** — all from a single English question.

---

## 🧠 What is PolMatrix?

PolMatrix helps U.S. government agencies and civic technologists simulate policy outcomes using real-world data, trend modeling, and configurable policy levers.  
Type a plain English question like:

> _"What happens if we boost green energy subsidies in Texas through 2040?"_

and get back dynamic, year-by-year charts of GDP, emissions, health, and more.

---

## 🚀 Key Features

- 📊 **Interactive Dashboards**
  - Tabs for Economy, Education, Health, Environment
- 🌀 **Real-Time Simulations**
  - “What if” engine forecasts how policies shift key indicators
- 🧠 **Natural Language Interface**
  - Just ask — no need to code or configure anything
- 🎨 **Live Charts & Trends**
  - Recharts-powered visualizations with auto-pivoted time series
- 🌗 **Dark/Light Mode**
  - Responsive, animated UI using Tailwind and Framer Motion
- 🧩 **Modular Architecture**
  - Easily extend simulation logic or import new data

---

## 🏗️ Tech Stack

| Layer       | Technology |
|-------------|------------|
| Frontend    | Next.js (React 18), TailwindCSS, Framer Motion |
| Backend     | Node.js + Express |
| Data Engine | Python (for forecasting models) |
| Database    | PostgreSQL (AWS RDS) |
| Hosting     | AWS EC2 + Cloudflare |
| ETL Sources | U.S. Census, BLS, CDC, EPA, IMF, USDA |

---

## 📁 Folder Structure
- .gitignore
- docs
  - Polmatrix_DB_Structure.pdf
- polmatrix-ai
- polmatrix-backend
  - .env
  - .gitignore
  - backend
    - db.js
    - index.js
    - package-lock.json
    - package.json
    - routes
      - ai.js
      - economy.js
      - education.js
      - environment.js
      - health.js
      - policy.js
    - services
      - domainModels
        - economyModel.js
        - educationModel.js
        - environmentModel.js
        - healthModel.js
        - policyEffects.js
      - parser.js
      - parser_new.js
      - simulator.js
    - test
      - sample_sim.js
    - us-east-2-bundle.pem
  - project_structure.text
  - README.md
  - schema.sql
- polmatrix-etl
  - .env
  - .env.example
  - .gitignore
  - data
    - us_co2.csv
    - us_education.csv
    - us_gdp.csv
    - us_health.csv
  - economy_fetcher.py
  - education_fetcher.py
  - environment_columns.csv
  - environment_fetcher.py
  - etl.log
  - health_fetcher.py
  - missing_year.csv
  - project_structure.text
  - README.md
  - requirements.txt
  - run_all.sh
  - test
    - co2_loader.py
    - education_loader.py
    - gdp_loader.py
    - health_loader.py
  - test_edgar.py
- polmatrix-forecast
  - .env
  - .gitignore
  - Dockerfile
  - extract_training_data.py
  - main.py
  - models
    - co2_emissions_US.joblib
    - education_index_US.joblib
    - gdp_US.joblib
    - green_jobs_US.joblib
    - health_index_US.joblib
    - spending_US.joblib
  - model_runner.py
  - requirements.txt
  - run_server.py
  - test_forecast.py
  - training_data.csv
  - train_models.py
  - __pycache__
    - main.cpython-313.pyc
    - model_runner.cpython-313.pyc
- polmatrix-frontend
  - .env.local
  - .env.production
  - .gitignore
  - app
    - admin
      - economy
        - page.tsx
      - re.md
    - api
      - ai
        - simulate.ts
        - [...slug]
          - route.ts
      - hooks
        - useSimulation.ts
    - dashboard
      - page.tsx
    - favicon.ico
    - globals.css
    - layout.tsx
  - components
    - ChartGrid.tsx
    - ChartTabs.tsx
    - CorrelationChart.tsx
    - CorrelationMatrix.tsx
    - DashboardView.tsx
    - EconomyChart.tsx
    - EducationChart.tsx
    - EnvironmentChart.tsx
    - GlobalFilter.tsx
    - HealthChart.tsx
    - Hero.tsx
    - HeroPrompt.tsx
    - Navbar.tsx
    - Sidebar.tsx
    - SimulationResults.tsx
  - components.json
  - docs
    - .project_structure_ignore
    - CHART_DATA_TRANSFORMATION.md
    - CHART_IMPROVEMENTS.md
    - ECONOMY_SIMULATOR_FIX.md
  - eslint.config.mjs
  - lib
    - api.ts
    - chartTransforms.ts
    - metricsConfig.ts
  - next-env.d.ts
  - next.config.ts
  - package-lock.json
  - package.json
  - postcss.config.mjs
  - project_structure.text
  - public
    - file.svg
    - globe.svg
    - logo_polmatrix.png
    - next.svg
    - vercel.svg
    - window.svg
  - README.md
  - test-dashboard.js
  - tsconfig.json
- README.md
- sql
  - schema.sql



# RetireNow - Retirement Planning Calculator

A comprehensive retirement planning tool that helps users calculate and visualize their retirement savings trajectory, featuring Monte Carlo simulations for inflation risk analysis.

## Features

- User Authentication
- Retirement Calculator
  - Detailed yearly projections
  - Customizable retirement parameters
  - Savings accumulation and withdrawal phases
- Monte Carlo Simulation
  - 500 iterations with variable inflation (4-7%)
  - Percentile analysis
  - Visual representation of outcomes
- Scenario Management
  - Save multiple retirement scenarios
  - Compare different retirement plans
  - Visual comparisons with charts
- Interactive Charts
  - Nest egg progression visualization
  - Monte Carlo simulation results
  - Multi-scenario comparison

## Tech Stack

### Frontend
- React
- Chart.js for data visualization
- Tailwind CSS for styling
- Axios for API communication

### Backend
- Go (Gin framework)
- GORM for database operations
- PostgreSQL database
- JWT for authentication

## Getting Started

### Prerequisites
- Go 1.16+
- Node.js and npm
- PostgreSQL database

### Backend Setup
1. Navigate to backend directory
```bash
cd backend
```

2. Install Go dependencies
```bash
go mod tidy
```

3. Set up your PostgreSQL database and update the connection string in config/database.go

4. Run the server
```bash
go run main.go
```

The server will start on http://localhost:8000

### Frontend Setup
1. Navigate to frontend directory
```bash
cd frontend
```

2. Install dependencies
```bash
npm install
```

3. Start development server
```bash
npm start
```

The application will open in your browser at http://localhost:3000

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret_key
PORT=8000
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:8000/api
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - User login
- GET `/api/user/me` - Get current user

### Scenarios
- POST `/api/scenarios` - Create scenario
- GET `/api/scenarios` - Get all scenarios
- DELETE `/api/scenarios/:id` - Delete scenario

### Calculations
- POST `/api/calculate` - Calculate retirement projections
- POST `/api/montecarlo` - Run Monte Carlo simulation

## Project Structure

```
├── backend/
│   ├── config/         # Database configuration
│   ├── controllers/    # Request handlers
│   ├── middleware/     # Auth middleware
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   └── utils/          # Helper functions
└── frontend/
    ├── public/         # Static files
    └── src/
        ├── components/ # React components
        ├── pages/      # Page components
        └── utils/      # Helper functions
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
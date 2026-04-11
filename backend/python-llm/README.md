# AI Career Guidance Platform - Python LLM Service

Professional Python-based LLM service for advanced career data analysis and recommendations.

## Features

- **Comprehensive Career Database**: Complete Indian career pathways from 10th standard to post-graduation
- **Advanced Analytics**: Demand analysis, salary trends, skill requirements
- **Personalized Recommendations**: AI-powered matching based on user preferences
- **RESTful API**: FastAPI-based high-performance API service
- **Data-Driven Insights**: Statistical analysis of career trends

## Installation

```bash
# Navigate to python-llm directory
cd backend/python-llm

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

## Running the Service

```bash
# Development mode (with auto-reload)
python llm_career_service.py

# Or using uvicorn directly
uvicorn llm_career_service:app --reload --port 8000
```

The service will start at `http://localhost:8000`

## API Documentation

Once running, access interactive API documentation:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### 1. Generate Career Paths
```http
POST /api/generate-paths
Content-Type: application/json

{
  "educationLevel": "10th",
  "userId": "optional-user-id",
  "preferences": {
    "high_demand": true,
    "high_salary": true,
    "interests": ["Programming", "Mathematics"]
  }
}
```

### 2. Expand Career Node
```http
POST /api/expand-node/{node_id}
Content-Type: application/json

{
  "sessionId": "optional-session-id",
  "userId": "optional-user-id"
}
```

### 3. Get Career Details
```http
GET /api/career-details/{node_id}?language=en
```

### 4. Health Check
```http
GET /api/health
```

## Architecture

```
┌─────────────────────────────────────────┐
│         CareerDatabase Class            │
│  - Comprehensive career pathways data   │
│  - Categorized by education level       │
│  - Metadata with salaries, skills, etc. │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│      CareerAnalysisEngine Class         │
│  - Path categorization                  │
│  - Demand analysis                      │
│  - Salary trend analysis                │
│  - Skill extraction                     │
│  - Personalized recommendations         │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         FastAPI Endpoints               │
│  - POST /api/generate-paths             │
│  - POST /api/expand-node/{id}           │
│  - GET  /api/career-details/{id}        │
│  - GET  /api/health                     │
└─────────────────────────────────────────┘
```

## Data Structure

Each career path includes:
- **Basic Info**: nodeId, label, category, description
- **Requirements**: duration, eligibility, demand level
- **Metadata**: 
  - Salary ranges (entry, mid, senior)
  - Growth rate (0-100)
  - Required skills
  - Education pathway steps
  - Growth opportunities
  - Top recruiters
  - Future outlook

## Advanced Features

### 1. Personalized Matching Algorithm
- Calculates match score based on user preferences
- Considers demand, salary expectations, and skill interests
- Returns top 5 recommended paths with scores

### 2. Statistical Analysis
- Demand distribution across categories
- Average growth rates
- Salary trend analysis
- Skill requirement aggregation

### 3. Comprehensive Coverage
- **10th Standard**: 8 pathways (PUC, ITI, Diploma, Vocational)
- **12th Standard**: 8 pathways (Engineering, Medical, BCA, B.Com, etc.)
- **Diploma**: 4 pathways (Lateral B.Tech, Govt Jobs, Private Jobs, Entrepreneurship)
- **Degree**: 6 pathways (M.Tech, MBA, IT Jobs, Govt Services, Data Science, Civil Services)
- **ITI**: 2 pathways (Apprenticeship, Technical Jobs)
- **Certificate**: 2 pathways (Freelancing, Higher Education)

## Integration with Node.js Backend

To integrate with the existing Node.js backend, update the `aiCareerService.js` to call this Python service:

```javascript
const PYTHON_LLM_URL = process.env.PYTHON_LLM_URL || 'http://localhost:8000';

async generateInitialPaths(educationLevel) {
  const response = await axios.post(`${PYTHON_LLM_URL}/api/generate-paths`, {
    educationLevel,
    preferences: {}
  });
  return response.data.data.nodes;
}
```

## Environment Variables

Create `.env` file in `python-llm` directory:

```env
PORT=8000
LOG_LEVEL=info
NODE_ENV=development
```

## Performance Optimization

- Uses Pydantic for data validation
- Numpy for statistical calculations
- Async/await for concurrent request handling
- Uvicorn ASGI server for high performance

## Future Enhancements

- [ ] Machine Learning model integration for predictive analytics
- [ ] Real-time job market data scraping
- [ ] User behavior analysis and learning
- [ ] Multi-language support
- [ ] Resume parsing and skill gap analysis
- [ ] Interview preparation recommendations

## License

MIT License

## Support

For issues and feature requests, please create an issue in the repository.

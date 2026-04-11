# API Documentation

Base URL: `http://localhost:5000/api`

All authenticated routes require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register User
```http
POST /auth/register
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123",
  "role": "student",
  "profile": {
    "name": "John Doe",
    "age": 18,
    "location": {
      "district": "Rural District",
      "state": "State Name",
      "country": "India"
    }
  },
  "education": {
    "currentLevel": "higher_secondary",
    "marks": {
      "percentage": 85
    }
  },
  "interests": ["technology", "science"],
  "skills": [
    {
      "name": "JavaScript",
      "proficiency": 60,
      "category": "technical"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_id",
      "email": "student@example.com",
      "role": "student",
      "profile": { ... },
      "gamification": {
        "xp": 50,
        "level": 1,
        "badges": [],
        "streak": { "count": 1 }
      }
    }
  }
}
```

---

### Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "student@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
}
```

---

### Get Current User
```http
GET /auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "User data retrieved successfully",
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "role": "...",
      "profile": { ... },
      "education": { ... },
      "skills": [ ... ],
      "interests": [ ... ],
      "gamification": { ... }
    }
  }
}
```

---

## Career Endpoints

### Get Career Recommendations
```http
POST /career/recommend
```
**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "interests": ["technology", "data"],
  "skills": ["Python", "Mathematics"],
  "marks": 85,
  "location": "Maharashtra",
  "educationLevel": "higher_secondary"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "careerTitle": "Data Scientist",
        "matchPercentage": 92,
        "description": "...",
        "requiredSkills": ["Python", "Statistics", "ML"],
        "averageSalary": {
          "entry": 600000,
          "mid": 1200000,
          "senior": 2000000
        },
        "growthOutlook": "growing"
      }
    ]
  }
}
```

---

### Get Trending Careers
```http
GET /career/trending?location=Maharashtra
```

---

## Skill Endpoints

### Analyze Skill Gaps
```http
POST /skills/analyze
```

**Request Body:**
```json
{
  "targetCareer": "Data Scientist",
  "currentSkills": [
    { "name": "Python", "proficiency": 70 },
    { "name": "Mathematics", "proficiency": 80 }
  ]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "overallMatchPercentage": 65,
    "missingSkills": [
      {
        "name": "Machine Learning",
        "priority": "high",
        "estimatedLearningTime": "3 months",
        "learningResources": [
          {
            "title": "ML Course",
            "type": "course",
            "url": "https://...",
            "platform": "Coursera",
            "isFree": false
          }
        ]
      }
    ]
  }
}
```

---

## Learning Path Endpoints

### Generate Learning Path
```http
POST /learning/generate
```

**Request Body:**
```json
{
  "careerPath": "Data Scientist",
  "currentLevel": "beginner"
}
```

---

### Mark Step Complete
```http
PUT /learning/:id/step/:stepId
```

---

## Job Endpoints

### Get All Jobs
```http
GET /jobs?type=full-time&location=Mumbai&skills=Python&page=1&limit=20
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "jobs": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8
    }
  }
}
```

---

### Get Hyperlocal Jobs
```http
GET /jobs/hyperlocal?longitude=72.8777&latitude=19.0760&maxDistance=50000
```

---

## Mentor Endpoints

### Find Mentors
```http
GET /mentors?expertise=Data+Science&language=English
```

---

### Request Mentorship
```http
POST /mentors/request
```

**Request Body:**
```json
{
  "mentorId": "mentor_id",
  "message": "I would like guidance on becoming a data scientist"
}
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:5000');
```

### Events

**Join User Room:**
```javascript
socket.emit('join', userId);
```

**Subscribe to Job Alerts:**
```javascript
socket.emit('subscribe_jobs', {
  location: 'Mumbai',
  skills: ['Python']
});
```

**Send Chat Message:**
```javascript
socket.emit('send_message', {
  receiverId: 'mentor_id',
  message: 'Hello!'
});
```

**Receive Message:**
```javascript
socket.on('receive_message', (data) => {
  console.log(data);
});
```

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation error",
  "errors": {
    "email": "Invalid email format"
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Not Found (404)
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1617234567`

---

## Health Check

```http
GET /health
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Server is running",
  "data": {
    "status": "healthy",
    "timestamp": "2026-04-11T12:00:00.000Z",
    "uptime": 3600
  }
}
```

---

## Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)

**Response includes:**
```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

---

## Filtering

Most GET endpoints support filtering:

**Jobs:**
- `?type=full-time`
- `?location=Mumbai`
- `?skills=Python,JavaScript`
- `?experienceLevel=entry`

**Mentors:**
- `?expertise=Data+Science`
- `?language=English`
- `?available=true`

---

Last Updated: April 11, 2026

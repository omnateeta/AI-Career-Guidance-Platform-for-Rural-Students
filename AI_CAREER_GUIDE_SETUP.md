# AI Career Guidance Engine - Setup & Usage Guide

## 🎯 Overview

This is a **production-level AI-driven career guidance engine** that dynamically generates career pathways using OpenAI GPT API and interactive React Flow visualization.

---

## ⚙️ Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Configure Environment Variables

Update `backend/.env`:

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-3.5-turbo  # or gpt-4 for better quality

# Scraping Configuration
SCRAPING_ENABLED=true
CACHE_TTL=86400  # 24 hours
```

**Get OpenAI API Key:**
1. Visit https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and paste it in `.env`

#### Start Backend Server
```bash
npm run dev
```

Server will start on `http://localhost:5000`

---

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Frontend Development Server
```bash
npm run dev
```

Frontend will start on `http://localhost:5173`

---

## 🚀 How to Use

### For Students:

1. **Login/Register** to the platform
2. **Click "Career Guidance"** in the navbar
3. **Select your education level**:
   - 10th Standard
   - 12th Standard (PUC)
   - Diploma
   - Degree

4. **Explore Career Paths**:
   - AI will generate all possible pathways
   - Click on any node to expand and see next steps
   - Nodes are color-coded by category:
     - 🔵 Blue: Education
     - 🟣 Purple: Stream
     - 🔵 Indigo: Degree
     - 🟢 Teal: Specialization
     - 🟢 Green: Career
     - 🟠 Orange: Job
     - 🩷 Pink: Certification

5. **View Career Details**:
   - Click on any career/job node
   - Side panel opens with:
     - Detailed explanation
     - Education path
     - Required skills
     - Salary ranges
     - Growth opportunities
     - Top recruiters
     - Recommended courses

6. **Voice Features**:
   - Click microphone icon for voice navigation
   - Click speaker icon to listen to career explanation

7. **Multi-Language Support**:
   - Change language in career details panel
   - Available: English, Hindi, Kannada, Tamil, Telugu

---

## 🧠 How It Works

### Architecture Flow:

```
Student selects education level
        ↓
Backend checks cache (MongoDB + Memory)
        ↓
   Found? → Return cached data (fast)
        ↓
   Not Found?
        ↓
AI (GPT-4/3.5) generates pathways
        ↓
Cache results for 24 hours
        ↓
Return to frontend
        ↓
React Flow renders interactive graph
        ↓
Student clicks node → Expand children
```

### Caching Strategy:

1. **Memory Cache** (node-cache): Fast access, 24-hour TTL
2. **Database Cache** (MongoDB): Persistent, auto-expired
3. **Client Cache**: Browser caching for repeated requests

**Cost Optimization**: 
- First request: ~$0.01 (AI generation)
- Subsequent requests: $0.00 (from cache)
- Average cost per user: ~$0.05-0.10

---

## 📊 API Endpoints

### 1. Generate Initial Paths
```http
POST /api/career/generate-paths
Authorization: Bearer <token>

Body:
{
  "educationLevel": "10th"
}

Response:
{
  "success": true,
  "data": {
    "nodes": [...],
    "sessionId": "..."
  },
  "cached": false
}
```

### 2. Expand Node
```http
POST /api/career/expand-node/:nodeId
Authorization: Bearer <token>

Body:
{
  "sessionId": "..."
}

Response:
{
  "success": true,
  "data": {
    "children": [...],
    "parentNode": {...}
  },
  "cached": true
}
```

### 3. Get Career Details
```http
GET /api/career/career-details/:nodeId?language=hi
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "details": {
      "detailedDescription": "...",
      "educationPath": [...],
      "requiredSkills": [...],
      "salaryRange": {...},
      "growthOpportunities": [...]
    }
  }
}
```

### 4. Get Exploration History
```http
GET /api/career/exploration-history
Authorization: Bearer <token>
```

---

## 🎨 Features Implemented

### ✅ Backend:
- [x] OpenAI GPT integration for dynamic generation
- [x] MongoDB caching with TTL
- [x] In-memory caching (node-cache)
- [x] Education scraper service (AICTE, UGC, Skill India)
- [x] Career session tracking
- [x] Multi-language translation via AI
- [x] Comprehensive API endpoints

### ✅ Frontend:
- [x] Interactive React Flow visualization
- [x] Claymorphism design
- [x] Custom node components by category
- [x] Expand-on-click functionality
- [x] Career details side panel
- [x] Voice navigation
- [x] Text-to-speech
- [x] Multi-language support
- [x] Mobile responsive
- [x] Smooth animations

---

## 🔧 Technical Stack

### Backend:
- **Node.js + Express**: API server
- **OpenAI GPT-3.5/4**: AI generation engine
- **MongoDB + Mongoose**: Database with caching
- **node-cache**: In-memory caching
- **Cheerio**: Web scraping
- **Winston**: Logging

### Frontend:
- **React 18**: UI framework
- **React Flow (@xyflow/react)**: Interactive flowchart
- **Framer Motion**: Animations
- **Axios**: HTTP client
- **Tailwind CSS**: Styling
- **React Icons**: Icon library

---

## 📈 Performance Optimization

1. **Lazy Loading**: Children loaded on-demand
2. **Caching**: Multi-layer caching strategy
3. **Memoization**: React components optimized
4. **Virtual Rendering**: React Flow handles 1000+ nodes
5. **Compression**: API responses compressed

---

## 🚨 Important Notes

### OpenAI API Costs:
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens
- **Recommended**: Start with GPT-3.5, upgrade if needed

### Rate Limiting:
- OpenAI has rate limits (requests per minute)
- Cached responses don't hit API
- Implement queue if high traffic expected

### Data Freshness:
- Cache expires every 24 hours
- Scrapers can be scheduled weekly
- Manual cache invalidation available

---

## 🐛 Troubleshooting

### Issue: "Failed to generate career paths"
**Solution**: 
- Check if `OPENAI_API_KEY` is set correctly
- Verify API key has sufficient credits
- Check backend logs for errors

### Issue: Nodes not expanding
**Solution**:
- Check browser console for errors
- Verify backend is running
- Check network tab for API responses

### Issue: Slow performance
**Solution**:
- Enable caching (it's on by default)
- Check MongoDB connection
- Reduce max_tokens in AI service if needed

---

## 🎯 Next Steps (Future Enhancements)

1. **Personalization**: Factor in student's interests, marks, location
2. **Real Job Integration**: Connect to job APIs (Adzuna, LinkedIn)
3. **Course Recommendations**: Link to Coursera, NPTEL, Udemy
4. **Mentor Matching**: Connect with professionals in selected career
5. **Progress Tracking**: Track student's journey through path
6. **Community Features**: See what paths other students chose
7. **Analytics Dashboard**: Popular paths, trending careers by region
8. **Offline Mode**: Cache paths for offline viewing

---

## 📝 Example User Flow

**Scenario**: Student completed 10th standard

1. Selects "10th Standard"
2. AI generates 10-12 pathways:
   - PUC Science
   - PUC Commerce
   - PUC Arts
   - ITI Electrician
   - Polytechnic Diploma
   - Web Development Certification
   - etc.

3. Student clicks "PUC Science"
4. AI expands to show:
   - Engineering (CSE, ME, CE, ECE, etc.)
   - Medical (MBBS, BDS, Nursing, Pharmacy)
   - Pure Sciences (BSc Physics, Chemistry, Maths)
   - Architecture
   - etc.

5. Student clicks "Engineering → CSE"
6. AI expands to show:
   - Software Engineer
   - Data Scientist
   - ML Engineer
   - DevOps Engineer
   - etc.

7. Student clicks "Software Engineer"
8. Career details panel shows:
   - What is Software Engineering?
   - Education: 12th → JEE → B.Tech → Jobs
   - Skills: Java, Python, DSA, System Design
   - Salary: 4-6 LPA (entry), 12-20 LPA (mid)
   - Top Recruiters: TCS, Infosys, Google, Microsoft
   - Growth: Tech Lead → Architect → CTO

---

## 🏆 Key Advantages Over Traditional Systems

❌ **Traditional**: Predefined lists of 20-30 careers
✅ **Our System**: Infinite dynamically generated paths

❌ **Traditional**: Static data, becomes outdated
✅ **Our System**: AI-generated, always current

❌ **Traditional**: One-size-fits-all
✅ **Our System**: Context-aware, expands based on choices

❌ **Traditional**: Text-based lists
✅ **Our System**: Interactive visual flowchart

❌ **Traditional**: English only
✅ **Our System**: Multi-language with voice support

---

## 📞 Support

For issues or questions:
1. Check backend logs: `backend/logs/error.log`
2. Check browser console for frontend errors
3. Review API responses in Network tab
4. Verify environment variables are set correctly

---

## 🎓 Built For

This system is specifically designed for **rural students in India** who:
- Lack access to career counselors
- Need guidance in their native language
- Want to explore all possible options
- Need simple, easy-to-understand information
- May have low bandwidth internet

The AI generates content that is:
- Written in simple language
- Includes government and private opportunities
- Mentions scholarships and financial aid
- Provides realistic salary expectations
- Shows clear step-by-step paths

---

**Remember**: This is not just a career quiz. It's an **intelligent decision support system** that understands the complete Indian education landscape and can guide students through every possible pathway! 🚀

# 🎯 Complete Setup & Deployment Guide

## Prerequisites Installation

### 1. Install Node.js (v20+)
**Windows:**
- Download from https://nodejs.org/
- Run installer
- Verify: `node --version`

**Mac:**
```bash
brew install node
```

**Linux:**
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB

**Option A: Local Installation**

**Windows:**
```bash
# Download from https://www.mongodb.com/try/download/community
# Run installer
# Start service:
net start MongoDB
```

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Option B: MongoDB Atlas (Cloud - Recommended for Production)**
1. Visit https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster
4. Get connection string
5. Whitelist your IP
6. Create database user
7. Update `.env` with connection string

### 3. Install Git (Optional)
```bash
# Windows
https://git-scm.com/download/win

# Mac
brew install git

# Linux
sudo apt-get install git
```

---

## Project Setup

### Step 1: Navigate to Project
```bash
cd "e:\AI Career Guidance Platform for Rural Students"
```

### Step 2: Setup Backend
```bash
cd backend

# Install all dependencies
npm install

# Create environment file
copy .env.example .env

# Edit .env file with your configuration
notepad .env
```

**Minimum .env configuration:**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/career-guidance
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Step 3: Setup Frontend
```bash
cd ../frontend

# Install all dependencies
npm install
```

### Step 4: Start MongoDB
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB Connected: localhost
✅ Database indexes created
🚀 Server running on port 5000 in development mode
📡 API available at http://localhost:5000/api
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health

---

## Testing the Application

### 1. Test Registration
1. Open http://localhost:5173
2. Click "Get Started" or "Register"
3. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
4. Click "Create Account"
5. You'll be redirected to onboarding

### 2. Test Login
1. Go to http://localhost:5173/login
2. Enter:
   - Email: test@example.com
   - Password: password123
3. Click "Sign In"
4. You'll be redirected to dashboard

### 3. Test API Endpoints

**Using cURL:**
```bash
# Health check
curl http://localhost:5000/api/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "profile": { "name": "Test User" }
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Using Postman:**
1. Import API collection (create from API.md)
2. Set base URL: http://localhost:5000/api
3. Test endpoints

---

## Production Deployment

### Backend Deployment (Railway.app - Free Tier)

1. **Prepare Repository:**
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Deploy to Railway:**
   - Visit https://railway.app/
   - Connect GitHub repository
   - Add MongoDB plugin
   - Set environment variables
   - Deploy automatically

3. **Environment Variables:**
```env
MONGODB_URI=<from Railway MongoDB>
JWT_SECRET=<generate-strong-secret>
NODE_ENV=production
CORS_ORIGIN=<your-frontend-url>
```

### Frontend Deployment (Vercel - Free Tier)

1. **Build Project:**
```bash
cd frontend
npm run build
```

2. **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

3. **Or use Vercel Dashboard:**
   - Visit https://vercel.com/
   - Import GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`
   - Deploy

### Database (MongoDB Atlas)

1. Create cluster on MongoDB Atlas
2. Whitelist `0.0.0.0/0` (allow from anywhere)
3. Create database user
4. Get connection string
5. Update `MONGODB_URI` in backend environment variables

---

## Troubleshooting

### MongoDB Connection Issues

**Error:** `MongoNetworkError: connect ECONNREFUSED`

**Solutions:**
1. Check if MongoDB is running:
   ```bash
   # Windows
   tasklist | findstr mongod
   
   # Mac/Linux
   ps aux | grep mongod
   ```

2. Start MongoDB service
3. Check connection string in `.env`
4. For Atlas: Check IP whitelist and credentials

### Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solutions:**
```bash
# Find process using port 5000
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9

# Or change port in .env
PORT=5001
```

### npm Install Fails

**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -rf node_modules
rm package-lock.json

# Reinstall
npm install
```

### Frontend Can't Connect to Backend

**Check:**
1. Backend is running on port 5000
2. CORS_ORIGIN in backend/.env matches frontend URL
3. Check browser console for CORS errors
4. Verify proxy configuration in vite.config.js

### Build Errors

**Frontend:**
```bash
cd frontend
npm run build
# Check error messages
# Common fixes:
npm update
rm -rf node_modules .vite
npm install
```

---

## Performance Optimization

### Backend
- Enable compression (already done)
- Use MongoDB indexes (already created)
- Implement caching (Redis)
- Add pagination to all list endpoints
- Use PM2 for process management

### Frontend
- Code splitting with React.lazy()
- Image optimization (WebP)
- Enable gzip compression
- Use CDN for assets
- Implement service worker for offline

---

## Monitoring & Logging

### Backend Logs
```bash
# View logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

### Production Monitoring
- Use Sentry for error tracking
- Use New Relic for performance
- Use LogRocket for user sessions
- Setup health check endpoints

---

## Backup & Restore

### MongoDB Backup
```bash
# Backup
mongodump --uri="mongodb://localhost:27017/career-guidance" --out=backup/

# Restore
mongorestore --uri="mongodb://localhost:27017/career-guidance" backup/
```

---

## Security Checklist

- [x] JWT authentication
- [x] Password hashing
- [x] Rate limiting
- [x] CORS protection
- [x] Helmet.js headers
- [ ] Input validation (add express-validator)
- [ ] SQL injection protection (using Mongoose)
- [ ] XSS protection
- [ ] CSRF protection
- [ ] HTTPS in production
- [ ] Secure HTTP-only cookies
- [ ] Regular dependency updates

---

## Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx)
- Deploy multiple backend instances
- Use Redis for session management
- Database replication

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add caching layer
- Use CDN

---

## Support & Resources

### Documentation
- Full README: `/README.md`
- Quick Start: `/QUICKSTART.md`
- API Docs: `/backend/docs/API.md`
- Project Status: `/PROJECT_STATUS.md`

### Need Help?
- Check troubleshooting section
- Review error logs
- Search GitHub issues
- Create new issue with details

---

## Next Steps After Setup

1. ✅ Get application running locally
2. ✅ Test all authentication flows
3. ✅ Explore dashboard features
4. 🔄 Complete remaining page implementations
5. 🔄 Integrate AI/ML microservice
6. 🔄 Add real API integrations
7. 🔄 Implement WebSocket features
8. 🔄 Deploy to production
9. 🔄 Gather user feedback
10. 🔄 Iterate and improve

---

**Happy Coding! 🚀**

Last Updated: April 11, 2026

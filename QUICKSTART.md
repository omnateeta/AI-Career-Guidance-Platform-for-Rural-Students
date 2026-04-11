# 🚀 Quick Start Guide

## Setup in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Setup Environment

**Backend (.env):**
```bash
cd backend
copy .env.example .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/career-guidance
JWT_SECRET=your-secret-key-here
```

### Step 3: Start MongoDB

**Windows:**
```bash
net start MongoDB
```

**Mac:**
```bash
brew services start mongodb-community
```

### Step 4: Run the App

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running at: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
✅ Frontend running at: http://localhost:5173

### Step 5: Open in Browser

Visit: **http://localhost:5173**

Click "Get Started" to create an account!

---

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, use your cluster connection string

### Port Already in Use
- Backend: Change PORT in backend/.env
- Frontend: Change port in frontend/vite.config.js

### Dependencies Installation Failed
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

---

## Next Steps

1. ✅ Create account
2. ✅ Explore dashboard
3. ✅ Check out career recommendations
4. ✅ Browse learning paths
5. ✅ View job opportunities

---

## Need Help?

Check the full README.md for detailed documentation.

# White Screen Troubleshooting Guide

## ✅ Fixes Applied

1. **Fixed React Flow imports** - Changed from `@xyflow/react` to `reactflow` (stable version)
2. **Updated all component imports** - CareerNode and CareerGuidanceFlow now use correct package

---

## 🔍 Steps to Fix White Screen

### Step 1: Clear Browser Cache and Restart

1. **Stop the development server** (Ctrl+C in terminal)
2. **Clear browser cache**:
   - Chrome: Ctrl+Shift+Delete → Clear cache
   - Or use Incognito/Private window
3. **Restart the development server**:

```bash
cd frontend
npm run dev
```

### Step 2: Check Browser Console

1. Open browser (usually http://localhost:5173)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. Look for red error messages

**Common errors and fixes:**

#### Error: "Cannot find module 'reactflow'"
**Fix:**
```bash
cd frontend
npm install reactflow
```

#### Error: "Failed to fetch" or Network errors
**Fix:** Make sure backend is running
```bash
cd backend
npm run dev
```

#### Error: "OpenAI API key not configured"
**Fix:** This won't cause white screen, but you need to add your API key to use Career Guidance

#### Error: "Cannot read properties of undefined"
**Fix:** Check the console for which component is failing and share the error message

### Step 3: Verify Both Servers are Running

You need **TWO terminals** running:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Should show: `🚀 Server running on port 5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Should show: `Local: http://localhost:5173/`

### Step 4: Test Basic Navigation

1. Go to http://localhost:5173
2. Try these routes:
   - `/` - Landing page (should work)
   - `/login` - Login page (should work)
   - `/register` - Register page (should work)

3. **After login**, try:
   - `/dashboard` - Dashboard (should work)
   - `/career-guidance` - Career Guidance (the new feature)

### Step 5: Check if Issue is Only on Career Guidance Page

If landing page works but Career Guidance shows white screen:

1. Open browser console (F12)
2. Navigate to Career Guidance
3. Check for errors
4. Share the error message

---

## 🐛 Common Issues & Solutions

### Issue 1: Dependencies Not Installed
**Symptom:** Module not found errors

**Solution:**
```bash
cd frontend
npm install
npm run dev
```

### Issue 2: Backend Not Running
**Symptom:** Network errors, failed API calls

**Solution:**
```bash
cd backend
npm install
npm run dev
```

### Issue 3: MongoDB Connection Failed
**Symptom:** Backend errors, authentication fails

**Solution:** 
- Check MongoDB URI in `backend/.env`
- Ensure MongoDB Atlas is accessible
- Check network access in MongoDB Atlas settings

### Issue 4: Vite Cache Issue
**Symptom:** Old code still showing

**Solution:**
```bash
cd frontend
rm -rf node_modules/.vite
npm run dev
```

Or on Windows:
```bash
cd frontend
rmdir /s /q node_modules\.vite
npm run dev
```

### Issue 5: Port Already in Use
**Symptom:** Server won't start

**Solution:**
```bash
# Kill process on port 5173
npx kill-port 5173
npm run dev
```

---

## 📝 Diagnostic Commands

Run these to check if everything is set up correctly:

```bash
# Check if React Flow is installed
cd frontend
npm list reactflow

# Check Node version (should be 16+)
node --version

# Check npm version
npm --version

# Reinstall dependencies if needed
rm -rf node_modules package-lock.json
npm install
```

---

## 🆘 Still Not Working?

### Share This Information:

1. **Browser Console Errors** (F12 → Console tab)
   - Screenshot or copy all red error messages

2. **Network Tab** (F12 → Network tab)
   - Are API calls failing? What's the status code?

3. **Terminal Output**
   - Any errors in backend terminal?
   - Any errors in frontend terminal?

4. **What Works?**
   - Does landing page (/) load?
   - Does login page (/login) load?
   - Does dashboard (/dashboard) load after login?
   - Only Career Guidance fails, or everything?

5. **Browser Info**
   - Which browser? (Chrome, Firefox, Edge?)
   - Browser version?

---

## ✅ Expected Behavior After Fix

1. **Landing Page** - Shows normally
2. **Login/Register** - Works normally
3. **Dashboard** - Shows after login
4. **Career Guidance** - Shows education level selector with 4 cards:
   - 10th Standard
   - 12th Standard (PUC)
   - Diploma
   - Degree

When you click an education level:
- Loading spinner appears
- AI generates career paths (takes 3-5 seconds)
- Interactive flowchart appears with nodes

---

## 🚀 Quick Fix Commands

Run these in order:

```bash
# 1. Stop any running servers (Ctrl+C)

# 2. Clean frontend
cd frontend
rm -rf node_modules/.vite
npm install reactflow

# 3. Start backend
cd ../backend
npm run dev

# 4. Start frontend (in new terminal)
cd frontend
npm run dev

# 5. Open browser
# Go to http://localhost:5173
# Use Incognito window to avoid cache issues
```

---

## 💡 Pro Tips

1. **Use Incognito/Private window** - Avoids cache issues
2. **Hard refresh** - Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check both terminals** - Both backend and frontend should show no errors
4. **Start simple** - Test landing page first, then login, then career guidance

---

## 📞 Need More Help?

If you're still seeing a white screen after trying all the above:

1. Open browser console (F12)
2. Take a screenshot of any errors
3. Share the error messages
4. I'll help you fix it!

The most common cause is **not having both servers running** or **browser cache showing old code**.

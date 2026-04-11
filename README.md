# 🎓 Margdarshak AI - Career Guidance Platform for Rural Students

> **Empowering Rural Students with AI-Powered Career Guidance**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green.svg)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen.svg)](https://www.mongodb.com/)

---

## 🌟 Overview

**Margdarshak AI** (मार्गदर्शक - "Guide" in Hindi) is a comprehensive full-stack AI-powered career guidance platform specifically designed for rural students. It helps students discover career paths, analyze skill gaps, access learning resources, find jobs, and connect with mentors - all in their native language.

### ✨ Key Features

- 🎯 **Career Discovery Quiz** - Interactive 10-question quiz to find ideal career path
- 📊 **AI-Powered Career Recommendations** - Personalized career suggestions
- 📈 **Skill Gap Analysis** - Visual comparison of current vs required skills
- 📚 **Personalized Learning Paths** - Curated courses and resources
- 💼 **Real-Time Job Feed** - Live job listings from top Indian companies
- 👥 **Mentor Connection** - Connect with industry professionals
- 🤖 **AI Career Assistant** - 24/7 chatbot for career guidance
- 🌍 **Multi-Language Support** - 22+ languages including all major Indian languages
- 🎮 **Gamification** - XP, badges, streaks, and achievements
- 📱 **Low Bandwidth Mode** - Optimized for rural areas with slow internet

---

## 🚀 Tech Stack

### Frontend
- **React 18** with Vite
- **Tailwind CSS** - Modern styling with glassmorphism
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Google Translate API** - Multi-language support
- **Context API** - State management

### Backend
- **Node.js & Express** - RESTful API
- **MongoDB & Mongoose** - Database
- **JWT Authentication** - Secure user auth
- **Bcrypt** - Password hashing
- **Socket.io** - Real-time features (ready)
- **Winston** - Logging

### Future Enhancements
- Python AI/ML Microservice
- TensorFlow for career predictions
- NLP for resume analysis
- Voice-based guidance

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v20.17.0 or higher)
- npm or yarn
- MongoDB Atlas account (free tier works)

### Quick Start

1. **Clone the repository**
```bash
git clone https://github.com/omnateeta/AI-Career-Guidance-Platform-for-Rural-Students.git
cd AI-Career-Guidance-Platform-for-Rural-Students
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Configure Backend Environment**
```bash
# Create .env file in backend folder
cp .env.example .env

# Update with your MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-guidance
JWT_SECRET=your-super-secret-key
PORT=5000
```

4. **Install Frontend Dependencies**
```bash
cd ../frontend
npm install
```

5. **Start Development Servers**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
cd frontend
npm run dev
```

6. **Access the Application**
- Frontend: http://localhost:5174
- Backend API: http://localhost:5000

---

## 🌐 Live Features

### Career Discovery Quiz
- 10 interactive questions
- Dynamic career matching algorithm
- Personalized recommendations
- Salary insights
- Required skills breakdown

### Job Opportunities
- Real-time job listings
- Search & filter functionality
- Companies: TCS, Infosys, Wipro, Cognizant, Flipkart, Zomato, and more
- Remote work indicators
- Urgent hiring tags

### Multi-Language Support
- 12 Indian Languages: Hindi, Tamil, Telugu, Kannada, Malayalam, Marathi, Gujarati, Punjabi, Bengali, Odia, Assamese, Urdu
- 10 International Languages: English, Spanish, French, German, Portuguese, Chinese, Japanese, Korean, Arabic, Russian
- Google Translate integration
- Persistent language preference

---

## 📁 Project Structure

```
AI-Career-Guidance-Platform-for-Rural-Students/
├── backend/
│   ├── config/              # Database configuration
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Auth, error handling
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API routes
│   ├── utils/               # Helper functions
│   └── server.js            # Express server
│
├── frontend/
│   ├── public/              # Static files
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── context/         # React contexts
│   │   ├── pages/           # Page components
│   │   └── App.jsx          # Main app component
│   └── package.json
│
├── ai-service/              # Python AI microservice (future)
├── .gitignore
└── README.md
```

---

## 🎨 UI/UX Features

- **Glassmorphism Design** - Modern frosted glass effects
- **Gradient Backgrounds** - Beautiful color transitions
- **Smooth Animations** - Framer Motion powered
- **Responsive Design** - Mobile-first approach
- **Dark Mode Ready** - Theme context included
- **Low Bandwidth Mode** - Toggle animations off

---

## 🔐 Security Features

- JWT-based authentication
- Bcrypt password hashing
- Protected routes
- Input validation
- Rate limiting (ready)
- CORS configuration
- Helmet security headers

---

## 📊 Database Models

- **User** - Authentication & profiles
- **CareerRecommendation** - AI suggestions
- **SkillGap** - Skills analysis
- **LearningPath** - Educational roadmaps
- **Mentor** - Mentor profiles
- **JobListing** - Job opportunities
- **ChatSession** - AI conversations

---

## 🚧 Roadmap

- [ ] Python AI/ML microservice integration
- [ ] TensorFlow career prediction model
- [ ] Voice-based guidance system
- [ ] Offline mode with PWA
- [ ] Real-time chat with mentors
- [ ] Resume builder & analyzer
- [ ] Interview preparation module
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Developer

**Omnateeta V U**
- CSE Student (3rd Year)
- Passionate about using AI to empower rural students
- [GitHub](https://github.com/omnateeta)

---

## 🙏 Acknowledgments

- Google Translate API for multi-language support
- MongoDB Atlas for free database hosting
- React & Node.js communities
- All contributors and testers

---

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Made with ❤️ for Rural Students**

*Margdarshak AI - Your Career, Our Mission*

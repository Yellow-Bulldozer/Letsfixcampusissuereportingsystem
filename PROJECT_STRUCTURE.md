# Campus Issue Reporting Platform - Complete Project Structure

## 📦 Project Overview

A full-stack campus issue reporting and voting platform with separate frontend (React) and backend (Node.js/Express/MongoDB) implementations.

---

## 🗂️ Complete Directory Structure

```
project-root/
│
├── frontend/                          # React Frontend (Existing)
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── App.tsx
│   │   │   └── routes.ts
│   │   ├── styles/
│   │   └── ...
│   ├── public/
│   ├── package.json
│   └── ...
│
└── backend/                           # Node.js Backend (New)
    ├── config/                        # Configuration files
    │   ├── cloudinary.js              # Cloudinary setup
    │   └── multer.js                  # File upload config
    │
    ├── controllers/                   # Business logic
    │   ├── authController.js          # Auth operations
    │   ├── issueController.js         # Issue CRUD
    │   └── pollController.js          # Polling logic
    │
    ├── middlewares/                   # Express middlewares
    │   ├── auth.js                    # JWT & authorization
    │   ├── errorHandler.js            # Error handling
    │   ├── rateLimiter.js             # Rate limiting
    │   └── validation.js              # Input validation
    │
    ├── models/                        # Mongoose schemas
    │   ├── User.js                    # User model
    │   ├── Issue.js                   # Issue model
    │   ├── Poll.js                    # Poll model
    │   └── Vote.js                    # Vote model
    │
    ├── routes/                        # API routes
    │   ├── authRoutes.js              # /api/auth/*
    │   ├── issueRoutes.js             # /api/issues/*
    │   └── pollRoutes.js              # /api/polls/*
    │
    ├── scripts/                       # Utility scripts
    │   └── seedAdminUser.js           # Create admin users
    │
    ├── utils/                         # Helper functions
    │   ├── duplicateDetection.js      # Duplicate checking
    │   ├── jwt.js                     # JWT utilities
    │   └── pollAutomation.js          # Poll automation
    │
    ├── uploads/                       # Local file storage (gitignored)
    │
    ├── Documentation/
    │   ├── README.md                  # Main documentation
    │   ├── API_EXAMPLES.md            # API examples
    │   ├── DEPLOYMENT.md              # Deployment guide
    │   ├── FRONTEND_INTEGRATION.md    # Frontend integration
    │   └── SUMMARY.md                 # Project summary
    │
    ├── .env.example                   # Environment template
    ├── .gitignore                     # Git ignore rules
    ├── package.json                   # Dependencies
    ├── postman_collection.json        # Postman tests
    └── server.js                      # Entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- MongoDB (local or Atlas)
- npm or yarn
- Git

### Option 1: Separate Development (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configurations
node scripts/seedAdminUser.js
npm run dev
# Backend runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
# Update API_BASE_URL to http://localhost:5000/api
npm start
# Frontend runs on http://localhost:3000
```

### Option 2: Monorepo Setup

If you prefer a monorepo structure, you can combine both:

**Root package.json:**
```json
{
  "name": "campus-issue-reporting-platform",
  "private": true,
  "scripts": {
    "install:all": "npm install && cd backend && npm install",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm start",
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "build:backend": "cd backend && npm install",
    "build:frontend": "cd frontend && npm run build"
  },
  "devDependencies": {
    "concurrently": "^8.2.0"
  }
}
```

Then run:
```bash
npm run install:all
npm run dev
```

---

## 🔗 Frontend ↔ Backend Connection

### 1. Update Frontend Configuration

**Create `/frontend/src/config/api.js`:**
```javascript
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
```

**Create `/frontend/.env`:**
```
REACT_APP_API_URL=http://localhost:5000/api
```

### 2. Replace Mock Data

Find all components using mock data and replace with API calls:

**Before (Mock):**
```javascript
const issues = mockIssues;
```

**After (API):**
```javascript
import { issueService } from '../services/issue.service';

const [issues, setIssues] = useState([]);

useEffect(() => {
  const fetchIssues = async () => {
    try {
      const response = await issueService.getIssues();
      setIssues(response.data);
    } catch (error) {
      console.error('Error fetching issues:', error);
    }
  };
  fetchIssues();
}, []);
```

### 3. Add Authentication Context

**Create `/frontend/src/contexts/AuthContext.js`:**
```javascript
import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = authService.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

## 🌐 API Integration Checklist

### Authentication
- [ ] Replace mock login with `authService.login()`
- [ ] Replace mock register with `authService.register()`
- [ ] Store JWT token in localStorage
- [ ] Add token to all API requests
- [ ] Implement logout functionality
- [ ] Add token refresh logic (optional)

### Issues
- [ ] Replace mock issue list with `issueService.getIssues()`
- [ ] Replace mock issue creation with `issueService.createIssue()`
- [ ] Implement image upload with FormData
- [ ] Add filters (status, category, etc.)
- [ ] Implement pagination
- [ ] Add issue detail page with API call
- [ ] Admin: Implement verify functionality
- [ ] Admin/Authority: Implement status update

### Polling
- [ ] Replace mock poll data with `pollService.getActivePoll()`
- [ ] Implement vote casting with `pollService.castVote()`
- [ ] Show poll results with `pollService.getPollResults()`
- [ ] Display "already voted" state
- [ ] Show poll countdown timer
- [ ] Admin: Implement manual poll start

### Dashboard
- [ ] Replace mock stats with `issueService.getDashboardStats()`
- [ ] Update charts with real data
- [ ] Implement real-time updates (optional)

---

## 🔐 Security Configuration

### Backend CORS Setup
```javascript
// In server.js
const allowedOrigins = [
  'http://localhost:3000',           // Local development
  'https://your-frontend.com',       // Production frontend
  'https://www.your-frontend.com'    // Production frontend (www)
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### Frontend Axios Configuration
```javascript
// In api.service.js
axios.defaults.withCredentials = true;
```

---

## 🚀 Deployment Strategy

### Option 1: Separate Deployments (Recommended)

**Backend → Render/Railway/AWS:**
- Deploy backend independently
- Get backend URL: `https://api.yourapp.com`

**Frontend → Vercel/Netlify:**
- Deploy frontend separately
- Set env: `REACT_APP_API_URL=https://api.yourapp.com/api`

**Benefits:**
- Independent scaling
- Easier debugging
- Technology flexibility

### Option 2: Same Server Deployment

**Structure:**
```
server/
├── backend/
├── frontend/build/
└── server.js (serves both)
```

**Express configuration:**
```javascript
// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend/build')));

// API routes
app.use('/api', apiRoutes);

// Catch-all for frontend routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/build', 'index.html'));
});
```

---

## 📊 Development Workflow

### 1. Initial Setup
```bash
# Clone repository
git clone <repo-url>
cd campus-issue-reporting

# Backend setup
cd backend
npm install
cp .env.example .env
node scripts/seedAdminUser.js
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
npm start
```

### 2. Development Process
1. Backend runs on `http://localhost:5000`
2. Frontend runs on `http://localhost:3000`
3. Frontend makes API calls to backend
4. CORS allows cross-origin requests
5. JWT tokens stored in localStorage

### 3. Testing Flow
1. Register a student account
2. Login and get JWT token
3. Report an issue with images
4. Login as admin (from seeded users)
5. Verify the reported issue
6. Start a poll (admin)
7. Vote on issues (student)
8. Check poll results
9. Update issue status (admin/authority)

---

## 🗄️ Database Setup

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb-community  # macOS
# or download from mongodb.com

# Start MongoDB
brew services start mongodb-community

# Connect
mongosh

# Create database
use campus-issue-reporting
```

### MongoDB Atlas (Cloud)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0 (allow all)
5. Get connection string
6. Update `.env`: `MONGO_URI=mongodb+srv://...`

---

## 🧪 Testing

### Backend Testing
```bash
cd backend

# Test with curl
curl http://localhost:5000/api/health

# Test register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@yourcollege.edu","password":"test123","department":"CS"}'

# Import Postman collection
# File: backend/postman_collection.json
```

### Frontend Testing
1. Open browser: `http://localhost:3000`
2. Register new student
3. Login
4. Report issue
5. Vote in poll
6. Check dashboard

---

## 📝 Environment Variables

### Backend `.env`
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-issue-reporting
JWT_SECRET=your_very_long_secret_key_change_this
JWT_EXPIRE=7d
COLLEGE_EMAIL_DOMAIN=@yourcollege.edu
UPLOAD_METHOD=local
FRONTEND_URL=http://localhost:3000
```

### Frontend `.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error
**Solution:**
- Check `FRONTEND_URL` in backend `.env`
- Verify CORS configuration in `server.js`
- Ensure credentials are included in frontend requests

### Issue: MongoDB Connection Failed
**Solution:**
- Check MongoDB is running: `mongosh`
- Verify `MONGO_URI` format
- Check network connectivity
- For Atlas: Whitelist IP addresses

### Issue: JWT Token Invalid
**Solution:**
- Clear localStorage in browser
- Re-login to get new token
- Check JWT_SECRET is set correctly
- Verify token expiration time

### Issue: File Upload Not Working
**Solution:**
- Check `uploads/` directory exists
- Verify multer configuration
- Check file size limits
- Ensure FormData is used correctly

### Issue: Poll Not Starting
**Solution:**
- Check cron job configuration
- Verify timezone settings
- Ensure verified issues exist
- Check server logs for errors

---

## 📈 Performance Tips

### Backend
- Use pagination for large datasets
- Implement caching with Redis
- Use database indexes (already configured)
- Enable gzip compression
- Use lean() for read-only queries

### Frontend
- Implement lazy loading
- Use React.memo for expensive components
- Add loading skeletons
- Optimize images
- Implement virtual scrolling for long lists

---

## 🔒 Security Best Practices

### Backend
- ✅ Environment variables for secrets
- ✅ JWT token expiration
- ✅ Password hashing (bcrypt)
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers

### Frontend
- ✅ Store tokens securely (localStorage)
- ✅ Implement CSRF protection
- ✅ Sanitize user inputs
- ✅ Validate file uploads
- ✅ Use HTTPS in production
- ✅ Implement CSP headers

---

## 📚 Documentation Links

- [Backend README](backend/README.md)
- [API Examples](backend/API_EXAMPLES.md)
- [Deployment Guide](backend/DEPLOYMENT.md)
- [Frontend Integration](backend/FRONTEND_INTEGRATION.md)
- [Project Summary](backend/SUMMARY.md)

---

## 🎯 Quick Command Reference

```bash
# Backend commands
cd backend
npm install                    # Install dependencies
npm run dev                    # Start dev server
npm start                      # Start production
node scripts/seedAdminUser.js  # Create admin users

# Frontend commands
cd frontend
npm install                    # Install dependencies
npm start                      # Start dev server
npm run build                  # Build for production

# Database commands
mongosh                        # Connect to MongoDB
use campus-issue-reporting     # Switch database
db.users.find()               # List users
db.issues.find()              # List issues

# Git commands
git status                     # Check status
git add .                      # Stage changes
git commit -m "message"        # Commit changes
git push                       # Push to remote
```

---

## 🎓 Learning Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Guide](https://mongoosejs.com/docs/guide.html)
- [JWT Introduction](https://jwt.io/introduction)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit pull request

---

## 📄 License

MIT License - feel free to use this project for learning or production.

---

## 🆘 Support

For issues, questions, or contributions:
- Create an issue on GitHub
- Contact: [your-email@example.com]
- Documentation: [Link to docs]

---

**Happy Coding! 🚀**

Built with ❤️ for Campus Safety and Student Empowerment

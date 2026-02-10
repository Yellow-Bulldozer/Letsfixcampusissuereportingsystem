# Campus Issue Reporting Platform - Backend

A production-ready RESTful API backend for a campus issue reporting and voting platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control (Student, Admin, Authority)
- **Issue Reporting**: Students can report campus issues with images and location details
- **Automated Polling**: Weekly Saturday polls for verified issues with 24-hour voting window
- **Vote Management**: One vote per student per poll with duplicate prevention
- **Status Tracking**: Issue lifecycle management (Pending → Ongoing → Completed)
- **Duplicate Detection**: Prevents duplicate issue reports for the same location within 24 hours
- **Image Uploads**: Supports both local storage and Cloudinary
- **Dashboard APIs**: Role-specific statistics and filtered data
- **Security**: Rate limiting, input sanitization, helmet protection

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 6.0 (local or Atlas)
- npm or yarn
- (Optional) Cloudinary account for cloud image storage

## 🛠️ Installation

1. **Clone and navigate to backend directory**
```bash
cd backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` file with your configurations:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/campus-issue-reporting
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
COLLEGE_EMAIL_DOMAIN=@yourcollege.edu
UPLOAD_METHOD=local
FRONTEND_URL=http://localhost:3000
```

4. **Create uploads directory (if using local storage)**
```bash
mkdir uploads
```

## 🚀 Running the Application

**Development mode (with auto-reload)**
```bash
npm run dev
```

**Production mode**
```bash
npm start
```

Server will start on `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── config/
│   ├── cloudinary.js      # Cloudinary configuration
│   └── multer.js           # File upload configuration
├── controllers/
│   ├── authController.js   # Authentication logic
│   ├── issueController.js  # Issue management logic
│   └── pollController.js   # Polling and voting logic
├── middlewares/
│   ├── auth.js             # JWT & role-based authorization
│   ├── errorHandler.js     # Global error handling
│   ├── rateLimiter.js      # Rate limiting
│   └── validation.js       # Request validation rules
├── models/
│   ├── User.js             # User schema
│   ├── Issue.js            # Issue schema
│   ├── Poll.js             # Poll schema
│   └── Vote.js             # Vote schema
├── routes/
│   ├── authRoutes.js       # Auth endpoints
│   ├── issueRoutes.js      # Issue endpoints
│   └── pollRoutes.js       # Poll endpoints
├── utils/
│   ├── duplicateDetection.js  # Duplicate issue detection
│   ├── jwt.js                 # JWT utilities
│   └── pollAutomation.js      # Poll automation logic
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js               # Entry point
```

## 🔐 API Endpoints

### Authentication Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new student |
| POST | `/api/auth/login` | Public | Login user |
| GET | `/api/auth/me` | Private | Get current user |
| PUT | `/api/auth/profile` | Private | Update profile |
| PUT | `/api/auth/change-password` | Private | Change password |

### Issue Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/issues` | Student | Report new issue |
| GET | `/api/issues` | All | Get all issues (filtered) |
| GET | `/api/issues/:id` | All | Get single issue |
| GET | `/api/issues/my/issues` | Student | Get user's issues |
| PUT | `/api/issues/:id/status` | Admin/Authority | Update issue status |
| PUT | `/api/issues/:id/verify` | Admin | Verify/unverify issue |
| GET | `/api/issues/stats/dashboard` | All | Get dashboard statistics |
| GET | `/api/issues/weekly/priority` | Authority | Get weekly priority issue |
| DELETE | `/api/issues/:id` | Admin | Delete issue |

### Poll Routes

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/polls/start` | Admin | Start new poll manually |
| GET | `/api/polls/active` | All | Get active poll |
| POST | `/api/polls/vote` | Student | Cast vote |
| GET | `/api/polls/result` | All | Get poll results |
| GET | `/api/polls` | Admin | Get all polls |
| PUT | `/api/polls/:id/close` | Admin | Close poll manually |
| GET | `/api/polls/stats` | Admin | Get poll statistics |
| GET | `/api/polls/my-vote` | Student | Get user's vote |

## 📝 API Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john.doe@yourcollege.edu",
  "password": "securePassword123",
  "department": "Computer Science"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@yourcollege.edu",
  "password": "securePassword123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john.doe@yourcollege.edu",
    "role": "student",
    "department": "Computer Science"
  }
}
```

### Report Issue
```bash
POST /api/issues
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Broken Bench in Library",
  "description": "The bench near the entrance is broken and needs repair",
  "category": "bench",
  "location": {
    "block": "A",
    "floor": "Ground Floor",
    "room": "Library Entrance"
  },
  "images": [file1, file2]  // multipart files
}
```

### Cast Vote
```bash
POST /api/polls/vote
Authorization: Bearer <token>
Content-Type: application/json

{
  "issueId": "507f1f77bcf86cd799439011"
}
```

## 🔄 Poll Automation

The system automatically starts polls every Saturday at midnight using `node-cron`:

1. **Week Definition**: Monday to Friday
2. **Eligible Issues**: Only verified, pending issues from the week
3. **Poll Duration**: 24 hours
4. **Winner Selection**: Highest voted issue becomes weekly priority
5. **Status Update**: Winning issue marked as critical priority

### Manual Poll Control

Admins can also manually start and close polls via API endpoints.

## 🗄️ Database Schema

### User Model
- Authentication and profile information
- Role-based access (student/admin/authority)
- Password hashing with bcrypt

### Issue Model
- Issue details with location and category
- Image URLs array
- Status tracking and verification
- Weekly priority flag

### Poll Model
- Week date range and poll window
- Associated issues array
- Winner tracking
- Active/closed status

### Vote Model
- Student-issue-poll relationship
- Unique constraint prevents duplicate votes
- Timestamp tracking

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt (10 salt rounds)
- Role-based access control
- Rate limiting on sensitive routes
- Input validation and sanitization
- MongoDB injection prevention
- Helmet security headers
- CORS configuration
- File upload restrictions

## 🎯 Business Logic

### Duplicate Detection
- Prevents duplicate reports for same location + category within 24 hours
- Alerts user with existing issue details

### Status Flow
```
Pending → Ongoing → Completed
```
- Only admins and authorities can update status
- Status history tracked with timestamps

### Voting Rules
- One vote per student per poll
- Only during active poll window
- Only for verified issues
- Database-level constraint enforcement

## 📊 File Upload Strategy

### Local Storage (Development)
**Pros:**
- No external dependencies
- Free
- Fast for development
- Easy debugging

**Cons:**
- Not scalable
- Server disk space required
- No CDN benefits

### Cloudinary (Production)
**Pros:**
- Automatic optimization
- CDN delivery
- Scalable storage
- Built-in transformations
- Backup and redundancy

**Cons:**
- Requires API keys
- Costs for high usage

**Recommendation**: Use local storage for development, Cloudinary for production.

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong `JWT_SECRET`
3. Configure MongoDB Atlas URI
4. Set up Cloudinary (recommended)
5. Configure CORS for frontend domain

### Deployment Platforms
- **Render**: Easy Node.js deployment
- **Railway**: Simple setup with free tier
- **AWS EC2**: Full control
- **Heroku**: Quick deployment
- **DigitalOcean**: Cost-effective VPS

### MongoDB Setup
- Use MongoDB Atlas for managed database
- Set up IP whitelist
- Enable database user authentication
- Regular backups

## 🧪 Testing

Create admin and authority users manually in MongoDB:

```javascript
// In MongoDB Shell or Compass
db.users.updateOne(
  { email: "admin@yourcollege.edu" },
  {
    $set: {
      role: "admin",
      password: "$2a$10$..." // hashed password
    }
  }
)
```

## 📞 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Check MONGO_URI format
- Verify MongoDB is running
- Check network connectivity
- Whitelist IP in Atlas

### File Upload Issues
- Check upload directory permissions
- Verify file size limits
- Check Cloudinary credentials
- Ensure multer configuration

### JWT Issues
- Verify JWT_SECRET is set
- Check token expiration
- Ensure Bearer token format

## 📄 License

MIT

## 👥 Support

For issues and questions, please create an issue in the repository.

---

**Built with ❤️ for Campus Safety and Improvement**

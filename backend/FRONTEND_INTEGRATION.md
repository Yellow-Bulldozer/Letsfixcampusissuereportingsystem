# Frontend Integration Guide

Complete guide to integrate your existing frontend with this backend API.

## 🔗 Quick Start

### 1. Update Frontend Configuration

Create an API configuration file in your frontend:

**`/src/config/api.js`**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/profile`,
  CHANGE_PASSWORD: `${API_BASE_URL}/auth/change-password`,
  
  // Issues
  ISSUES: `${API_BASE_URL}/issues`,
  MY_ISSUES: `${API_BASE_URL}/issues/my/issues`,
  ISSUE_STATS: `${API_BASE_URL}/issues/stats/dashboard`,
  WEEKLY_PRIORITY: `${API_BASE_URL}/issues/weekly/priority`,
  
  // Polls
  POLLS: `${API_BASE_URL}/polls`,
  ACTIVE_POLL: `${API_BASE_URL}/polls/active`,
  VOTE: `${API_BASE_URL}/polls/vote`,
  POLL_RESULTS: `${API_BASE_URL}/polls/result`,
  MY_VOTE: `${API_BASE_URL}/polls/my-vote`,
  POLL_STATS: `${API_BASE_URL}/polls/stats`
};

export default API_BASE_URL;
```

### 2. Create API Service

**`/src/services/api.service.js`**
```javascript
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

export default apiClient;
```

### 3. Create Auth Service

**`/src/services/auth.service.js`**
```javascript
import apiClient from './api.service';
import { API_ENDPOINTS } from '../config/api';

export const authService = {
  // Register new student
  register: async (userData) => {
    const response = await apiClient.post('/auth/register', userData);
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Login
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.success && response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    return await apiClient.get('/auth/me');
  },

  // Update profile
  updateProfile: async (userData) => {
    return await apiClient.put('/auth/profile', userData);
  },

  // Change password
  changePassword: async (currentPassword, newPassword) => {
    return await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword
    });
  },

  // Get stored user
  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};
```

### 4. Create Issue Service

**`/src/services/issue.service.js`**
```javascript
import apiClient from './api.service';

export const issueService = {
  // Create new issue with images
  createIssue: async (issueData) => {
    const formData = new FormData();
    
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('category', issueData.category);
    formData.append('location', JSON.stringify(issueData.location));
    
    // Append images
    if (issueData.images && issueData.images.length > 0) {
      issueData.images.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    return await apiClient.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Get all issues with filters
  getIssues: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });
    
    return await apiClient.get(`/issues?${params.toString()}`);
  },

  // Get single issue
  getIssue: async (id) => {
    return await apiClient.get(`/issues/${id}`);
  },

  // Get user's issues
  getMyIssues: async () => {
    return await apiClient.get('/issues/my/issues');
  },

  // Update issue status (Admin/Authority)
  updateStatus: async (id, status, comment) => {
    return await apiClient.put(`/issues/${id}/status`, { status, comment });
  },

  // Verify issue (Admin)
  verifyIssue: async (id, verified) => {
    return await apiClient.put(`/issues/${id}/verify`, { verified });
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    return await apiClient.get('/issues/stats/dashboard');
  },

  // Get weekly priority issue (Authority)
  getWeeklyPriority: async () => {
    return await apiClient.get('/issues/weekly/priority');
  },

  // Delete issue (Admin)
  deleteIssue: async (id) => {
    return await apiClient.delete(`/issues/${id}`);
  }
};
```

### 5. Create Poll Service

**`/src/services/poll.service.js`**
```javascript
import apiClient from './api.service';

export const pollService = {
  // Get active poll
  getActivePoll: async () => {
    return await apiClient.get('/polls/active');
  },

  // Cast vote (Student)
  castVote: async (issueId) => {
    return await apiClient.post('/polls/vote', { issueId });
  },

  // Get poll results
  getPollResults: async (pollId = null) => {
    const url = pollId ? `/polls/result?pollId=${pollId}` : '/polls/result';
    return await apiClient.get(url);
  },

  // Get user's vote (Student)
  getMyVote: async () => {
    return await apiClient.get('/polls/my-vote');
  },

  // Start poll (Admin)
  startPoll: async () => {
    return await apiClient.post('/polls/start');
  },

  // Get all polls (Admin)
  getAllPolls: async (page = 1, limit = 10) => {
    return await apiClient.get(`/polls?page=${page}&limit=${limit}`);
  },

  // Close poll (Admin)
  closePoll: async (pollId) => {
    return await apiClient.put(`/polls/${pollId}/close`);
  },

  // Get poll statistics (Admin)
  getPollStats: async () => {
    return await apiClient.get('/polls/stats');
  }
};
```

---

## 🎨 React Component Examples

### 1. Login Component

```javascript
import React, { useState } from 'react';
import { authService } from '../services/auth.service';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      
      if (response.success) {
        // Redirect based on role
        const user = response.user;
        if (user.role === 'student') {
          window.location.href = '/student/dashboard';
        } else if (user.role === 'admin') {
          window.location.href = '/admin/dashboard';
        } else if (user.role === 'authority') {
          window.location.href = '/authority/dashboard';
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
}

export default Login;
```

### 2. Report Issue Component

```javascript
import React, { useState } from 'react';
import { issueService } from '../services/issue.service';

function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'bench',
    location: {
      block: '',
      floor: '',
      room: ''
    },
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('location.')) {
      const locationField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: files
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await issueService.createIssue(formData);
      
      if (response.success) {
        setSuccess(true);
        // Reset form
        setFormData({
          title: '',
          description: '',
          category: 'bench',
          location: { block: '', floor: '', room: '' },
          images: []
        });
        // Optionally redirect
        setTimeout(() => {
          window.location.href = '/student/my-issues';
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to report issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        placeholder="Issue Title"
        value={formData.title}
        onChange={handleChange}
        required
      />
      
      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        required
      />
      
      <select
        name="category"
        value={formData.category}
        onChange={handleChange}
        required
      >
        <option value="bench">Bench</option>
        <option value="water">Water</option>
        <option value="electrical">Electrical</option>
        <option value="washroom">Washroom</option>
        <option value="classroom">Classroom</option>
        <option value="infrastructure">Infrastructure</option>
        <option value="internet">Internet</option>
        <option value="security">Security</option>
        <option value="cleanliness">Cleanliness</option>
        <option value="other">Other</option>
      </select>
      
      <input
        type="text"
        name="location.block"
        placeholder="Block"
        value={formData.location.block}
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="location.floor"
        placeholder="Floor"
        value={formData.location.floor}
        onChange={handleChange}
        required
      />
      
      <input
        type="text"
        name="location.room"
        placeholder="Room (Optional)"
        value={formData.location.room}
        onChange={handleChange}
      />
      
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageChange}
        max="5"
      />
      
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Issue reported successfully!</p>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Submitting...' : 'Report Issue'}
      </button>
    </form>
  );
}

export default ReportIssue;
```

### 3. Voting Component

```javascript
import React, { useState, useEffect } from 'react';
import { pollService } from '../services/poll.service';

function VotingPoll() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    fetchActivePoll();
  }, []);

  const fetchActivePoll = async () => {
    try {
      const response = await pollService.getActivePoll();
      if (response.success) {
        setPoll(response.data);
      }
    } catch (err) {
      setError(err.message || 'No active poll available');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (issueId) => {
    setVoting(true);
    setError('');

    try {
      const response = await pollService.castVote(issueId);
      
      if (response.success) {
        alert('Vote cast successfully!');
        // Refresh poll data
        fetchActivePoll();
      }
    } catch (err) {
      setError(err.message || 'Failed to cast vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!poll) return <div>No active poll</div>;

  return (
    <div className="voting-poll">
      <h2>Weekly Poll</h2>
      <p>Poll ends: {new Date(poll.pollEndDate).toLocaleString()}</p>
      
      {poll.hasVoted && (
        <p className="info">You have already voted in this poll</p>
      )}
      
      <div className="issues-list">
        {poll.issues.map((issue) => (
          <div key={issue._id} className="issue-card">
            <h3>{issue.title}</h3>
            <p>{issue.description}</p>
            <p>Category: {issue.category}</p>
            <p>Location: {issue.location.block} - {issue.location.floor}</p>
            <p>Current Votes: {issue.voteCount}</p>
            
            {!poll.hasVoted && (
              <button
                onClick={() => handleVote(issue._id)}
                disabled={voting}
              >
                {voting ? 'Voting...' : 'Vote for This Issue'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VotingPoll;
```

### 4. Dashboard Stats Component

```javascript
import React, { useState, useEffect } from 'react';
import { issueService } from '../services/issue.service';

function DashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await issueService.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading stats...</div>;
  if (!stats) return null;

  return (
    <div className="dashboard-stats">
      <div className="stat-card">
        <h3>Total Issues</h3>
        <p className="stat-number">{stats.totalIssues || stats.total}</p>
      </div>
      
      <div className="stat-card">
        <h3>Pending</h3>
        <p className="stat-number">{stats.pending}</p>
      </div>
      
      <div className="stat-card">
        <h3>Ongoing</h3>
        <p className="stat-number">{stats.ongoing}</p>
      </div>
      
      <div className="stat-card">
        <h3>Completed</h3>
        <p className="stat-number">{stats.completed}</p>
      </div>
    </div>
  );
}

export default DashboardStats;
```

---

## 🔐 Protected Routes

```javascript
import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/auth.service';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getStoredUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

// Usage in routes:
<Route
  path="/student/dashboard"
  element={
    <ProtectedRoute allowedRoles={['student']}>
      <StudentDashboard />
    </ProtectedRoute>
  }
/>
```

---

## 🌐 Environment Variables

Add to your `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

For production:
```env
REACT_APP_API_URL=https://your-backend-domain.com/api
```

---

## ⚙️ Image Display

For displaying uploaded images:

```javascript
const imageUrl = issue.images[0];

// If using local storage:
const fullImageUrl = `${process.env.REACT_APP_API_URL.replace('/api', '')}${imageUrl}`;

// If using Cloudinary, URL is already complete
<img src={fullImageUrl} alt={issue.title} />
```

---

## 🧪 Testing API Calls

Use browser console to test:

```javascript
// Test login
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'student@yourcollege.edu',
    password: 'password123'
  })
})
.then(res => res.json())
.then(data => console.log(data));
```

---

## 📱 Error Handling Best Practices

```javascript
try {
  const response = await issueService.createIssue(formData);
  // Success handling
} catch (error) {
  // Extract error message
  const errorMessage = error.message || 
                       error.errors?.join(', ') || 
                       'An error occurred';
  
  setError(errorMessage);
  
  // Log for debugging
  console.error('API Error:', error);
}
```

---

## 🔄 Real-time Updates (Optional)

For real-time notifications, consider adding Socket.io:

**Backend:** Install and configure Socket.io
**Frontend:** Connect and listen for events

```javascript
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

socket.on('pollStarted', (data) => {
  // Show notification
  alert('New poll has started!');
});

socket.on('issueStatusUpdated', (data) => {
  // Refresh issue list
  fetchIssues();
});
```

---

## ✅ Integration Checklist

- [ ] API services created
- [ ] Axios interceptors configured
- [ ] Auth token storage implemented
- [ ] Protected routes set up
- [ ] Login/Register forms connected
- [ ] Issue reporting form connected
- [ ] Voting component connected
- [ ] Dashboard stats connected
- [ ] Image upload working
- [ ] Error handling implemented
- [ ] Loading states added
- [ ] Environment variables configured
- [ ] CORS configured on backend
- [ ] API endpoints tested
- [ ] Role-based access working

---

## 🎯 Next Steps

1. Replace mock data with API calls
2. Test all user flows
3. Handle edge cases
4. Add loading indicators
5. Implement error boundaries
6. Add success notifications
7. Test with different roles
8. Performance optimization
9. Production deployment

---

**Your frontend is now ready to communicate with the backend! 🚀**

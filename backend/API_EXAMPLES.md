# API Request & Response Examples

Complete API documentation with request/response examples for all endpoints.

## Table of Contents
- [Authentication](#authentication)
- [Issues](#issues)
- [Polls & Voting](#polls--voting)

---

## Authentication

### 1. Register Student

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "name": "John Doe",
  "email": "john.doe@yourcollege.edu",
  "password": "securePassword123",
  "department": "Computer Science"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY1YTFiMmMzZDRlNWY2ZzciLCJpYXQiOjE3MDUwNjg4MDAsImV4cCI6MTcwNTY3MzYwMH0.abc123...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7",
    "name": "John Doe",
    "email": "john.doe@yourcollege.edu",
    "role": "student",
    "department": "Computer Science",
    "createdAt": "2024-01-12T10:30:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Email must be from college domain @yourcollege.edu"
  ]
}
```

---

### 2. Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "john.doe@yourcollege.edu",
  "password": "securePassword123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "65a1b2c3d4e5f6g7",
    "name": "John Doe",
    "email": "john.doe@yourcollege.edu",
    "role": "student",
    "department": "Computer Science",
    "createdAt": "2024-01-12T10:30:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a1b2c3d4e5f6g7",
    "name": "John Doe",
    "email": "john.doe@yourcollege.edu",
    "role": "student",
    "department": "Computer Science",
    "isActive": true,
    "createdAt": "2024-01-12T10:30:00.000Z",
    "updatedAt": "2024-01-12T10:30:00.000Z"
  }
}
```

---

## Issues

### 1. Report New Issue

**Endpoint:** `POST /api/issues`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request (multipart/form-data):**
```
title: "Broken Bench in Library"
description: "The wooden bench near the main entrance is broken. Two legs are damaged and it's unsafe to sit on."
category: "bench"
location: {"block":"A","floor":"Ground Floor","room":"Library Entrance"}
images: [file1.jpg, file2.jpg]
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Issue reported successfully",
  "data": {
    "_id": "65a2c3d4e5f6g7h8",
    "title": "Broken Bench in Library",
    "description": "The wooden bench near the main entrance is broken...",
    "category": "bench",
    "images": [
      "/uploads/issue-1705070400000-123456789.jpg",
      "/uploads/issue-1705070400001-987654321.jpg"
    ],
    "location": {
      "block": "A",
      "floor": "Ground Floor",
      "room": "Library Entrance"
    },
    "status": "Pending",
    "verified": false,
    "reportedBy": {
      "_id": "65a1b2c3d4e5f6g7",
      "name": "John Doe",
      "email": "john.doe@yourcollege.edu",
      "department": "Computer Science"
    },
    "priority": "medium",
    "isWeeklyPriority": false,
    "createdAt": "2024-01-12T11:00:00.000Z",
    "updatedAt": "2024-01-12T11:00:00.000Z"
  }
}
```

**Error Response - Duplicate (400):**
```json
{
  "success": false,
  "message": "A similar issue has been reported in this location within the last 24 hours",
  "duplicateIssue": {
    "id": "65a2c3d4e5f6g7h8",
    "title": "Damaged Bench",
    "status": "Pending",
    "createdAt": "2024-01-12T09:00:00.000Z"
  }
}
```

---

### 2. Get All Issues (with filters)

**Endpoint:** `GET /api/issues?status=Pending&category=bench&page=1&limit=10`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 45,
  "page": 1,
  "pages": 5,
  "data": [
    {
      "_id": "65a2c3d4e5f6g7h8",
      "title": "Broken Bench in Library",
      "description": "The wooden bench near the main entrance...",
      "category": "bench",
      "images": ["/uploads/issue-1705070400000-123456789.jpg"],
      "location": {
        "block": "A",
        "floor": "Ground Floor",
        "room": "Library Entrance"
      },
      "status": "Pending",
      "verified": true,
      "reportedBy": {
        "_id": "65a1b2c3d4e5f6g7",
        "name": "John Doe",
        "email": "john.doe@yourcollege.edu",
        "department": "Computer Science"
      },
      "verifiedBy": {
        "_id": "65a3d4e5f6g7h8i9",
        "name": "Admin User",
        "email": "admin@yourcollege.edu"
      },
      "verifiedAt": "2024-01-12T11:30:00.000Z",
      "priority": "medium",
      "isWeeklyPriority": false,
      "createdAt": "2024-01-12T11:00:00.000Z",
      "updatedAt": "2024-01-12T11:30:00.000Z"
    }
  ]
}
```

---

### 3. Get Single Issue

**Endpoint:** `GET /api/issues/65a2c3d4e5f6g7h8`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a2c3d4e5f6g7h8",
    "title": "Broken Bench in Library",
    "description": "The wooden bench near the main entrance is broken...",
    "category": "bench",
    "images": [
      "/uploads/issue-1705070400000-123456789.jpg",
      "/uploads/issue-1705070400001-987654321.jpg"
    ],
    "location": {
      "block": "A",
      "floor": "Ground Floor",
      "room": "Library Entrance"
    },
    "status": "Pending",
    "verified": true,
    "reportedBy": {
      "_id": "65a1b2c3d4e5f6g7",
      "name": "John Doe",
      "email": "john.doe@yourcollege.edu",
      "department": "Computer Science"
    },
    "verifiedBy": {
      "_id": "65a3d4e5f6g7h8i9",
      "name": "Admin User",
      "email": "admin@yourcollege.edu"
    },
    "verifiedAt": "2024-01-12T11:30:00.000Z",
    "priority": "medium",
    "isWeeklyPriority": false,
    "statusUpdates": [],
    "createdAt": "2024-01-12T11:00:00.000Z",
    "updatedAt": "2024-01-12T11:30:00.000Z"
  }
}
```

---

### 4. Verify Issue (Admin only)

**Endpoint:** `PUT /api/issues/65a2c3d4e5f6g7h8/verify`

**Headers:**
```
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request:**
```json
{
  "verified": true
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Issue verified successfully",
  "data": {
    "_id": "65a2c3d4e5f6g7h8",
    "title": "Broken Bench in Library",
    "verified": true,
    "verifiedBy": {
      "_id": "65a3d4e5f6g7h8i9",
      "name": "Admin User",
      "email": "admin@yourcollege.edu"
    },
    "verifiedAt": "2024-01-12T11:30:00.000Z"
  }
}
```

---

### 5. Update Issue Status (Admin/Authority)

**Endpoint:** `PUT /api/issues/65a2c3d4e5f6g7h8/status`

**Headers:**
```
Authorization: Bearer <admin_or_authority_token>
Content-Type: application/json
```

**Request:**
```json
{
  "status": "Ongoing",
  "comment": "Maintenance team has been assigned to fix the bench"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Status updated successfully",
  "data": {
    "_id": "65a2c3d4e5f6g7h8",
    "title": "Broken Bench in Library",
    "status": "Ongoing",
    "statusUpdates": [
      {
        "status": "Ongoing",
        "updatedBy": {
          "_id": "65a3d4e5f6g7h8i9",
          "name": "Admin User",
          "email": "admin@yourcollege.edu",
          "role": "admin"
        },
        "comment": "Maintenance team has been assigned to fix the bench",
        "timestamp": "2024-01-13T09:00:00.000Z"
      }
    ]
  }
}
```

---

### 6. Get Dashboard Statistics

**Endpoint:** `GET /api/issues/stats/dashboard`

**Headers:**
```
Authorization: Bearer <token>
```

**Student Response (200):**
```json
{
  "success": true,
  "data": {
    "totalIssues": 8,
    "pending": 3,
    "ongoing": 2,
    "completed": 3
  }
}
```

**Admin Response (200):**
```json
{
  "success": true,
  "data": {
    "total": 156,
    "verified": 120,
    "unverified": 36,
    "pending": 45,
    "ongoing": 38,
    "completed": 73
  }
}
```

**Authority Response (200):**
```json
{
  "success": true,
  "data": {
    "weeklyPriority": 1,
    "pending": 45,
    "ongoing": 38,
    "completed": 73
  }
}
```

---

## Polls & Voting

### 1. Start Poll (Admin only)

**Endpoint:** `POST /api/polls/start`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Poll started successfully",
  "data": {
    "_id": "65a4e5f6g7h8i9j0",
    "weekStartDate": "2024-01-08T00:00:00.000Z",
    "weekEndDate": "2024-01-12T23:59:59.999Z",
    "pollStartDate": "2024-01-13T00:00:00.000Z",
    "pollEndDate": "2024-01-14T00:00:00.000Z",
    "isActive": true,
    "isClosed": false,
    "issues": [
      {
        "_id": "65a2c3d4e5f6g7h8",
        "title": "Broken Bench in Library",
        "category": "bench",
        "status": "Pending"
      },
      {
        "_id": "65a2c3d4e5f6g7h9",
        "title": "Water Cooler Not Working",
        "category": "water",
        "status": "Pending"
      }
    ],
    "totalVotes": 0,
    "createdAt": "2024-01-13T00:00:00.000Z"
  }
}
```

---

### 2. Get Active Poll

**Endpoint:** `GET /api/polls/active`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a4e5f6g7h8i9j0",
    "weekStartDate": "2024-01-08T00:00:00.000Z",
    "weekEndDate": "2024-01-12T23:59:59.999Z",
    "pollStartDate": "2024-01-13T00:00:00.000Z",
    "pollEndDate": "2024-01-14T00:00:00.000Z",
    "isActive": true,
    "isClosed": false,
    "hasVoted": false,
    "issues": [
      {
        "_id": "65a2c3d4e5f6g7h8",
        "title": "Broken Bench in Library",
        "description": "The wooden bench near the main entrance...",
        "category": "bench",
        "location": {
          "block": "A",
          "floor": "Ground Floor",
          "room": "Library Entrance"
        },
        "status": "Pending",
        "reportedBy": {
          "_id": "65a1b2c3d4e5f6g7",
          "name": "John Doe",
          "email": "john.doe@yourcollege.edu",
          "department": "Computer Science"
        },
        "voteCount": 15
      },
      {
        "_id": "65a2c3d4e5f6g7h9",
        "title": "Water Cooler Not Working",
        "description": "The water cooler on 2nd floor...",
        "category": "water",
        "location": {
          "block": "B",
          "floor": "2nd Floor",
          "room": "Common Area"
        },
        "status": "Pending",
        "reportedBy": {
          "_id": "65a1b2c3d4e5f6g8",
          "name": "Jane Smith",
          "email": "jane.smith@yourcollege.edu",
          "department": "Electrical Engineering"
        },
        "voteCount": 23
      }
    ],
    "totalVotes": 38
  }
}
```

---

### 3. Cast Vote (Student only)

**Endpoint:** `POST /api/polls/vote`

**Headers:**
```
Authorization: Bearer <student_token>
Content-Type: application/json
```

**Request:**
```json
{
  "issueId": "65a2c3d4e5f6g7h9"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Vote cast successfully",
  "data": {
    "_id": "65a5f6g7h8i9j0k1",
    "pollId": "65a4e5f6g7h8i9j0",
    "issueId": "65a2c3d4e5f6g7h9",
    "studentId": "65a1b2c3d4e5f6g7",
    "createdAt": "2024-01-13T10:30:00.000Z"
  }
}
```

**Error Response - Already Voted (400):**
```json
{
  "success": false,
  "message": "You have already voted in this poll"
}
```

**Error Response - Poll Not Active (400):**
```json
{
  "success": false,
  "message": "No active poll available"
}
```

---

### 4. Get Poll Results

**Endpoint:** `GET /api/polls/result` or `GET /api/polls/result?pollId=65a4e5f6g7h8i9j0`

**Headers:**
```
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "65a4e5f6g7h8i9j0",
    "weekStartDate": "2024-01-08T00:00:00.000Z",
    "weekEndDate": "2024-01-12T23:59:59.999Z",
    "pollStartDate": "2024-01-13T00:00:00.000Z",
    "pollEndDate": "2024-01-14T00:00:00.000Z",
    "isActive": false,
    "isClosed": true,
    "totalVotes": 87,
    "closedAt": "2024-01-14T00:00:00.000Z",
    "winningIssue": {
      "_id": "65a2c3d4e5f6g7h9",
      "title": "Water Cooler Not Working",
      "category": "water",
      "status": "Ongoing"
    },
    "issues": [
      {
        "_id": "65a2c3d4e5f6g7h9",
        "title": "Water Cooler Not Working",
        "category": "water",
        "voteCount": 52,
        "isWinner": true
      },
      {
        "_id": "65a2c3d4e5f6g7h8",
        "title": "Broken Bench in Library",
        "category": "bench",
        "voteCount": 35,
        "isWinner": false
      }
    ]
  }
}
```

---

### 5. Get All Polls (Admin only)

**Endpoint:** `GET /api/polls?page=1&limit=10`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 23,
  "page": 1,
  "pages": 3,
  "data": [
    {
      "_id": "65a4e5f6g7h8i9j0",
      "weekStartDate": "2024-01-08T00:00:00.000Z",
      "weekEndDate": "2024-01-12T23:59:59.999Z",
      "pollStartDate": "2024-01-13T00:00:00.000Z",
      "pollEndDate": "2024-01-14T00:00:00.000Z",
      "isActive": false,
      "isClosed": true,
      "issues": [
        {
          "_id": "65a2c3d4e5f6g7h8",
          "title": "Broken Bench in Library",
          "category": "bench",
          "status": "Pending"
        }
      ],
      "winningIssue": {
        "_id": "65a2c3d4e5f6g7h9",
        "title": "Water Cooler Not Working",
        "category": "water"
      },
      "totalVotes": 87,
      "closedAt": "2024-01-14T00:00:00.000Z",
      "createdAt": "2024-01-13T00:00:00.000Z"
    }
  ]
}
```

---

### 6. Get Poll Statistics (Admin only)

**Endpoint:** `GET /api/polls/stats`

**Headers:**
```
Authorization: Bearer <admin_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPolls": 23,
    "activePolls": 1,
    "closedPolls": 22,
    "totalVotes": 1843,
    "avgVotesPerPoll": 84
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "Category is required"
  ]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "message": "User role 'student' is not authorized to access this route"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Issue not found"
}
```

### 429 - Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later"
}
```

### 500 - Server Error
```json
{
  "success": false,
  "message": "Server Error"
}
```

---

## Authentication Headers

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

### Filters (Issues)
- `status`: Pending | Ongoing | Completed
- `category`: bench | water | electrical | washroom | classroom | etc.
- `verified`: true | false
- `block`: Block name
- `floor`: Floor name
- `priority`: low | medium | high | critical
- `isWeeklyPriority`: true | false
- `sort`: Field to sort by (prefix with - for descending)

---

**Note:** Replace placeholder IDs and tokens with actual values from your database.

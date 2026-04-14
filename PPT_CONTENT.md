# Campus Issue Reporting System PPT Content

## Slide: System Architecture

### Title
System Architecture of the Campus Issue Reporting System

### Content
The Campus Issue Reporting System is designed as a full-stack web application that connects students, administrators, and authorities through a centralized issue management platform.

### Input
- Student registration and login details
- Issue details such as title, description, category, and location
- Uploaded issue images
- Admin verification inputs
- Student votes for weekly priority issues
- Authority status updates for issue resolution

### Processing Steps
1. The user accesses the React frontend and submits login or issue data.
2. The frontend sends API requests to the Node.js and Express backend.
3. The backend validates the request, checks authorization, and applies business rules.
4. MongoDB stores users, issues, polls, and votes.
5. Duplicate issue detection checks whether a similar issue was already reported in the same location.
6. Admin verifies valid issues.
7. Every Saturday, the poll automation module creates a weekly poll for verified issues.
8. Students vote for the most critical issue.
9. The system counts votes and marks the highest-voted issue as the weekly priority.
10. Authorities update the issue status from Pending to Ongoing to Completed.

### Output
- Student dashboard showing submitted and verified issues
- Admin dashboard showing issue verification and status control
- Voting interface for weekly priority selection
- Authority dashboard showing top-priority and ongoing issues
- Final issue resolution status and updated reports

### Short Architecture Flow
Student/Admin/Authority -> React Frontend -> API Layer -> Express Backend -> MongoDB Database -> Dashboards and Reports

---

## Slide: Architecture Flow Diagram Content

### Title
Input-Process-Output Flow

### Content
Input:
Student issue details, images, login credentials, admin verification actions, voting data

Processing:
Frontend form validation -> API request handling -> authentication -> duplicate detection -> issue storage -> verification -> weekly poll generation -> vote counting -> status update

Output:
Dashboards, issue lists, poll result, top-priority issue, completed issue report

### Presenter Note
This architecture ensures that the system not only collects complaints but also prioritizes them through a transparent voting workflow and tracks them until resolution.

---

## Slide: Implementation Details

### Title
Implementation Details of the System

### Content
The project is implemented using React and TypeScript for the frontend, Node.js and Express for the backend, and MongoDB for database storage. The frontend manages role-based views for students, admins, and authorities, while the backend handles authentication, issue management, poll automation, and voting logic.

### Technologies Used
- Frontend: React, TypeScript, Vite, Tailwind CSS, Motion
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Security: JWT, Helmet, Mongo Sanitize, CORS
- Automation: node-cron

---

## Slide: Frontend Implementation with Code

### Title
Frontend Implementation

### Explanation
The React application controls user login, dashboard rendering, issue reporting, voting, and status tracking. Based on the user role, the app dynamically displays the student, admin, or authority interface.

### Code Snippet
```tsx
const handleReportIssue = async (issueData) => {
  if (!currentUser) return 'You must be signed in';
  try {
    const issue = await createIssue(issueData);
    setIssues((prev) => [issue, ...prev]);
    setShowReportForm(false);
    return null;
  } catch (error) {
    return error instanceof Error ? error.message : 'Unable to submit issue';
  }
};
```

### Description of Code
- Accepts issue data from the report form
- Sends the data to the backend API
- Adds the newly created issue to the dashboard
- Closes the form after successful submission

### Screenshot to Insert
- Screenshot of the "Report an Issue" form
- Screenshot of the student dashboard after submitting an issue

---

## Slide: API Integration with Code

### Title
Frontend to Backend API Communication

### Explanation
The frontend communicates with the backend through reusable API methods. JWT tokens are stored in local storage and attached to protected requests.

### Code Snippet
```ts
async function request<T>(path: string, options: RequestInit = {}, requiresAuth = true): Promise<T> {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');

  if (requiresAuth) {
    const token = getToken();
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload?.message || payload?.errors?.[0] || 'Request failed';
    throw new Error(message);
  }

  return payload as T;
}
```

### Description of Code
- Builds a common API request function
- Attaches JWT token for authorization
- Sends requests to the backend
- Handles success and error responses centrally

### Screenshot to Insert
- Screenshot of login page
- Screenshot of dashboard data loaded after login

---

## Slide: Backend Implementation with Code

### Title
Backend Issue Processing

### Explanation
The backend processes issue creation, validates duplicate complaints, stores images, and saves the record in MongoDB.

### Code Snippet
```js
exports.createIssue = async (req, res, next) => {
  try {
    const { title, description, category, location } = req.body;
    const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

    const duplicate = await checkDuplicateIssue(category, parsedLocation);

    if (duplicate) {
      return res.status(400).json({
        success: false,
        message: 'A similar issue has been reported in this location within the last 24 hours'
      });
    }

    const issue = await Issue.create({
      title,
      description,
      category,
      location: parsedLocation,
      reportedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Issue reported successfully',
      data: issue
    });
  } catch (error) {
    next(error);
  }
};
```

### Description of Code
- Receives issue data from the client
- Parses and validates the location
- Detects duplicate issue reports
- Stores the issue in MongoDB
- Sends the created issue back to the frontend

### Screenshot to Insert
- Screenshot of successful issue creation output in the UI
- Screenshot of the issue appearing in admin dashboard

---

## Slide: Poll Automation with Code

### Title
Weekly Poll Automation

### Explanation
A cron job automatically starts a weekly poll every Saturday. Verified pending issues from the previous week are selected for voting.

### Code Snippet
```js
cron.schedule(`0 ${pollStartHour} * * ${pollDay}`, async () => {
  console.log('Starting weekly poll automation...');
  try {
    await startWeeklyPoll();
    console.log('Weekly poll started successfully');
  } catch (error) {
    console.error('Error starting weekly poll:', error.message);
  }
}, {
  timezone: "America/New_York"
});
```

### Description of Code
- Schedules the poll automatically
- Runs every Saturday
- Calls the weekly poll generator
- Starts the voting process without manual intervention

### Screenshot to Insert
- Screenshot of weekly voting page
- Screenshot showing the top-voted issue or live voting state

---

## Slide: Admin and Authority Implementation

### Title
Role-Based Issue Management

### Content
- Admin verifies newly reported issues before they are included in the voting process.
- Admin dashboard provides issue filtering, verification, and status update actions.
- Authority dashboard displays priority issues, ongoing work, and completed issues.
- Role-based access ensures that each user sees only the actions relevant to their responsibilities.

### Screenshot to Insert
- Screenshot of admin dashboard with Verify Issue button
- Screenshot of authority dashboard with top-priority issue

---

## Slide: Output Screenshots to Add

### Recommended Screenshot Order
1. Home or login page
2. Student dashboard
3. Report issue form
4. Submitted issue visible in dashboard
5. Admin dashboard for verification
6. Weekly voting page
7. Authority dashboard
8. Completed issue status screen

### Caption Examples
- Student login interface
- Student issue submission form
- Student dashboard displaying reported issues
- Admin dashboard for issue verification
- Weekly priority voting module
- Authority dashboard for issue resolution

---

## Slide: Conclusion

### Title
Conclusion

### Content
The Campus Issue Reporting System provides a structured digital platform for reporting, verifying, prioritizing, and resolving campus issues. By combining issue tracking with automated weekly voting, the system improves transparency, encourages student participation, and helps authorities focus on the most critical problems first.

---

## Real Project References

- Frontend app flow: `src/app/App.tsx`
- API integration: `src/app/lib/api.ts`
- Report issue form: `src/app/components/report-issue-form.tsx`
- Student dashboard: `src/app/components/student-dashboard.tsx`
- Voting module: `src/app/components/voting-system.tsx`
- Backend server setup: `backend/server.js`
- Issue creation logic: `backend/controllers/issueController.js`
- Poll automation: `backend/utils/pollAutomation.js`

## Verification

- Frontend production build completed successfully using `npm run build`

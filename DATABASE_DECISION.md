# Database Recommendation for Final Deployment

## Short answer

Keep MongoDB and use MongoDB Atlas for deployment.

This project is a MERN stack app and the backend is already written around Mongoose models, MongoDB filters, `populate`, and aggregation. Switching to SQLite would require rewriting the data layer for users, issues, polls, votes, seed scripts, duplicate detection, and poll automation.

## Why the project fails on another laptop

MongoDB Compass is only a desktop GUI for viewing and managing MongoDB. It is not the actual shared database.

If the backend uses a local URI such as:

```env
MONGO_URI=mongodb://127.0.0.1:27017/letsfixcampus
```

then every laptop must have MongoDB server installed and running locally. A cloned laptop without MongoDB running will fail to connect.

## Recommended database

Use MongoDB Atlas because:

- It works with the current backend code without a migration.
- It is suitable for Render or other backend hosting.
- It lets every laptop and deployed backend connect to the same cloud database.
- It is easier to explain in final documentation because the project remains a true MERN app.

## Why not SQLite for this deployment

SQLite is good for small local demos, but it is not the best fit here because:

- The backend currently uses Mongoose, so SQLite needs a larger rewrite.
- SQLite files on many cloud hosts are not safely persistent unless a persistent disk is configured.
- Concurrent users and image/report workflows are better served by a cloud database.

## Deployment setup

Use this environment variable in Render for the backend:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/letsfixcampus
```

Use this in a local `backend/.env` file when running on another laptop:

```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/letsfixcampus
JWT_SECRET=your_strong_secret
JWT_EXPIRE=7d
UPLOAD_METHOD=local
FRONTEND_URL=http://localhost:5173
```

After that, run:

```bash
cd backend
npm install
npm start
```

The backend should start without needing MongoDB Compass or a local MongoDB server.

## Documentation wording

You can write this in your final documentation:

> The project uses MongoDB Atlas as the cloud database. Earlier local testing used MongoDB Compass with a local MongoDB connection, which caused clone-and-run issues on other laptops because each machine needed a local MongoDB server. For deployment, the database was moved to MongoDB Atlas so the backend can connect through a secure `MONGO_URI` environment variable from any machine or hosting service.

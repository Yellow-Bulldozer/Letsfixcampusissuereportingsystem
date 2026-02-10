# Deployment Guide

Complete guide to deploy the Campus Issue Reporting Backend to production.

## 📋 Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Environment variables configured
- [ ] MongoDB Atlas database created
- [ ] Cloudinary account set up (recommended for production)
- [ ] Security settings reviewed
- [ ] CORS settings configured for frontend domain
- [ ] Admin and authority users created

## 🚀 Deployment Platforms

### Option 1: Render (Recommended)

#### Step 1: Create MongoDB Atlas Database

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Create database user with password
4. Whitelist all IPs (0.0.0.0/0) or specific Render IPs
5. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/campus-issues`

#### Step 2: Create Cloudinary Account

1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Get credentials from dashboard:
   - Cloud name
   - API Key
   - API Secret

#### Step 3: Deploy to Render

1. Push code to GitHub repository
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: campus-issue-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for production)

#### Step 4: Add Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/campus-issues
JWT_SECRET=your_very_long_and_secure_random_string_change_this
JWT_EXPIRE=7d
COLLEGE_EMAIL_DOMAIN=@yourcollege.edu
UPLOAD_METHOD=cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=https://your-frontend-domain.com
POLL_DAY=6
POLL_START_HOUR=0
POLL_DURATION_HOURS=24
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Step 5: Deploy and Test

1. Click "Create Web Service"
2. Wait for deployment (2-3 minutes)
3. Test health endpoint: `https://your-app.onrender.com/api/health`
4. Create admin users using seed script (see below)

---

### Option 2: Railway

#### Steps:

1. Go to [Railway](https://railway.app/)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository
5. Add environment variables (same as Render)
6. Railway will automatically detect Node.js and deploy

**Benefits:**
- Automatic HTTPS
- Easy MongoDB integration
- Simple deployment
- Good free tier

---

### Option 3: AWS EC2

#### Step 1: Launch EC2 Instance

1. Go to AWS Console → EC2
2. Launch Instance:
   - Ubuntu Server 22.04 LTS
   - t2.micro (free tier)
   - Configure security group (ports 22, 80, 443)
3. Download key pair

#### Step 2: Connect and Setup

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MongoDB (or use Atlas)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# Install PM2
sudo npm install -g pm2
```

#### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/your-repo.git
cd your-repo/backend

# Install dependencies
npm install

# Create .env file
nano .env
# Add all environment variables

# Start with PM2
pm2 start server.js --name campus-backend
pm2 save
pm2 startup
```

#### Step 4: Setup Nginx (Optional)

```bash
sudo apt install nginx

# Create Nginx config
sudo nano /etc/nginx/sites-available/campus-backend

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/campus-backend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### Option 4: DigitalOcean App Platform

1. Go to [DigitalOcean](https://www.digitalocean.com/)
2. Create App → GitHub
3. Select repository
4. Configure:
   - **Type**: Web Service
   - **HTTP Port**: 5000
   - **Build Command**: `npm install`
   - **Run Command**: `npm start`
5. Add environment variables
6. Deploy

---

## 🔐 Post-Deployment Setup

### 1. Create Admin Users

SSH into your server or use Render/Railway console:

```bash
node scripts/seedAdminUser.js
```

This creates:
- Admin user: `admin@yourcollege.edu` / `admin123`
- Authority user: `authority@yourcollege.edu` / `authority123`

**⚠️ Change these passwords immediately!**

### 2. Test API Endpoints

```bash
# Health check
curl https://your-api-domain.com/api/health

# Login as admin
curl -X POST https://your-api-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@yourcollege.edu","password":"admin123"}'
```

### 3. Configure CORS

Update `.env`:
```
FRONTEND_URL=https://your-actual-frontend-domain.com
```

Or in `server.js`, update CORS config for multiple domains:
```javascript
const allowedOrigins = [
  'https://your-frontend.com',
  'https://www.your-frontend.com',
  'http://localhost:3000' // for development
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

### 4. Setup SSL/HTTPS

**Render/Railway/DigitalOcean**: Automatic HTTPS ✅

**AWS/VPS**: Use Let's Encrypt with Certbot

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

---

## 🔍 Monitoring & Logging

### PM2 Monitoring (VPS/EC2)

```bash
# View logs
pm2 logs campus-backend

# Monitor
pm2 monit

# Restart
pm2 restart campus-backend

# View error logs
pm2 logs campus-backend --err
```

### Render Monitoring

- Go to Dashboard → Logs
- Enable "Persistent Logs"
- Set up alerts

---

## 📊 Database Management

### MongoDB Atlas

1. **Backups**: Enable automated backups
2. **Monitoring**: Check performance metrics
3. **Indexes**: Ensure indexes are created (automatic via models)
4. **Connection Limits**: Monitor connection pool

### Database Indexes Verification

```javascript
// Connect to MongoDB and run:
db.issues.getIndexes()
db.users.getIndexes()
db.polls.getIndexes()
db.votes.getIndexes()
```

---

## 🔧 Environment-Specific Configurations

### Development
```env
NODE_ENV=development
UPLOAD_METHOD=local
MONGO_URI=mongodb://localhost:27017/campus-issues
```

### Staging
```env
NODE_ENV=staging
UPLOAD_METHOD=cloudinary
MONGO_URI=mongodb+srv://...staging-cluster...
```

### Production
```env
NODE_ENV=production
UPLOAD_METHOD=cloudinary
MONGO_URI=mongodb+srv://...production-cluster...
```

---

## 🚨 Troubleshooting

### Issue: MongoDB Connection Failed

**Solution:**
1. Check connection string format
2. Verify database user credentials
3. Whitelist IP addresses in Atlas
4. Check network access rules

### Issue: File Upload Failing

**Solution:**
1. Verify Cloudinary credentials
2. Check file size limits
3. Ensure proper Content-Type headers
4. Check multer configuration

### Issue: CORS Errors

**Solution:**
1. Update `FRONTEND_URL` in .env
2. Check CORS middleware configuration
3. Verify request headers
4. Test with Postman first

### Issue: Poll Automation Not Working

**Solution:**
1. Check cron job configuration
2. Verify timezone settings
3. Check server time: `date`
4. Review cron logs: `pm2 logs`

### Issue: High Memory Usage

**Solution:**
1. Check for memory leaks
2. Limit query results with pagination
3. Use lean() for Mongoose queries
4. Enable MongoDB connection pooling

---

## 📈 Performance Optimization

### 1. Database Optimization

```javascript
// Use lean() for read-only operations
const issues = await Issue.find().lean();

// Select only needed fields
const issues = await Issue.find().select('title status category');

// Use pagination
const issues = await Issue.find()
  .skip((page - 1) * limit)
  .limit(limit);
```

### 2. Caching Strategy

Consider implementing Redis for:
- Session management
- Poll results caching
- Dashboard statistics

### 3. Image Optimization

Cloudinary automatic optimizations:
- Format conversion (WebP)
- Quality optimization
- Lazy loading
- Responsive images

### 4. Rate Limiting

Adjust based on traffic:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100 // requests per window
});
```

---

## 🔒 Security Checklist

- [ ] Strong JWT secret (minimum 32 characters)
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all routes
- [ ] MongoDB injection protection
- [ ] File upload restrictions
- [ ] Admin passwords changed
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] Error messages don't leak sensitive info
- [ ] Helmet security headers enabled
- [ ] Authentication tokens expire appropriately

---

## 📞 Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review error logs
- Check database performance
- Monitor disk space (if VPS)

**Monthly:**
- Update dependencies: `npm audit fix`
- Review and rotate API keys
- Database backup verification
- Performance analysis

**Quarterly:**
- Security audit
- Dependency updates: `npm outdated`
- Load testing
- Cost optimization review

---

## 🎯 Scaling Considerations

### When to Scale:

1. **Vertical Scaling** (Upgrade instance):
   - High CPU usage (>80%)
   - Memory constraints
   - Slow response times

2. **Horizontal Scaling** (Multiple instances):
   - 1000+ concurrent users
   - Geographic distribution needed
   - High availability requirements

3. **Database Scaling**:
   - Use MongoDB Atlas auto-scaling
   - Consider read replicas
   - Implement caching layer

### Load Balancing

For multiple instances:
- Use Nginx or AWS ELB
- Session management with Redis
- Sticky sessions for uploads

---

## 📝 Deployment Checklist

Before going live:

- [ ] All tests passing
- [ ] Environment variables set
- [ ] Database configured and accessible
- [ ] Admin users created
- [ ] CORS configured for frontend
- [ ] SSL/HTTPS enabled
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Rate limits appropriate
- [ ] Security headers enabled
- [ ] File upload working
- [ ] Poll automation tested
- [ ] API documentation accessible
- [ ] Frontend integration tested
- [ ] Performance tested
- [ ] Security audit completed

---

## 🌟 Production Best Practices

1. **Use environment variables** for all configurations
2. **Enable logging** with appropriate levels
3. **Implement health checks** for monitoring
4. **Use connection pooling** for database
5. **Enable compression** for responses
6. **Set appropriate timeouts**
7. **Implement graceful shutdown**
8. **Use PM2 or similar** for process management
9. **Regular backups** of database
10. **Monitor application metrics**

---

## 📚 Additional Resources

- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/production-best-practices/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Production Notes](https://docs.mongodb.com/manual/administration/production-notes/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

**Deployment Complete! 🎉**

Your backend is now ready to serve the campus community. Monitor logs regularly and respond to issues promptly.

# BlinkURL 🔗

BlinkURL is a production-ready, full-stack URL Shortener and Analytics Platform that empowers users to create, optimize, and track shortened URLs with enterprise-grade precision. Featuring a modern, high-contrast dark-mode interface, BlinkURL provides rich telemetry tracking, batch file handling, configurable link expiration dates, and secure shared metrics visibility.

---

 Live Links & Documentation

Frontend Deployment Link:https://url-shortener-blinkurl-7d2t.vercel.app
Backend Deployment Link :https://url-shortener-blinkurl.onrender.com
Video Presentation: https://www.loom.com/share/e6c8962a6f5c4707868beda1aa00f74a

---

📂 Folder Structure

```text
BlinkURL/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── url.controller.js
│   │   ├── analytics.controller.js
│   │   └── redirect.controller.js
│   ├── middleware/
│   │   └── auth.middleware.js
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Url.model.js
│   │   └── Visit.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── url.routes.js
│   │   ├── analytics.routes.js
│   │   └── redirect.routes.js
│   ├── utils/
│   │   └── helpers.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── BarChart.jsx
    │   │   ├── EditUrlModal.jsx
    │   │   └── QRCode.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── ToastContext.jsx
    │   ├── pages/
    │   │   ├── LoginPage.jsx
    │   │   ├── SignupPage.jsx
    │   │   ├── DashboardPage.jsx
    │   │   ├── CreateUrlPage.jsx
    │   │   ├── AnalyticsPage.jsx
    │   │   └── NotFoundPage.jsx
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   └── api.js
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    ├── package.json
    ├── .env.example
    └── vite.config.js     
---

## Database Schema Relationships

```
User (1) ──< Url (many)   : userId on Url references User._id
Url  (1) ──< Visit (many) : urlId on Visit references Url._id
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### 1. Clone and install

```bash
# Backend
cd backend
npm install
cp .env
# Fill in MONGODB_URI and JWT_SECRET in .env

# Frontend
cd ../frontend
npm install
cp .env
# Set VITE_API_URL=http://localhost:5000
```

2. Start backend

```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

3. Start frontend

```bash
cd frontend
npm run dev
# Runs on http://localhost:3000
```

---

## API Reference

### Auth

| Method | Endpoint              | Body                        | Description     |
|--------|-----------------------|-----------------------------|-----------------|
| POST   | /api/auth/register    | name, email, password       | Register user   |
| POST   | /api/auth/login       | email, password             | Login user      |

### URLs (JWT required)

| Method | Endpoint         | Body / Params          | Description         |
|--------|------------------|------------------------|---------------------|
| POST   | /api/url/create  | originalUrl, customAlias?, expiryDate? | Create short URL |
| GET    | /api/url/all     | —                      | Get all user's URLs |
| PUT    | /api/url/:id     | originalUrl            | Update destination  |
| DELETE | /api/url/:id     | —                      | Delete URL          |

### Analytics (JWT required)

| Method | Endpoint              | Description               |
|--------|-----------------------|---------------------------|
| GET    | /api/analytics/:id    | Full analytics for a URL  |
| GET    | /api/analytics/:id/public | Public read-only stats |

### Redirect

| Method | Endpoint         | Description                 |
|--------|------------------|-----------------------------|
| GET    | /:shortCode      | Redirect to original URL    |

---

## Deployment

### MongoDB Atlas (Database)

1. Go to https://cloud.mongodb.com and create a free cluster
2. Create a database user with read/write access
3. Whitelist IP `0.0.0.0/0` (allow all) for cloud deployments
4. Get your connection string: `mongodb+srv://user:pass@cluster.mongodb.net/urlshortener`

---

### Backend — Deploy to Render

1. Push your `backend/` folder to a GitHub repository
2. Go to https://render.com → New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Environment**: Node

5. Add environment variables:
   ```
   MONGODB_URI=<your Atlas connection string>
   JWT_SECRET=<long random string>
   PORT=5000
   BASE_URL=https://your-backend.onrender.com
   FRONTEND_URL=https://your-frontend.vercel.app
   ```

6. Click "Create Web Service" — your API will be live in ~2 minutes

---

### Frontend — Deploy to Vercel

1. Push your `frontend/` folder to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Set root directory to `frontend/` if needed
4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend.onrender.com
   ```
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click Deploy

---

## Features Implemented

- [x] JWT Authentication (register, login, protected routes)
- [x] Password hashing with bcryptjs
- [x] URL shortening with unique 6-char codes
- [x] Collision-safe short code generation
- [x] Custom aliases (e.g. /my-project)
- [x] Link expiry dates
- [x] Click tracking and analytics
- [x] Server-side redirects with visit recording
- [x] Daily click trend chart (pure React/CSS)
- [x] QR code generation
- [x] Edit destination URL
- [x] Delete URL + analytics
- [x] Copy to clipboard
- [x] Toast notifications (no library)
- [x] Responsive design
- [x] MVC architecture
- [x] Public stats endpoint

---

## Testing Checklist

- [ ] Register a new account
- [ ] Login with wrong password (should show error)
- [ ] Create a short URL
- [ ] Create a short URL with a custom alias
- [ ] Create a short URL with an expiry date (set to 1 minute from now)
- [ ] Visit the short URL in a browser — verify redirect works
- [ ] Visit the expired link — verify "Link Expired" response
- [ ] Check dashboard: click count should increment
- [ ] Open Analytics page — verify recent visit appears
- [ ] Check daily trend chart updates
- [ ] Copy short URL to clipboard
- [ ] Edit the destination URL
- [ ] Delete a URL
- [ ] Try accessing another user's analytics (should get 404)
- [ ] Log out and verify protected routes redirect to /login


Hackathon Submission Details
 Author Profile: Kavin ([GitHub Profile Link])

 Context: This production system was developed as part of an official hackathon challenge powered by Katomaran Technologies (https://katomaran.com).


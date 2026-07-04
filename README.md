# UrbanShield AI — Smart City Emergency Response Platform

UrbanShield AI is an AI-powered Smart City Emergency Response Platform that helps city authorities monitor incidents, analyze emergencies using AI, visualize city-wide data, and coordinate emergency responses in real time.

---

## Tech Stack

### Frontend
- React 18 (Vite) — Component-based UI with lazy loading
- Tailwind CSS — Utility-first styling with dark glassmorphism theme
- Framer Motion — Smooth animations and page transitions
- React Leaflet — Interactive OpenStreetMap integration
- Recharts — Data visualization and analytics charts
- React Router DOM v6 — Client-side routing with lazy-loaded pages
- Axios — HTTP client with JWT interceptor
- Socket.IO Client — Real-time bidirectional communication
- Lucide React — Consistent icon library

### Backend
- Node.js / Express.js — Server runtime and REST API framework
- MongoDB / Mongoose — NoSQL database with ODM
- JWT (jsonwebtoken) — Token-based authentication
- Google Generative AI SDK — Gemini Flash AI for predictions and summaries
- Socket.IO — WebSocket real-time event-driven communication
- OpenWeather API — Weather and air quality data
- bcryptjs — Password hashing
- Helmet — HTTP security headers
- express-rate-limit — API rate limiting (500 req/15min)

---

## Key Features

- **Real-Time Dashboard** — Live stats, weather, AI predictions, Recharts analytics
- **Incident Management** — Full CRUD with filtering, pagination, and search
- **Interactive Maps** — Leaflet + OpenStreetMap with auto-location and click-to-report
- **AI Integration** — Google Gemini Flash for emergency predictions and incident summaries
- **Weather & Air Quality** — Real-time weather data with air quality index
- **Real-Time Updates** — Socket.IO for live incident and alert notifications
- **Alerts System** — Severity-based emergency notifications
- **User Management** — Admin panel with JWT + Google OAuth authentication
- **Analytics** — Trend charts, category and severity distribution, status timelines

---

## Roles

| Role    | Permissions |
|---------|-------------|
| Admin   | Full access: create alerts, manage incidents, manage users, view analytics |
| Citizen | Report incidents, view map, track own incidents, receive alerts |

---

## Live Demo & Default Users

| Role    | Email                  | Password   |
|---------|------------------------|------------|
| Admin   | admin@urbanshield.ai   | Admin@123  |

New registrations are automatically assigned the **Citizen** role.

---

## Installation

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Google Gemini API key
- OpenWeather API key
- Google OAuth 2.0 credentials (optional)

### Backend Setup

```bash
cd backend
npm install
# Create .env file (see below)
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env file (see below)
npm run dev
```

---

## Environment Variables

### Backend (.env)

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/urbanshield
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GEMINI_API_KEY=your_gemini_api_key
OPENWEATHER_API_KEY=your_openweather_api_key
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id
```

---

## API Endpoints

### Authentication
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| POST   | /api/auth/register    | Register new user  |
| POST   | /api/auth/login       | Login              |
| POST   | /api/auth/google      | Google OAuth       |
| GET    | /api/auth/me          | Get current user   |

### Incidents
| Method | Endpoint                       | Description            |
|--------|--------------------------------|------------------------|
| GET    | /api/incidents                 | List incidents (filters)|
| GET    | /api/incidents/stats           | Incident statistics    |
| GET    | /api/incidents/:id             | Get incident detail    |
| POST   | /api/incidents                 | Create incident (citizen) |
| PUT    | /api/incidents/:id             | Update incident (admin) |
| DELETE | /api/incidents/:id             | Delete incident (admin) |
| PATCH  | /api/incidents/:id/resolve     | Resolve incident (admin) |

### Alerts
| Method | Endpoint              | Description        |
|--------|-----------------------|--------------------|
| GET    | /api/alerts            | List alerts        |
Add comment
Commenting on line 144
Cancel
Comment
| GET    | /api/alerts/active     | Active alerts      |
| GET    | /api/alerts/:id        | Get alert detail   |
| POST   | /api/alerts            | Create alert (admin)|
| PUT    | /api/alerts/:id        | Update alert (admin)|
| DELETE | /api/alerts/:id        | Delete alert (admin)|

### Dashboard
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/dashboard/stats     | Admin dashboard stats    |
| GET    | /api/dashboard/citizen   | Citizen dashboard        |

### AI
| Method | Endpoint              | Description                |
|--------|-----------------------|----------------------------|
| GET    | /api/ai/prediction    | AI emergency prediction    |
| POST   | /api/ai/summary       | AI incident summary        |

### Weather & Geocoding
| Method | Endpoint                    | Description            |
|--------|-----------------------------|------------------------|
| GET    | /api/weather?lat=&lon=      | Weather by coordinates |
| GET    | /api/weather/city?city=     | Weather by city        |
| GET    | /api/geocode/search?q=      | Address search         |
| GET    | /api/geocode/reverse?lat=&lon= | Reverse geocode     |

### Users
| Method | Endpoint                 | Description              |
|--------|--------------------------|--------------------------|
| GET    | /api/users               | List users (admin)       |
| PUT    | /api/users/profile       | Update profile           |
| PUT    | /api/users/:id           | Update user (admin)      |
| DELETE | /api/users/:id           | Delete user (admin)      |

---

## Project Structure

```
├── backend/
│   ├── config/         # Database config, env setup
│   ├── controllers/    # Route handlers (9 controllers)
│   ├── middleware/      # Auth, error handler, validation
│   ├── models/         # User, Incident, Alert schemas
│   ├── routes/         # Express route definitions (8 route files)
│   ├── services/       # Seed script, external service helpers
│   ├── socket/         # Socket.IO event handlers
│   ├── utils/          # AppError, helpers
│   ├── validators/     # Express-validator rules
│   └── server.js       # Entry point
├── frontend/
│   └── src/
│       ├── components/ # Layout, UI, Charts, Maps components
│       ├── context/    # AuthContext, SocketContext
│       ├── pages/      # 11 lazy-loaded page modules
│       ├── services/   # Axios API client
│       └── utils/      # Helpers, cn utility
└── README.md
```

---

## Challenges & Resolutions

| Challenge | Resolution |
|-----------|------------|
| Officer role complexity | Removed officer role entirely — simplified to Admin/Citizen |
| Gemini API quota limits (20 req/day) | Switched to gemini-flash-latest with fallback chain across 3 models |
| Dashboard slow (10+ queries) | Combined into single $facet aggregation + .select() optimization |
| 2dsphere index on alerts | Removed index, added pre-save guard to strip empty location |
| Socket.IO listener leaks | Proper useEffect cleanup with socket.off() |
| CORS on dual frontend ports | Array of origins: [5173, 5174] |

---

## Deployment

### Backend (Render)
1. Push to GitHub
2. Create Web Service → set root to `backend`
3. Build: `npm install`, Start: `npm start`
4. Add environment variables

### Frontend (Vercel)
1. Import project → set root to `frontend`
2. Framework preset: Vite
3. Add environment variables

### Database (MongoDB Atlas)
1. Create cluster → database user → whitelist IP → get connection string

---
## License

MIT


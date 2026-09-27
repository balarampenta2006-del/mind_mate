# Smart Mental Health Care Companion (Mind Mate) · SMHC

A full-stack mental health care platform with patient dashboards, a therapist consultation portal, an admin console, mood tracking & analytics, an emotion-aware AI chat companion, emergency SOS broadcasts with shareable view links, guided meditations, and appointment booking.

**Version:** 1.0.0 · **License:** MIT

---

## ✨ Features

| Portal | Capabilities |
| :--- | :--- |
| **Patient (User)** | Mood logging & trends, AI emotional-support chat, therapist discovery & booking, guided meditation library, personalised recommendations, progress reports, emergency contacts, SOS alerts, notifications, profile |
| **Therapist** | Dashboard with today's schedule, assigned patients & patient reports, direct patient messaging, availability slot management, professional profile |
| **Admin** | Platform stats, user & therapist management (activate/deactivate/remove), therapist onboarding, SOS alert triage, platform analytics & reports, broadcast notifications |

---

## 🧰 Tech Stack

- **Backend:** Node.js, Express 4 (ESM), JSON Web Tokens, bcryptjs, Mongoose (MongoDB Atlas) with automatic **in-memory fallback** when no database is reachable
- **Frontend:** React 18, Vite 5, React Router 7 (HashRouter), Recharts, plain CSS design system
- **Testing:** dependency-free Node test runner hitting the live Express app (`backend/tests/api.test.js`)

---

## 📁 Project Structure

```
project/
├── backend/                                  # Express REST API (port 8080)
│   ├── server.js                             # Entry point
│   ├── .env.example                          # Environment template
│   ├── src/
│   │   ├── config/                           # Config + database connection
│   │   ├── controllers/                      # 14 feature controllers
│   │   ├── data/                             # In-memory store, seed data, Mongo seeder
│   │   ├── middleware/                       # JWT auth, role guards, error handler
│   │   ├── models/                           # Mongoose schemas
│   │   ├── routes/                           # Modular Express routers
│   │   └── utils/                            # Password hashing helpers
│   └── tests/api.test.js                     # 21-case API & security suite
│
├── frontend/                                 # React + Vite app
│   ├── .env.example                          # API base URL + mock toggle
│   └── src/
│       ├── app/router/                       # Route table (public/user/therapist/admin)
│       ├── components/ · layouts/ · pages/   # UI
│       ├── services/                         # API clients (mock or HTTP)
│       └── stores/                           # Auth & toast context
│
├── postman/
│   ├── collections/SMHC_API_Collection.postman_collection.json
│   └── globals/workspace.globals.yaml
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🚀 Quick Start

### 1. Backend API

```bash
cd backend
npm install
cp .env.example .env      # then edit values (see table below)
npm start                 # or: npm run dev (auto-restart)
```

- **API base URL:** `http://localhost:8080/api`
- **Health check:** `http://localhost:8080/api/health`

### 2. Frontend App

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

- **App URL:** `http://localhost:5173` (as printed by Vite)

> With no database configured the API runs fully on its seeded in-memory store, so the app works out of the box.

---

## ⚙️ Environment Variables

### `backend/.env`

| Variable | Required | Description |
| :--- | :--- | :--- |
| `PORT` | no | API port (default `8080`) |
| `NODE_ENV` | no | `development` / `production`. **Production refuses to boot without `JWT_SECRET`.** |
| `JWT_SECRET` | **yes in production** | Signing secret. If omitted in dev a random one is generated (sessions reset on restart). |
| `MONGODB_URI` | no | MongoDB connection string (e.g. Atlas). Omit to use the in-memory store. |
| `CORS_ORIGIN` | no | Comma-separated allowed origins (default: wide open for local dev). |

### `frontend/.env`

| Variable | Description |
| :--- | :--- |
| `VITE_API_BASE_URL` | API base URL (default `http://localhost:8080/api`) |
| `VITE_USE_MOCK` | `true` = run the UI against bundled offline mock data (no backend needed) |

---

## 🔑 Demo Login Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **User (Patient)** | `user@mindmate.com` | `demo1234` |
| **Therapist** | `therapist@mindmate.com` | `demo1234` |
| **Admin** | `admin@mindmate.com` | `demo1234` |

Passwords are bcrypt-hashed on seed; demo accounts are only created when the store is empty.

---

## 🔒 Security Model

- **Authentication:** stateless JWT (`Authorization: Bearer <token>`) on every protected route; expired/forged tokens → `401`, wrong role → `403`.
- **Authorisation:** role guards (`user` / `therapist` / `admin`) per route group. Registration can never self-assign a role.
- **Ownership scoping:** users can only read/write their own records; therapists only see their own patients, availability, bookings and profile; admins may act on any record (whitelisted fields only — no mass assignment).
- **Passwords:** bcrypt hashed (min 8 chars at registration); login answers are uniform (`Invalid email or password`) so accounts can't be enumerated; the old master-password/auto-create backdoors are removed.
- **Emergency view links:** `/api/emergency/view` requires the per-alert `viewToken`, so SOS details are only shared with people who hold the link.
- **Errors:** 5xx responses return a generic message (no stack traces or DB errors leaked).

---

## 🧪 Tests

```bash
cd backend
npm test
```

Runs 21 end-to-end cases against a randomly-port-bound server with `NODE_ENV=test` (never touches a real database): health, anonymous/role/token enforcement, registration role-escalation blocking, all three demo logins, password reset flows, and CRUD coverage for moods, bookings, chat, SOS, contacts, notifications, reports, recommendations, meditation, admin management and the therapist portal.

---

## 📮 Postman

Import `postman/collections/SMHC_API_Collection.postman_collection.json` into Postman:

1. Ensure the backend is running on `http://localhost:8080`.
2. Run **Auth → Login** — the test script saves the JWT to `{{authToken}}` and the user id to `{{userId}}`.
3. Every other request inherits Bearer auth from the collection root.

### API modules (70 requests)

1. **🔐 Auth** — register, login, logout, forgot/reset password
2. **👤 Users** — directory (role-scoped), own profile update
3. **🧑‍⚕️ Therapists** — list/filter, detail, availability, therapist self-profile update
4. **😊 Moods** — history, log, trend, latest
5. **📅 Bookings** — user bookings, therapist bookings, detail, create, cancel
6. **💬 Chat** — emotion-aware message, history, clear
7. **🚨 SOS Alerts** — trigger, list, status update (Active/Acknowledged/Resolved)
8. **📞 Emergency Contacts** — CRUD + public `viewToken` emergency view
9. **🔔 Notifications** — list, unread count, mark read, mark all read
10. **📊 Reports** — list, detail, generate, therapist patient view
11. **💡 Recommendations** — personalised list, daily motivation
12. **🧘 Meditation** — list, category filter, detail, complete
13. **🛡️ Admin** — stats, all mood logs, users, therapists, all bookings, broadcast notifications
14. **🩺 Therapist Portal** — assigned patients, patient messaging

---

## 🚢 Deployment Notes

1. **Backend** — set `NODE_ENV=production`, a strong `JWT_SECRET`, your real `CORS_ORIGIN`, and `MONGODB_URI` (Atlas). Start with `node server.js` behind a process manager (PM2/systemd).
2. **Frontend** — `npm run build` produces `frontend/dist/`, which can be served by any static host (Netlify, Vercel, Nginx, `serve`). HashRouter means no server-side rewrite rules are required. Point `VITE_API_BASE_URL` at your deployed API before building.
3. **Never commit `.env`** — it is git-ignored; only `.env.example` files are tracked.

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

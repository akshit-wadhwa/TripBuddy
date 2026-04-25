# TripBuddy

TripBuddy is a full-stack ride-sharing platform where users can:

- Sign up and sign in (including OTP email flow)
- Publish and search rides
- Book rides and complete payments with Razorpay
- Chat in real-time for ride coordination
- Receive real-time notifications
- Track rides on live maps

This repository contains:

- `frontend/`: React + Vite client application
- `backend/`: Node.js + Express API, Socket.IO, WebSocket services, and MongoDB models

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, Socket.IO Client
- Backend: Node.js, Express, Mongoose, Socket.IO, ws, JWT, Nodemailer, Razorpay
- Database: MongoDB

## Project Structure

```text
TripBuddy/
  backend/
  frontend/
```

## Prerequisites

Install these tools before running locally:

- Node.js (v18+ recommended)
- npm
- MongoDB (local or cloud URI)

## Environment Variables

Create the following files:

- `backend/.env`
- `frontend/.env`

### backend/.env

```env
PORT=5000
NODE_ENV=development

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# CORS origin for frontend
FRONTEND_URL=http://localhost:5173

# Email (OTP)
EMAIL=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
SKIP_EMAIL=true

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### frontend/.env

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
VITE_WS_URL=ws://localhost:5000

VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
```

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Run the Project (Development)

Use two terminals.

1. Start backend

```bash
cd backend
npm run dev
```

2. Start frontend

```bash
cd frontend
npm run dev
```

## Default Local URLs

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/health

## Useful Scripts

### Backend

- `npm run dev` - start backend with nodemon

### Frontend

- `npm run dev` - start Vite dev server
- `npm run build` - create production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

## API and Realtime Notes

- REST API base URL: `http://localhost:5000`
- Frontend talks to backend using `VITE_BACKEND_URL`
- Socket.IO runs on backend server
- Notification WebSocket endpoint uses `/ws/notifications?token=<jwt>`

## Common Troubleshooting

- CORS errors:
  - Ensure `FRONTEND_URL` in `backend/.env` matches your frontend URL exactly.
- MongoDB connection fails:
  - Verify `MONGO_URI` and check MongoDB service/network access.
- OTP email not sent:
  - Set `SKIP_EMAIL=true` for development, or configure `EMAIL` + `EMAIL_PASSWORD` correctly.
- Razorpay order creation fails:
  - Verify `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`.

## Deployment Checklist

Before pushing/deploying:

- Keep real `.env` files out of git
- Add production environment variables in hosting platform
- Update `FRONTEND_URL` and `VITE_BACKEND_URL` for production domains
- Confirm MongoDB, email, and Razorpay credentials are valid

## License

This project is currently unlicensed. 

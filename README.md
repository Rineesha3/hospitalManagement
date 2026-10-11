# Hospital Management System

A full-stack web app for finding doctors and booking appointments, with separate dashboards for patients, doctors and admins.

## Project Overview

Patients can search for doctors, book appointments and leave reviews. Doctors manage their availability and appointment requests, and admins manage users, doctors and bookings. The backend is a REST API built with Node.js, Express and MongoDB, and the frontend is a React app built with Vite and Tailwind CSS.

## Key Features

- **Patients:** search doctors, book 30-minute clinic or video appointments, reschedule or cancel, and leave reviews
- **Doctors:** manage profile and weekly availability, and confirm or reject appointment requests
- **Admins:** approve or suspend doctors, manage patients and view all bookings
- In-app notifications for booking updates
- JWT authentication with role-based access control

## Technology Stack

- **Frontend:** React, Vite, React Router, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **Other:** Cloudinary (profile photos), Jitsi Meet (video consultations)

## Installation and Setup

### Prerequisites
- Node.js and npm
- MongoDB database
- Cloudinary account

### Backend

```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```
MONGO_URL=your_mongodb_connection_string
JWT_SECRET_key=your_jwt_secret
```

```bash
npm run seed     # optional: adds sample data (clears existing data)
npm start
```

The backend runs on `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```
VITE_CLOUD_NAME=your_cloudinary_cloud_name
VITE_UPLOAD_PRESET=your_cloudinary_upload_preset
```

```bash
npm run dev
```

The frontend runs on `http://localhost:5173`.
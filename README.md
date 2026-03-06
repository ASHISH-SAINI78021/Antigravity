# 🚀 ANTIGRAVITY

### Smart Job Application Operating System

Antigravity is a modern MERN stack application designed to help students and professionals track, optimize, and accelerate their job search.

## ✨ Features

- **Smart Dashboard**: Visual analytics with Recharts for application tracking.
- **Job Management**: Complete CRUD flow for tracking applications with statuses.
- **Resume Versioning**: Upload and manage different resumes via Cloudinary.
- **Automated Follow-ups**: Daily check-ins via Cron jobs and email notifications.
- **Security First**: JWT authentication, Joi validation, and protected routes.

## 🛠️ Tech Stack

- **Frontend**: React (Vite), Module CSS, Recharts, Axios, Lucide-React.
- **Backend**: Node.js, Express, MongoDB (Mongoose), Nodemailer, Node-Cron.
- **Infrastructure**: Cloudinary (Resume storage), JWT (Auth).

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**
   ```bash
   npm install      # Root dependencies
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Configure Environment Variables**
   Create a `.env` file in the `backend` folder with:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `CLOUDINARY_CONFIG`
   - `EMAIL_CONFIG` (for follow-ups)
4. **Run the application**
   From the root directory:
   ```bash
   npm run dev
   ```

## 🧱 Project Structure

- `backend/`: Node.js Express API.
- `frontend/`: React Vite application.
- `package.json`: Root manager for running both servers concurrently.

---
*Empower your career with Antigravity.*

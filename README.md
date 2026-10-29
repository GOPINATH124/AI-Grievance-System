# 🏛️ AI-Powered Citizen Grievance Redressal System

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75C2?logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

An intelligent, multilingual, multi-channel citizen grievance redressal platform engineered to modernize public governance. By integrating generative AI, speech processing, and automated escalation workflows, the system streamlines grievance filing, automated department dispatch, real-time tracking, and administrative resolution.

---

## 🌟 Key Highlights & Features

- **🤖 Automated AI Classification & Routing**: Evaluates grievance descriptions using Google Gemini AI to automatically infer category, priority/urgency (Critical, High, Medium, Low), sentiment, and assign responsible administrative departments.
- **🗣️ Multilingual Inclusivity (Bhashini AI)**: Accessible across regional Indian languages with built-in voice-to-text, translation, and localized conversational interfaces.
- **⚡ Express Grievance Filing**: Streamlined form for urgent citizen complaints with photo attachment, GPS geo-tagging, and instant tracking ticket generation.
- **🤝 Volunteer & Proxy Lodging**: Facilitates assisted grievance submissions on behalf of senior citizens, differently-abled, or non-digitally literate community members.
- **📞 Multi-Channel Ingestion (IVR & WhatsApp)**:
  - Interactive Voice Response (IVR) phone simulator for toll-free telephone grievances.
  - WhatsApp gateway integration for messaging complaints directly.
- **🗺️ Community Heatmap & Geo-Analytics**: Interactive spatial visualization of recurring municipal issues (roads, sanitation, water, electrical) to prioritize civic interventions.
- **📊 Unified Admin Analytics Portal**: Comprehensive dashboard featuring live SLA trackers, grievance status updates (Submitted → Under Review → Assigned → In Progress → Resolved), priority escalations, and workload distribution.
- **🔒 Secure Authentication**: Robust citizen identity management powered by Clerk and JWT token authorization for administrative workflows.
- **📜 DigiLocker Ready**: Architecture configured for verified government credential attachment.

---

## 🏗️ System Architecture

```
AI-Grievance-System/
├── backend/
│   ├── ai/                  # AI orchestration (Gemini prompt pipelines, Bhashini)
│   ├── config/              # Database connection & configurations
│   ├── controllers/         # Admin, auth, AI, IVR, and complaint business logic
│   ├── middleware/          # JWT auth, Clerk verification, file upload middleware
│   ├── models/              # Mongoose schemas (Complaint, User, Admin, etc.)
│   ├── routes/              # Express API route endpoints
│   ├── uploads/             # Grievance attachment storage
│   ├── server.js            # Express application bootstrap
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios clients & API request abstractions
│   │   ├── components/      # Reusable UI components & layouts
│   │   ├── pages/           # Pages (AdminDashboard, AIChat, ExpressGrievance, etc.)
│   │   ├── routes/          # Application routing (AppRoutes.jsx)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/              # Static assets
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example
├── .gitignore               # Root git ignore protecting secrets and dependencies
└── README.md                # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (v18.x or later recommended)
- [MongoDB](https://www.mongodb.com/) (running locally or a MongoDB Atlas URI)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/AI-Grievance-System.git
cd AI-Grievance-System
```

---

### 2. Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt: `copy .env.example .env`)*

4. Populate your `.env` file with your credentials:
   ```env
   PORT=5000
   MONGO_URL=mongodb://127.0.0.1:27017/AI-Grievance-DB
   JWT_SECRET=your_jwt_secret_key_here
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ADMIN_SECRET_KEY=your_admin_secret_key_here
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
   ```

5. (Optional) Seed initial data or verify database connection:
   ```bash
   node check_db.js
   node seed_now.js
   ```

6. Start the backend development server:
   ```bash
   npm run dev
   # Or production start:
   # npm start
   ```
   *The server will start on `http://localhost:5000`.*

---

### 3. Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *(On Windows Command Prompt: `copy .env.example .env`)*

4. Configure your Clerk publishable key:
   ```env
   VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key_here
   ```

5. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *The client app will be accessible at `http://localhost:5173`.*

---

## 📡 Key API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/complaints` | Lodge a new citizen grievance |
| `GET` | `/api/complaints` | Retrieve citizen grievances |
| `GET` | `/api/complaints/:id` | Retrieve grievance by ID / Tracking code |
| `POST` | `/api/ai/analyze` | AI category, sentiment & priority classification |
| `POST` | `/api/admin/login` | Administrative staff authentication |
| `GET` | `/api/admin/analytics`| Department performance metrics & SLA trends |
| `PATCH`| `/api/admin/complaints/:id/status` | Update grievance redressal status |
| `POST` | `/api/ivr/webhook` | Process incoming IVR telephony grievances |

---

## 🛡️ Security & Privacy

- All sensitive keys (API tokens, database credentials, authentication secrets) are maintained exclusively in local `.env` files and strictly excluded from version control via `.gitignore`.
- Password hashing using `bcrypt`.
- Protected admin routes guarded via JWT middleware verification.

---

## 👥 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.

# SUVIDHA 2026 – Unified Civic Self-Service Kiosk

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)

---

## 🏆 Hackathon Submission

This project is submitted under the C-DAC SUVIDHA 2026 Hackathon.

It is designed as a unified, touch-enabled civic self-service kiosk supporting Electricity, Gas, Water, and Municipal services with secure authentication, multilingual access, and real-time service workflows.

---

## 📖 About

**NextGen Seva** is a unified civic self-service kiosk platform designed to streamline citizen interaction with Electricity, Gas, Water, and Municipal services. 
Built on a modular service-oriented backend architecture with a touch-optimized React interface, secure administrative controls, and an AI-powered multilingual chatbot, the system delivers a scalable, secure, and accessible digital public service experience.

### Problem Statement
Citizens frequently encounter fragmented service channels, long queues, and complex paperwork when accessing essential municipal services such as bill payments, complaint registration, or new utility connections. Additionally, language barriers limit effective usage of digital platforms.

### Solution Overview
NextGen Seva consolidates fragmented civic services into a single, integrated, multilingual kiosk system. 
The platform enables secure bill payments, complaint tracking, new connection requests, and administrative oversight through structured, real-time workflows.
An AI-powered multilingual chatbot further enhances accessibility and guided interaction.

### Success Metrics
- Reduction in manual counter workload through structured self-service workflows.
- Increased citizen accessibility across rural and urban demographics via multilingual, touch-enabled kiosk deployment.
- Enhanced service transparency through real-time request tracking and status visibility.
- Continuous 24/7 digital service availability, reducing dependency on physical office hours.

---

## ✨ Key Features

- **Aadhaar Auth (OTP-based):** Secure login & citizen verification using SMS OTP (via Twilio/Gov API).
- **Bill Payment Integration:** Fast and secure utility payments (Razorpay integration).
- **Complaint Management:** Log, track, and update status of civil/municipal issues.
- **New Connections:** Streamlined portal to request new electricity, water, or gas connections with status tracking.
- **Multilingual UI:** Accessibility for diverse demographics with localized text.
- **Admin Dashboard:** Centralized kiosk & dashboard for civil servants to manage applications, resolve complaints, and track overall analytics.
- **AI Chatbot:** An intelligent NLP-based conversational agent to guide citizens through services.

### 🖥 Designed for touch-enabled kiosk deployment in:
- Municipal Offices
- Electricity Boards
- Public Service Centers
- Smart City Infrastructure Points

---

## 🏗️ Architecture

```text
+-------------------+       +----------------------------+       +---------------------------+
|                   |       |                            |       |                           |
|  Citizen Kiosk    | <---> |   Node.js / Express API    | <---> |   PostgreSQL (Database)   |
|  (Frontend UI)    |       |   (Service Layer)          |       |   via Supabase            |
|                   |       |   - JWT Authentication     |       |   - Citizens              |
+-------------------+       |   - RBAC                   |       |   - Complaints            |
                            |   - Session Management     |       |   - Payments              |
                            +------+------+--------------+       +---------------------------+
                                   |      |
                                   |      |
                                   v      v
                         +--------------------+      +--------------------+
                         |   Payment Gateway  |      |    AWS S3 Storage  |
                         |     (Razorpay)     |      |  (Object Storage)  |
                         |                    |      |  - Documents       |
                         +--------------------+      |  - Images          |
                                                     +--------------------+


+-------------------+       +---------------------------+
|                   |       |                           |
| Admin Dashboard   | <---> |   Node.js / Express API   |
|   (React UI)      |       |   (Same Service Layer)    |
|                   |       |                           |
+-------------------+       +---------------------------+


+-------------------+       +---------------------------+
|                   |       |                           |
| Chatbot Frontend  | <---> |   Chatbot Backend         |
|                   |       |   (Python / FastAPI)      |
+-------------------+       +---------------------------+

+-------------------+
| SMS / OTP Service |
| (Twilio / Gov API)|
+-------------------+
        ^
        |
        +---------------- Connected via Backend API
```

*(Note: The chatbot operates as a specialized service communicating alongside the main ecosystem.)*

### Architectural Highlights
- Modular, service-oriented backend architecture.
- Separation of transactional data (PostgreSQL) and object storage (AWS S3).
- Managed infrastructure layer via Supabase for scalability.
- Centralized API layer enforcing authentication and role-based access control.
- Designed for scalable deployment across Smart City infrastructure nodes.

---

## 💻 Tech Stack

| Category         | Technology / Tools |
|------------------|--------------------|
| **Frontend**     | React, Vite, Tailwind CSS, Framer Motion |
| **Backend**      | Node.js, Express.js, Prisma ORM |
| **Database**     | PostgreSQL |
| **Cloud Backend**| Supabase (PostgreSQL hosting & auth-ready infra) |
| **Object Storage** | AWS S3 (secure document & media storage) |
| **AI / Chatbot** | Python, FastAPI / Flask, NLP frameworks |
| **Payments**     | Razorpay |
| **SMS/Auth**     | Twilio (OTP Verification) |

---

## 🗄️ Data & Storage Architecture

- **PostgreSQL** serves as the primary relational database for citizens, complaints, payments, and service records.
- **Supabase** is used as a managed PostgreSQL infrastructure layer, enabling scalability, secure access policies, and rapid deployment.
- **AWS S3** handles secure storage of uploaded documents (ID proofs, connection forms, complaint images).
- Pre-signed URLs are used for controlled, time-bound access to uploaded files.
- Architecture remains cloud-agnostic and can be deployed on government-approved infrastructure if required.

---

## 🔐 Security Architecture

- JWT-based authentication for citizens and admins
- Role-based access control (RBAC)
- Encrypted communication between services (TLS-ready)
- Secure OTP verification flow
- Public kiosk auto-session termination
- DPDP Act & Government IT compliance considerations

---

## 📂 Project Structure

The monorepo is divided into 5 distinct services:

```text
SUVIDHA-Hackathon/
├── admin/               # React-based Admin Dashboard for officials
├── backend/             # Node.js + Express API serving core logic and DB interactions
├── chatbot_backend/     # Python-powered NLP engine and conversational AI API
├── chatbot_frontend/    # UI for the AI Chatbot interaction
├── frontend/            # Main React citizen portal
├── INSTALLATION.md      # Detailed installation guide
└── README.md            # Project documentation (this file)
```

---

## 🛠 Prerequisites

Make sure you have the following installed before getting started:
- **Node.js** (v18+)
- **Python** (v3.9+)
- **PostgreSQL** (running locally or via cloud URL)
- **Git**

---

## 🚀 Getting Started

Here is a quick overview of how to start each service. For profound details, refer to the [INSTALLATION.md](./INSTALLATION.md).

### 1. Database & Backend
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 2. Citizen Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Admin Dashboard
```bash
cd admin
npm install
npm run dev
```

### 4. Chatbot Backend
```bash
cd chatbot_backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py             # or uvicorn main:app --reload (if using FastAPI)
```

### 5. Chatbot Frontend
```bash
cd chatbot_frontend
npm install
npm run dev
```

---

## 🔌 API Endpoints (Core)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | `POST` | Sends OTP via Twilio to citizen phone |
| `/api/auth/verify-otp`| `POST` | Verifies OTP and generates session/token |
| `/api/bills/:id` | `GET` | Fetch citizen utility bills |
| `/api/payments/create`| `POST` | Initializes Razorpay order |
| `/api/complaints` | `POST` | Registers a new citizen complaint |
| `/api/connections`    | `POST` | Submits request for a new utility connection |

---

## 🗄️ Database Schema

Key tables within our PostgreSQL Database (managed by Prisma):
- **User / Citizen Account:** Stores citizen demographics, verified phone numbers, Aadhaar ref.
- **Payments / Bills:** Tracks transaction IDs, amounts, payment status (Pending, Success, Failed).
- **Complaints:** Logs issues with category, status (Open, In Progress, Resolved), and location coordinates.
- **Service Requests:** Stores new connection applications alongside uploaded document metadata.

---

## 🧪 Testing

To run the local unit tests (if configured):

**Backend (Node.js)**
```bash
cd backend
npm run test
```

**Frontend (React)**
```bash
cd frontend
npm run test
```

---

## 🔐 Environment Variables

You will need to create a `.env` file in the respective directories:

### Backend (`backend/.env`)
```env
PORT=5001
DATABASE_URL="postgresql://user:password@localhost:5432/suvidha"
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_SERVICE_SID=your_verify_service_sid
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
JWT_SECRET=your_super_secret_key
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

### Admin (`admin/.env`)
```env
VITE_API_URL=http://localhost:5001/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Chatbot Backend (`chatbot_backend/.env`)
```env
PORT=8000
OPENAI_API_KEY=your_openai_key # If applicable
```

---

## 📌 Project Status

This project was developed as part of the 
Smart Urban Virtual Interactive Digital Helpdesk Assistant (SUVIDHA) – 2026 Hackathon organized by C-DAC.

External contributions are not applicable as this is an official hackathon submission.

---

## 📄 Intellectual Property & License

This project was developed as part of the 
Smart Urban Virtual Interactive Digital Helpdesk Assistant (SUVIDHA) – 2026 Hackathon organized by C-DAC.

As per hackathon guidelines, all Intellectual Property (IP) arising from this submission 
shall be the sole property of C-DAC.

---

## 👥 Team

Developed by Team **Runtime Terrors**
1. **Powel Lawrence Lewis** (Team Lead) - [GitHub](https://github.com/Powel29)
2. Nayan Saraff - [GitHub](https://github.com/NayanSaraff)
3. Aayush Vivek Raj - [GitHub](https://github.com/aayush0984)
4. Ojas Thakurela - [GitHub](https://github.com/Ojas-Thakurela)

---

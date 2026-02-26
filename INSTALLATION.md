# Installation Guide

This project consists of several microservices and frontend applications. Follow the instructions below to set up each component.

---

## 🚀 Quick Start
If you just want to get everything running at once, you will need to open separate terminals for each component.

---

## 1. Main Backend (`/backend`)
*Language: Node.js
*Database: PostgreSQL (via Prisma)*

1. Navigate to the folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

3. Generate Prisma Client and push Schema:
   ```bash
   npx prisma generate
   ```
4. Run the server:
   ```bash
   npm run dev
   ```

---

## 2. Main Frontend (`/frontend`)
*Framework: React + Vite*

1. Navigate to the folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 3. Chatbot Backend (`/chatbot_backend`)
*Language: Python*

1. Navigate to the folder:
   ```bash
   cd chatbot_backend
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows:** `.\venv\Scripts\activate`
   - **Mac/Linux:** `source venv/bin/activate`
4. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Run the server:
   ```bash
   python main.py
   ```

---

## 4. Chatbot Frontend (`/chatbot_frontend`)
*Framework: React + Vite*

1. Navigate to the folder:
   ```bash
   cd chatbot_frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 5. Admin Dashboard (`/admin`)
*Framework: React + Vite*

1. Navigate to the folder:
   ```bash
   cd admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

---

## 🛠 Prerequisites
Ensure you have the following installed on your system:
- **Node.js** (v18 or higher)
- **NPM** (v9 or higher)
- **Python** (3.9 - 3.11 recommended)
- **PostgreSQL** (Running locally or hosted)

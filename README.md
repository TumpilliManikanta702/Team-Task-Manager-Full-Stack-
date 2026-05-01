Project Name: TaskFlow - Team Task Manager

Description:
TaskFlow is a full-stack, production-ready Team Task Manager web application built using the MERN stack (MongoDB, Express.js, React.js, Node.js) and styled with Tailwind CSS. It features a modern user interface, role-based access control, interactive dashboards, and Kanban-style task management.

Features:

* Secure authentication using JWT and password hashing
* Role-Based Access:
  Admin: Create projects, manage members, and control tasks
  Member: View assigned projects and update task statuses
* Project management with task tracking and statistics
* Kanban board for task workflow (To Do, In Progress, Done)
* Interactive dashboard with charts (Recharts)
* Responsive UI with Tailwind CSS and modern design

Tech Stack:
Frontend:

* React.js (Vite)
* Tailwind CSS
* React Router
* Axios
* Recharts
* Lucide Icons

Backend:

* Node.js
* Express.js
* MongoDB (Mongoose)
* JWT (Authentication)
* bcryptjs (Password hashing)

Deployment:

* Frontend: Vercel
* Backend: Render / Railway
* Database: MongoDB Atlas

Local Setup:

Prerequisites:

* Node.js (version 16 or above)
* MongoDB Atlas account or local MongoDB

Backend Setup:

1. Navigate to backend folder:
   cd backend
2. Install dependencies:
   npm install
3. Create .env file with:
   PORT=5000
   MONGODB_URI=mongodb+srv://manikanta:MMani12@cluster0.8nvxe8y.mongodb.net/?appName=Cluster0
   JWT_SECRET=supersecretjwtkey123
   NODE_ENV=development
4. Start backend server:
   npm run dev

Frontend Setup:

1. Navigate to frontend folder:
   cd frontend
2. Install dependencies:
   npm install
3. Start frontend:
   npm run dev
4. Open in browser:
   http://localhost:5173

Production Setup:

* Set environment variable in frontend:
  VITE_API_URL=[https://your-backend-url/api](https://team-task-manager-full-stack.onrender.com/)
* Ensure backend allows requests from frontend (CORS enabled)

Usage:

* First registered user becomes Admin automatically
* Admin can create and manage projects and tasks
* Members can update task status using Kanban board

Project Highlights:

* Clean and scalable architecture
* Secure authentication system
* Real-time UI updates
* Production-ready deployment structure

Author:
Manikanta Tumpilli

License:
ISC

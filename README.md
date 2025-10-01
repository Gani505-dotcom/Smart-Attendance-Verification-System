Smart Face Recognition Attendance System

📌 Overview

The Smart Face Recognition Attendance System is a web-based project that automates student attendance using face recognition. The system provides secure login/registration, real-time attendance marking via webcam or uploaded images, and attendance reports for administrators.

🚀 Tech Stack

Frontend: React.js (with routing, dashboards)

Backend: Python Flask (face recognition, APIs)

Database: MySQL (face_system)

Authentication: PHP + MySQL for login/registration

Libraries/Tools:

face_recognition (Python)

Flask

MySQL Connector

React Router

🎯 Features

👨‍🎓 Student

Register and log in securely

Upload/scan face for attendance marking

View personal profile & attendance history

Logout securely

👩‍💼 Admin

Login to admin dashboard

Manage students (Add, Edit, Delete, Reset Passwords)

View daily/overall attendance reports

Monitor face recognition logs

🗄️ Database Structure

Database: face_system

Table: students
Column	Type	Description
id	INT (PK)	Auto-increment ID
name	VARCHAR	Student name
email	VARCHAR	Student email
roll_number	VARCHAR	Unique roll no.
course	VARCHAR	Course enrolled
password	VARCHAR	Hashed password
Table: attendance
Column	Type	Description
id	INT (PK)	Auto-increment ID
student_id	INT (FK)	Linked to students.id
date	DATE	Attendance date
time	TIME	Marked time
status	VARCHAR	Present/Absent
face_image	BLOB/Path	Stored attendance image
⚙️ Installation & Setup

Clone the repo

git clone https://github.com/your-username/face-attendance-system.git
cd face-attendance-system


Setup Backend (Flask)

cd backend
pip install -r requirements.txt
python app.py


Setup Frontend (React)

cd frontend
npm install
npm start


Setup Database (MySQL)

Create database face_system

Import face_system.sql (provided in repo)

Run Project

Flask backend → http://localhost:5000

React frontend → http://localhost:3000

📌 Additional Features

Attendance notifications via email/SMS

Face recognition with live liveness detection

Export reports as Excel/PDF

👨‍💻 Author

Developed by Mandadi Ganesh (Computer Science Engineering, 2026)

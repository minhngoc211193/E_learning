E-Learning Management System
Overview

This project is a web-based E-Learning Management System designed to facilitate interaction and academic management between students, teachers, and educational staff.

The platform integrates learning resource management, scheduling, and communication tools into a unified system. It allows teachers to share educational content, enables students to access learning materials and schedules, and supports staff in organizing classes and academic activities.

Additionally, the system provides real-time communication and notifications, improving collaboration and responsiveness between users.

Key Features
Role-Based User System

The platform supports three main user roles:

Students

View learning schedules

Access learning materials and blog posts

Communicate with teachers via messaging

Book meetings with teachers

Teachers

Upload learning documents and teaching materials

Publish educational blog posts

Manage meeting requests from students

Interact with students through real-time messaging

Educational Staff (Administrators)

Manage academic schedules

Assign students to classes

Organize learning sessions

Monitor academic operations

Core Functionalities
Authentication & Security

JWT-based authentication

Google Email Authentication (OAuth)

Role-based access control

Academic Scheduling

Class scheduling and management

Student class assignment

Meeting booking between students and teachers

Schedule viewing system

Learning Resources

Teachers can upload study documents

Blog system for sharing educational content

Real-Time Communication

Real-time messaging between students and teachers

Implemented using WebSocket / Socket.io

Notification System

Real-time notifications for schedule updates

Alerts for meeting requests and academic events

System Architecture

The system follows a full-stack web architecture.

Frontend

React.js

REST API integration

Real-time communication using Socket.io

Backend

Node.js

Express.js

JWT authentication

WebSocket / Socket.io server

Database

MongoDB

API Testing

Postman

Tech Stack

Frontend

React.js

JavaScript

Backend

Node.js

Express.js

Socket.io

Database

MongoDB

Authentication

JWT

Google OAuth

Development Tools

Postman

Git / GitHub

Main Modules
E_learning/
│
├── frontend/        # React client application
├── backend/         # Node.js / Express API server
├── controllers/     # Business logic
├── routes/          # API endpoints
├── middleware/      # Authentication & authorization
├── models/          # MongoDB schemas
└── sockets/         # Real-time communication logic
Future Improvements

Video meeting integration for online classes

Advanced learning analytics

Mobile application support

AI-based course recommendation

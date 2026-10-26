 ChatSphere — Real-Time Chat Application

ChatSphere is a web-based messaging application designed to make communication between users simple and interactive. It combines a React frontend with a Node.js and Express backend, MongoDB for message persistence, and Socket.IO for real-time communication.

The project was developed as a team project to explore how frontend and backend technologies work together to build a real-time web application.

Features

* Google Authentication: Firebase Authentication for Google sign-in.
* Real-Time Messaging: Socket.IO for real-time message communication.
* Message Persistence: MongoDB stores messages so conversation history can be retrieved.
* User Search: Find users to start a conversation.
* Message Timestamps: Display timestamps alongside messages.
* Responsive Web Interface: A chat interface built with React.

Tech Stack

Frontend

* React
* Vite
* JavaScript
* Axios

Backend

* Node.js
* Express.js
* Socket.IO

Database and Authentication

* MongoDB
* Mongoose
* Firebase Authentication

Project Structure

ChatSphere/
├── client/     # React frontend
└── server/     # Node.js and Express backend

Getting Started

Prerequisites

* Node.js and npm
* MongoDB connection
* Firebase project configured for Google Authentication

1. Clone the repository

git clone https://github.com/harshita-0417/ChatSphere.git
cd ChatSphere

2. Set up the backend

Open a terminal in the server directory:

cd server
npm install

Configure the required environment variables in a local .env file according to the variables used by the server code. Do not commit .env files or credentials to GitHub.

Start the backend using the start command defined in server/package.json.

3. Set up the frontend

Open another terminal in the client directory:

cd client
npm install
npm run dev

Open the local URL printed by Vite in your terminal.

4. Configure Firebase and MongoDB

Before running the application, configure Firebase Google Authentication and provide the MongoDB connection settings required by the backend. Check the project code for the exact environment variable names and configuration requirements.

Learning Outcomes

This project provided practical experience with frontend and backend integration, REST API communication, database connectivity, authentication, and real-time communication using WebSockets through Socket.IO.

Future Improvements

* Strengthen backend authentication and authorization.
* Improve input validation and error handling.
* Add deployment configuration and production environment settings.
* Improve automated testing and application reliability.
* Enhance the user experience across devices.

Project Status

This is a student team project. Local setup and end-to-end functionality should be verified before treating it as production-ready.

Contributors

Developed collaboratively as a team project.
# Academic Question Answering System

This project is an Academic Question Answering System that provides step-by-step answers and helpful hints for academic questions. It features a modern web interface and a backend powered by Google Generative AI (Gemini) and SQLite for storing question history.

## Features
- Ask academic questions and receive detailed, step-by-step answers
- Get helpful hints before revealing the answer
- View and manage your question history (delete individual questions)
- Modern, responsive UI built with React
- Backend API using Express.js and SQLite

## Tech Stack
- **Frontend:** React (with hooks)
- **Backend:** Node.js, Express.js
- **Database:** SQLite
- **AI Model:** Google Generative AI (Gemini)

## Setup Instructions

### 1. Clone the Repository
```bash
git clone <your-repo-url>
cd academic-qa-system
```

### 2. Install Dependencies
#### For the root (backend):
```bash
cd server
npm install
cd ..
```
#### For the client (if needed):
```bash
cd client
npm install
cd ..
```

### 3. Configure Environment Variables
Create a `.env` file in the project root with your Google API key:
```
GOOGLE_API_KEY=your_google_api_key_here
```

### 4. Run the Application
#### Start the backend server:
```bash
cd server
npm start
```

#### Start the frontend (in a new terminal):
```bash
cd client
npm start
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000)
- The backend API runs on [http://localhost:5000](http://localhost:5000)

## Usage
1. Enter your academic question in the input box and submit.
2. Review the hints provided.
3. Click "Show Answer" to reveal the step-by-step solution.
4. View your question history and delete any entry as needed.

## Project Structure
```
academic-qa-system/
├── client/         # React frontend
├── server/         # Express backend
├── .env            # Environment variables (not committed)
├── package.json    # Project dependencies
└── README.md       # Project documentation
```

## Environment & Security
- **Never commit your `.env` file or API keys to version control.**
- The backend loads the Google API key from `.env` using `dotenv`.

## License
This project is for educational purposes. Please check the license or add your own if you plan to use it publicly. 
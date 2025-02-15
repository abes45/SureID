SureID/
├── backend/
│   ├── Dockerfile
│   ├── main.py
│   ├── models.py
│   ├── database.py
│   └── requirements.txt
├── frontend/
│   ├── Dockerfile
│   ├── package.json
│   ├── .env                   // Contains REACT_APP_BACKEND_URL=http://localhost:8000
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js             // Main router file
│       ├── App.css            // Global CSS
│       ├── index.js           // Entry point
│       └── components/
│           ├── ProviderDashboard.jsx
│           ├── ProviderDashboard.css
│           ├── IDUpload.jsx           // Two-step extraction & verification
│           ├── GuestList.jsx          // Guest List sub-page
│           ├── CheckInHistory.jsx     // Check-In History sub-page
│           ├── SecurityDashboard.jsx  // Security interface
│           ├── ManualSearch.jsx       // Manual search interface
│           └── (corresponding CSS files for others)
├── docker-compose.yml
└── .dockerignore

# SureID (National Guest Identification & Security Network)

SureID is a minimum working prototype designed to enhance security and streamline guest identification in Nigeria’s hospitality sector. The system features separate interfaces for providers, security agencies, and administrators with role-based access control, JWT-based authentication, and secure password hashing.

## Features

*   **Guest Check-In:** Providers can capture guest IDs using OCR, verify the extracted data, and perform check-in using a user-friendly ID.
*   **Security Alerts:** Security users can view current alerts, manually flag guests, and perform manual searches.
*   **User Management:** Administrators can log in, view all users, and create new user accounts (provider and security roles).
*   **Robust Authentication:** The backend uses JWT tokens for secure authentication and password hashing (via Passlib) for secure credential storage.

## Technologies Used

*   **Backend:** FastAPI, Uvicorn, Motor (Async MongoDB driver), PyJWT, Passlib (bcrypt), Docker
*   **Frontend:** React, Axios, React Router, CSS, Docker

## Getting Started

### Prerequisites

*   Docker & Docker Compose
*   Node.js & npm (for local development of the frontend)

### Setup & Running

1.  **Clone the Repository:**

    ```bash
    git clone [https://github.com/abes45/sureid.git](https://github.com/abes45/sureid.git)
    cd sureid
    ```

2.  **Backend Setup:**

    *   Ensure your `requirements.txt` is up-to-date.
    *   The backend Dockerfile builds the FastAPI application.
    *   The backend will automatically create a default admin account on startup:
        *   Username: `admin`
        *   Password: `changeme`

3.  **Frontend Setup:**

    *   The frontend Dockerfile builds the React application.
    *   Environment variable `REACT_APP_BACKEND_URL` should be set to your backend URL (e.g., `http://localhost:8000`).

4.  **Run the Application with Docker Compose:**

    In the root directory of the project, run:

    ```bash
    docker-compose up --build -d
    ```

    This command rebuilds the images for both the frontend and backend using their respective Dockerfiles and starts the containers in detached mode.

### Accessing the Application

1.  **Login:**

    Open your browser and navigate to `http://localhost:3000/login` to log in. Use the default admin credentials or those of another registered user.

2.  **Provider Interface:**

    Providers (and admin users) can access check-in, guest list, and check-in history via the provider interface.

3.  **Security Interface:**

    Security (and admin) users can view security alerts and use the manual search interface.

4.  **Admin Interface:**

    Admin users can manage user accounts through the Admin User Management page.

## Environment Variables

For development, you can create a `.env` file in the respective directories:

*   **Backend:**
    *   Set `SECRET_KEY` (for JWT token generation).
*   **Frontend:**
    *   Set `REACT_APP_BACKEND_URL` (e.g., `http://localhost:8000`).

## Future Enhancements

*   Integration with government verification systems.
*   Enhanced analytics and reporting.
*   Additional security and audit logging features.
*   Improved UI/UX across all interfaces.
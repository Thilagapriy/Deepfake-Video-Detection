# Deepfake Video Detection Platform: Full Context & Documentation

## 1. Full Description
The **True Vision Deepfake Video Detection** platform is a comprehensive, full-stack web application designed to identify synthetically manipulated (deepfake) videos. It provides a secure, multi-user environment where individuals can authenticate, upload suspicious media files, and receive high-level analytical breakdowns of the video's authenticity based on advanced machine learning concepts. The system is designed with enterprise-grade security and role-based privacy (including an overarching Boss/Admin role) to ensure user data remains confidential. 

## 2. Tools & Technologies Used
### Frontend (User Interface)
* **React & Vite**: Extremely fast and modern JavaScript framework used to build interactive single-page applications.
* **React Router DOM**: Enables seamless navigation between the Login, Dashboard, Detection, and History pages without reloading the window.
* **Recharts**: Builds the responsive visualization graphs (Bar Charts) comparing the "Fake" vs "Real" probabilities.
* **Axios**: Handles RESTful API requests to communicate with the Python backend.
* **Vanilla CSS**: Used to create a stunning, fully animated, glassmorphism UI with gradient glows.

### Backend (Server & API)
* **Python**: The core language used because of its deep integrations with ML models natively.
* **FastAPI**: A state-of-the-art backend framework used to build rapid, async API endpoints for video upload and auth handling.
* **Uvicorn**: An ASGI web server implementation used to run the FastAPI application.
* **OpenCV (`cv2`)**: Industry-standard computer vision library used to extract specific 2D image frames directly out of the uploaded video files to create analyzable data points.

### Database & Security Stack
* **SQLAlchemy**: An Object-Relational Mapper (ORM) used to seamlessly connect Python to database engines (SQLite locally, Supabase/PostgreSQL in production).
* **JWT (JSON Web Tokens)**: Cryptographically signed security tokens used to authenticate and isolate every specific user's web session securely.
* **Bcrypt**: A powerful, slow cryptographic hashing algorithm used to irreversibly scramble sensitive OTP codes stored in the database.
* **SlowAPI**: Software rate-limiter attached to FastAPI to prevent malicious bots from spamming the login routes or brute-forcing OTPs.
* **smtplib**: Python's native tool for routing secure OTPs through Gmail’s SMTP servers.

---

## 3. Procedure and Steps
1. **User Authentication**: A user navigates to the application and enters their Email ID. 
2. **OTP Generation**: The backend securely mints a 6-digit pin, hashes it using Bcrypt, sets a 5-minute Time-To-Live (TTL), and restricts attempts (max 3).
3. **Email Dispatch**: The backend logs into a central Gmail account securely with an App Password and sends the OTP to the user.
4. **Verification**: User types the OTP. If it matches, the backend clears the code (one-time use) and grants the user a JWT session token.
5. **Video Upload**: User heads to the detection page and seamlessly posts an `.mp4` video.
6. **Frame Extraction**: The backend intercepts the file with OpenCV, parsing the video duration to extract exactly 5 evenly-spaced visual frames for deep analysis.
7. **Simulated Model Inference**: Represents the Vision Transformer (ViT) / SOTA MDNet / Bi-GRU pipeline processing the frames to identify anomalies.
8. **Grad-CAM Visualization**: For detected "Fake" videos, OpenCV processes the anomaly location into a multi-colored heat map (`COLORMAP_JET`) explicitly overlying the corrupted frames.
9. **Final Logging**: The total statistical result and frame locations are committed to the secure database attached directly to the user's specific JWT ID. 

---

## 4. Entire Plan & Architecture
The project architecture revolves around complete decoupling separation of concerns:
* **The Presentation Layer (Vite/React)**: Entirely responsible for loading animations, capturing user input files, displaying Grad-CAM frames, and storing JWTs in LocalStorage.
* **The Intelligence Layer (FastAPI/Python)**: Operates independently. Designed to be completely scalable so that if machine learning payloads get too heavy, the Python worker can scale vertically on loud cloud pods (like Render/AWS).
* **The Data Layer (PostgreSQL/Supabase)**: Designed to act as the single source of truth for all users. It aggregates the complete history of evaluations globally.

---

## 5. Output Section
The Output returned to the end-user on the graphical interface includes:
1. **The Primary Verdict**: Clearly stating whether the footage is `Real` or `Fake` alongside its dominant calculated probability out of 100%.
2. **Bar Graph Breakdown**: A visual, colored representation juxtaposing the exact internal confidence ratings separating Fake vs Real.
3. **Anomalous Frame Row**: A horizontally scrolling shelf displaying the exactly extracted scenes/frames from their video.
4. **Grad-CAM Anomaly Heatmap**: Placed directly over the specific frame where the manipulation was detected (denoted by a bright red glowing border and an "Anomaly Spotted" badge).

---

## 6. Additional Features Included 
### 🛡️ Enterprise Privacy Shield
Users are given ironclad privacy regarding their activity. Non-admin users can ONLY observe the detection history belonging exactly to the videos they analyzed under their specific email account.

### 👑 The "Boss Mode" Administrator Capability
The platform was hardcoded to assign `aishwaryat701@gmail.com` as the primary overarching Admin. When this email securely logs into the website, the History limitations are intentionally broken. The Boss Mode user can magically witness **Every single history element** submitted by every user on the platform, alongside a new UI label explicitly revealing which User Email uploaded the video!

### 🚦 Anti-Bot Limiters
Because of the implementation of `SlowAPI`, the login endpoints are massively protected against abuse. An internet bot can only request 3 OTP codes per minute before the FastAPI backend drops connection and blocks them.

### 🔌 Cloud-Ready Database Support
The codebase was retro-fitted using `psycopg2-binary` and dynamic Environment Variable (`.env`) loaders so that the SQL engine seamlessly switches from the local dev database to massive cloud infrastructures like Supabase or Neon without changing a single line of python execution logic.

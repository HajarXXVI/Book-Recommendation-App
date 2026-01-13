# Book Recommendation App - Installation Guide

This guide covers the complete setup process for the Book Recommendation App, including the backend (Node.js/Express) and the mobile frontend (React Native/Expo).

## 🚀 Prerequisites

Before you begin, ensure you have the following installed on your machine:

1.  **Node.js** (v18 or higher recommended) - [Download Here](https://nodejs.org/)
2.  **Git** - [Download Here](https://git-scm.com/)
3.  **Expo Go App** on your physical Android/iOS device (available on Play Store / App Store).
4.  **MongoDB Atlas Account** (or a local MongoDB instance).
5.  **Cloudinary Account** (for image uploads).

---

## 📂 Project Structure

The project is divided into two main folders:
- `backend/`: The Express.js API server.
- `mobile/`: The React Native Expo mobile application.

---

## 🛠️ Step 1: Backend Setup

### 1. Navigate to the backend directory
Open your terminal and run:
```bash
cd backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a file named `.env` in the `backend/` directory:
```bash
# Windows
type NUL > .env
# Mac/Linux
touch .env
```

Open `.env` and add the following configuration (replace with your actual keys):
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 4. Start the Backend Server
```bash
npm run dev
```
> You should see a message indicating the server is running on port 3000 and connected to MongoDB.

---

## 📱 Step 2: Mobile App Setup

### 1. Navigate to the mobile directory
Open a **new** terminal window (keep the backend running) and run:
```bash
cd mobile
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API URL
To allow your physical phone to connect to the backend running on your computer, you must update the API URL with your computer's local IP address.

1.  **Find your IP address**:
    *   **Windows**: Run `ipconfig` in a terminal. Look for "IPv4 Address" under your Wi-Fi adapter (e.g., `192.168.1.5`).
    *   **Mac/Linux**: Run `ifconfig` or `ip a`.

2.  **Update `config.js`**:
    *   Open `mobile/constants/config.js`.
    *   Replace `localhost` with your IP address:
        ```javascript
        // Example
        export const API_URL = 'http://192.168.1.5:3000';
        ```
    > **Note**: Your phone and computer MUST be on the *same Wi-Fi network*.

### 4. Start the Expo Server
```bash
npx expo start --clear
```

---

## ▶️ Step 3: Running the App

1.  Ensure **both** terminals are running:
    *   Terminal 1: Backend (`npm run dev`)
    *   Terminal 2: Mobile (`npx expo start`)
2.  Available modes:
    *   **Physical Device**: Open the **Expo Go** app on your phone and scan the QR code shown in the terminal.
    *   **Web Browser**: Press `w` in the mobile terminal (functionality may be limited compared to mobile).
    *   **Emulator**: Press `a` (Android) or `i` (iOS) if you have emulators set up.

---

## ❓ Troubleshooting

*   **Network Request Failed?**
    *   Double-check your IP address in `mobile/constants/config.js`.
    *   Ensure your firewall is not blocking port 3000.
    *   Ensure phone and PC are on the same Wi-Fi.

*   **ReferenceError: property 'Sleep' doesn't exist?**
    *   This was a known bug. Ensure you have the latest code where `Sleep` was corrected to `sleep`.

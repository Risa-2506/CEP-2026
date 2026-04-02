# 📁 Frontend Project Structure Guide

This project follows a structured approach to ensure smooth collaboration and easy merging.

---

## 📂 Folder Structure

### `app/`

* Contains all screens and navigation (Expo Router based)
* This is the **core of the app**
* Example usage:

  * Home screens
  * Auth screens (login/register)
  * Feature screens

---

### `assets/`

* Stores all static resources
* Example:

  * Images
  * Icons
  * Fonts

---

### `components/`

* Reusable UI components
* Use this for elements used in multiple places
* Example:

  * Buttons
  * Cards
  * Input fields

---

### `constants/`

* Stores global constants/config
* Example:

  * Colors
  * API URLs
  * App-wide variables

---

### `hooks/`

* Custom React hooks
* Used for reusable logic
* Example:

  * API handling
  * State management
  * Authentication logic

---

### `services/`

* Handles API calls to backend
* Central place for all network requests
* Example:

  * GET / POST requests
  * Axios setup

---

## ⚠️ Rules to Follow

* Do NOT push directly to `main`
* Always create a new branch:

  * `feature/login`
  * `feature/dashboard`
* Keep code inside proper folders
* Do NOT create random files in root
* Reuse components instead of duplicating code

---

## 🚀 Running the Project

```bash
cd frontend
npm install
npx expo start
```

---

## 🧠 Notes

* Follow the folder structure strictly
* Keep code clean and modular
* Ask before changing core structure

## 📱 App Routing Structure (Expo Router)

### `app/_layout.tsx`

* Root layout of the app
* Controls overall navigation

### `app/(tabs)/_layout.tsx`

* Defines bottom tab navigation

### `app/(tabs)/index.tsx`

* Default Home screen

### `app/auth/`

* Authentication screens (login/register)

### `app/home/`

* Main app feature screens

### Notes:

* `index.tsx` = default screen of folder
* `(folder)` = grouping folder (not part of URL)


# 🔧 Backend Structure Guide

This backend follows a modular structure to ensure clean code, scalability, and easy collaboration.

---

## 📂 Folder Structure

### `server.js`

* Entry point of the backend
* Starts the Express server
* Handles middleware and base routes

---

### `config/`

* Contains configuration files
* Example:

  * Database connection (`db.js`)
  * Environment setup

---

### `controllers/`

* Contains business logic
* Handles request and response
* Example:

  * Login logic
  * Data processing

👉 Controllers DO NOT define routes, only logic

---

### `routes/`

* Defines API endpoints
* Connects routes to controllers

👉 Example:

```js
router.get('/users', getUsers);
```

---

### `models/`

* Defines database schemas
* Represents structure of data
* Used for database operations

---

### `.env`

* Stores environment variables
* Example:

  * Database URL
  * Port
  * API keys

⚠️ Do NOT push sensitive data

---

### `.gitignore`

* Prevents unnecessary files from being pushed
* Example:

  * node_modules
  * .env

---

### `package.json`

* Contains dependencies and scripts
* Used to install and run the backend

---

## 🔁 Request Flow (IMPORTANT)

```text
Client → Route → Controller → Model → Database
```

---

## ⚠️ Rules to Follow

* Do NOT write logic inside routes
* Keep controllers clean and modular
* Use proper folder structure
* Do NOT push `.env` file
* Create separate branches for features

---

## 🚀 Running the Backend

```bash
cd backend
npm install
npm start
```

Run on port 5000
Dont edit server.js

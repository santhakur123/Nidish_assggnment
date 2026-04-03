# ContentCraft — Nidish LLC Full-Stack Assignment

A full-stack content management and live preview application built with **HTML/CSS/JS** (frontend) and **Node.js/Express serverless** (backend), deployed as a single project on **Vercel**.

---

## 🚀 Deploy to Vercel (One Click)

```bash
# 1. Push to GitHub first
git init && git add . && git commit -m "feat: nidish assignment"
git remote add origin <YOUR_GITHUB_URL>
git push -u origin main

# 2. Install Vercel CLI
npm i -g vercel

# 3. Deploy
vercel
```

That's it! Both frontend and backend deploy together. No ENV vars needed.

---



## 🚀 Setup & Running Locally

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Start the Backend Server

```bash
npm start
# or for auto-reload during development:
npm run dev
```

The server will start at **http://localhost:5000**

### 3. Open the Frontend

Simply open `frontend/index.html` in your browser — no build step required.

Or serve it locally with:
```bash
# Python 3
cd frontend
python -m http.server 3000
```

Then visit **http://localhost:3000**

---

## ⚙️ ENV Configuration

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Port the Express server listens on |
| `FRONTEND_ORIGIN` | `*` | CORS allowed origin (set to your frontend URL in production) |

### Frontend — `frontend/app.js` (top of file)

```js
const API_BASE_URL = 'http://localhost:5000';
```

**Change this line** to your deployed backend URL when deploying to production.

---

## 📋 API Reference

### `POST /api/content`

**Request Body:**
```json
{
  "heading": "My Heading",
  "paragraph": "<p>Rich <strong>text</strong> content</p>",
  "backgroundImage": "https://example.com/image.jpg",
  "textColor": "#FFFFFF"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Content saved successfully!",
  "data": {
    "heading": "My Heading",
    "paragraph": "<p>Rich <strong>text</strong> content</p>",
    "backgroundImage": "https://example.com/image.jpg",
    "textColor": "#FFFFFF"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Validation failed. Please fix the errors below.",
  "errors": {
    "textColor": "Text color must be a valid HEX code (e.g. #FF5733 or #F53).",
    "backgroundImage": "Background image URL is not reachable or returned an error."
  }
}
```

---

## 🗂️ Project Structure

```
ASSIGNMENT_nidish/
├── backend/
│   ├── .env                        # Environment variables
│   ├── server.js                   # Express server entry point
│   ├── package.json
│   ├── routes/
│   │   └── content.js              # POST /api/content
│   └── validators/
│       └── contentValidator.js     # Validation logic
│
└── frontend/
    ├── index.html                  # Two-column layout
    ├── style.css                   # Dark-mode premium design
    └── app.js                      # Form logic, API calls, preview updates
```

---

## ✅ Features

- **Rich-text editor** (Quill.js) for paragraph content
- **Live color swatch** updates as you type the HEX code
- **Client-side validation** (required fields, HEX regex) before any server call
- **Server-side validation** including HTTP HEAD check to verify image URL is reachable
- **Animated preview** — right column fades and updates on successful submission
- **Inline error messages** per field — no alert() boxes
- **Responsive layout** — stacks vertically on mobile

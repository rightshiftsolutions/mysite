# LMS Test Portal Bootstrap Frontend

This is a static Bootstrap frontend for the simplified LMS test portal.

## Stack

- HTML
- Bootstrap 5
- Plain JavaScript
- GitHub Pages compatible

## Pages

- `index.html` - landing page
- `login.html` - teacher/student login
- `signup.html` - student signup
- `teacher-dashboard.html` - normal teacher UI
- `create-game.html` - teacher creates GitHub MCQ game
- `student-dashboard.html` - gamified student dashboard
- `game.html` - gamified MCQ test page
- `leaderboard.html` - cumulative score ranking

## Configure backend URL

Edit:

```text
assets/js/config.js
```

For local backend:

```js
window.APP_CONFIG = {
  API_BASE_URL: "http://localhost:5000"
};
```

For deployed backend:

```js
window.APP_CONFIG = {
  API_BASE_URL: "https://your-api-domain.com"
};
```

## Required backend APIs

This frontend expects these APIs from the Node.js backend:

- `POST /api/auth/login`
- `POST /api/auth/student-signup`
- `GET /api/teacher/games`
- `POST /api/teacher/games`
- `PUT /api/teacher/games/:id/start`
- `PUT /api/teacher/games/:id/complete`
- `GET /api/student/my-profile`
- `GET /api/student/active-game`
- `POST /api/student/start-game`
- `POST /api/student/submit-attempt`
- `GET /api/leaderboard`

## Student scoring flow

1. Student starts the active game.
2. Frontend loads MCQ JSON from GitHub Pages.
3. Student answers questions.
4. Frontend builds an answer string such as `1A2C3B5D`.
5. Backend compares it with the answer key string stored in MySQL.
6. Backend returns result and updates cumulative score.

## Deploy to GitHub Pages

Upload the contents of this folder to your frontend repository and enable GitHub Pages.

If your backend is not local, update `assets/js/config.js` before deployment.

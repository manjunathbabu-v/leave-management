# Leave Desk (React frontend)

1. Start the Spring Boot backend (port 8080).
2. `npm install` then `npm run dev`
3. Open http://localhost:5173

The Vite dev server proxies `/api/*` to `http://localhost:8080` (see `vite.config.js`),
so the browser never makes a cross-origin request and CORS errors cannot occur.
If your backend runs on another port, change the `target` in `vite.config.js`.

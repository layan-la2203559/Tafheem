/**
 * Startup file for Hostinger's Node.js (Passenger) hosting.
 * Passenger launches this file and provides the port via process.env.PORT.
 * Boots Next.js in production mode and lets it handle every request
 * (pages, API routes, and /_next + /public static assets).
 * Requires `npm run build` to have produced the .next folder next to this file.
 */
const { createServer } = require("http");
const next = require("next");

const port = process.env.PORT || 3000;
const app = next({ dev: false });
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    createServer((req, res) => handle(req, res)).listen(port, () => {
      console.log(`Tafheem platform ready on port ${port}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start Next.js server:", err);
    process.exit(1);
  });

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let PORT = parseInt(process.env.PORT, 10) || 3000;

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
};

// Map of API route handlers
const apiRoutes = {
  "/api/products": "./api/products.js",
  "/api/orders": "./api/orders.js",
  "/api/contact": "./api/contact.js",
  "/api/store": "./api/store.js",
  "/api/auth": "./api/auth.js",
};

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = parsedUrl.pathname;

  // 1. API Route Handling
  if (pathname.startsWith("/api/")) {
    const routeKey = pathname.endsWith("/") && pathname.length > 5 ? pathname.slice(0, -1) : pathname;
    const modulePath = apiRoutes[routeKey];

    if (modulePath) {
      try {
        const module = await import(modulePath);
        const handler = module.default;

        // Enhance req with query and body helper
        req.query = Object.fromEntries(parsedUrl.searchParams);

        // Helper res methods similar to Express/Vercel
        res.status = (code) => {
          res.statusCode = code;
          return res;
        };
        res.json = (data) => {
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.end(JSON.stringify(data));
          return res;
        };

        return await handler(req, res);
      } catch (err) {
        console.error("API Error:", err);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        return res.end(JSON.stringify({ error: "Internal Server Error", details: err.message }));
      }
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      return res.end(JSON.stringify({ error: "API route not found" }));
    }
  }

  // 2. Static File Handling
  let filePath = path.join(__dirname, pathname === "/" ? "index.html" : pathname);

  // Check if file exists without extension, try .html
  if (!fs.existsSync(filePath)) {
    if (fs.existsSync(filePath + ".html")) {
      filePath = filePath + ".html";
    }
  }

  // Prevent directory traversal
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    return res.end("Forbidden");
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      return res.end("404 Not Found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    res.statusCode = 200;
    res.setHeader("Content-Type", contentType);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

function startServer(portToTry) {
  server.listen(portToTry, () => {
    console.log(`\n✦ Luxore Watches Full-Stack Server running at: http://localhost:${portToTry}`);
    console.log(`✦ Ready for Vercel deployment with Serverless APIs.\n`);
  });

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.log(`Port ${portToTry} in use, trying port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      console.error("Server error:", err);
    }
  });
}

startServer(PORT);

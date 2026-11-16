import { memoryStore } from "./_data.js";

async function getBody(req) {
  if (req.body) return typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (chunk) => (data += chunk));
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "POST") {
    const body = await getBody(req);
    const { action, passcode, oldPasscode, newPasscode } = body;

    // Login action
    if (action === "login") {
      if (passcode === memoryStore.adminPasscode) {
        return res.status(200).json({
          success: true,
          authenticated: true,
          token: "luxore-admin-token-" + Date.now(),
        });
      }
      return res.status(401).json({ success: false, error: "Invalid passcode. Access denied." });
    }

    // Change passcode action
    if (action === "change_pass") {
      if (oldPasscode !== memoryStore.adminPasscode) {
        return res.status(401).json({ success: false, error: "Current passcode is incorrect" });
      }
      if (!newPasscode || newPasscode.length < 4) {
        return res.status(400).json({ success: false, error: "Passcode must be at least 4 characters" });
      }
      memoryStore.adminPasscode = newPasscode;
      return res.status(200).json({ success: true, message: "Passcode updated successfully" });
    }

    return res.status(400).json({ error: "Invalid action" });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method, query } = req;

  // GET /api/contact - fetch messages for admin
  if (method === "GET") {
    return res.status(200).json(memoryStore.contactMessages);
  }

  // POST /api/contact - client sends inquiry
  if (method === "POST") {
    const body = await getBody(req);

    if (!body.name || !body.email || !body.message) {
      return res.status(400).json({ error: "Name, email, and message are required" });
    }

    const newInquiry = {
      id: "MSG-" + Math.floor(10000 + Math.random() * 90000),
      name: body.name.trim(),
      email: body.email.trim(),
      message: body.message.trim(),
      subject: body.subject || "Private Client Inquiry",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "Unread",
    };

    memoryStore.contactMessages.unshift(newInquiry);
    return res.status(201).json({
      success: true,
      message: "Thank you. Your concierge inquiry has been registered. Our horology advisor will contact you shortly.",
      inquiry: newInquiry,
    });
  }

  // DELETE /api/contact?id=...
  if (method === "DELETE") {
    const { id } = query || {};
    if (!id) {
      return res.status(400).json({ error: "Message id is required" });
    }
    const index = memoryStore.contactMessages.findIndex((m) => m.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Message not found" });
    }
    const [deleted] = memoryStore.contactMessages.splice(index, 1);
    return res.status(200).json({ success: true, deleted });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

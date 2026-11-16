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
  res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method } = req;

  // GET /api/store
  if (method === "GET") {
    return res.status(200).json(memoryStore.storeData);
  }

  // PUT /api/store
  if (method === "PUT") {
    const body = await getBody(req);
    memoryStore.storeData = {
      ...memoryStore.storeData,
      ...body,
    };
    return res.status(200).json({ success: true, storeData: memoryStore.storeData });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

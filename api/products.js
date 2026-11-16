import { memoryStore, defaultProducts } from "./_data.js";

// Helper to parse body if not parsed
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

  // GET /api/products
  if (method === "GET") {
    const { id, category, q } = query || {};

    if (id) {
      const product = memoryStore.products.find((p) => p.id === id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      return res.status(200).json(product);
    }

    let results = [...memoryStore.products];

    if (category && category !== "all") {
      results = results.filter((p) => p.category === category);
    }

    if (q) {
      const search = q.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          (p.desc && p.desc.toLowerCase().includes(search)) ||
          (p.tag && p.tag.toLowerCase().includes(search))
      );
    }

    return res.status(200).json(results);
  }

  // POST /api/products
  if (method === "POST") {
    const body = await getBody(req);
    if (!body.name || !body.price) {
      return res.status(400).json({ error: "Product name and price are required" });
    }

    const newProduct = {
      id: body.id || "watch-" + Date.now(),
      name: body.name,
      price: body.price,
      desc: body.desc || "",
      category: body.category || "men",
      tag: body.tag || "New",
      img: body.img || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80",
      movement: body.movement || "Swiss Automatic Movement",
      caseSpec: body.caseSpec || "41mm Stainless Steel",
      crystal: body.crystal || "Double-Coated Sapphire Crystal",
      dial: body.dial || "Custom Sunburst Dial",
      waterResist: body.waterResist || "100 Meters / 10 ATM",
      strap: body.strap || "Genuine Handcrafted Leather",
      powerReserve: body.powerReserve || "48 Hours Autonomy",
    };

    memoryStore.products.unshift(newProduct);
    return res.status(201).json({ success: true, product: newProduct });
  }

  // DELETE /api/products?id=...
  if (method === "DELETE") {
    const { id } = query || {};
    if (!id) {
      return res.status(400).json({ error: "Product id is required" });
    }

    const index = memoryStore.products.findIndex((p) => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }

    const [deleted] = memoryStore.products.splice(index, 1);
    return res.status(200).json({ success: true, deletedProduct: deleted });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

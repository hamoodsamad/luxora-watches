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
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { method, query } = req;

  // GET /api/orders
  if (method === "GET") {
    const { email, orderId } = query || {};

    let list = [...memoryStore.orders];

    if (orderId) {
      const order = list.find((o) => o.orderId === orderId);
      if (!order) return res.status(404).json({ error: "Order not found" });
      return res.status(200).json(order);
    }

    if (email) {
      list = list.filter(
        (o) => o.clientEmail && o.clientEmail.toLowerCase() === email.toLowerCase()
      );
    }

    return res.status(200).json(list);
  }

  // POST /api/orders
  if (method === "POST") {
    const body = await getBody(req);

    if (!body.watchName || !body.clientName || !body.clientEmail) {
      return res.status(400).json({ error: "Missing required order fields" });
    }

    const orderId = body.orderId || "LX-" + Math.floor(100000 + Math.random() * 900000);
    const orderDate =
      body.orderDate ||
      new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

    const newOrder = {
      orderId,
      orderDate,
      watchId: body.watchId || "unknown",
      watchName: body.watchName,
      watchPrice: body.watchPrice,
      watchImg: body.watchImg || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=700&q=80",
      clientName: body.clientName,
      clientEmail: body.clientEmail,
      clientPhone: body.clientPhone || "",
      shippingAddress: body.shippingAddress || "",
      paymentMethod: body.paymentMethod || "Cash on Delivery",
      isOnlinePayment: Boolean(body.isOnlinePayment),
      paymentStatus: body.paymentStatus || "UNPAID (Cash on Delivery)",
      settlementTrx: body.settlementTrx || "None",
      status: body.status || "Confirmed",
      createdAt: new Date().toISOString(),
    };

    memoryStore.orders.unshift(newOrder);
    return res.status(201).json({ success: true, order: newOrder });
  }

  // PUT /api/orders (update status / refund)
  if (method === "PUT") {
    const body = await getBody(req);
    const { orderId, status, paymentStatus, courierTracking } = body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = memoryStore.orders.find((o) => o.orderId === orderId);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (status) order.status = status;
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (courierTracking) order.courierTracking = courierTracking;

    return res.status(200).json({ success: true, order });
  }

  // DELETE /api/orders
  if (method === "DELETE") {
    const { orderId, all } = query || {};

    if (all === "true") {
      memoryStore.orders = [];
      return res.status(200).json({ success: true, message: "All orders cleared" });
    }

    if (!orderId) {
      return res.status(400).json({ error: "orderId or all=true required" });
    }

    const index = memoryStore.orders.findIndex((o) => o.orderId === orderId);
    if (index === -1) {
      return res.status(404).json({ error: "Order not found" });
    }

    const [deleted] = memoryStore.orders.splice(index, 1);
    return res.status(200).json({ success: true, deletedOrder: deleted });
  }

  return res.status(405).json({ error: "Method not allowed" });
}

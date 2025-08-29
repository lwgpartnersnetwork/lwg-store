import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertProductSchema, 
  createOrderSchema, 
  adminLoginSchema,
  type Product,
  type Order 
} from "@shared/schema";
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ ok: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ ok: false, error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check routes
  app.get("/", (req, res) => {
    res.json({ ok: true, name: "LWG API" });
  });

  app.get("/api/status", (req, res) => {
    res.json({ 
      ok: true, 
      uptime: process.uptime(),
      version: "1.0.0"
    });
  });

  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const {
        q: search,
        category,
        min: minPrice,
        max: maxPrice,
        page = "1",
        pageSize = "20"
      } = req.query;

      const filters = {
        search: search as string,
        category: category as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        page: parseInt(page as string, 10),
        pageSize: parseInt(pageSize as string, 10)
      };

      const result = await storage.getProducts(filters);
      res.json({ ok: true, ...result });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:idOrSlug", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.idOrSlug);
      if (!product) {
        return res.status(404).json({ ok: false, error: "Product not found" });
      }
      res.json({ ok: true, product });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", authenticateToken, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json({ ok: true, product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ ok: false, error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ ok: false, error: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const updates = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(req.params.id, updates);
      if (!product) {
        return res.status(404).json({ ok: false, error: "Product not found" });
      }
      res.json({ ok: true, product });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ ok: false, error: "Invalid product data", details: error.errors });
      }
      res.status(500).json({ ok: false, error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", authenticateToken, async (req, res) => {
    try {
      const deleted = await storage.deleteProduct(req.params.id);
      if (!deleted) {
        return res.status(404).json({ ok: false, error: "Product not found" });
      }
      res.json({ ok: true, message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to delete product" });
    }
  });

  // Orders API
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = createOrderSchema.parse(req.body);
      const order = await storage.createOrder({
        ...orderData,
        subtotal: orderData.subtotal.toString(),
        deliveryFee: orderData.deliveryFee.toString(),
        grandTotal: orderData.grandTotal.toString(),
      });
      
      // TODO: Send email notifications
      // TODO: Send WhatsApp notification if configured
      
      res.status(201).json({ 
        ok: true, 
        order: { 
          id: order.id, 
          ref: order.ref, 
          createdAt: order.createdAt 
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ ok: false, error: "Invalid order data", details: error.errors });
      }
      res.status(500).json({ ok: false, error: "Failed to create order" });
    }
  });

  app.get("/api/orders/:ref", async (req, res) => {
    try {
      const order = await storage.getOrderByRef(req.params.ref);
      if (!order) {
        return res.status(404).json({ ok: false, error: "Order not found" });
      }
      res.json({ ok: true, order });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch order" });
    }
  });

  app.get("/api/orders/lookup", async (req, res) => {
    try {
      const { email, phone } = req.query;
      if (!email && !phone) {
        return res.status(400).json({ ok: false, error: "Email or phone required" });
      }

      const orders = await storage.getOrdersByCustomer(email as string, phone as string);
      const latestOrder = orders[0];
      
      if (!latestOrder) {
        return res.status(404).json({ ok: false, error: "No orders found" });
      }

      res.json({ ok: true, order: latestOrder });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to lookup order" });
    }
  });

  app.get("/api/receipt/:ref", async (req, res) => {
    try {
      const order = await storage.getOrderByRef(req.params.ref);
      if (!order) {
        return res.status(404).json({ ok: false, error: "Order not found" });
      }

      // TODO: Generate PDF receipt
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.ref}.pdf"`);
      res.send('PDF receipt would be generated here');
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to generate receipt" });
    }
  });

  // Admin API
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = adminLoginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ ok: false, error: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
      res.json({ ok: true, token, user: { id: user.id, username: user.username } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ ok: false, error: "Invalid login data", details: error.errors });
      }
      res.status(500).json({ ok: false, error: "Login failed" });
    }
  });

  app.get("/api/admin/orders", authenticateToken, async (req, res) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 20;
      
      const result = await storage.getOrders(page, pageSize);
      res.json({ ok: true, ...result });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/products", authenticateToken, async (req, res) => {
    try {
      const result = await storage.getProducts();
      res.json({ ok: true, ...result });
    } catch (error) {
      res.status(500).json({ ok: false, error: "Failed to fetch products" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

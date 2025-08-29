import { type User, type InsertUser, type Product, type InsertProduct, type Order, type InsertOrder } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Product methods
  getProducts(filters?: { 
    category?: string; 
    search?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    page?: number; 
    pageSize?: number; 
  }): Promise<{ products: Product[]; total: number }>;
  getProduct(idOrSlug: string): Promise<Product | undefined>;
  getProductById(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Order methods
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: string): Promise<Order | undefined>;
  getOrderByRef(ref: string): Promise<Order | undefined>;
  getOrdersByCustomer(email?: string, phone?: string): Promise<Order[]>;
  getOrders(page?: number, pageSize?: number): Promise<{ orders: Order[]; total: number }>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private products: Map<string, Product>;
  private orders: Map<string, Order>;
  private orderSequence: Map<string, number>;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.orders = new Map();
    this.orderSequence = new Map();
    this.seedData();
  }

  private seedData() {
    // Create admin user
    const adminUser: User = {
      id: randomUUID(),
      username: "admin",
      password: "admin123", // In real app, this would be hashed
    };
    this.users.set(adminUser.id, adminUser);

    // Create sample products
    const sampleProducts: Product[] = [
      {
        id: randomUUID(),
        title: "Professional Laptop Pro 15\"",
        slug: "professional-laptop-pro-15",
        description: "High-performance laptop designed for business professionals with advanced security features and powerful processing capabilities.",
        price: "2499.00",
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 12,
        category: "technology",
        tags: ["laptop", "professional", "business"],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Executive Office Chair",
        slug: "executive-office-chair",
        description: "Ergonomic design with lumbar support and premium materials for all-day comfort and professional appearance.",
        price: "699.00",
        image: "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 8,
        category: "office",
        tags: ["chair", "ergonomic", "office"],
        featured: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Video Conference Kit",
        slug: "video-conference-kit",
        description: "Complete video conferencing solution with 4K camera, professional audio equipment, and wireless connectivity.",
        price: "1299.00",
        image: "https://images.unsplash.com/photo-1600298881974-6be191ceeda1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 5,
        category: "technology",
        tags: ["conference", "video", "audio"],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Strategic Consulting Package",
        slug: "strategic-consulting-package",
        description: "Comprehensive business strategy consultation with market analysis, growth planning, and implementation roadmap.",
        price: "899.00",
        image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 999,
        category: "consulting",
        tags: ["consulting", "strategy", "business"],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Multi-Function Printer Pro",
        slug: "multi-function-printer-pro",
        description: "Professional grade printer with scanning, copying, fax, and wireless connectivity for complete office solutions.",
        price: "449.00",
        image: "https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 15,
        category: "office",
        tags: ["printer", "scanner", "office"],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        title: "Adjustable Standing Desk",
        slug: "adjustable-standing-desk",
        description: "Height-adjustable desk with memory settings and sustainable materials for healthy work habits and improved productivity.",
        price: "799.00",
        image: "https://images.unsplash.com/photo-1541558869434-2840d308329a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        stock: 6,
        category: "office",
        tags: ["desk", "adjustable", "ergonomic"],
        featured: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Product methods
  async getProducts(filters?: { 
    category?: string; 
    search?: string; 
    minPrice?: number; 
    maxPrice?: number; 
    page?: number; 
    pageSize?: number; 
  }): Promise<{ products: Product[]; total: number }> {
    let filteredProducts = Array.from(this.products.values());

    if (filters?.category && filters.category !== 'all') {
      filteredProducts = filteredProducts.filter(p => p.category === filters.category);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchLower)))
      );
    }

    if (filters?.minPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) >= filters.minPrice!);
    }

    if (filters?.maxPrice !== undefined) {
      filteredProducts = filteredProducts.filter(p => parseFloat(p.price) <= filters.maxPrice!);
    }

    // Sort by created date (newest first) by default
    filteredProducts.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());

    const total = filteredProducts.length;
    
    // Pagination
    const page = filters?.page || 1;
    const pageSize = filters?.pageSize || 20;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    const products = filteredProducts.slice(start, end);

    return { products, total };
  }

  async getProduct(idOrSlug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(p => p.id === idOrSlug || p.slug === idOrSlug);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const newProduct: Product = {
      ...product,
      id,
      stock: product.stock || 0,
      tags: product.tags || [],
      featured: product.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      updatedAt: new Date(),
    };
    
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    return this.products.delete(id);
  }

  // Order methods
  private generateOrderRef(): string {
    const today = new Date();
    const dateString = today.toISOString().slice(0, 10).replace(/-/g, '');
    const currentSequence = this.orderSequence.get(dateString) || 0;
    const newSequence = currentSequence + 1;
    this.orderSequence.set(dateString, newSequence);
    
    return `LWG-${dateString}-${newSequence.toString().padStart(4, '0')}`;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const ref = this.generateOrderRef();
    const order: Order = {
      ...insertOrder,
      id,
      ref,
      status: insertOrder.status || 'Processing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrder(id: string): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByRef(ref: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(o => o.ref === ref);
  }

  async getOrdersByCustomer(email?: string, phone?: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => 
      (email && o.customerEmail === email) || 
      (phone && o.customerPhone === phone)
    ).sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrders(page = 1, pageSize = 20): Promise<{ orders: Order[]; total: number }> {
    const allOrders = Array.from(this.orders.values());
    const total = allOrders.length;
    
    // Sort by created date (newest first)
    allOrders.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const orders = allOrders.slice(start, end);

    return { orders, total };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const existingOrder = this.orders.get(id);
    if (!existingOrder) return undefined;

    const updatedOrder: Order = {
      ...existingOrder,
      status,
      updatedAt: new Date(),
    };
    
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
}

export const storage = new MemStorage();

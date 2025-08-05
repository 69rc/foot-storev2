import {
  users,
  products,
  carts,
  cartItems,
  orders,
  orderItems,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Cart,
  type CartItem,
  type InsertCartItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartWithItems,
  type OrderWithItems,
} from "@shared/schema";
import {db }  from "./db";
import { eq, and, desc } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  // Cart operations
  getUserCart(userId: string): Promise<CartWithItems | undefined>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, quantity: number): Promise<CartItem>;
  removeFromCart(id: string): Promise<void>;
  clearCart(cartId: string): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems>;
  getUserOrders(userId: string): Promise<OrderWithItems[]>;
  getAllOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Cart operations
  async getUserCart(userId: string): Promise<CartWithItems | undefined> {
    try {
      console.log(`Getting cart for user ${userId}`);
      
      // First get or create cart
      let [cart] = await db.select().from(carts).where(eq(carts.userId, userId));
      
      if (!cart) {
        console.log(`No existing cart found for user ${userId}, creating new cart`);
        try {
          [cart] = await db.insert(carts).values({ userId }).returning();
          console.log(`Created new cart:`, cart);
        } catch (error) {
          console.error(`Error creating cart for user ${userId}:`, error);
          throw error;
        }
      } else {
        console.log(`Found existing cart for user ${userId}:`, cart);
      }

      // Get cart with items and products
      console.log(`Fetching items for cart ${cart.id}`);
      const items = await db
        .select({
          id: cartItems.id,
          cartId: cartItems.cartId,
          productId: cartItems.productId,
          quantity: cartItems.quantity,
          size: cartItems.size,
          color: cartItems.color,
          createdAt: cartItems.createdAt,
          product: products,
        })
        .from(cartItems)
        .innerJoin(products, eq(cartItems.productId, products.id))
        .where(eq(cartItems.cartId, cart.id));

      console.log(`Found ${items.length} items in cart ${cart.id}`);
      
      return {
        ...cart,
        items,
      };
    } catch (error) {
      console.error(`Error in getUserCart for user ${userId}:`, error);
      throw error; // Re-throw to be handled by the route
    }
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    console.log("Starting addToCart with data:", cartItem);
    
    try {
      // Check if item already exists with same product, size, and color
      console.log("Checking for existing cart item...");
      const [existingItem] = await db
        .select()
        .from(cartItems)
        .where(
          and(
            eq(cartItems.cartId, cartItem.cartId),
            eq(cartItems.productId, cartItem.productId),
            eq(cartItems.size, cartItem.size || ""),
            eq(cartItems.color, cartItem.color || "")
          )
        );

      if (existingItem) {
        console.log("Found existing cart item, updating quantity:", existingItem);
        // Update quantity if item exists
        const [updatedItem] = await db
          .update(cartItems)
          .set({ 
            quantity: existingItem.quantity + (cartItem.quantity || 1),
            updatedAt: new Date()
          })
          .where(eq(cartItems.id, existingItem.id))
          .returning();
        
        console.log("Successfully updated cart item quantity:", updatedItem);
        return updatedItem;
      } else {
        console.log("No existing item found, creating new cart item");
        // Create new cart item
        try {
          const [newItem] = await db.insert(cartItems)
            .values({
              ...cartItem,
              quantity: cartItem.quantity || 1,
              createdAt: new Date(),
              updatedAt: new Date()
            })
            .returning();
          
          console.log("Successfully created new cart item:", newItem);
          return newItem;
        } catch (error) {
          console.error("Error creating new cart item:", error);
          throw new Error(`Failed to create cart item: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Error in addToCart:", error);
      throw new Error(`Failed to add to cart: ${error.message}`);
    }
  }

  async updateCartItem(id: string, quantity: number): Promise<CartItem> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(cartId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  }

  // Order operations
  async createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<OrderWithItems> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    const orderItemsWithOrderId = items.map(item => ({
      ...item,
      orderId: newOrder.id,
    }));
    
    const newOrderItems = await db.insert(orderItems).values(orderItemsWithOrderId).returning();
    
    // Get user and products for the complete order
    const [user] = await db.select().from(users).where(eq(users.id, newOrder.userId));
    
    const itemsWithProducts = await Promise.all(
      newOrderItems.map(async (item) => {
        const [product] = await db.select().from(products).where(eq(products.id, item.productId));
        return { ...item, product };
      })
    );

    return {
      ...newOrder,
      items: itemsWithProducts,
      user,
    };
  }

  async getUserOrders(userId: string): Promise<OrderWithItems[]> {
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.createdAt));

    return await Promise.all(
      userOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            size: orderItems.size,
            color: orderItems.color,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const [user] = await db.select().from(users).where(eq(users.id, order.userId));

        return {
          ...order,
          items,
          user,
        };
      })
    );
  }

  async getAllOrders(): Promise<OrderWithItems[]> {
    const allOrders = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    return await Promise.all(
      allOrders.map(async (order) => {
        const items = await db
          .select({
            id: orderItems.id,
            orderId: orderItems.orderId,
            productId: orderItems.productId,
            quantity: orderItems.quantity,
            price: orderItems.price,
            size: orderItems.size,
            color: orderItems.color,
            product: products,
          })
          .from(orderItems)
          .innerJoin(products, eq(orderItems.productId, products.id))
          .where(eq(orderItems.orderId, order.id));

        const [user] = await db.select().from(users).where(eq(users.id, order.userId));

        return {
          ...order,
          items,
          user,
        };
      })
    );
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    
    if (!order) return undefined;

    const items = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        quantity: orderItems.quantity,
        price: orderItems.price,
        size: orderItems.size,
        color: orderItems.color,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, order.id));

    const [user] = await db.select().from(users).where(eq(users.id, order.userId));

    return {
      ...order,
      items,
      user,
    };
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder;
  }
}

export const storage = new DatabaseStorage();

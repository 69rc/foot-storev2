-- Create sessions table for Replit Auth
CREATE TABLE IF NOT EXISTS "sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" jsonb NOT NULL,
	"expire" timestamp NOT NULL
);

CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "sessions" ("expire");

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"email" varchar,
	"first_name" varchar,
	"last_name" varchar,
	"profile_image_url" varchar,
	"role" varchar DEFAULT 'customer' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);

-- Create order status enum
DO $$ BEGIN
 CREATE TYPE "order_status" AS ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create products table
CREATE TABLE IF NOT EXISTS "products" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" varchar NOT NULL,
	"description" text NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"image_url" varchar NOT NULL,
	"category" varchar NOT NULL,
	"stock" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create carts table
CREATE TABLE IF NOT EXISTS "carts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS "cart_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"cart_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"size" varchar,
	"color" varchar,
	"created_at" timestamp DEFAULT now()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS "orders" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"user_id" varchar NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"status" "order_status" DEFAULT 'pending' NOT NULL,
	"shipping_address" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS "order_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid(),
	"order_id" varchar NOT NULL,
	"product_id" varchar NOT NULL,
	"quantity" integer NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"size" varchar,
	"color" varchar
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "carts" ADD CONSTRAINT "carts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_cart_id_carts_id_fk" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "cart_items" ADD CONSTRAINT "cart_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "order_items" ADD CONSTRAINT "order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Insert sample products
INSERT INTO "products" ("name", "description", "price", "image_url", "category", "stock") VALUES
('Nike Air Max 270', 'Comfortable running shoes with air cushioning technology for all-day comfort and style.', '150.00', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'athletic', 25),
('Adidas Ultraboost 22', 'Premium running shoes with Boost technology for energy return and superior comfort.', '180.00', 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'athletic', 30),
('Converse Chuck Taylor All Star', 'Classic canvas sneakers with timeless style that goes with everything.', '65.00', 'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'casual', 50),
('Oxford Dress Shoes', 'Premium leather dress shoes perfect for formal occasions and business attire.', '120.00', 'https://images.unsplash.com/photo-1614252369475-531eba835eb1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'formal', 15),
('Nike Revolution 6', 'Lightweight running shoes designed for daily training and casual wear.', '70.00', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'athletic', 40),
('Timberland Work Boots', 'Durable work boots with steel toe protection and waterproof construction.', '200.00', 'https://images.unsplash.com/photo-1608667508764-33cf0726b13a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'boots', 20),
('Vans Old Skool', 'Classic skate shoes with iconic side stripe and durable canvas construction.', '80.00', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'casual', 35),
('Puma Suede Classic', 'Retro basketball shoes with premium suede upper and classic styling.', '75.00', 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'casual', 28),
('Dr. Martens 1460', 'Iconic leather boots with air-cushioned sole and distinctive yellow stitching.', '170.00', 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'boots', 18),
('New Balance 990v5', 'Made in USA running shoes with premium materials and superior comfort.', '185.00', 'https://images.unsplash.com/photo-1539185441755-769473a23570?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'athletic', 22),
('Loafers Brown Leather', 'Elegant leather loafers perfect for business casual and smart casual looks.', '95.00', 'https://images.unsplash.com/photo-1478166071386-8ef9b1eb5bc2?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'formal', 32),
('Chelsea Boots Black', 'Sleek ankle boots with elastic side panels for easy slip-on convenience.', '140.00', 'https://images.unsplash.com/photo-1529994971565-7e0de4643b73?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600', 'boots', 24)
ON CONFLICT DO NOTHING;

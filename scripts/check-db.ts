import { db } from '../server/db';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Test the connection
    const result = await db.execute(sql`SELECT 1 as test`);
    console.log('✅ Database connection successful');
    
    // Check if tables exist
    console.log('\nChecking tables...');
    const tables = ['users', 'products', 'carts', 'cart_items', 'orders', 'order_items'];
    
    for (const table of tables) {
      try {
        await db.execute(sql`SELECT 1 FROM ${sql.identifier(table)} LIMIT 1`);
        console.log(`✅ Table ${table} exists`);
      } catch (error) {
        console.error(`❌ Table ${table} does not exist or is not accessible:`, error.message);
      }
    }
    
    // Check cart data
    console.log('\nChecking cart data...');
    const carts = await db.execute(sql`SELECT * FROM carts`);
    console.log(`Found ${carts.rowCount} carts in the database`);
    
    if (carts.rowCount > 0) {
      console.log('Sample cart:', carts.rows[0]);
    }
    
    // Check cart items
    const cartItems = await db.execute(sql`SELECT * FROM cart_items`);
    console.log(`Found ${cartItems.rowCount} cart items in the database`);
    
    if (cartItems.rowCount > 0) {
      console.log('Sample cart item:', cartItems.rows[0]);
    }
    
    // Check if test user exists
    console.log('\nChecking test user...');
    const testUser = await db.execute(sql`SELECT * FROM users WHERE email = 'test@example.com'`);
    
    if (testUser.rowCount > 0) {
      console.log('✅ Test user found:', testUser.rows[0]);
    } else {
      console.log('⚠️ Test user not found. Creating test user...');
      try {
        const newUser = await db.execute(sql`
          INSERT INTO users (id, email, first_name, last_name, role) 
          VALUES (gen_random_uuid(), 'test@example.com', 'Test', 'User', 'admin')
          RETURNING *
        `);
        console.log('✅ Created test user:', newUser.rows[0]);
      } catch (error) {
        console.error('❌ Failed to create test user:', error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Database check failed:', error);
  } finally {
    process.exit(0);
  }
}

checkDatabase();

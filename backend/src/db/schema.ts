import { pgTable, serial, text, varchar, integer, boolean, timestamp, decimal, foreignKey, jsonb, pgEnum } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  googleId: text('google_id').unique(), // Google's unique ID
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').default(0).notNull(),
  imageUrl: text('image_url').default("https://ocohjxbhun.ufs.sh/f/tusHOP3SRakyxg8uE9cS5Mz41aUprsPwuTW763coqvnFCeKQ"),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 50 }).default('completed').notNull(), // e.g., pending, completed, cancelled
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


//Order Items Table
// This connects Products to Orders
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at the time of purchase
});


export const giftCardCodeStatusEnum = pgEnum('gift_card_code_status', ['available', 'sold']);


// Gift Card Codes Table (The actual inventory of unique codes)
export const giftCardCodes = pgTable('gift_card_codes', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull().references(() => products.id),
  //The code should be ENCRYPTED in your database.
  code: text('code').notNull().unique(), 
  status: giftCardCodeStatusEnum('status').default('available').notNull(),
  // This will be null until the code is sold and assigned to an order
  orderId: integer('order_id').references(() => orders.id), 
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});



// RELATIONS //

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));


// A product can have many individual codes
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
  // Add this line:
  giftCardCodes: many(giftCardCodes), 
}));

// An order can now be associated with a specific delivered code
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  // Add this line:
  giftCardCode: one(giftCardCodes), // Assuming one gift card per order for simplicity
}));


export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
// Add the new relations for the giftCardCodes table
export const giftCardCodesRelations = relations(giftCardCodes, ({ one }) => ({
  product: one(products, {
    fields: [giftCardCodes.productId],
    references: [products.id],
  }),
  order: one(orders, {
    fields: [giftCardCodes.orderId],
    references: [orders.id],
  }),
}));


// Export inferred types
export type User = InferSelectModel<typeof users>;
export type Product = InferSelectModel<typeof products>;
export type Order = InferSelectModel<typeof orders>;
export type GiftCardCode = InferSelectModel<typeof giftCardCodes>;
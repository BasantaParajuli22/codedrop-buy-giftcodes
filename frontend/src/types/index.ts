// Based on Drizzle schema 
export interface Product {
  id: number;
  name: string;
  description: string | null; // Description can be null in the schema
  price: string; // The decimal type is often returned as a string by APIs
  stock: number;
  imageUrl: string | null; // The image URL can be null
  createdAt: string;
}

// Type for an order item, which includes the nested product
export interface OrderItemWithProduct {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: string; // Price at the time of purchase
  product: Product;
}

// The main type for a single order with all its details
export interface OrderWithDetails {
  id: number;
  userId: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  orderItems: OrderItemWithProduct[];
}
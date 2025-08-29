import { Product } from '../db/schema'; 

// to generate a unique code 
function generateGiftCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) { // 16 characters long
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}


export function generateSampleGiftCardCodes(products: Product[]) {
  const giftCardCodesData: any = [];

  // For each product, let's create a few available gift codes
  products.forEach(product => {
    // Generate 'stock' number of codes for each product
    for (let i = 0; i < product.stock; i++) {
      giftCardCodesData.push({
        productId: product.id,
        code: generateGiftCode(), //generate random string code
        status: 'available',
        // orderId will be null initially, assigned when sold
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });

  return giftCardCodesData;
}
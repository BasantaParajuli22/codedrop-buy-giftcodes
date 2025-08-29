import { generateSampleGiftCardCodes } from "../data/giftCardCode.data";
import { sampleProducts } from "../data/product.data";
import {pool, db } from "../db/index";
import * as schema from '../db/schema';
import { count } from 'drizzle-orm';


export async function seedInitialData() {
  try {
    //check if there are existing products or not 
    //if there are we cannot seed
    const existingProducts = await db.select({ value: count() }).from(schema.products);
    const productCount = existingProducts[0].value;
    if (productCount > 0) {
      console.log('Products table is not empty. Skipping seeding.');
      return;
    } 

    // Insert the products seed data
    let insertedProducts: schema.Product[] = [];
    insertedProducts = await db.insert(schema.products).values(sampleProducts).returning();
    console.log('Product table successfully seeded!');

    // now seeding gift card codes
    // check if there are products or not
    if (insertedProducts.length > 0) {
      const existingGiftCodes = await db.select({ value: count() }).from(schema.giftCardCodes);
      const giftCodeCount = existingGiftCodes[0].value;

      //if no gift codes then 
      if (giftCodeCount === 0) {

        //generate gift codes for all products 
        //then we gift card codes which are in array format
        const giftCardCodesToInsert = generateSampleGiftCardCodes(insertedProducts);//passing inserted or seeded products

        // Batch insert the generated gift card codes
        await db.insert(schema.giftCardCodes).values(giftCardCodesToInsert);//insert 
        console.log('Gift Card Codes successfully seeded!');
      } else {
        console.log('Gift Card Codes table is not empty. Skipping gift code seeding.');
      }
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
    
  }finally{
    await pool.end();//close conn
    console.log('Connection closed. Script finished.');
  }
}

seedInitialData();
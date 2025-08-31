import { Request, Response } from 'express';
import { db } from '../../db'; 
import { giftCardCodes, orderItems, orders, products, users } from '../../db/schema';
import { and, eq, sql } from 'drizzle-orm';
import Stripe from "stripe";
import stripe from "../../config/stripe.config";
import { sendConfirmationEmail } from '../mail/mail.service';


const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET as string;

// This function will handle the successful payment event from Stripe
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  //match stripe signature with our webhook key(signature)
  try {
    // Use the raw body for verification
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session; //create stripe session

    // FULFILL THE ORDER
    const { userId, productId, quantity } = session.metadata!;
    const numericUserId = Number(userId);
    const numericProductId = Number(productId);
    const numericQuantity = Number(quantity);
    
    try {
      // create a transaction to ensure all database operations succeed or none do
      const deliveredCode = await db.transaction(async (tx) => {
              
        //  Find a specific, available gift card code for this product.
        // This is the most important check. We are no longer just checking a stock number.
        const availableCodes = await tx.query.giftCardCodes.findMany({
          where: and(
            eq(giftCardCodes.productId, numericProductId),
            eq(giftCardCodes.status, 'available')
          ),
          limit: numericQuantity, //fetch required quantity
        });

        //If no code is found, abort immediately. The user paid for nothing.
        if (availableCodes.length < numericQuantity) {
          throw new Error(`CRITICAL: Insufficient code inventory for product ${productId}. Payment must be refunded manually.`);
        }

        // Fetch the product details for the order item record.
        const product = await tx.query.products.findFirst({ where: eq(products.id, numericProductId) });
        if (!product) {
          throw new Error(`Product with ID ${productId} not found during fulfillment.`);
        }

        // Create the main order record.
        // Use the amount_total from the Stripe session as price.
        const [createdOrder] = await tx.insert(orders).values({
          userId: numericUserId,
          totalAmount: (session.amount_total! / 100).toString(),
          status: "completed",
        }).returning();

        // Create the line item for the order.
        await tx.insert(orderItems).values({
          orderId: createdOrder.id,
          productId: product.id,
          price: product.price, // Price at time of purchase
          quantity: numericQuantity,
        });

        // "Claim" the code by marking it as sold and linking it to the new order.
        //there are multiple gift codes if quantity > 1 
        for(const code of availableCodes){
          await tx.update(giftCardCodes).set({
            status:'sold',
            orderId: createdOrder.id,
          }).where(eq(giftCardCodes.id, code.id))
        }

        //Decrement the general stock count on the parent product.
        await tx.update(products).set({
          stock: sql`${products.stock} - ${numericQuantity}` 
        }).where(eq(products.id, product.id));

        // Return the gift  codes and product name from the transaction to be used for delivery.
        return { code: availableCodes.map( c=> c.code ), productName: product.name };
      });

      console.log(`Order fulfilled in DB. Preparing to deliver code for user ${userId}.`);
      
      // Deliver the code to the user via email.
      const user = await db.query.users.findFirst({ where: eq(users.id, numericUserId) });
      if (user?.email) {
        await sendConfirmationEmail(user.email, deliveredCode.productName, deliveredCode.code.join(", \n") ); 
      } else {
        throw new Error(`Could not find user or user email for userId ${userId} to send confirmation.`);
      }
    } catch (error: any) {
      console.error('Failed to fulfill order:', error.message);
      return res.status(500).json({ error: 'Failed to create order in database.' });
    }
  }

  // Acknowledge receipt of the event
  //this sends to 
  res.status(200).json({ received: true });
}




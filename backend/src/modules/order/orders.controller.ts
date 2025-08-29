import { Request, Response, NextFunction } from 'express';
import * as queries from '../../db/queries'; // Make sure the path to your queries is correct
import { MyUserType } from '../../types'; // Import your custom user type
import { db } from '../../db';
import { orderItems, orders, products } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { number } from 'zod';

/**
 * Handles the "Click and Buy" direct order creation.
 * It expects a productId and quantity in the request body.
 * It uses a transaction to create the order and update stock safely.
 */
export const handleCreateDirectOrder = async (req: Request, res: Response, next: NextFunction) => {
    const {productId: productString, quantity: quantityString} = req.params;
    const user = req.user as MyUserType;
    if (!user || !user.id) {
        return res.status(401).json({ error: 'User not authenticated or user data is missing.' });
    }

    const productId = Number(productString); //while changing to number it may also return NaN
    const quantity = Number(quantityString);
    if (!productString || !quantityString || isNaN(productId) || isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Product ID and a valid quantity are required. ' });
    }
    
    //creating new Order and reduce quantity from stock 
    try {
        //if some error in transaction whole process gets reverted
        const newOrder = await db.transaction(async (tx) =>{

            const productArray = await tx.select()//it could select mulitple rows so array
                .from(products)
                .where(eq(products.id, productId));// should be // eq(columnDataType,string)

            const product = productArray[0];
            if(product.stock < quantity){
                throw new Error("not enough stock ");
            }

            const price = Number(product.price);

            //create order
            const orderArray = await tx.insert(orders).values({
                userId: user.id,
                totalAmount: (price * quantity).toFixed(2),//makes it string
                status: "completed",
            }).returning();
            const createdOrder = orderArray[0];

            //create orderitem 
            const orderItemArray = await tx.insert(orderItems).values({
                orderId: createdOrder.id,//link to order
                productId: product.id,
                price: product.price,
                quantity:quantity
            }).returning();

            //update stock of product
            const newStock = product.stock - quantity;
            await tx.update(products).set({stock: newStock})
                .where(eq(products.id,productId));
        });
    } catch (error: any) {
        console.log(error.message);
        // Send an appropriate response to the client
        if (error.message === "not enough stock") {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};

/**
 * Fetches the complete order history for the currently logged-in user.
 * It includes all associated order items and product details for each order.
 */
export const handleGetUserOrders = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user as MyUserType;
    if (!user || !user.id) {
        return res.status(401).json({ error: 'User not authenticated or user data is missing.' });
    }

    try {
        const userOrders = await db.query.orders.findMany({
            where: eq(orders.userId, user.id),
            with: {
                orderItems: {
                    with: {
                        product: true//nested product details
                    },
                },
            },
        });
        if(!userOrders){
            return res.status(404).json({ message: "No orders found for this user." });
        }
        res.status(200).json(userOrders);
    } catch (error: any) {
        console.log(error.message);
        return res.status(500).json({ error: 'An unexpected error occurred.' });
    }
};



//extra notes //

// const userOrders = await db.query.orders.findMany({
//     where: eq(orders.userId, user.id),
//     with: {
//         orderItems: {
//             select:{//selects items quantity and price with 
//                 quantity:true,
//                 price: true,
//             },
//             with: {
//                 product: {//selects product name description
//                     select:{//specific selection
//                         name: true,
//                         description: true,
//                     },
//                 },
//             },
//         },
//     },
// });
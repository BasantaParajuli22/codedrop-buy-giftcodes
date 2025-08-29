import { Request, Response } from "express";
import stripe from "../../config/stripe.config";
import * as queries from '../../db/queries';
import { MyUserType } from '../../types'; // type for req.user

const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";

export async function createCheckoutSession(req: Request, res: Response): Promise<void> {
    const { productId: productString, quantity: quantityString } = req.body;
    const user = req.user as MyUserType; // Get authenticated user from Passport.js

    if (!user || !user.id) {
        res.status(401).json({ success: false, message: "User is not authenticated." });
        return;
    }

    const productId = Number(productString);
    const quantity = Number(quantityString);

    // validation
    if (!productString || isNaN(productId)) {
        res.status(400).json({ success: false, message: "A valid product ID is required." });
        return;
    }
    if (!quantityString || isNaN(quantity) || quantity <= 0) {
        res.status(400).json({ success: false, message: "A valid, positive quantity is required." });
        return;
    }

    try {
        const product = await queries.getProductById(productId);
        if (!product) {
            res.status(404).json({ success: false, message: "Product not found." });
            return;
        }

        if (product.stock < quantity) {
            res.status(400).json({ success: false, message: "Not enough items in stock." });
            return;
        }

        // The price from Drizzle's decimal type is a string, so we parse it
        const unitAmount = Math.round(parseFloat(product.price) * 100);

        const session = await stripe.checkout.sessions.create({
            mode: "payment",
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        unit_amount: unitAmount, // Price in cents

                        product_data: {
                            name: product.name,
                            description: product.description || undefined,
                        },
                    },
                    quantity: quantity,
                },
            ],
            // Store what you need to fulfill the order in metadata
            metadata: {
                userId: user.id.toString(),
                productId: product.id.toString(),
                quantity: quantity.toString(),
            },
            success_url: `${FRONTEND_BASE_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${FRONTEND_BASE_URL}/payment-cancelled`,
        });

        res.status(200).json({
            success: true,
            message: "Checkout session created successfully.",
            url: session.url,
        });

    } catch (error: any) {
        console.error("Stripe session creation error:", error.message);
        res.status(500).json({
            success: false,
            message: "Failed to create checkout session.",
            error: error.message,
        });
    }
}
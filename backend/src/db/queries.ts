import { db } from "../db/index";
import { Product } from "./schema";
import * as schema from './schema';
import { eq } from "drizzle-orm";

export const getAllProducts = async (): Promise<Product[]> => {
  return await db.query.products.findMany();
};

export const getProductById = async (id: number): Promise<Product | undefined> => {

  return await db.query.products.findFirst({
    where: eq(schema.products.id, id),
  });
};


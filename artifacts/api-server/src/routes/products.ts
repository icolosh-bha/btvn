import { Router } from "express";
import { db, productsTable } from "@workspace/db";
import { ilike, or } from "drizzle-orm";

const router = Router();

router.get("/products", async (req, res) => {
  const search = req.query["search"] as string | undefined;

  let products;
  if (search && search.trim()) {
    const term = `%${search.trim()}%`;
    products = await db
      .select()
      .from(productsTable)
      .where(or(ilike(productsTable.name, term), ilike(productsTable.description, term), ilike(productsTable.category, term)));
  } else {
    products = await db.select().from(productsTable);
  }

  res.json(products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    description: p.description,
    imageUrl: p.imageUrl,
    rating: p.rating,
    category: p.category,
  })));
});

export default router;

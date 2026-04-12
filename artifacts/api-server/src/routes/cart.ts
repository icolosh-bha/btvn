import { Router } from "express";
import { db, cartItemsTable, productsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.use(requireAuth);

async function buildCart(userId: number) {
  const items = await db
    .select()
    .from(cartItemsTable)
    .innerJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
    .where(eq(cartItemsTable.userId, userId));

  const cartItems = items.map(row => ({
    productId: row.cart_items.productId,
    quantity: row.cart_items.quantity,
    product: {
      id: row.products.id,
      name: row.products.name,
      price: row.products.price,
      description: row.products.description,
      imageUrl: row.products.imageUrl,
      rating: row.products.rating,
      category: row.products.category,
    },
  }));

  const total = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  return { items: cartItems, total: Math.round(total * 100) / 100 };
}

router.get("/cart", async (req, res) => {
  const cart = await buildCart(req.session!.userId);
  res.json(cart);
});

router.post("/cart/items", async (req, res) => {
  const { productId, quantity = 1 } = req.body as { productId?: number; quantity?: number };
  if (!productId) {
    res.status(400).json({ error: "productId is required" });
    return;
  }

  const userId = req.session!.userId;

  const [existing] = await db
    .select()
    .from(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)))
    .limit(1);

  if (existing) {
    await db
      .update(cartItemsTable)
      .set({ quantity: existing.quantity + quantity })
      .where(eq(cartItemsTable.id, existing.id));
  } else {
    await db.insert(cartItemsTable).values({ userId, productId, quantity });
  }

  const cart = await buildCart(userId);
  res.json(cart);
});

router.put("/cart/items/:productId", async (req, res) => {
  const productId = parseInt(req.params["productId"]!);
  const { quantity } = req.body as { quantity?: number };

  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "quantity must be at least 1" });
    return;
  }

  const userId = req.session!.userId;

  await db
    .update(cartItemsTable)
    .set({ quantity })
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  const cart = await buildCart(userId);
  res.json(cart);
});

router.delete("/cart/items/:productId", async (req, res) => {
  const productId = parseInt(req.params["productId"]!);
  const userId = req.session!.userId;

  await db
    .delete(cartItemsTable)
    .where(and(eq(cartItemsTable.userId, userId), eq(cartItemsTable.productId, productId)));

  const cart = await buildCart(userId);
  res.json(cart);
});

router.post("/cart/checkout", async (req, res) => {
  const { bankName, accountNumber, accountHolder } = req.body as {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };

  if (!bankName || !accountNumber || !accountHolder) {
    res.status(400).json({ error: "bankName, accountNumber, and accountHolder are required" });
    return;
  }

  const userId = req.session!.userId;
  await db.delete(cartItemsTable).where(eq(cartItemsTable.userId, userId));

  res.json({ message: "Payment successful! Your order has been placed." });
});

export default router;

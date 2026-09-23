import express from "express";
import db from "./db.js";

const router = express.Router();

router.get("/", (_req, res) => {
  const products = db
    .prepare(`
      SELECT id, name, description, price_cents AS priceCents, image
      FROM products
      WHERE active = 1
      ORDER BY id ASC
    `)
    .all();

  res.json(products);
});

router.get("/:id", (req, res) => {
  const product = db
    .prepare(`
      SELECT id, name, description, price_cents AS priceCents, image
      FROM products
      WHERE id = ? AND active = 1
    `)
    .get(Number(req.params.id));

  if (!product) return res.status(404).json({ error: "Produto não encontrado." });
  res.json(product);
});

export default router;
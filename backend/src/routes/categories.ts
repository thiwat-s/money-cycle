import { Router } from "express";
import { authenticate, getUserId } from "../middleware/authenticate.js";
import { Category } from "../models/Category.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const categories = await Category.find({ userId: getUserId(req) }).sort({ order: 1, name: 1 });
  res.json(categories);
});

router.post("/", async (req, res) => {
  try {
    const category = await Category.create({
      userId: getUserId(req),
      name: req.body.name,
      color: req.body.color,
      order: req.body.order
    });
    res.status(201).json(category);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }
    throw error;
  }
});

router.put("/:id", async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: getUserId(req) },
      { name: req.body.name, color: req.body.color, order: req.body.order },
      { new: true, runValidators: true }
    );

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    res.json(category);
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({ message: "Category already exists" });
      return;
    }
    throw error;
  }
});

router.delete("/:id", async (req, res) => {
  const category = await Category.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
  if (!category) {
    res.status(404).json({ message: "Category not found" });
    return;
  }

  res.status(204).send();
});

export default router;

import { Router } from "express";
import { authenticate, getUserId } from "../middleware/authenticate.js";
import { Category } from "../models/Category.js";
import { Transaction } from "../models/Transaction.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const filter: Record<string, unknown> = { userId: getUserId(req) };
  if (req.query.cycleId) filter.cycleId = req.query.cycleId;

  const transactions = await Transaction.find(filter).sort({ date: -1 });
  res.json(transactions);
});

router.post("/", async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ message: "Amount must be greater than zero" });
    return;
  }

  if (req.body.type === "transfer") {
    if (!req.body.transferToAccountId) {
      res.status(400).json({ message: "Transfer destination account is required" });
      return;
    }

    if (req.body.transferToAccountId === req.body.accountId) {
      res.status(400).json({ message: "Transfer destination must be different from source account" });
      return;
    }
  }

  if (req.body.category) {
    const category = await Category.exists({ userId: getUserId(req), name: req.body.category });
    if (!category) {
      res.status(400).json({ message: "Category must exist in category master" });
      return;
    }
  }

  const transaction = await Transaction.create({
    userId: getUserId(req),
    cycleId: req.body.cycleId,
    accountId: req.body.accountId,
    type: req.body.type,
    amount,
    category: req.body.category,
    note: req.body.note,
    date: req.body.date,
    transferToAccountId: req.body.transferToAccountId
  });
  res.status(201).json(transaction);
});

router.put("/:id", async (req, res) => {
  const amount = Number(req.body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ message: "Amount must be greater than zero" });
    return;
  }

  if (req.body.type === "transfer") {
    if (!req.body.transferToAccountId) {
      res.status(400).json({ message: "Transfer destination account is required" });
      return;
    }

    if (req.body.transferToAccountId === req.body.accountId) {
      res.status(400).json({ message: "Transfer destination must be different from source account" });
      return;
    }
  }

  if (req.body.category) {
    const category = await Category.exists({ userId: getUserId(req), name: req.body.category });
    if (!category) {
      res.status(400).json({ message: "Category must exist in category master" });
      return;
    }
  }

  const update =
    req.body.type === "transfer"
      ? {
          $set: {
            cycleId: req.body.cycleId,
            accountId: req.body.accountId,
            type: req.body.type,
            amount,
            category: req.body.category,
            note: req.body.note,
            date: req.body.date,
            transferToAccountId: req.body.transferToAccountId
          }
        }
      : {
          $set: {
            cycleId: req.body.cycleId,
            accountId: req.body.accountId,
            type: req.body.type,
            amount,
            category: req.body.category,
            note: req.body.note,
            date: req.body.date
          },
          $unset: { transferToAccountId: "" }
        };

  const transaction = await Transaction.findOneAndUpdate(
    { _id: req.params.id, userId: getUserId(req) },
    update,
    { new: true, runValidators: true }
  );

  if (!transaction) {
    res.status(404).json({ message: "Transaction not found" });
    return;
  }

  res.json(transaction);
});

router.delete("/:id", async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
  if (!transaction) {
    res.status(404).json({ message: "Transaction not found" });
    return;
  }

  res.status(204).send();
});

export default router;

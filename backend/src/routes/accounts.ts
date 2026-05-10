import { Router } from "express";
import { authenticate, getUserId } from "../middleware/authenticate.js";
import { Account } from "../models/Account.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req, res) => {
  const accounts = await Account.find({ userId: getUserId(req) }).sort({ order: 1 });
  res.json(accounts);
});

router.post("/", async (req, res) => {
  const account = await Account.create({
    userId: getUserId(req),
    name: req.body.name,
    color: req.body.color,
    order: req.body.order
  });
  res.status(201).json(account);
});

router.put("/:id", async (req, res) => {
  const account = await Account.findOneAndUpdate(
    { _id: req.params.id, userId: getUserId(req) },
    { name: req.body.name, color: req.body.color, order: req.body.order },
    { new: true, runValidators: true }
  );

  if (!account) {
    res.status(404).json({ message: "Account not found" });
    return;
  }

  res.json(account);
});

router.delete("/:id", async (req, res) => {
  const account = await Account.findOneAndDelete({ _id: req.params.id, userId: getUserId(req) });
  if (!account) {
    res.status(404).json({ message: "Account not found" });
    return;
  }

  res.status(204).send();
});

export default router;

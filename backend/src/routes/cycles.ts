import { Router } from "express";
import { authenticate, getUserId } from "../middleware/authenticate.js";
import { Account } from "../models/Account.js";
import { Cycle } from "../models/Cycle.js";
import { User } from "../models/User.js";
import { getCurrentCycleDates } from "../utils/payDate.js";

const router = Router();

router.use(authenticate);

type AllocationInput = {
  accountId: string;
  amount: number;
};

function normalizeAllocations(allocations: AllocationInput[] = []) {
  return allocations.map((allocation) => ({
    accountId: allocation.accountId,
    amount: Number(allocation.amount)
  }));
}

function allocationTotal(allocations: AllocationInput[] = []) {
  return allocations.reduce((sum, allocation) => sum + Number(allocation.amount || 0), 0);
}

function hasInvalidAllocation(allocations: AllocationInput[] = []) {
  return allocations.some((allocation) => !allocation.accountId || !Number.isFinite(Number(allocation.amount)) || Number(allocation.amount) < 0);
}

router.get("/", async (req, res) => {
  const cycles = await Cycle.find({ userId: getUserId(req) }).sort({ startDate: -1 });
  res.json(cycles);
});

router.get("/current", async (req, res) => {
  const user = await User.findById(getUserId(req));
  const { startDate, endDate } = getCurrentCycleDates(new Date(), user?.settings?.payDay ?? 21);
  const cycle = await Cycle.findOne({
    userId: getUserId(req),
    startDate: { $lte: new Date() },
    endDate: { $gte: new Date() }
  });

  res.json(cycle ?? { startDate, endDate, salary: 0, allocations: [] });
});

router.post("/", async (req, res) => {
  const user = await User.findById(getUserId(req));
  const { startDate, endDate } = getCurrentCycleDates(req.body.date ? new Date(req.body.date) : new Date(), user?.settings?.payDay ?? 21);
  const salary = Number(req.body.salary);
  let allocations = normalizeAllocations(req.body.allocations ?? []);

  if (!Number.isFinite(salary) || salary < 0) {
    res.status(400).json({ message: "Salary must be a positive number" });
    return;
  }

  if (allocations.length === 0 && salary > 0) {
    const defaultAccount = await Account.findOne({ userId: getUserId(req) }).sort({ order: 1, createdAt: 1 });
    if (defaultAccount) {
      allocations = [{ accountId: defaultAccount._id.toString(), amount: salary }];
    }
  }

  if (allocationTotal(allocations) > salary) {
    res.status(400).json({ message: "Total allocations cannot exceed cycle salary" });
    return;
  }

  if (hasInvalidAllocation(allocations)) {
    res.status(400).json({ message: "Each allocation must have an account and a non-negative amount" });
    return;
  }

  const cycle = await Cycle.findOneAndUpdate(
    { userId: getUserId(req), startDate },
    {
      userId: getUserId(req),
      startDate,
      endDate,
      salary,
      allocations
    },
    { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true }
  );

  res.status(201).json(cycle);
});

router.put("/:id/allocations", async (req, res) => {
  const existing = await Cycle.findOne({ _id: req.params.id, userId: getUserId(req) });
  if (!existing) {
    res.status(404).json({ message: "Cycle not found" });
    return;
  }

  const allocations = normalizeAllocations(req.body.allocations ?? []);
  if (allocationTotal(allocations) > existing.salary) {
    res.status(400).json({ message: "Total allocations cannot exceed cycle salary" });
    return;
  }

  if (hasInvalidAllocation(allocations)) {
    res.status(400).json({ message: "Each allocation must have an account and a non-negative amount" });
    return;
  }

  const cycle = await Cycle.findOneAndUpdate(
    { _id: req.params.id, userId: getUserId(req) },
    { allocations },
    { new: true, runValidators: true }
  );

  if (!cycle) {
    res.status(404).json({ message: "Cycle not found" });
    return;
  }

  res.json(cycle);
});

export default router;

import { Schema, model, Types, type InferSchemaType } from "mongoose";

const transactionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    cycleId: { type: Schema.Types.ObjectId, ref: "Cycle", required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    type: { type: String, enum: ["expense", "transfer", "income"], required: true },
    amount: { type: Number, required: true, min: 0 },
    category: { type: String, default: "" },
    note: { type: String, default: "" },
    date: { type: Date, default: Date.now },
    transferToAccountId: { type: Schema.Types.ObjectId, ref: "Account" }
  },
  { timestamps: true }
);

transactionSchema.index({ userId: 1, cycleId: 1, date: -1 });

export type TransactionDocument = InferSchemaType<typeof transactionSchema> & { _id: Types.ObjectId };
export const Transaction = model("Transaction", transactionSchema);

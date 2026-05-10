import { Schema, model, Types, type InferSchemaType } from "mongoose";

const allocationSchema = new Schema(
  {
    accountId: { type: Schema.Types.ObjectId, ref: "Account", required: true },
    amount: { type: Number, required: true, min: 0 }
  },
  { _id: false }
);

const cycleSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    salary: { type: Number, required: true, min: 0 },
    allocations: { type: [allocationSchema], default: [] }
  },
  { timestamps: true }
);

cycleSchema.index({ userId: 1, startDate: -1 });

export type CycleDocument = InferSchemaType<typeof cycleSchema> & { _id: Types.ObjectId };
export const Cycle = model("Cycle", cycleSchema);

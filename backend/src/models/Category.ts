import { Schema, model, Types, type InferSchemaType } from "mongoose";

const categorySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#64748B" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, order: 1 });

export type CategoryDocument = InferSchemaType<typeof categorySchema> & { _id: Types.ObjectId };
export const Category = model("Category", categorySchema);

import { Schema, model, Types, type InferSchemaType } from "mongoose";

const accountSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    color: { type: String, default: "#1976D2" },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

accountSchema.index({ userId: 1, order: 1 });

export type AccountDocument = InferSchemaType<typeof accountSchema> & { _id: Types.ObjectId };
export const Account = model("Account", accountSchema);

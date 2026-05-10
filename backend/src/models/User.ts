import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    googleId: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true },
    name: { type: String, required: true },
    settings: {
      payDay: { type: Number, default: 21, min: 1, max: 31 }
    }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export type UserDocument = InferSchemaType<typeof userSchema>;
export const User = model("User", userSchema);

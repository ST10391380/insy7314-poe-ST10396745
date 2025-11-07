import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  accountNumber: { type:String, required:true },
  amount: { type:Number, required:true },
  currency: { type:String, required:true },
  swift: { type:String, required:true },
  status: { type:String, default:"PENDING" },
  verifiedAt: Date,
  submittedAt: Date
}, { timestamps:true });

export default mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

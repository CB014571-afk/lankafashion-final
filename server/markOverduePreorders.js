// Script to mark preorders as overdue if paymentDueDate has passed and not paid
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PreOrderRequest = require("./models/PreOrderRequest");
dotenv.config();

async function markOverdue() {
  await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const now = new Date();
  const result = await PreOrderRequest.updateMany(
    {
      paymentOption: "pay_later",
      paid: false,
      paymentDueDate: { $lt: now },
      status: { $ne: "overdue" },
    },
    { $set: { status: "overdue" } }
  );
  console.log(`Marked ${result.modifiedCount} preorders as overdue.`);
  await mongoose.disconnect();
}

markOverdue().catch(err => {
  console.error(err);
  process.exit(1);
});

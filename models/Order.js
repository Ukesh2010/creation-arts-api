const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  items: [
    {
      product: { type: Schema.Types.ObjectID, ref: "Product" },
      quantity: Number,
      total_amount: Number,
    },
  ],
  total_amount: Number,
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  paypal_order_id: String,
});

const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;

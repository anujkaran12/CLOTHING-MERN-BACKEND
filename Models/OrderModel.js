const mongoose = require("mongoose");
const orderschema = mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "userModel",
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "userModel",
    },
    quantity: {
      type: Number,
      require: true,
    },
    size: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    price: {
      type: Number,
      require: true,
    },
    totalAmount: {
      type: Number,
      require: true,
    },
    color: {
      type: String,
      require: true,
      trim: true,
      lowercase: true,
    },
    address: {
      type: String,
      require: true,
      trim: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      require: true,
      ref: "productModel",
    },
    paymentMode: {
      type: String,
      require: true,
      enum: ["COD", "STRIPE"],
    },
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const orderModel = mongoose.model("orderModel", orderschema);

module.exports = { orderModel };

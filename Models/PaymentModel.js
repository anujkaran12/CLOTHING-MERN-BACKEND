const { default: mongoose } = require("mongoose");

const paymentSchema = mongoose.Schema({
  paymentID: {
    type: String,
    require: true,
    unique: true,
  },
  orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "orderModel",
      require: true,
    },
  ],
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "userModel",
    require: true,
  },
});

const paymentModel = mongoose.model("paymentModel", paymentSchema);

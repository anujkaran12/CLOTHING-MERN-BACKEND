const mongose = require("mongoose");

const userSchema = new mongose.Schema(
  {
    fullName: {
      type: String,
      require: true,
      trim: true,
    },
    avatar: {
      secure_url: {
        type: String,
      },
      public_id: {
        type: String,
      },
    },
    email: {
      type: String,
      require: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      require: true,
      enum: ["buyer", "admin", "seller"],
      default: "buyer",
      trim: true,
    },
    cart: [
      {
        _id: false,
        product: {
          type: mongose.Schema.Types.ObjectId,
          ref: "productModel",
        },
        quantity: {
          type: Number,
        },
        size: {
          type: String,
          trim: true,
        },
      },
    ],
    wishlist: [
      {
        _id: false,
        type: mongose.Schema.Types.ObjectId,
        ref: "productModel",
      },
    ],
    mobile: {
      type: Number,
      require: true,
      length: 10,
    },
    address: {
      type: String,
      require: true,
    },
    provider: {
      type: String,
      enum: ["email&password", "google"],
      default: "email&password",
      require: true,
    },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpiresAt: { type: Date, default: null },
  },
  { timestamps: true }
);
const userModel = mongose.model("userModel", userSchema);
module.exports = userModel;

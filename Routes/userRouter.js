const express = require("express");
const { sendUserInfo, updateProfile } = require("../Controller/userController");
const {
  addToWishlist,
  removeFromWishlist,
  fetchWishlist,
} = require("../Controller/wishlistController");
const {
  addToCart,
  removeFromCart,
  fetchCart,
  checkCartAvailability,
} = require("../Controller/cartController");
const { placeOrder, fetchOrders } = require("../Controller/orderController");
const multer = require("multer");

const userRouter = express.Router();

const path = require("path");
const fs = require("fs");
// or diskStorage
const storage = multer.memoryStorage();

const upload = multer({ storage });

userRouter.get("/info", sendUserInfo);
userRouter.post(
  "/info",
  upload.fields([{ name: "avatar", maxCount: 1 }]),
  updateProfile
);

userRouter.get("/cart", fetchCart);
userRouter.post("/cart", addToCart);
userRouter.post("/cart/check",checkCartAvailability)
userRouter.delete("/cart", removeFromCart);

userRouter.get("/wishlist", fetchWishlist);
userRouter.post("/wishlist", addToWishlist);
userRouter.delete("/wishlist", removeFromWishlist);

userRouter.post("/place-order", placeOrder);
userRouter.get("/orders", fetchOrders);

module.exports = { userRouter };

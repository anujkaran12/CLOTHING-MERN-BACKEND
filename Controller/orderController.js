const { default: mongoose } = require("mongoose");
const { orderModel } = require("../Models/OrderModel");
const userModel = require("../Models/UserModel");
const productModel = require("../Models/ProductModel");

const placeOrder = async (req, res) => {
  try {
    const { cartProducts, address, paymentMode } = req.body;
    const user_id = req.id;

    const ordersToAddDB = cartProducts.map((item) => {
      return {
        product: item.product._id,
        quantity: item.quantity,
        size: item.size,
        color: item.product.color,
        price: item.product.discountPrice,
        totalAmount: item.product.discountPrice * item.quantity,
        buyer: user_id,
        seller: item.product.seller,
        address: address,
        paymentMode: paymentMode,
      };
    });

    const order = await orderModel.insertMany(ordersToAddDB);

    if (!order) {
      return res.status(400).send("Unable to place orders");
    }

    const stockUpdates = cartProducts.map((item) => {
      return productModel.findByIdAndUpdate(
        item.product._id,
        {
          $inc: { [`sizes.${(item.size).toUpperCase()}`]: -item.quantity }, // reduce stock
        },
        { new: true }
      );
    });

    await Promise.all(stockUpdates);

    await userModel.findByIdAndUpdate(user_id, {
      $set: {
        cart: [],
      },
    });

    return res.status(200).send("Order placed successfully");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
const fetchOrders = async (req, res) => {
  try {
    console.log("Fetch order run");
    const user_id = req.id;

    const orders = await orderModel.aggregate([
      {
        $match: { buyer: new mongoose.Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: "productmodels",
          foreignField: "_id",
          localField: "product",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "usermodels",
          foreignField: "_id",
          localField: "buyer",
          as: "buyer",
        },
      },
      {
        $unwind: "$buyer",
      },

      {
        $lookup: {
          from: "usermodels",
          foreignField: "_id",
          localField: "seller",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
    ]);

    return res.status(200).send(orders);
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
module.exports = { placeOrder, fetchOrders };

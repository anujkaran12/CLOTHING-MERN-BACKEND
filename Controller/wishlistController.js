const { default: mongoose } = require("mongoose");
const userModel = require("../Models/UserModel");

const fetchWishlist = async (req, res) => {
  try {
    console.log("wishlist fetch run");
    const user_id = req.id;
    const user = await userModel.aggregate([
      {
        $match: { _id: new mongoose.Types.ObjectId(user_id) },
      },
      {
        $lookup: {
          from: "productmodels",
          localField: "wishlist",
          foreignField: "_id",
          as: "wishlist",
        },
      },
    ]);

    return res.status(200).send(user[0].wishlist);
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    console.log("wishlist - ", productId);
    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.id,
        {
          $addToSet: { wishlist: productId },
        },
        {
          new: true,
        }
      )
      .populate("wishlist");
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    return res.status(200).send(updatedUser.wishlist);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).send("Internal server error");
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(401).send("Field is missing");
    }
    const updatedUser = await userModel
      .findByIdAndUpdate(
        req.id,
        {
          $pull: { wishlist: productId },
        },
        {
          new: true,
        }
      )
      .populate("wishlist");
    if (!updatedUser) {
      return res.status(404).send("User not found");
    }
    return res.status(200).send(updatedUser.wishlist);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).send("Internal server error");
  }
};

module.exports = { addToWishlist, removeFromWishlist, fetchWishlist };

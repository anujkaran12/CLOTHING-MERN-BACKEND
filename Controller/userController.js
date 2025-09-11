const { default: mongoose } = require("mongoose");
const userModel = require("../Models/UserModel");
const { uploadOnCloudnary } = require("../utility/cloudnaryUploader");
const { cloudnaryDeleteImage } = require("../utility/cloudnaryDeleteImage");

const sendUserInfo = async (req, res) => {
  try {
    console.log("user info run");
    const user_id = req.id;

    // const userInfo = await userModel.aggregate([
    //   {
    //     $match: { _id: new mongoose.Types.ObjectId(user_id) },
    //   },
    //   {
    //     $unwind: "$cart",
    //   },
    //   {
    //     $lookup: {
    //       from: "productmodels",
    //       localField: "cart.product",
    //       foreignField: "_id",
    //       as: "cartProducts",
    //     },
    //   },
    //   {
    //     $unwind: "$cartProducts",
    //   },

    //   {
    //     $addFields: {
    //       "cart.product": "$cartProducts",
    //     },
    //   },
    //   {
    //     $group: {
    //       _id: "$_id",
    //       fullName: { $first: "$fullName" },
    //       email: { $first: "$email" },
    //       address: { $first: "$address" },
    //       role: { $first: "$role" },
    //       mobile: { $first: "$mobile" },
    //       cart: { $push: "$cart" },
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: "productmodels",
    //       localField: "wishlist",
    //       foreignField: "_id",
    //       as: "wishlist",
    //     },
    //   },

    //   {
    //     $project: {
    //       password: 0,
    //       cartProducts: 0,
    //     },
    //   },
    // ]);
    const userInfo = await userModel.findById(user_id).populate("cart.product wishlist");
    if (!userInfo) {
      return res.status(400).send("unable to get user info");
    }
    return res.status(200).send(userInfo);
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};

const updateProfile = async (req, res) => {
  try {
    const user_id = req.id;
    
    const { fullName, email, address, mobile } = req.body;
  

    let avatar = req.files.avatar;
    
    let user = await userModel.findById(user_id);

    
    if (avatar) {
      if (user.avatar?.public_id) {
        await cloudnaryDeleteImage(user.avatar.public_id);
      }
      const profileImage = (await uploadOnCloudnary(avatar))[0];
      avatar = profileImage;
    }

    const updateUser = {};
    if (fullName) updateUser.fullName = fullName;
    if (email) updateUser.email = email;
    if (address) updateUser.address = address;
    if (mobile) updateUser.mobile = mobile;
    if (avatar) updateUser.avatar = avatar;

    await userModel.findByIdAndUpdate(user_id, {
      $set: updateUser,
    });

    return res.status(200).send("User updated");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};

module.exports = {
  sendUserInfo,
  updateProfile,
};

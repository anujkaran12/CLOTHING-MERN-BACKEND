const { default: mongoose } = require("mongoose");
const productModel = require("../Models/ProductModel");

const fetchSingleProduct = async (req, res) => {
  try {
    console.log("single product fetch run");
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).send( "Invalid product ID");
    }

    const productDetail = await productModel.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $lookup: {
          from: "usermodels",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: "$seller",
      },
      {
        $project: {
          "seller.password": 0,
        },
      },
    ]);
   
   return res.status(200).send(productDetail[0]);
  } catch (error) {
    console.log(error);
    res.status(502).send("Internal server error");
  }
};

const fetchAllProducts = async (req, res) => {
  console.log("All products fetch");
  try {
    const products = await productModel.find();

    if (!products) {
      return res.status(400).send("Unable to get any product");
    }
    return res.status(200).send(products);
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
module.exports = { fetchSingleProduct, fetchAllProducts };

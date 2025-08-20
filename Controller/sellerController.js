const { default: mongoose } = require("mongoose");
const productModel = require("../Models/ProductModel");
const { uploadOnCloudnary } = require("../utility/cloudnaryUploader");
const { orderModel } = require("../Models/OrderModel");

const addProduct = async (req, res) => {
  // console.log(req.files);

  let {
    title,
    description,
    category,
    subCategory,
    price,
    discountPrice,
    sizes,
    color,
    brand,
    material,
  } = req.body;

  sizes = JSON.parse(sizes);

  if (
    !title ||
    !description ||
    !category ||
    !subCategory ||
    !price ||
    !discountPrice ||
    !color ||
    !brand ||
    !material
  ) {
    return res.status(401).send("Provide all fields");
  }
  console.log(req.body);
  try {
    const thumbnail = (await uploadOnCloudnary(req.files.thumbnail))[0];
    const galleryImages = await uploadOnCloudnary(req.files.gallery);
    // console.log(req.files)

    const result = await productModel.create({
      title,
      description,
      category,
      subCategory,
      price,
      discountPrice,
      sizes,
      color,
      brand,
      material,
      seller: req.id,
      thumbnail,
      galleryImages,
    });
    if (!result) {
      return res.status(404).send("Unable to add product");
    }
    return res.status(200).send("Product added successfully");
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

const removeProduct = async (req, res) => {
  try {
    const { product_id } = req.body;
    const result = await productModel.deleteOne({ _id: product_id });
    if (!result) {
      return res.status(400).send("Unable to delete product");
    }
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

const getAllProducts = async (req, res) => {
  try {
    console.log("get all products run");
    const user_id = new mongoose.Types.ObjectId(req.id);
    const products = await productModel.aggregate([
      {
        $match: {
          seller: user_id,
        },
      },
    ]);

    return res.status(200).send(products);
  } catch (error) {
    return res.status(500).send("Internal server error");
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    if ((!orderId, !status)) {
      return res.status(401).send("OrderId and status required");
    }
    const order = await orderModel.findOneAndUpdate(new mongoose.Types.ObjectId(orderId), {
      $set: { status: status },
    });

    if (!order) {
      return res.status(400).send("Unable to update status");
    }
    return res.status(200).send("Status update successfully");
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};

module.exports = { addProduct, getAllProducts, removeProduct, updateOrderStatus };

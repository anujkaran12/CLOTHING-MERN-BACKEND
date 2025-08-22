const productModel = require("../Models/ProductModel");
const userModel = require("../Models/UserModel");

const fetchCart = async (req, res) => {
  try {
    console.log("fetch cart");
    const user_id = req.id;
    const user = await userModel.findById(user_id).populate("cart.product");
    if (!user) {
      return res.status(400).send("User not found");
    }

    return res.status(200).send(user.cart || []);
  } catch (error) {
    console.log(error);
    return res.status(502).send("Internal server error");
  }
};
const addToCart = async (req, res) => {
  console.log("add to cart");
  
  try {
    const { productId, quantity, size } = req.body;
    if (!productId.trim() || !quantity || !size.trim()) {
      return res.status(401).send("Field mmissing for add to cart");
    }
    const user_id = req.id;
    const user = await userModel.findById(user_id);
    const product = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (product) {
      product.quantity = quantity;
      product.size = size;
    } else {
      user.cart.push({ product: productId, quantity, size });
    }

    await user.save();

    const populatedUser = await userModel
      .findById(user_id)
      .populate("cart.product");

    return res.status(200).send(populatedUser.cart);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

const removeFromCart = async (req, res) => {
  console.log("Remove from cart");
  try {
    const { productId } = req.body;

    const user_id = req.id;
    const user = await userModel
      .findByIdAndUpdate(
        user_id,
        {
          $pull: { cart: { product: productId } },
        },
        {
          new: true,
        }
      )
      .populate("cart.product");

    return res.status(200).send(user.cart);
  } catch (error) {
    console.log(error);
    return res.status(500).send("Internal server error");
  }
};

// Check availability of all products in cart
const checkCartAvailability = async (req, res) => {
  try {
    let unavailableItems = [];
    
    const { cartProductsToBeChecked } = req.body;
    for (const item of cartProductsToBeChecked) {
      const product = await productModel.findById(item.productId);

      const availableQty = product.sizes.get(item.size.toUpperCase());

      if (availableQty === undefined) {
        unavailableItems.push({
          ...item,
          status: "Size not available",
        });
        continue;
      }

      if (availableQty < item.quantity) {
        unavailableItems.push({
          ...item,
          status: `Only ${availableQty} left`,
        });
      }
    }

    return res.status(200).send(unavailableItems);
  } catch (err) {
    console.log(err);
    return res.status(200).send("Internal server error");
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  fetchCart,
  checkCartAvailability,
};

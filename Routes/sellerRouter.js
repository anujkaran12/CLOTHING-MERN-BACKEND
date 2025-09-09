const express = require("express");
const multer = require("multer");
const {
  addProduct,
  removeProduct,
  getAllProducts,
  updateOrderStatus,
  updateProduct,
  fetchOrdersSeller,
} = require("../Controller/sellerController");
const { sellerValidator } = require("../Validator/sellerValidator");

const sellerRouter = express.Router();

const path = require("path");
const fs = require("fs");

// or diskStorage
const storage = multer.memoryStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname,'..', "uploads");
    // Check if folder exists — if not, create it
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

sellerRouter.use(sellerValidator);
sellerRouter.post(
  "/addProduct",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
    { name: "gallery", maxCount: 3 },
  ]),
  addProduct
);
sellerRouter.delete("/removeProduct", removeProduct);
sellerRouter.get("/getAllProducts", getAllProducts);

sellerRouter.get("/orders", fetchOrdersSeller);
sellerRouter.put("/orders", updateOrderStatus);

sellerRouter.post('/updateProduct/:productId',updateProduct)

module.exports = { sellerRouter };

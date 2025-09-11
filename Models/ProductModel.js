const mongose = require("mongoose");

const productSchema = mongose.Schema(
  {
    title: {
      type: String,
      require: true,
      lowercase: true,
    },
    description: {
      type: String,
      require: true,
      lowercase: true,
    },
    price: {
      type: Number,
      require: true,
    },
    discountPrice: {
      type: Number,
      require: true,
      default: 0,
    },
    category: {
      type: String,
      require: true,
      lowercase: true,
    },
    subCategory: {
      type: String,
      require: true,
      lowercase: true,
    },
    thumbnail: {
      public_id: {
        type: String,
        require: true,
      },
      secure_url: {
        type: String,
        require: true,
      },
    },
    galleryImages: [
      {
        public_id: {
          type: String,
          require: true,
        },
        secure_url: {
          type: String,
          require: true,
        },
      },
    ],
    sizes: {
      type: Map,
      of: Number,
      default: {},
    },
    color: {
      type: String,
      require: true,
      lowercase: true,
    },
    material: {
      type: String,
      require: true,
      lowercase: true,
    },
    brand: {
      type: String,
      require: true,
      lowercase: true,
    },

    seller: {
      type: mongose.Schema.Types.ObjectId,
      ref: "userModel",
      require: true,
    },
  },
  { timestamps: true }
);

const productModel = mongose.model("productModel", productSchema);
module.exports = productModel;

const { v2 } = require("cloudinary");
const fs = require("fs");
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const cloudnaryDeleteImage = async (publicId) => {
  try {
    const result = await v2.uploader.destroy(publicId);
    console.log("Deleted =>", result);
    return result;
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
};

module.exports = {cloudnaryDeleteImage}
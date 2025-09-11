const streamifier = require("streamifier");
const { v2 } = require("cloudinary");
const fs = require("fs");
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudnary = async (imgArray) => {
  try {
    if (!imgArray) {
      return null;
    }
    //get all files in promises | didn't use await
    const uploadPromises = imgArray.map((img, i) =>
      v2.uploader.upload(img.path)
    );
    const result = await Promise.all(uploadPromises);
    const fileUrls = result.map((uploadedImage) => {
      return {
        secure_url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    });
    //now unlik the images from local upload folder
    imgArray.forEach((img) => {
      fs.unlinkSync(img.path);
    });
    return fileUrls;
  } catch (error) {
    console.log(error);
    imgArray.forEach((img) => {
      fs.unlinkSync(img.path);
    });
    return null;
  }
};
module.exports = { uploadOnCloudnary };

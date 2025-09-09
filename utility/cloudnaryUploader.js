const { v2 } = require("cloudinary");
const fs = require("fs");
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudnary = async (imgArray) => {
  try {
    if (!imgArray) return null;

    // ensure imgArray is always an array (single upload can also be passed)
    if (!Array.isArray(imgArray)) imgArray = [imgArray];

    const uploadPromises = imgArray.map((img) => {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          
          (error, result) => {
            if (result) resolve({
              secure_url: result.secure_url,
              public_id: result.public_id
            });
            else reject(error);
          }
        );
        // Pipe the buffer into Cloudinary stream
        streamifier.createReadStream(img.buffer).pipe(uploadStream);
      });
    });

    const result = await Promise.all(uploadPromises);
    return result; // array of {secure_url, public_id}
  } catch (error) {
    console.log('Cloud upload error:', error);
    return null;
  }
};

module.exports = { uploadOnCloudnary };

const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary Configuration
 * Cloudinary is chosen for production because:
 * 1. Automatic image optimization and transformation
 * 2. CDN delivery for faster loading
 * 3. Scalable storage without server disk space concerns
 * 4. Built-in backup and redundancy
 * 5. No need to manage file system permissions
 * 
 * For development, local storage is recommended to avoid API costs.
 */

if (process.env.UPLOAD_METHOD === 'cloudinary') {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload image buffer to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folder = 'campus-issues') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { width: 1200, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' }
        ]
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      }
    );
    
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};

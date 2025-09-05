/**
 * Utility functions for handling product images
 */

/**
 * Constructs the full URL for a product image
 * @param {string} imagePath - The image path from the backend
 * @returns {string} - The full URL for the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If imagePath already includes the full URL, use it as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, construct the full URL
  return `http://localhost:3000/${imagePath}`;
};

/**
 * Processes a product object to ensure all image URLs are properly constructed
 * @param {Object} product - The product object
 * @returns {Object} - The product object with processed image URLs
 */
export const processProductImages = (product) => {
  if (!product || !product.images) {
    return product;
  }
  
  return {
    ...product,
    images: product.images.map(getImageUrl).filter(Boolean) // Filter out null/undefined URLs
  };
};

/**
 * Processes an array of products to ensure all image URLs are properly constructed
 * @param {Array} products - Array of product objects
 * @returns {Array} - Array of product objects with processed image URLs
 */
export const processProductsImages = (products) => {
  if (!Array.isArray(products)) {
    return products;
  }
  
  return products.map(processProductImages);
};

/**
 * Gets the first available image URL for a product
 * @param {Object} product - The product object
 * @returns {string|null} - The first image URL or null if no images
 */
export const getFirstImageUrl = (product) => {
  if (!product || !product.images || product.images.length === 0) {
    return null;
  }
  
  return getImageUrl(product.images[0]);
};

/**
 * Gets all image URLs for a product
 * @param {Object} product - The product object
 * @returns {Array} - Array of image URLs
 */
export const getAllImageUrls = (product) => {
  if (!product || !product.images) {
    return [];
  }
  
  return product.images.map(getImageUrl).filter(Boolean);
};

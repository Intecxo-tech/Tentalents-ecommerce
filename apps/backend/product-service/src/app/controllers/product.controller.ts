import { Request, Response, NextFunction } from 'express';
import { productService } from '../services/product.service';
import { sendSuccess } from '@shared/utils';
import { produceKafkaEvent } from '@shared/kafka';
import { PrismaClient } from '@prisma/client';
/**
 * Helper to get userId or send 401 if missing
 */const prisma = new PrismaClient();
function getUserIdOrThrow(req: Request, res: Response): string | undefined {
  if (!req.user) {
    res.status(401).json({ message: 'Unauthorized: User not found' });
    return undefined;
  }
  return req.user.userId;
}

/**
 * 📦 Create a new product
 */
export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdOrThrow(req, res);
    if (!userId) return;

    // Find vendorId by userId
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found for user' });
    }

    const {
      title,
      description,
      category,
      subCategory,
      images,
      sku,
      price,
      originalPrice,
      stock,
      unit,
      itemWeight,
      packageLength,
      packageWidth,
      packageHeight,
      deliveryEta,
      variants,
      brand,
      includedComponents,
      numberOfItems,
      enclosureMaterial,
      productCareInstructions,
      productFeatures,
    } = req.body;

    // Input validation should be added here before continuing

    const product = await productService.createProduct({
      title,
      description,
      category,
      subCategory,
      images,
      sku,
      price,
      originalPrice,
      stock,
      unit,
      itemWeight,
      packageLength,
      packageWidth,
      packageHeight,
      deliveryEta,
      variants,
      brand,
      includedComponents,
      numberOfItems,
      enclosureMaterial,
      productCareInstructions,
      productFeatures,
      vendorId: vendor.id,  // use the vendor's ID here
    });

    // Produce Kafka event, but protect from throwing
    try {
      await produceKafkaEvent({
        topic: 'product.created',
        messages: [{ value: JSON.stringify(product) }],
      });
    } catch (kafkaErr) {
      console.error('⚠️ Kafka event failed:', kafkaErr);
    }

    sendSuccess(res, '✅ Product created successfully', product);
  } catch (err) {
    console.error('❌ Error in createProduct:', err);
    next(err);
  }
};

/**
 * 🔍 Get all products
 */
export const getAllProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await productService.getAllProducts();
    sendSuccess(res, '✅ Product list fetched', products);
  } catch (err) {
    console.error('❌ Error in getAllProducts:', err);
    next(err);
  }
};

/**
 * 🔍 Get a product by ID
 */
export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductById(req.params.id);
    sendSuccess(res, '✅ Product details retrieved', product);
  } catch (err) {
    console.error('❌ Error in getProductById:', err);
    next(err);
  }
};

/**
 * 🔍 Get product by slug
 */
export const getProductBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    sendSuccess(res, '✅ Product fetched by slug', product);
  } catch (err) {
    console.error('❌ Error in getProductBySlug:', err);
    next(err);
  }
};

/**
 * 🛠️ Update product details
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdOrThrow(req, res);
    if (!userId) return;

    // TODO: Validate inputs before updating

    // Authorization check: Confirm user owns product or vendor
    const authorized = await productService.isUserAuthorizedForProduct(userId, req.params.id);
    if (!authorized) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to update this product' });
    }

    const updated = await productService.updateProduct(req.params.id, req.body);

    try {
      await produceKafkaEvent({
        topic: 'product.updated',
        messages: [{ value: JSON.stringify(updated) }],
      });
    } catch (kafkaErr) {
      console.error('⚠️ Kafka event failed:', kafkaErr);
    }

    sendSuccess(res, '✅ Product updated successfully', updated);
  } catch (err) {
    console.error('❌ Error in updateProduct:', err);
    next(err);
  }
};

/**
 * ❌ Delete a product
 */
export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserIdOrThrow(req, res);
    if (!userId) return;

    // Authorization check
    const authorized = await productService.isUserAuthorizedForProduct(userId, req.params.id);
    if (!authorized) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to delete this product' });
    }

    const deleted = await productService.deleteProduct(req.params.id);

    try {
      await produceKafkaEvent({
        topic: 'product.deleted',
        messages: [{ value: JSON.stringify({ productId: req.params.id }) }],
      });
    } catch (kafkaErr) {
      console.error('⚠️ Kafka event failed:', kafkaErr);
    }

    sendSuccess(res, '🗑️ Product deleted', deleted);
  } catch (err) {
    console.error('❌ Error in deleteProduct:', err);
    next(err);
  }
};

/**
 * 🖼️ Upload product image to MinIO
 */
export const uploadProductImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Optional: check user authorization if needed
    const userId = getUserIdOrThrow(req, res);
    if (!userId) return;

    // Optionally, check if user is authorized to upload image for this product
    const authorized = await productService.isUserAuthorizedForProduct(userId, req.params.id);
    if (!authorized) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to upload image for this product' });
    }

    const result = await productService.uploadProductImage(req.params.id, req.body.imageBase64);
    sendSuccess(res, '🖼️ Image uploaded to MinIO', result);
  } catch (err) {
    console.error('❌ Error in uploadProductImage:', err);
    next(err);
  }
};

/**
 * Get products for card display
 */
export const getProductsForCard = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const productCards = await productService.getProductsForCard();
    sendSuccess(res, '✅ Product cards fetched', productCards);
  } catch (err) {
    console.error('❌ Error in getProductsForCard:', err);
    next(err);
  }
};
export const getProductsByVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log('GET /vendor/products called');

    const userId = getUserIdOrThrow(req, res);
    if (!userId) return;

    console.log('User ID:', userId);

    // Find vendorId from userId first
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    console.log('Vendor found:', vendor);

    if (!vendor) {
      console.warn('Vendor not found for user:', userId);
      return res.status(404).json({ message: 'Vendor not found for user' });
    }

    // Use vendor.id to fetch products
    const vendorProducts = await productService.getProductsByVendorId(vendor.id);
    console.log(`Found ${vendorProducts.length} products for vendorId:`, vendor.id);

    sendSuccess(res, '✅ Vendor products fetched successfully', vendorProducts);
  } catch (err) {
    console.error('❌ Error in getProductsByVendor:', err);
    next(err);
  }
};

import { getProductBySlug } from '../../../../../services/productservice';
import ProductDetailClient from './productdetailpage';
import StoreLayout from 'apps/frontend/seller-ui/src/shared/components/layouts/StoreLayout';
// import Ramesh from "../../../assets/ramesh.png";

// interface PageProps {
//   params: {
//     slug: string;
//   };
// }
type PageProps = {
   params: Promise<{ slug: string }>;
  // params: { slug: string }; 
};


// type tParams = { slug: string };
export default async function ProductDetailPage({ params }: PageProps) {
  // const { slug } = props.params;
  const slug = (await params).slug;

 let productRaw = null;

try {
  productRaw = await getProductBySlug(slug);
} catch (error) {
  console.error('Failed to fetch product details:', error);
}

  if (!productRaw) {
    return <p className="text-center text-red-500 mt-10">Product not found.</p>;
  }

  // Normalize product shape for client
  const listing = productRaw.listings && productRaw.listings.length > 0 ? productRaw.listings[0] : null;

  const product = {
  id: productRaw.id,
  title: productRaw.title,
  description: productRaw.description,
  category: productRaw.category,
  subCategory: productRaw.subCategory,
  image: productRaw.imageUrls ?? [],
  price: listing?.originalPrice ? Number(listing.originalPrice) : null,
  offerPrice: listing?.price ? Number(listing.price) : null,
  slug: productRaw.slug,
  stock: listing?.stock ?? null,
  weight: listing?.itemWeight ? `${listing.itemWeight} ${listing.unit}` : null,
  dimensions: listing
    ? `${listing.packageLength} x ${listing.packageWidth} x ${listing.packageHeight} cm`
    : null,
  deliveryDate: listing?.deliveryEta ?? 'N/A',
  deliveryLocation: 'India',

  // ✅ New fields
  brand: listing?.brand ?? productRaw.brand ?? '',
  includedComponents: listing?.includedComponents ?? productRaw.includedComponents ?? [],
  numberOfItems: listing?.numberOfItems ?? productRaw.numberOfItems ?? null,
  enclosureMaterial: listing?.enclosureMaterial ?? productRaw.enclosureMaterial ?? '',
  productCareInstructions: listing?.productCareInstructions ?? productRaw.productCareInstructions ?? '',
  productFeatures: listing?.productFeatures ?? productRaw.productFeatures ?? [],
 listingId: listing?.id ?? null,
 vendorId: listing?.vendor?.id ?? null,
  rating:
    productRaw.ratings && productRaw.ratings.length > 0
      ? (
          productRaw.ratings.reduce(
            (sum: number, r: { score: number }) => sum + r.score,
            0
          ) / productRaw.ratings.length
        ).toFixed(1)
      : 0,
  reviewCount: productRaw.ratings?.length ?? 0,
  reviews: [], // Optional
  purchaseCount: 25,



vendor: listing?.vendor
  ? {
      id: listing.vendor.id,
      name:
        listing.vendor.businessName ||
        listing.vendor.user?.name ||
        'Unnamed Vendor',
      description: listing.vendor.description || '',
      image:
        listing.vendor.profileImage ||
        listing.vendor.user?.profileImage ||
        '',

      rating:
        listing.vendor.ratings?.length > 0
          ? (
              listing.vendor.ratings.reduce(
                (sum: number, r: { score: number }) => sum + r.score,
                0
              ) / listing.vendor.ratings.length
            ).toFixed(1)
          : '0',

      reviewCount: listing.vendor.ratings?.length ?? 0,
      productCount: listing.vendor.productListings?.length || 0,
    }
  : {
      name: 'Demo Seller',
      description: 'No description available.',
      image: '',
      rating: '0',
      reviewCount: 0,
      productCount: 0,
    },


};


  return     <StoreLayout><ProductDetailClient product={product} /></StoreLayout>;
}








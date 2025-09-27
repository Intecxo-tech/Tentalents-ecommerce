'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Balance from '../../../../../shared/components/balance/Balance';
import HomeProducts from '../../../../../shared/components/ProductsSold/HomeProducts';
import ProductHistory from '../../../../../shared/components/ProductHistory/ProductHistory';
import ProductTabs from '../../../../../shared/components/ProductTabs/ProductTabs';
import InventorySection from '../../../../../shared/components/InventorySection/InventorySection';
import '../../page.css';;

// --- Interfaces (No changes needed here) ---
interface Variant {
  id: string;
  variantName?: string;
  stock?: number;
}
interface Product {
  id: string;
  title?: string; 
  brand?: string;
  imageUrls?: string[];
}
interface ProductListing {
  id: string;
  product?: {
    id: string;
    brand?: string;
   title?: string; 
     imageUrls?: string[];
  };
  stock?: number;
  variants?: Variant[];
}
interface VendorWithProducts {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  gstin?: string;
  aadhar?: string;
  rating?: number;
  productsCount?: number;
  categories?: string[];
  profileImage?: string;
  role?: string;
  productListings?: ProductListing[];
  products?: any[];
}


const Page = () => {
  const { vendorId } = useParams<{ vendorId: string }>(); // Specify type for vendorId
  const [vendor, setVendor] = useState<VendorWithProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!vendorId) return;

    async function fetchVendorDetails() {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem('token');

        const response = await fetch('https://admin-service-k0id.onrender.com/api/admin/sellers/all-with-products', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) throw new Error('Failed to fetch vendor details');

    const data = await response.json();
// console.log('API response:', data); // Keep or remove console.log

const vendors: VendorWithProducts[] = Array.isArray(data.data) ? data.data : [];

const foundVendor = vendors.find((v) => v.id === vendorId);

if (!foundVendor) {
  setError('Vendor not found');
  setVendor(null);
} else {
  setVendor(foundVendor);
}

      
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchVendorDetails();
  }, [vendorId]);

  if (loading) return <div>Loading vendor details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!vendor) return <div>No vendor details available</div>;

  // Map vendor.products to the shape your InventorySection expects
  
const mappedProducts = vendor.productListings?.map((listing: ProductListing) => {
  const variants = listing.variants || [];
  const hasVariants = variants.length > 0;

  const imageUrl =
    listing.product?.imageUrls && listing.product.imageUrls.length > 0
      ? listing.product.imageUrls[0]
      : ''; 

  if (hasVariants) {
    return {
      id: listing.product?.id || listing.id,
       name: listing.product?.title || 'Unknown Product',
      image: imageUrl,
      stock: 0,
      inventory: {
        variants: variants.map((variant: Variant, index: number) => ({
          id: variant.id || `variant-${index}`,
          name: variant.variantName || `Variant ${index + 1}`,
          stock: variant.stock ?? 0,
          status:
  (variant.stock ?? 0) > 10 ? 'avail' :
  (variant.stock ?? 0) > 0 ? 'restock' :
  'empty',
        })),
      },
    };
  } else {
    return {
      id: listing.product?.id || listing.id,
       name: listing.product?.title || 'Unknown Product',
      image: imageUrl,
      stock: listing.stock ?? 0,
      inventory: {
        variants: [],
      },
    };
  }
}) || [];


  return (
     <div className='background-[var(--lightblue2)] p-[10px] rounded-[10px] main-pagesettings' >
     

   <div className="topsection flex justify-between gap-[10px] background-[white] p-[10px] rounded-[10px] mb-[15px]">
  <div className=" producthistorts w-1/3">
    <Balance vendorId={vendorId} />
  </div>
  <div className=" producthistorts w-1/3">
    <HomeProducts vendorId={vendorId} />
  </div>
  <div className=" producthistorts w-1/3">
    <ProductHistory vendorId={vendorId} />
  </div>
</div>

     <div className='inventory-sectionback'>
  <div className="prodiucttabdsw">
    <ProductTabs  vendorId={vendorId} />
  </div>
  <div className="inventory-sectionw">

<InventorySection products={mappedProducts}
/>
   
  </div>
</div>

     
    
    </div>

  );
};

export default Page;
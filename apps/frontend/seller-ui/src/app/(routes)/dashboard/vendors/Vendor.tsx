'use client'

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import './vendor.css';
import VendorSkeleton from './VendorSkeleton';
import Default from '../../../../assets/defaultprofile.png'
import { useRouter } from 'next/navigation';

interface VendorData {
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
  role?: string; // Added role to filter out admin
}

function Vendor() {
  const router = useRouter();
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

 async function fetchVendors() {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Token not found');

    const response = await fetch(
      'https://admin-service-k0id.onrender.com/api/admin/sellers/all-with-products',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch vendor data');
    }

    // Call json only once
    const responseJson = await response.json();

    // If API wraps data inside a `data` property
    const vendorsArray: any[] = Array.isArray(responseJson)
      ? responseJson
      : responseJson.data;

    if (!Array.isArray(vendorsArray)) {
      throw new Error('Invalid data format from API');
    }

const processedVendors: VendorData[] = vendorsArray
  .filter((vendor) => vendor.role !== 'admin' && vendor.role !== 'user')
  .map((vendor) => {
    const products = vendor.productListings?.map((pl: any) => pl.product) || [];

    // Calculate unique categories
    const uniqueCategories: string[] = Array.from(
      new Set(products.map((p: any) => p.category).filter(Boolean))
    ) as string[];

    // Only consider products with ratings
    const ratedProducts = products.filter((p: any) => typeof p.rating === 'number');
    const totalRating = ratedProducts.reduce((sum: number, p: any) => sum + p.rating, 0);
    const averageRating = ratedProducts.length > 0 ? totalRating / ratedProducts.length : 4.2;

    return {
      id: vendor.id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
      address: vendor.address,
      gstin: vendor.gstin,
      aadhar: vendor.aadhar,
      profileImage: vendor.profileImage,
      role: vendor.role,
      productsCount: products.length,
      categories: uniqueCategories,
      rating: parseFloat(averageRating.toFixed(1)), // Rounded to 1 decimal
    };
  });




    setVendors(processedVendors);
  } catch (err: any) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
}


  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) return <VendorSkeleton />; 
  if (error) return <div>Error: {error}</div>;
  if (vendors.length === 0) return <div>No vendor data available</div>;

  return (
    <div className="vendor-grid">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="vendorcard" onClick={() => router.push(`/dashboard/vendors/${vendor.id}`)} >
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Image
                  src={vendor.profileImage || Default}
                  alt={vendor.name}
                  width={100}
                  height={100}
                />
              </div>

              <div className="vendorright">
                <div className="vendorname">
                  <h2>{vendor.name}</h2>
                  <div className="stars">
                    <p>{vendor.rating}</p>
                    <Star />
                    <p className="head">(100)</p>
                  </div>
                </div>

                <p className="productslist">
                  {vendor.productsCount} Products
                </p>

                <div className="catrgoies">
                  {vendor.categories?.map((cat) => (
                    <p key={cat} className="catrgoryname">{cat}</p>
                  ))}
                </div>
              </div>
            </div>

            <div className="vendorbottom">
              <p>
                <span className="leftsidetext">Address</span><br />
                {vendor.address ?? 'No address available'}
              </p>

              <div className="first-column">
                <p><span className="leftsidetext">Phone No:</span> {vendor.phone ?? '+9578963548'}</p>
                <p><span className="leftsidetext">Email:</span> {vendor.email}</p>
              </div>

              <div className="first-column">
                <p><span className="leftsidetext">GST IN:</span> {vendor.gstin ?? '+847859632'}</p>
                <p><span className="leftsidetext">Aadhar CARD:</span> {vendor.aadhar ?? 'abcd1478596'}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Vendor;

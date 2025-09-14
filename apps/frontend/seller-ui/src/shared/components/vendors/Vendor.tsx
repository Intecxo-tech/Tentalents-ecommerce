
'use client'


import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import './vendor.css';

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
  const [vendors, setVendors] = useState<VendorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchVendors() {
    try {
      const token = localStorage.getItem('token');

      const response = await fetch('https://admin-service-k0id.onrender.com/api/admin/sellers/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor data');
      }

      const vendorsData: VendorData[] = await response.json();

      // 🔍 Filter out vendors with role 'admin'
     const filteredVendors = vendorsData.filter(
  (vendor) => vendor.role !== 'admin' && vendor.role !== 'user'
);


    setVendors(filteredVendors);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchVendors();
  }, []);

  if (loading) return <div>Loading vendor details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (vendors.length === 0) return <div>No vendor data available</div>;

  return (
    <div>
        <div className="vendor-grid">
      {vendors.map((vendor) => (
        <div key={vendor.id} className="vendorcard">
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Image
                  src={vendor.profileImage || '/fallback-profile.png'}
                  alt={vendor.name}
                  width={100}
                  height={100}
                />
              </div>

              <div className="vendorright">
                <div className="vendorname">
                  <h2>{vendor.name}</h2>
                  <div className="stars">
                    <p>{vendor.rating ?? '4.2'}</p>
                    <Star />
                    <p className="head">(100)</p>
                  </div>
                </div>

                <p className="productslist">
                  {vendor.productsCount ?? 50} Products
                </p>

                <div className="catrgoies">
                  {(vendor.categories ?? ['Electronics', 'Home Appliances', 'Tools']).map((cat) => (
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
    </div>
  );
}

export default Vendor;

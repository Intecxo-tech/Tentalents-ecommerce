'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import Ramesh from '../../../assets/ramesh.png'; // fallback image
import '../vendors/vendor.css';
import './approve.css';
import VendorApproveSkeleton from './VendorApproveSkeleton';

interface BankDetails {
  accountNumber: string | null;
  ifscCode: string | null;
  branchName: string | null;
}

interface Vendor {
  id: string;
  name: string;
  email: string;
  businessName: string;
  phone: string | null;
  status: string;
  gstNumber: string | null;
  panNumber: string | null;
  AadharNumber: string | null;
  profileImage?: string | null;
  categories?: string[];  // optional
  bankDetails?: BankDetails | null;
}

const VendorApprove: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const res = await fetch('https://admin-service-k0id.onrender.com/api/admin/sellers/pending', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();

        if (!res.ok || !json.success) throw new Error(json.message || 'Failed to fetch vendors');

        // Map to Vendor interface
        const vendorList: Vendor[] = json.data.map((v: any) => ({
          id: v.id,
          name: v.name,
          email: v.email,
          businessName: v.businessName,
          phone: v.phone,
          status: v.status,
          gstNumber: v.gstNumber,
          panNumber: v.panNumber,
          AadharNumber: v.AadharNumber,
          profileImage: v.profileImage || null,
          categories: v.categories || [],
         bankDetails: v.bankDetail || null,
        }));

        setVendors(vendorList);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);
const updateStatus = async (vendorId: string, approve: boolean) => {
  try {
    setActionLoading(vendorId);

    const token = localStorage.getItem('token');
    if (!token) throw new Error('No token found');

    const res = await fetch('https://admin-service-k0id.onrender.com/api/admin/sellers/status', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sellerId: vendorId, approve }), // ✅ FIXED
    });

    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json.message || 'Failed to update status');

    setVendors(prev => prev.filter(v => v.id !== vendorId));
    alert(`Vendor ${approve ? 'approved' : 'rejected'} successfully`);
  } catch (err: any) {
    alert(err.message || 'Failed to update status');
  } finally {
    setActionLoading(null);
  }
};

  if (loading) return <div><VendorApproveSkeleton /></div>;
  if (error) return <div>Error: {error}</div>;
  if (vendors.length === 0) return <div>No pending vendors</div>;

  return (
    <div className="vendor-approval-container">
      {vendors.map((vendor) => (
        <div className="vendorcard" key={vendor.id}>
          <div className="cardstyles">
            <div className="vendordeatil">
              <div className="vendorleft">
                <Image
                  src={vendor.profileImage || Ramesh}
                  alt={vendor.name}
                  width={90}
                  height={90}
                />
              </div>
              <div className="vendorright vendorright2">
                <div className="vendorname">
                  <h2>{vendor.name}</h2>
                  <div className="stars">
                    <p>4.2</p> {/* replace rating if available */}
                    <Star />
                    <p className="head">(100)</p>
                  </div>
                </div>
                {/* businessName */}
                <p className="productslist">{vendor.businessName}</p>
                {/* dynamic categories */}
                <div className="catrgoies">
                  {vendor.categories && vendor.categories.length > 0
                    ? vendor.categories.map((cat, idx) => (
                        <p className="catrgoryname" key={idx}>{cat}</p>
                      ))
                    : <p className="catrgoryname">No Categories</p>
                  }
                </div>
              </div>
            </div>

            <div className="vendorbottom">
              <div className="personalsection">
                <div className="personalbox">
                  <h2>Personal Details</h2>
                  <div className="details">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="leftsidetext">Phone No:</td>
                          <td className="rightsidebar">{vendor.phone || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">Email</td>
                          <td className="rightsidebar">{vendor.email}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">GST IN:</td>
                          <td className="rightsidebar">{vendor.gstNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">Aadhar CARD:</td>
                          <td className="rightsidebar">{vendor.AadharNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">PAN CARD:</td>
                          <td className="rightsidebar">{vendor.panNumber || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="personalbox">
                  <h2>Bank Details</h2>
                  <div className="details">
                    <table className="info-table">
                      <tbody>
                        <tr>
                          <td className="leftsidetext">Account Number:</td>
                          <td className="rightsidebar">{vendor.bankDetails?.accountNumber || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">IFSC Code:</td>
                          <td className="rightsidebar">{vendor.bankDetails?.ifscCode || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="leftsidetext">Branch Name:</td>
                          <td className="rightsidebar">{vendor.bankDetails?.branchName || 'N/A'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <div className="approvalcontainer">
              <p>Approval Status: </p>
              <div className="buttons">
                <button
                  disabled={actionLoading === vendor.id}
                  onClick={() => updateStatus(vendor.id, false)}
                  className="bordered-button"
                >
                  Deny
                </button>
                <button
                  disabled={actionLoading === vendor.id}
                  onClick={() => updateStatus(vendor.id, true)}
                  className="background-button"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VendorApprove;

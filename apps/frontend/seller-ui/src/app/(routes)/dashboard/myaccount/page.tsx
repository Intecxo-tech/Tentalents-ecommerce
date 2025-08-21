'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import './account.css'
import toast from 'react-hot-toast';
type Vendor = {
  id: string;
  userId: string;
  name: string;
  email: string;
  password: string;
  profileImage: string | null;
  businessName: string;
  phone: string;
  altphone?: string;
  website?: string;
  description?: string;
  status: string;
  address: string | null;
  gstNumber: string | null;
  kycDocsUrl: string[];
  createdAt: string;
  updatedAt: string;
};

const Page: React.FC = () => {
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
console.log('🔑 JWT Token:', token);
  const [vendorId, setVendorId] = useState<string | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [uploadingKyc, setUploadingKyc] = useState(false);

  // 🔍 Decode token and extract vendor ID
  useEffect(() => {
    if (!token) {
      console.log('🔴 No token found, redirecting to login');
      router.push('/login');
      return;
    }

    try {
      const decoded: any = jwtDecode(token);
      console.log('✅ Token decoded:', decoded);

     if (decoded.vendorId) {
  console.log('✅ Setting vendorId:', decoded.vendorId);
  setVendorId(decoded.vendorId);  // ✅ CORRECT

      } else {
        console.error('❌ Invalid token: Missing userId');
        throw new Error('Invalid token');
      }
    } catch (err) {
      console.error('❌ Failed to decode token:', err);
      localStorage.removeItem('token');
      router.push('/login');
    }
  }, [token, router]);

  // 🔍 Fetch vendor details
  useEffect(() => {
    const fetchVendor = async () => {
      if (!vendorId || !token) {
        console.log('⏳ Waiting for vendorId and token...');
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log(`📦 Fetching vendor details for ID: ${vendorId}`);

        const response = await fetch(`https://vendor-service-8bzv.onrender.com/api/vendor/${vendorId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error('❌ Error fetching vendor:', errorData);
          throw new Error(errorData.message || 'Failed to fetch vendor details');
        }

        const data = await response.json();
     
        setVendor(data.vendor);
      } catch (err: any) {
        console.error('❌ Fetch vendor error:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [vendorId, token]);

  // Logout handler
 

  // The rest of your component continues...
const handleSave = async (e: FormEvent) => {
  e.preventDefault();
  if (!vendor) return;
  setSaving(true);
  setError(null);

  const payload = {
    name: vendor.name,
    businessName: vendor.businessName || '',
    phone: vendor.phone,
    altphone: vendor.altphone || '',
    email: vendor.email,
    website: vendor.website || '',
    address: vendor.address || '',
    description: vendor.description || '',
    gstNumber: vendor.gstNumber || '',
  };

  console.log('📤 Sending PUT request with payload:', payload);

  try {
    const response = await fetch(`http://localhost:3010/api/vendor/profile/${vendorId}`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ PUT failed with:', errorData);
      throw new Error(errorData.message || 'Failed to save vendor details');
    }

    const data = await response.json();
    setVendor(data.vendor);
    alert('Vendor profile updated successfully!');
  } catch (err: any) {
    console.error('❌ Save error:', err.message);
    alert(`Error saving profile: ${err.message}`);
    setError(err.message);
  } finally {
    setSaving(false);
  }
};
 const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!vendor) return;
    const { name, value } = e.target;
    setVendor({ ...vendor, [name]: value });
  };
  // Upload Profile Image handler
const handleProfileImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files || e.target.files.length === 0 || !vendor) return;
  const file = e.target.files[0];

  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });

  try {
    setUploadingProfile(true);
    setError(null);

    const base64Image = await toBase64(file);

    const payload = { image: base64Image };

   const formData = new FormData();
formData.append('file', file);

const response = await fetch(`http://localhost:3010/api/vendor/profile-image/${vendorId}`, {
  method: 'POST',
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
    // DO NOT set 'Content-Type': multipart/form-data headers must be set automatically by the browser!
  },
  body: formData,
});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload profile image');
    }

    const data = await response.json();
    setVendor({ ...vendor, profileImage: data.imageUrl });
    alert('Profile image uploaded successfully!');
  } catch (err: any) {
    setError(err.message);
    console.error('Upload error:', err.message);
  } finally {
    setUploadingProfile(false);
  }
};


  const handleLogout = () => {
  localStorage.removeItem('token'); // Clear token
  toast.success('Logged out successfully'); // Show correct logout message
  router.push('/login'); // Redirect to login page
};
  // Upload KYC documents handler (multiple files)
  const handleKycUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !vendor) return;
    const files = Array.from(e.target.files);

    const formData = new FormData();
    files.forEach(file => formData.append('kycDocs', file));

    try {
      setUploadingKyc(true);
      setError(null);

      const response = await fetch(`http://localhost:3010/api/vendor/kyc-docs/${vendorId}`, {
  method: 'POST',
  headers: {
    Authorization: token ? `Bearer ${token}` : '',
  },
  body: formData,
});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload KYC documents');
      }

      const data = await response.json();
      // Append new docs URLs to existing ones
      setVendor({ ...vendor, kycDocsUrl: [...vendor.kycDocsUrl, ...data.kycDocsUrls] });
      alert('KYC documents uploaded successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploadingKyc(false);
    }
  };

  if (loading) return <p>Loading vendor details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!vendor) return <p>No vendor data found.</p>;



  return (
    <div className='account-page'>
      <div className="headertop">
 <div className="headingarea">
<h2>My Account</h2>
      <p className='my-account'>Vendor Account</p>
      </div>
      <div className="headerright">
 <button type="submit" disabled={saving} className='background-button'>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      <button type="button" className='bordered-button' onClick={handleLogout}>
  Logout
</button>
      </div>
      </div>
     
      
{/* Profile Image Upload */}
<div style={{ marginBottom: '1rem' }}>
  {vendor.profileImage ? (
    <img
      src={vendor.profileImage}
      alt="Profile"
      style={{ width: '150px', height: '150px', objectFit: 'cover', borderRadius: '8px' }}
    />
  ) : (
    <div
      style={{
        width: '150px',
        height: '150px',
        backgroundColor: '#ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#666',
      }}
    >
      No Profile Image
    </div>
  )}
  <input
    type="file"
    accept="image/*"
    onChange={handleProfileImageUpload}
    disabled={uploadingProfile}
    style={{ marginTop: '8px' }}
  />
  {uploadingProfile && <p>Uploading profile image...</p>}
</div>

{/* KYC Documents Upload */}
<div style={{ marginBottom: '1rem' }}>
  <h4>KYC Documents:</h4>
  {vendor.kycDocsUrl.length > 0 ? (
    vendor.kycDocsUrl.map((docUrl, idx) => (
      <div key={idx}>
        <a href={docUrl} target="_blank" rel="noopener noreferrer">
          Document {idx + 1}
        </a>
      </div>
    ))
  ) : (
    <p>No KYC documents uploaded</p>
  )}
  <input
    type="file"
    multiple
    accept="application/pdf,image/*"
    onChange={handleKycUpload}
    disabled={uploadingKyc}
  />
  {uploadingKyc && <p>Uploading KYC documents...</p>}
</div>

      {/* Profile Image */}
    

      {/* KYC Documents */}
     

      {/* Editable Form */}
      <form onSubmit={handleSave}>
        <div className='first-column'>

       
        
          <input
            type="text"
            name="name"
            value={vendor.name}
            onChange={handleChange}
            placeholder="Enter your name"
            className='full-width-input'
          />
    

      
          <input
            type="email"
            name="email"
            value={vendor.email}
            readOnly
          
          />
     
         </div>
 <div className='first-column'>
       
          <input
            type="text"
            name="businessName"
            value={vendor.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
           
          />
    

       
          <input
            type="tel"
            name="phone"
            value={vendor.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          
          />
  
        </div>
         <div className='first-column'>

      
          <textarea
            name="address"
            value={vendor.address || ''}
            onChange={handleChange}
            placeholder="Enter address"
          
          />
    
        
          <input
            type="text"
            name="gstNumber"
            value={vendor.gstNumber || ''}
            onChange={handleChange}
            placeholder="Enter GST number"
            
          />
   
        </div>

 
       
      </form>
    </div>
  );
};

export default Page;

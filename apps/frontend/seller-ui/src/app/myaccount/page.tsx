'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import './account.css'
import toast from 'react-hot-toast';
import Editbutton from '../../assets/editbutton.png'
// import { Menu } from 'lucide-react';
import Menu from '../../shared/components/menu/menu';
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
const fileInputRef = React.useRef<HTMLInputElement>(null);
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
// Upload individual KYC document by type
const handleKycUploadTyped = async (e: ChangeEvent<HTMLInputElement>, docType: 'pan' | 'aadhaar' | 'certificate') => {
  if (!e.target.files || e.target.files.length === 0 || !vendor) return;
  const file = e.target.files[0];

  const formData = new FormData();
  formData.append('kycDoc', file);
  formData.append('type', docType); // Optional: if your backend accepts type

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
      throw new Error(errorData.message || 'Failed to upload document');
    }

    const data = await response.json();

    // You can tag URLs based on the docType
    const taggedUrl = `${data.url}?doc=${docType}`;

    setVendor({
      ...vendor,
      kycDocsUrl: [...vendor.kycDocsUrl, taggedUrl]
    });

    toast.success(`${docType.toUpperCase()} uploaded successfully!`);
  } catch (err: any) {
    setError(err.message);
    toast.error(`Upload error: ${err.message}`);
  } finally {
    setUploadingKyc(false);
  }
};


  if (loading) return <p>Loading vendor details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!vendor) return <p>No vendor data found.</p>;



  return (
    <div>
        <Menu />
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
<div className="section1">
  <h2 className='heading2'>Personal Details</h2>
  <div className="personaldetails">
  <div className="personal-left">

  <div
    className="profiledetailsleft"
    onClick={() => !uploadingProfile && fileInputRef.current?.click()}
    style={{ cursor: uploadingProfile ? 'wait' : 'pointer', position: 'relative', width: '80px', height: '80px' }}
  >
    {vendor.profileImage ? (
      <Image
        src={vendor.profileImage}
        alt="Profile"
        className="profile-img"
        style={{
          width: '80px',
          height: '80px',
          objectFit: 'cover',
          borderRadius: '8px'
        }}
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
        className='profile-image-placeholder'
      >
        No Profile Image
      </div>
    )}

    <input
      type="file"
      ref={fileInputRef}
      accept="image/*"
      style={{ display: 'none' }}
      disabled={uploadingProfile}
      onChange={handleProfileImageUpload}
    />

    {/* Edit button overlay */}
    <div className="editbutton">
      <Image src={Editbutton} alt="Edit" style={{ cursor: 'pointer' }} />
    </div>

    {/* Optional: uploading overlay/spinner can go here */}
  </div>

  {uploadingProfile && <p>Uploading profile image...</p>}
 


</div>
<div className="personal-right">
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
            type="tel"
            name="phone"
            value={vendor.phone}
            onChange={handleChange}
            placeholder="Enter phone number"
          
          />
            <textarea
            name="address"
            value={vendor.address || ''}
            onChange={handleChange}
            placeholder="Enter address"
          
          />
  
        </div>
   </div>

      
        </div>

</div>
{/* KYC Documents Upload */}
{/* 📂 KYC Documents Upload Section */}
<div className="kycdocs">
  <h2 className='heading2'>Business Details</h2>
  <div className="businessdetail">
     <div className='first-column top-column'>
 

  
  {/* PAN Card (Required) */}
 <div className="adharside">
    <label>PAN Card (Required):</label>
    {vendor.kycDocsUrl.find(url => url.includes('pan')) ? (
      <div>
        <a href={vendor.kycDocsUrl.find(url => url.includes('pan'))} target="_blank" rel="noopener noreferrer">
          View Uploaded PAN Card
        </a>
      </div>
    ) : (
      <p style={{ color: 'red' }}>No PAN card uploaded</p>
    )}
    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={(e) => handleKycUploadTyped(e, 'pan')}
      disabled={uploadingKyc}
    />
</div>

  {/* Aadhaar Card (Optional) */}
<div className="adharside">
    <label>Aadhaar Card (Optional):</label>
    {vendor.kycDocsUrl.find(url => url.includes('aadhaar')) ? (
      <div>
        <a href={vendor.kycDocsUrl.find(url => url.includes('aadhaar'))} target="_blank" rel="noopener noreferrer">
          View Uploaded Aadhaar
        </a>
      </div>
    ) : (
      <p>No Aadhaar card uploaded</p>
    )}
    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={(e) => handleKycUploadTyped(e, 'aadhaar')}
      disabled={uploadingKyc}
    />
 
  </div>
</div>
  {/* Certificate of Incorporation (Optional) */}
  
 
    <label>Private Limited Incorporation Certificate (Optional):</label>
    {vendor.kycDocsUrl.find(url => url.includes('certificate')) ? (
      <div>
        <a href={vendor.kycDocsUrl.find(url => url.includes('certificate'))} target="_blank" rel="noopener noreferrer">
          View Certificate
        </a>
      </div>
    ) : (
      <p>No incorporation certificate uploaded</p>
    )}
    <input
      type="file"
      accept="image/*,application/pdf"
      onChange={(e) => handleKycUploadTyped(e, 'certificate')}
      disabled={uploadingKyc}
    />


  {uploadingKyc && <p>Uploading document...</p>}


 
   
       <div className='first-column'>
       
          <input
            type="text"
            name="businessName"
            value={vendor.businessName}
            onChange={handleChange}
            placeholder="Enter business name"
           
          />
    

       
           <input
            type="text"
            name="gstNumber"
            value={vendor.gstNumber || ''}
            onChange={handleChange}
            placeholder="Enter GST number"
            
          />
  
       
    </div>
  </div>
</div>
<div className="bankdetails">
  <h2 className='heading2'>
    Bank Details
  </h2>
  <div className="bank-detailsform">
    <form >
       <div className='first-column'>
       
         <input
          type="text"
          name="accountHolder"
          placeholder='Account Holder Name'
          onChange={handleChange}
          required
      
        />
    

       
          <input
          type="text"
          name="accountNumber"
        placeholder='Account Number'
          onChange={handleChange}
          required
       
        />
  
       
    </div>
    <div className="first-column">
       <input
          type="text"
          name="ifscCode"
        placeholder='IFSC Code'
          onChange={handleChange}
          required
        
        />
        <input
          type="text"
          name="bankName"
          placeholder='Bank Name'
          onChange={handleChange}
          required
        
        />
    </div>
    </form>
  </div>

</div>


      {/* Profile Image */}
    

      {/* KYC Documents */}
     

      {/* Editable Form */}
    
    </div>
    </div>
  );
};

export default Page;

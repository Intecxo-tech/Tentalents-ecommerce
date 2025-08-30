'use client'
import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import Image from 'next/image';
import './account.css'
import toast from 'react-hot-toast';
import Mainimage from '../../../../assets/tenanlenst-menu.png';
import Editbutton from '../../../../assets/editbutton.png'
import { FaUpload } from 'react-icons/fa'; 
// import { Menu } from 'lucide-react';
import Menu from '../../../../shared/components/menu/menu';
import { ChevronRight } from 'lucide-react';
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
  aadharNumber: string | null;
  panNumber: string | null;
  gstNumber: string | null;
  kycDocsUrl: string[];
  bankDetails?: {
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
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
 const [fileName, setFileName] = useState('');
 const [certificateFileName, setCertificateFileName] = useState<string>('');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (file) {
    setFileName(file.name);
    // Handle upload logic here if needed
  }
};

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
const handleBankSave = async () => {
  if (!vendor || !vendorId || !vendor.bankDetails) return;

  try {
    setSaving(true);
    const response = await fetch(
      `https://vendor-service-8bzv.onrender.com/api/vendor/vendors/${vendorId}/bank-details`,
      {
        method: 'PUT',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(vendor.bankDetails),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update bank details');
    }

    const data = await response.json();
  setVendor({
  ...data.vendor,
  bankDetails: data.vendor.bankDetails || {
    accountHolder: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
  },
});

    toast.success('Bank details updated successfully!');
  } catch (err: any) {
    console.error('Bank update error:', err.message);
    toast.error(`Error: ${err.message}`);
  } finally {
    setSaving(false);
  }
};

useEffect(() => {
  const fetchVendor = async () => {
    if (!vendorId || !token) {
      console.log('⏳ Waiting for vendorId and token...');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log(`📦 Fetching vendor details for ID: ${vendorId}`);  // Logs the vendorId for which you're fetching details

      const response = await fetch(`http://localhost:3010/api/vendor/profile/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,  // Send the token with the request
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Error fetching vendor:', errorData);
        throw new Error(errorData.message || 'Failed to fetch vendor details');
      }

      const data = await response.json();  // Parse the response data
      console.log('🔍 Vendor data fetched:', JSON.stringify(data, null, 2));  // Log the full vendor data

      setVendor(data.vendor);  // Save the fetched vendor data to state

      // Log the fetched fields (profileImage, gstNumber, kycDocsUrl)
      console.log('🔍 Vendor Profile Image:', data.vendor.profileImage);
      console.log('🔍 Vendor GST Number:', data.vendor.gstNumber);
      console.log('🔍 Vendor KYC Docs:', data.vendor.kycDocsUrl);

      // Check if bankDetails are included in the response
      console.log('🔍 Bank Details:', data.vendor.bankDetails);

      if (data.vendor.bankDetails) {
        setVendor({
          ...data.vendor,
          bankDetails: data.vendor.bankDetails,
        });
        console.log('✅ Bank Details set in state:', data.vendor.bankDetails);
      } else {
        console.warn('⚠️ No bank details found for this vendor');
      }

      // Check if KYC docs URL is present
      if (data.vendor.kycDocsUrl && data.vendor.kycDocsUrl.length > 0) {
        const fullUrl = data.vendor.kycDocsUrl[0];
        const fileNameFromUrl = fullUrl.split('/').pop()?.split('?')[0] || 'Document';
        setCertificateFileName(decodeURIComponent(fileNameFromUrl));  // Extracts the file name from the URL
      }

    } catch (err: any) {
      console.error('❌ Fetch vendor error:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchVendor();
}, [vendorId, token]);

// Log vendor and bank details whenever vendor state changes
useEffect(() => {
  if (vendor) {
    console.log('📌 Vendor state updated:', vendor);
    console.log('📌 Vendor Profile Image:', vendor.profileImage);
    console.log('📌 Vendor GST Number:', vendor.gstNumber);
    console.log('📌 Vendor KYC Docs URL:', vendor.kycDocsUrl);
    console.log('📌 Vendor Bank Details:', vendor.bankDetails);
  }
}, [vendor]);






  // Logout handler
 

  // The rest of your component continues...
  
// const handleSave = async (e: FormEvent) => {
//   e.preventDefault();
//   if (!vendor) return;
//   setSaving(true);
//   setError(null);

//   const payload = {
//     name: vendor.name,
//     businessName: vendor.businessName || '',
//     phone: vendor.phone,
//     altphone: vendor.altphone || '',
//     email: vendor.email,
//     website: vendor.website || '',
//     address: vendor.address || '',
//     description: vendor.description || '',
//     gstNumber: vendor.gstNumber || '',
//   };

//   console.log('📤 Sending PUT request with payload:', payload);

//   try {
//     const response = await fetch(`https://vendor-service-8bzv.onrender.com/api/vendor/profile/${vendorId}`, {
//       method: 'PUT',
//       headers: {
//         Authorization: token ? `Bearer ${token}` : '',
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     if (!response.ok) {
//       const errorData = await response.json();
//       console.error('❌ PUT failed with:', errorData);
//       throw new Error(errorData.message || 'Failed to save vendor details');
//     }

//     const data = await response.json();
//     setVendor(data.vendor);
//     alert('Vendor profile updated successfully!');
//   } catch (err: any) {
//     console.error('❌ Save error:', err.message);
//     alert(`Error saving profile: ${err.message}`);
//     setError(err.message);
//   } finally {
//     setSaving(false);
//   }
// };
const handlePersonalDetailsSave = async (e: FormEvent) => {
  e.preventDefault();
  if (!vendor) return;

  const payload = {
    name: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    address: vendor.address,
    // other personal details
  };

  try {
    const response = await fetch(`https://vendor-service-8bzv.onrender.com/api/vendor/profile/${vendorId}`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save personal details');
    }

    const data = await response.json();
    setVendor(data.vendor);
    toast.success('Personal details updated!');
  } catch (err: any) {
    console.error('Error saving personal details:', err.message);
    toast.error(`Error: ${err.message}`);
  }
};
const handleBusinessDetailsSave = async (e: FormEvent) => {
  e.preventDefault();
  if (!vendor) return;

  // Preparing the payload to include the updated Aadhar and PAN numbers
  const payload = {
    businessName: vendor.businessName,
    gstNumber: vendor.gstNumber,
    AadharNumber: vendor.aadharNumber, // Include Aadhar number
    panNumber: vendor.panNumber, // Include PAN number
  };

  try {
    // Sending the PUT request to the backend
    const response = await fetch(`http://localhost:3010/api/vendor/profile/${vendorId}`, {
      method: 'PUT',
      headers: {
        Authorization: token ? `Bearer ${token}` : '', // Ensure token is set
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send the payload
    });
  
    // Handling failed request
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save business details');
    }

    // If the request is successful, update the vendor details in the state
    const data = await response.json();
    setVendor(data.vendor); // Set the updated vendor object

    // Show success message
    toast.success('Business details updated!');
  } catch (err: any) {
    console.error('Error saving business details:', err.message);
    toast.error(`Error: ${err.message}`);
  }
};

const handleBankDetailsSave = async (e: FormEvent) => {
  e.preventDefault();
  if (!vendor || !vendor.bankDetails) return;

  const payload = {
    accountHolder: vendor.bankDetails.accountHolder,
    accountNumber: vendor.bankDetails.accountNumber,
    ifscCode: vendor.bankDetails.ifscCode,
    bankName: vendor.bankDetails.bankName,
  };

  try {
    setSaving(true);
    const response = await fetch(
      `https://vendor-service-8bzv.onrender.com/api/vendor/vendors/${vendorId}/bank-details`,
      {
        method: 'PUT',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update bank details');
    }

    const data = await response.json();

    // Update vendor state with the new bank details
    setVendor({
      ...vendor,
      bankDetails: data.bankDetails || {
        accountHolder: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
      },
    });

    toast.success('Bank details updated!');
  } catch (err: any) {
    console.error('Error updating bank details:', err.message);
    toast.error(`Error: ${err.message}`);
  } finally {
    setSaving(false);
  }
};

const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  if (!vendor) return;
  const { name, value } = e.target;
  console.log(name, value); // Check what is being entered
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

    const payload = {
      file: base64Image, // key name matches backend expected key
    };

    const response = await fetch(`https://vendor-service-8bzv.onrender.com/api/vendor/profile-image/${vendorId}`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',  // important
      },
      body: JSON.stringify(payload),
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
const handleKycUploadTyped = async (e: ChangeEvent<HTMLInputElement>, docType: string) => {
  if (!e.target.files || e.target.files.length === 0 || !vendor) return;
  const file = e.target.files[0];

  // Function to convert file to base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file); // This includes the base64 prefix (e.g., 'data:application/pdf;base64,')
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = err => reject(err);
    });

  try {
    setUploadingKyc(true);
    setError(null);

    // Convert the file to base64
    const base64 = await toBase64(file);
    console.log('Base64 preview:', base64.slice(0, 50)); // Log preview of base64 (first 50 characters)

    // Payload structure to match the expected format
    const payload = {
      files: [
        {
          filename: file.name,
          base64: base64, // Directly use the base64 string
        },
      ],
    };

    console.log('Payload:', payload);

    // Send the request to the backend
    const response = await fetch(`https://vendor-service-8bzv.onrender.com/api/vendor/kyc-docs/${vendor.id}`, {
      method: 'POST',
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload), // Send as JSON
    });

    // Check the response status
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Upload error:', errorData);
      throw new Error(errorData.message || 'Failed to upload document');
    }

    // If upload is successful
    const data = await response.json();
    toast.success(`${docType.toUpperCase()} uploaded successfully!`);
    e.target.value = ''; // reset file input after successful upload
  } catch (err: any) {
    console.error('Upload error:', err.message);
    setError(err.message);
    toast.error(`Upload error: ${err.message}`);
  } finally {
    setUploadingKyc(false);
  }
};


const handleBankChange = (e: ChangeEvent<HTMLInputElement>) => {
  if (!vendor) return;
  const { name, value } = e.target;

  setVendor({
    ...vendor,
    bankDetails: {
      ...vendor.bankDetails!,
      [name]: value, // "!" ensures bankDetails is not undefined
    },
  });
};




  if (loading) return <p>Loading vendor details...</p>;
  if (error) return <p style={{ color: 'red' }}>Error: {error}</p>;
  if (!vendor) return <p>No vendor data found.</p>;



  return (
 
    <div className='main-pagesetting'>
 
    <div className='account-page'>
  
      <div className="headertop">
 <div className="headingarea">
<h2>My Account</h2>
      <p className='my-account'>Vendor Account</p>
      </div>
      <div className="headerright">

      <button type="button" className='bordered-button' onClick={handleLogout}>
  Logout
</button>
      </div>
      </div>
     
      
{/* Profile Image Upload */}
<div className="accountpage-section">
<div className="section1">
  <form onSubmit={handlePersonalDetailsSave}> 
   <div className="bankheading">
      <h2 className='heading2'>Personal Details</h2>
        <button type="submit" disabled={saving} className='background-button'>
          {saving ? 'Saving...' : 'Update Details'}
        </button>
    </div>
  <div className="personaldetails">
  <div className="personal-left">

  <div
    className="profiledetailsleft"
    onClick={() => !uploadingProfile && fileInputRef.current?.click()}
    style={{ cursor: uploadingProfile ? 'wait' : 'pointer', position: 'relative', width: '80px', height: '80px' }}
  >
  {vendor.profileImage && (
  <Image
  src={vendor.profileImage || '/path/to/fallback-image.png'}
  alt="Profile"
  className="profile-img"
  width={90}
  height={90}
/>

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
            <input
            type="text"
            name="address"
            value={vendor.address || ''}
            onChange={handleChange}
            placeholder="Enter address"
          
          />
  
        </div>
   </div>

      
        </div>
</form>
</div>
{/* KYC Documents Upload */}
{/* 📂 KYC Documents Upload Section */}
<div className="kycdocs">
   <form onSubmit={handleBusinessDetailsSave}> 
    <div className="bankheading">
  <h2 className='heading2'>Business Details</h2>
 <button className='background-button' onClick={handleBusinessDetailsSave}>Update Details</button>
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
  type="text"
  name="gstNumber"
  value={vendor.gstNumber || ''}  // Use empty string as fallback if gstNumber is undefined or null
  onChange={handleChange}
  placeholder="Enter GST number"
/>

       
    </div>
  <div className="businessdetail">
     <div className='first-column top-column'>
     
<input
  type="text"
  name="aadharNumber"
  value={vendor.aadharNumber || ''}
  onChange={handleChange}
  placeholder="Aadhar Card"
/>
 
<input
  type="text"
  name="panNumber"
  value={vendor.panNumber || ''}
  onChange={handleChange}
  placeholder="PAN Card"
/>
  
  {/* PAN Card (Required) */}

</div>
<div className="first-column">
  <textarea placeholder="Business Address" className='' />
</div>
  {/* Certificate of Incorporation (Optional) */}
  
    <div className="upload-container">
  <span className="upload-label">
    {certificateFileName ? certificateFileName : 'Upload Incorporation Certificate'}
  </span>

  <label htmlFor="certificate-upload" className="upload-icon">
    <FaUpload size={15} />
  </label>

  <input
    type="file"
    id="certificate-upload"
    accept=".pdf,.doc,.docx,.png,.jpg"
    onChange={(e) => handleKycUploadTyped(e, 'certificate')}
    style={{ display: 'none' }}
  />

  {/* Displaying the file name once uploaded */}
 
</div>

  


 
   
      
  </div>
  </form>
</div>


</div>
<div className="bankdetails">
    <form onSubmit={handleBankDetailsSave }> 
  <div className="bankheading">
    <h2 className='heading2'>
    Bank Details
  </h2>
    <button className='background-button' onClick={handleBankDetailsSave} >
    Update Details
    </button>
  </div>
  
  <div className="bank-detailsform">
   
       <div className='first-column'>
       
   <input
      type="text"
      name="accountHolder"
      placeholder="Account Holder Name"
      value={vendor.bankDetails?.accountHolder || ''}
      onChange={handleBankChange}
      required
    />
    

       
   <input
      type="text"
      name="accountNumber"
      placeholder="Account Number"
      value={vendor.bankDetails?.accountNumber || ''}
      onChange={handleBankChange}
      required
    />
       
    </div>
    <div className="first-column">
     <input
      type="text"
      name="ifscCode"
      placeholder="IFSC Code"
      value={vendor.bankDetails?.ifscCode || ''}
      onChange={handleBankChange}
      required
    /> <input
      type="text"
      name="bankName"
      placeholder="Bank Name"
      value={vendor.bankDetails?.bankName || ''}
      onChange={handleBankChange}
      required
    />
    </div>
 
   
  </div>
  </form>
</div>

      {/* Profile Image */}
    

      {/* KYC Documents */}
     

      {/* Editable Form */}
    
    </div>
      <div className="accountpage-right">
          <div className="menu-left">
            <Image src={Mainimage} alt="User" className="menu-image" />
            <button className="background-button">
              Become a Seller
              <ChevronRight size={20} className="chevron-white" />
            </button>
          </div>
          
        </div>
    </div>
    
  );
};

export default Page;

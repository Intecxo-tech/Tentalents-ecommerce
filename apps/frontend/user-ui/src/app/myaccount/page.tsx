'use client'
import React, { useEffect, useState, useRef } from 'react';
import './address.css';
import Address from '../components/addaddress/Address';
import Image from 'next/image';
import { ChevronRight } from 'lucide-react';
import Mainimage from '../../assets/tenanlenst-menu.png';
import ProfileIcn from '../../assets/profileicon.png';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Editbutton from '../../assets/editbutton.png'

const AccountPage = () => {
  const [profile, setProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    altPhone: '',
    email: '',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`https://user-service-zje4.onrender.com/api/user/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) throw new Error('Failed to fetch profile');

      const data = await res.json();
      setProfile(data.data);
      setFormData({
        name: data.data.name || '',
        phone: data.data.phone || '',
        altPhone: data.data.altPhone || '',
        email: data.data.email || '',
      });
    } catch (err: any) {
      setError(err.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeSeller = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      if (profile?.isVendor || profile?.vendorId) {
        // If already a vendor, redirect to the seller login page with the token for auto-login
        toast.success('Redirecting to your seller dashboard...');
        router.push(`http://localhost:3000/login?token=${token}`);
        return;
      }

      if (!profile?.phone || !profile?.name) {
        toast.error("Please ensure your profile has a name and phone number.");
        return;
      }

      const res = await fetch(`https://tentalents-ecommerce45-f8sw.onrender.com/api/vendor/convert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to convert user to vendor');
      }

      setProfile((prev: any) => ({
        ...prev,
        isVendor: true,
        vendorId: data.data?.id,
      }));

      if (!data.data?.profileComplete) {
        toast.success('Complete your vendor profile');
        router.push(
          `https://tentalents-ecommerce-seller.vercel.app/signup?vendorId=${data.data?.id}&name=${encodeURIComponent(profile.name)}&phone=${profile.phone}&email=${profile.email}&token=${token}`
        );
        return;
      }

      toast.success('You are now a seller! Redirecting to dashboard...');
      // ✅ CORRECT: Redirect to the seller's login page with the token
      router.push(`https://tentalents-ecommerce-seller.vercel.app/login?token=${token}`);

    } catch (err: any) {
      toast.error(err.message || 'Error becoming a seller');
      console.error(err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    fetchProfile();
  }, [router]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const vendorId = profile?.vendorId || '';
  const handleUpdateProfile = async () => {
    setUpdatingProfile(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`https://user-service-zje4.onrender.com/api/user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          altPhone: formData.altPhone,
        }),
      });

      const contentType = res.headers.get('content-type');

      if (!res.ok) {
        if (contentType && contentType.includes('application/json')) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update profile');
        } else {
          const text = await res.text();
          throw new Error(`Failed to update profile: ${text}`);
        }
      }

      let updatedData;
      if (contentType && contentType.includes('application/json')) {
        updatedData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(`Unexpected response format: ${text}`);
      }

      setProfile(updatedData.data);
      toast.success('Profile updated successfully!');

    } catch (err: any) {
      setError(err.message || 'Error updating profile');
      toast.error(err.message || 'Error updating profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`https://user-service-zje4.onrender.com/api/user/profile/image`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to upload image');
      }

      const data = await res.json();
      setProfile((prev: any) => ({ ...prev, profileImage: data.data.profileImage }));
      toast.success('Profile image updated');
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className="accountpage">
      <div className="accountheader">
        <h2 className="sectiontitle">My Account</h2>
        <div className="accountname">{profile?.name || 'User Account'}</div>
      </div>

      <div className="accountpagemain">
        <div className="accountpage-leftsection">
          <div className="acountdetails">
            <div className="accountdetailsheader">
              <h2 className="sectiontitle">Personal Details</h2>
              <div className="accountbuttons flex items-center justify-between gap-[10px]">
        {/* <input
  type="file"
  ref={fileInputRef}
  accept="image/*"
  style={{ display: 'none' }}
  disabled={uploadingImage}
  onChange={handleImageChange}
/> */}
  <button 
    className="background-button update-btn" 
    onClick={handleUpdateProfile}
    disabled={updatingProfile}
  >
    {updatingProfile ? 'Updating...' : 'Update Profile'}
  </button>
              <button className="background-button logout-btn" onClick={handleLogout}>
                Logout
              </button>
              </div>
            </div>

            <div className="profiledetails">
     <div
  className="profiledetailsleft"
  onClick={() => !uploadingImage && fileInputRef.current?.click()}
  style={{ cursor: uploadingImage ? 'wait' : 'pointer' }}
>
  <Image
    src={profile?.profileImage || ProfileIcn}
    alt="Profile"
    width={80}
    height={80}
    className="profile-img"
  />

  <input
    type="file"
    ref={fileInputRef}
    accept="image/*"
    style={{ display: 'none' }}
    disabled={uploadingImage}
    onChange={handleImageChange} // important to have this here
  />

  <div className='editbutton'>
    <Image src={Editbutton} alt="Edit" style={{ cursor: 'pointer' }} />
  </div>

  {/* Optional: Show uploading spinner overlay here */}
</div>
              <div className="profiledetailsright">
                <div className="first-column">
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="Full Name"
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    placeholder="Phone No"
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="first-column">
                  <input
                    type="tel"
                    value={formData.altPhone}
                    placeholder="Alternative Phone No"
                    onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                  />
                  <input type="email" value={formData.email} placeholder="Your Email Id" readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Pass setAddress to Address component */}
          <Address
            showLocate={false}
            vendorId={vendorId}
            setAddress={setSelectedAddress} // Pass setSelectedAddress function to Address component
          />
        </div>

        <div className="accountpage-right">
          <div className="menu-left">
            <Image src={Mainimage} alt="User" className="menu-image" />
        <button className="background-button" onClick={handleBecomeSeller}>
            {profile?.isVendor || profile?.vendorId ? 'Switch to Seller' : 'Become a Seller'}
            <ChevronRight size={20} className="chevron-white" />
          </button>

          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;



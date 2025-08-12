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
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null); // state for selected address
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
       console.log('Fetched token:', token);
      if (!token) {
        router.push('/login');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URI}/api/user/profile`, {
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
    localStorage.removeItem('token'); // remove JWT
    router.push('/login'); // redirect to login page
  };

  const vendorId = profile?.vendorId || '';

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
              <button
                className="background-button"
                onClick={() => {}}
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
                onClick={() => fileInputRef.current?.click()}
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
                />
                <small>{uploadingImage ? 'Uploading...' : 'Click to change'}</small>
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
            <button className="background-button">
              Become a Seller
              <ChevronRight size={20} className="chevron-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Star } from 'lucide-react';
import '../vendors/vendor.css';

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  city: string;
  state: string;
  fullAddress: string;
  liveOrders: number;
  totalOrders: number;
  rating: number;
  reviews: number;
}

function Customer() {
  const [users, setUsers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');

        if (!token) {
          throw new Error('No authentication token found.');
        }

        const res = await fetch('https://admin-service-k0id.onrender.com/api/admin/users', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();

        if (!res.ok || !json.success) {
          throw new Error(json.message || 'Failed to fetch user data');
        }

        const trimmed: CustomerData[] = json.data
          .filter((user: any) => user.role === 'buyer')
          .map((user: any): CustomerData => {
            const defaultAddress = user.addresses?.[0] || {};

            return {
              name: user.name || defaultAddress.name || 'No Name',
              email: user.email || 'No Email',
              phone: user.phone || defaultAddress.phone || 'No Phone',
              profileImage: user.profileImage || '/default-user.png',
              city: defaultAddress.city || 'Unknown City',
              state: defaultAddress.state || 'Unknown State',
              fullAddress: defaultAddress.addressLine1
                ? `${defaultAddress.addressLine1}, ${defaultAddress.addressLine2 || ''}, ${defaultAddress.city}, ${defaultAddress.state}, ${defaultAddress.pinCode}, ${defaultAddress.country}`
                : 'No Address Available',

              // Mock / fallback values
              liveOrders: 2,
              totalOrders: 4,
              rating: 4.2,
              reviews: 100,
            };
          });

        setUsers(trimmed);
      } catch (err: any) {
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div>Loading customer details...</div>;
  if (error) return <div>Error: {error}</div>;
  if (users.length === 0) return <div>No customer data available</div>;

  return (
    <div>
      <div className="vendor-grid">
        {users.map((user, index) => (
          <div className="vendorcard" key={index}>
            <div className="cardstyles">
              <div className="vendordeatil">
                <div className="vendorleft">
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    width={96}
                    height={96}
                    className="rounded-image"
                  />
                </div>
                <div className="vendorright vendorright2">
                  <div className="vendorname">
                    <h2>{user.name}</h2>
                    <div className="stars">
                      <p>{user.rating}</p>
                      <Star />
                      <p className="head">({user.reviews})</p>
                    </div>
                  </div>

                  <div className="catrgoies">
                    <p className="catrgoryname">Live Order - {user.liveOrders}</p>
                    <p className="catrgoryname">Total Orders - {user.totalOrders}</p>
                    <p className="catrgoryname">
                      {user.city}, {user.state}
                    </p>
                  </div>
                </div>
              </div>

              <div className="vendorbottom">
                <p>
                  <span className="leftsidetext">Address</span>
                  <br />
                  {user.fullAddress}
                </p>
                <div className="first-column">
                  <p>
                    <span className="leftsidetext">Phone No:</span> {user.phone}
                  </p>
                  <p>
                    <span className="leftsidetext">Email:</span> {user.email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Customer;

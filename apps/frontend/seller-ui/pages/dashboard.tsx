import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

type VendorStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

interface VendorDashboardData {
  vendor: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    storeName: string;
    storeSlug: string;
    logoUrl?: string;
    status: VendorStatus;
    documents: string[];
    createdAt: string;
  };
  products: {
    id: string;
    name: string;
    price: number;
  }[];
  orders: {
    id: string;
    total: number;
  }[];
  payouts: {
    id: string;
    amount: number;
  }[];
  invoices: {
    id: string;
    fileUrl: string;
  }[];
  ratings: {
    id: string;
    score: number;
    comment: string;
  }[];
}

const VendorDashboard = () => {
  const [data, setData] = useState<VendorDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDashboard = async () => {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) {
        router.push('/seller-ui/google.login');
        return;
      }

      try {
        const response = await axios.get('/api/vendor/dashboard', {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) return <p>Loading vendor dashboard...</p>;
  if (!data) return <p>Unable to load dashboard data.</p>;

  const { vendor, products, orders, payouts, invoices, ratings } = data;

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageRating =
    ratings.length > 0
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : 'N/A';

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome, {vendor.storeName}</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>📋 Vendor Profile</h2>
        <p><strong>Name:</strong> {vendor.name}</p>
        <p><strong>Email:</strong> {vendor.email}</p>
        <p><strong>Phone:</strong> {vendor.phone || 'N/A'}</p>
        <p><strong>Status:</strong> {vendor.status}</p>
        <p><strong>Store Slug:</strong> {vendor.storeSlug}</p>
        <p><strong>Documents Uploaded:</strong> {vendor.documents.length}</p>
        {vendor.logoUrl && (
          <img
            src={vendor.logoUrl}
            alt="Store Logo"
            style={{ width: '100px', borderRadius: '8px' }}
          />
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🛒 Products ({products.length})</h2>
        {products.length ? (
          <ul>
            {products.map((p) => (
              <li key={p.id}>
                {p.name} - ₹{p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No products listed yet.</p>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>📦 Orders ({orders.length})</h2>
        <p><strong>Total Revenue:</strong> ₹{totalRevenue.toFixed(2)}</p>
        <ul>
          {orders.map((o) => (
            <li key={o.id}>Order #{o.id} - ₹{o.total}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>💰 Payouts ({payouts.length})</h2>
        <ul>
          {payouts.map((p) => (
            <li key={p.id}>Payout #{p.id} - ₹{p.amount}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🧾 Invoices ({invoices.length})</h2>
        <ul>
          {invoices.map((i) => (
            <li key={i.id}>
              <a href={i.fileUrl} target="_blank" rel="noreferrer">
                Download Invoice #{i.id}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>⭐ Ratings ({ratings.length})</h2>
        <p><strong>Average:</strong> {averageRating}/5</p>
        <ul>
          {ratings.map((r) => (
            <li key={r.id}>
              {r.score}/5 — “{r.comment}”
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default VendorDashboard;

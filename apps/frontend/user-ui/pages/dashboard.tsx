import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
}

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
}

interface UserDashboardData {
  user: User;
  orders: Order[];
  cart: Product[];
  wishlist: Product[];
  addresses: Address[];
  recommendedProducts: Product[];
}

const UserDashboard: React.FC = () => {
  const [data, setData] = useState<UserDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('sessionToken');
    if (!token) {
      router.push('/user-ui/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const res = await axios.get('/api/user/dashboard', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (err) {
        console.error('Failed to load user dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [router]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!data) return <p>Unable to load data.</p>;

  const { user, orders, cart, wishlist, addresses, recommendedProducts } = data;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Hello, {user.name} 👋</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🧾 Recent Orders</h2>
        {orders.length ? (
          <ul>
            {orders.map((order) => (
              <li key={order.id}>
                #{order.id} — ₹{order.total.toFixed(2)} — {order.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>You have no recent orders.</p>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🛒 Cart ({cart.length})</h2>
        {cart.length ? (
          <ul>
            {cart.map((item) => (
              <li key={item.id}>
                {item.name} - ₹{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Your cart is empty.</p>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>❤️ Wishlist ({wishlist.length})</h2>
        {wishlist.length ? (
          <ul>
            {wishlist.map((item) => (
              <li key={item.id}>
                {item.name} - ₹{item.price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No items in wishlist.</p>
        )}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>🏠 Saved Addresses</h2>
        {addresses.length ? (
          <ul>
            {addresses.map((addr) => (
              <li key={addr.id}>
                {addr.label}: {addr.line1}, {addr.city}, {addr.state} - {addr.zip}
              </li>
            ))}
          </ul>
        ) : (
          <p>No saved addresses.</p>
        )}
      </section>

      <section>
        <h2>✨ Recommended Products</h2>
        {recommendedProducts.length ? (
          <ul>
            {recommendedProducts.map((p) => (
              <li key={p.id}>
                {p.name} — ₹{p.price.toFixed(2)}
              </li>
            ))}
          </ul>
        ) : (
          <p>No recommendations at the moment.</p>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;

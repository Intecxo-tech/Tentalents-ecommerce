'use client';

import React, { useEffect, useState } from 'react';
import OrderCard from '../components/orderssec/ordercard';
import YourOrder from '../components/yourorder/yourorder';
import OrderPlaced from '../components/orderplaced/orderplaced';
import './orders.css';
import Closet from '../home-page/closet-section/closet';
import Products from '../home-page/products-grid/productsgrid';
import { ChevronRight, Search } from 'lucide-react';
import '../home-page/headerbanner.css';
import type { Product } from '../components/orderplaced/orderplaced';

interface ShippingAddress {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  addressLine2?: string;
  addressType: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  listingId: string;
  vendorId: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
  status: string;
  addedAt: string;
  dispatchStatus: string;
  dispatchTime: string | null;
  product: {
    title: string;
    imageUrls: string[];
     slug: string;
  };
}

interface OrderData {
  id: string;
  buyerId: string;
  totalAmount: string;
  paymentMode: string;
  paymentStatus: string;
  shippingAddressId: string;
  placedAt: string;
  updatedAt: string;
  stripePaymentIntentId: string | null;
  dispatchStatus: string;
  dispatchTime: string | null;
  status: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
}

const Page = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
const [dateFilter, setDateFilter] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  // Your existing products fetch effect here
useEffect(() => {
  async function fetchOrders() {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (!token) {
      setOrderError('Please Log in to view your orders');
      setLoadingOrders(false);
      return;
    }

    try {
      const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch orders response status:', res.status);

      if (!res.ok) throw new Error('Failed to fetch orders');

      const json = await res.json();
      console.log('Fetched orders data:', json);

   if (json.success) {
  setOrders(json.data);
} else {
  setOrderError('Error fetching order details');
}

    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setOrderError(err.message || 'Unknown error fetching orders');
    } finally {
      setLoadingOrders(false);
    }
  }

  fetchOrders();
}, []);

// Log orders before filtering
console.log('Orders before filtering:', orders);
console.log('Current date filter:', dateFilter);





function filterOrdersByDate(orders: OrderData[], filter: string) {
  if (filter === 'all') return orders;

  const now = new Date();
  let dateLimit: Date;
  let nextDateLimit: Date | null = null;

  switch (filter) {
    case 'today': {
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(now);
      todayEnd.setHours(23, 59, 59, 999);
      return orders.filter(order => {
        const placedAt = new Date(order.placedAt);
        return placedAt >= todayStart && placedAt <= todayEnd;
      });
    }
    case 'yesterday': {
      const yesterdayStart = new Date(now);
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayEnd = new Date(now);
      yesterdayEnd.setDate(yesterdayEnd.getDate() - 1);
      yesterdayEnd.setHours(23, 59, 59, 999);
      return orders.filter(order => {
        const placedAt = new Date(order.placedAt);
        return placedAt >= yesterdayStart && placedAt <= yesterdayEnd;
      });
    }
    case '15days':
      dateLimit = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      dateLimit = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '3months':
      dateLimit = new Date(now);
      dateLimit.setMonth(dateLimit.getMonth() - 3);
      break;
    case '6months':
      dateLimit = new Date(now);
      dateLimit.setMonth(dateLimit.getMonth() - 6);
      break;
    case '1year':
      dateLimit = new Date(now);
      dateLimit.setFullYear(dateLimit.getFullYear() - 1);
      break;
    default:
      return orders;
  }

  return orders.filter(order => new Date(order.placedAt) >= dateLimit);
}

const filteredOrders = filterOrdersByDate(orders, dateFilter);
useEffect(() => {
    async function fetchPopularProducts() {
      try {
        const res = await fetch(`https://product-service-23pc.onrender.com/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');

        const json = await res.json();
        const data = json.data ?? [];

        const mapped: Product[] = data.map((p: any) => {
          const listing = p.listings?.[0];
          return {
            id: p.id,
            title: p.title,
            href: `/shop/${p.slug}`,
            price: listing ? Number(listing.originalPrice) : 0,
            offerPrice: listing ? Number(listing.price) : undefined,
            image: p.imageUrls?.[0] || '',
            rating: p.ratings?.[0]?.score || 0,
            reviewCount: p.ratings?.length || 0,
          };
        });

        setProducts(mapped.slice(0, 4));
      } catch (err: any) {
        setProductError(err.message || 'Something went wrong');
      } finally {
        setLoadingProducts(false);
      }
    }

    fetchPopularProducts();
  }, []);
  return (
  <div className="orderapagefull2">
  <div className="orderapagefull">
    <div className="orderpageleft-2">
      <div className="yourorder-header">
        <h2 className="sectiontitle">Your Orders</h2>

        <div className="dateorder">
          <div className="search-inputbutton">
            <input type="text" placeholder="Search Order By ID/Product name" />
            <button className="background-button">
              <Search className="search-icon" />
            </button>
          </div>
        <select
  id="dateFilter"
  className="bordered-button custom-dropdown"
  value={dateFilter}
  onChange={(e) => setDateFilter(e.target.value)}
>

            <option value="all">All Orders</option>
              <option value="today">Today</option>
  <option value="yesterday">Yesterday</option>
            <option value="15days">Past 15 Days</option>
            <option value="30days">Past 30 Days</option>
            <option value="3months">Past 3 Months</option>
            <option value="6months">Past 6 Months</option>
            <option value="1year">Past 1 Year</option>
          </select>
        </div>
      </div>

     <div className="sectionorder">
 {loadingOrders ? (
  <p>Loading your orders...</p>
) : orderError ? (
  <p className="error-message">{orderError}</p>
) : orders.length > 0 ? (
  filteredOrders.map(order => (
    <div key={order.id} className="sectionsorder">
      {/* You can put OrderCard for that order */}
      <OrderCard order={order} />

      {/* If YourOrder is supposed to show multiple orders, you might want to filter or pass only this order */}
      {/* Or if YourOrder is a summary component, maybe keep it outside the map? */}
      {/* But since you want the section repeated for every order, let's assume you want YourOrder here as well */}
      <YourOrder orders={[order]} loading={false} error={null} />
    </div>
  ))
) : (
  <p className="empty-message">Nothing in your orders.</p>
)}

</div>
    </div>

    <div className="productpageright">
      <div className="popularproductcard">
        <h2 className="sectiontitle">Popular Products</h2>
        {loadingProducts && <p>Loading products...</p>}
        {productError && <p>Error: {productError}</p>}
        {!loadingProducts &&
          !productError &&
          products.slice(0, 4).map((product) => (
            <OrderPlaced key={product.id} product={product} />
          ))}
        <button className="background-button shopbutton">Explore Shop</button>
      </div>

      <div className="fullwidth-banner">
        <div className="section-1">
          <div className="content">
            <h3 className="banner-heading">Denim That Defines</h3>
            <p className="content-para">
              Explore premium fits, rugged comfort, and timeless style made for every move.
            </p>
            <button className="background-button mt-[10px]">
              Explore Now <ChevronRight />
            </button>
          </div>
        </div>
      </div>
      </div>
 
  </div>

  <div>
<Products />
    <Closet />
  </div>
</div>
  );
};

export default Page;


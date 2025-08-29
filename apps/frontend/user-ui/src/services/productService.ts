// ----------------------------
// Types & Interfaces
// ----------------------------
export interface Address {
  id?: string; // optional when adding a new address
  name: string;
  addressLine1: string;
  addressLine2?: string;
  pinCode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  addressType: string; // Home / Office
}

type GetAddressesResponse = { data: Address[] };

// ----------------------------
// Base URLs
// ----------------------------
const PRODUCT_SERVICE_URL = 'https://product-service-23pc.onrender.com/api';
const ORDER_SERVICE_URL = 'https://order-service-faxh.onrender.com/api/orders';

// ----------------------------
// Auth Headers
// ----------------------------
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ----------------------------
// Product Service
// ----------------------------
export const getAllProducts = async () => {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products`);
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  const json = await res.json();
  return json.data;
};

export const getProductBySlug = async (slug: string) => {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/products/slug/${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error('Failed to fetch product by slug');
  const json = await res.json();
  return json?.data;
};

export const getRatingsByProductId = async (productId: string) => {
  const res = await fetch(`${PRODUCT_SERVICE_URL}/ratings/product/${encodeURIComponent(productId)}`);
  if (!res.ok) throw new Error('Failed to fetch product ratings');
  const json = await res.json();
  return json?.data ?? [];
};

// ----------------------------
// Address Service
// ----------------------------
export const getAllAddresses = async (): Promise<Address[]> => {
  const res = await fetch(`${ORDER_SERVICE_URL}/addresses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch addresses');
  const json = await res.json();
  return Array.isArray(json?.data) ? json.data : [];
};

export const addAddress = async (newAddress: Address): Promise<Address> => {
  const payload = { ...newAddress };
  delete payload.id;
  const res = await fetch(`${ORDER_SERVICE_URL}/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add address');
  const data = await res.json();
  return data.data;
};

export const editAddress = async (addressId: string, updatedAddress: Partial<Address>): Promise<Address> => {
  const res = await fetch(`${ORDER_SERVICE_URL}/addresses/${addressId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedAddress),
  });
  if (!res.ok) throw new Error('Failed to edit address');
  const data = await res.json();
  return data.data;
};

export const deleteAddress = async (addressId: string): Promise<void> => {
  const res = await fetch(`${ORDER_SERVICE_URL}/addresses/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete address');
  try {
    await res.json();
  } catch {
    // ignore empty response
  }
};

// ----------------------------
// Invoice Service
// ----------------------------
export const getInvoiceUrl = async (orderId: string): Promise<string> => {
  const res = await fetch(`${ORDER_SERVICE_URL}/${orderId}/invoice`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch invoice');
  const json = await res.json();
  return json?.data?.invoiceUrl; // Cloudinary PDF URL
};

// ----------------------------
// Download PDF
// ----------------------------
export const downloadInvoice = async (orderId: string) => {
  try {
    const fileUrl = await getInvoiceUrl(orderId);
    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error('Failed to fetch invoice file');

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice-${orderId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Invoice download failed:', err);
  }
};



// export interface Address {
//   id?: string; // The ID is optional when adding a new address
//   name: string;
//   addressLine1: string;
//   addressLine2?: string;
//   pinCode: string;
//   city: string;
//   state: string;
//   country: string;
//   phone: string;
//   addressType: string; // e.g., 'Home', 'Office', etc.
// }
// type GetAddressesResponse = {
//   data: Address[];
// };
// export const getAllProducts = async () => {
//   const res = await fetch(`https://product-service-23pc.onrender.com/api/products`);
//   if (!res.ok) {
//     throw new Error(`HTTP error! status: ${res.status}`);
//   }
//   const json = await res.json();
//   return json.data;
// };

// export const getProductBySlug = async (slug: string) => {
//   const res = await fetch(`https://product-service-23pc.onrender.com/api/products/slug/${encodeURIComponent(slug)}`);

//   if (!res.ok) {
//     console.error(`Failed to fetch product by slug: ${slug}, status: ${res.status}`);
//     throw new Error(`Failed to fetch product data`);
//   }

//   const json = await res.json();

//   return json?.data; // assuming your backend wraps response as { data: ... }
// };
// export const getRatingsByProductId = async (productId: string) => {
//   const res = await fetch(`https://product-service-23pc.onrender.com/ratings/product/${encodeURIComponent(productId)}`);

//   if (!res.ok) {
//     console.error(`Failed to fetch ratings for productId: ${productId}, status: ${res.status}`);
//     throw new Error('Failed to fetch product ratings');
//   }

//   const json = await res.json();
//   return json?.data; // assuming your backend wraps response as { data: [...] }
// };
// const getAuthHeaders = () => {
//   const token = localStorage.getItem('token');
//   if (!token) {
//     throw new Error('No token found');
//   }
//   return {
//     'Content-Type': 'application/json',
//     'Authorization': `Bearer ${token}`,
//   };
// };

// // Fetch all addresses for the logged-in user
// export const getAllAddresses = async (): Promise<Address[]> => {
//   const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses`, {
//     method: 'GET',
//     headers: getAuthHeaders(),
//   });

//   if (!res.ok) {
//     console.error(`Failed to fetch addresses, status: ${res.status}`);
//     throw new Error('Failed to fetch addresses');
//   }

//   const json = await res.json();

//   // ✅ SAFELY return the array
//   return Array.isArray(json?.data) ? json.data : [];
// };


// // Add a new address
// export const addAddress = async (newAddress: Address): Promise<Address> => {
//   const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses`, {
//     method: 'POST',
//     headers: getAuthHeaders(),
//     body: JSON.stringify(newAddress),
//   });

//   if (!res.ok) {
//     console.error(`Failed to add address, status: ${res.status}`);
//     throw new Error('Failed to add address');
//   }

//   const data = await res.json();
//   return data; // Assuming the response returns the added address
// };

// // Edit an existing address
// export const editAddress = async (addressId: string, updatedAddress: Address): Promise<Address> => {
//   const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses/${addressId}`, {
//     method: 'PATCH',
//     headers: getAuthHeaders(),
//     body: JSON.stringify(updatedAddress),
//   });

//   if (!res.ok) {
//     console.error(`Failed to edit address, status: ${res.status}`);
//     throw new Error('Failed to edit address');
//   }

//   const data = await res.json();
//   return data; // Assuming the response returns the updated address
// };

// // Delete an address
// export const deleteAddress = async (addressId: string): Promise<void> => {
//   const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses/${addressId}`, {
//     method: 'DELETE',
//     headers: getAuthHeaders(),
//   });

//   if (!res.ok) {
//     console.error(`Failed to delete address, status: ${res.status}`);
//     throw new Error('Failed to delete address');
//   }

//   // No need to return anything if it's just a delete operation
//   await res.json(); // We assume we don't need to handle the response here
// };







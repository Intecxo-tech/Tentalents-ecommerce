export interface Address {
  id?: string; // The ID is optional when adding a new address
  name: string;
  addressLine1: string;
  addressLine2?: string;
  pinCode: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  addressType: string; // e.g., 'Home', 'Office', etc.
}
type GetAddressesResponse = {
  data: Address[];
};
export const getAllProducts = async () => {
  const res = await fetch(`https://product-service-23pc.onrender.com/products`);
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  const json = await res.json();
  return json.data;
};

export const getProductBySlug = async (slug: string) => {
  const res = await fetch(`https://product-service-23pc.onrender.com/products/slug/${encodeURIComponent(slug)}`);

  if (!res.ok) {
    console.error(`Failed to fetch product by slug: ${slug}, status: ${res.status}`);
    throw new Error(`Failed to fetch product data`);
  }

  const json = await res.json();

  return json?.data; // assuming your backend wraps response as { data: ... }
};
export const getRatingsByProductId = async (productId: string) => {
  const res = await fetch(`https://product-service-23pc.onrender.com/ratings/product/${encodeURIComponent(productId)}`);

  if (!res.ok) {
    console.error(`Failed to fetch ratings for productId: ${productId}, status: ${res.status}`);
    throw new Error('Failed to fetch product ratings');
  }

  const json = await res.json();
  return json?.data; // assuming your backend wraps response as { data: [...] }
};
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No token found');
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };
};

// Fetch all addresses for the logged-in user
export const getAllAddresses = async (): Promise<Address[]> => {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    console.error(`Failed to fetch addresses, status: ${res.status}`);
    throw new Error('Failed to fetch addresses');
  }

  const data = await res.json();
  return data; // Assuming the response contains an array of addresses
};

// Add a new address
export const addAddress = async (newAddress: Address): Promise<Address> => {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(newAddress),
  });

  if (!res.ok) {
    console.error(`Failed to add address, status: ${res.status}`);
    throw new Error('Failed to add address');
  }

  const data = await res.json();
  return data; // Assuming the response returns the added address
};

// Edit an existing address
export const editAddress = async (addressId: string, updatedAddress: Address): Promise<Address> => {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses/${addressId}`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(updatedAddress),
  });

  if (!res.ok) {
    console.error(`Failed to edit address, status: ${res.status}`);
    throw new Error('Failed to edit address');
  }

  const data = await res.json();
  return data; // Assuming the response returns the updated address
};

// Delete an address
export const deleteAddress = async (addressId: string): Promise<void> => {
  const res = await fetch(`https://order-service-faxh.onrender.com/api/orders/addresses/${addressId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!res.ok) {
    console.error(`Failed to delete address, status: ${res.status}`);
    throw new Error('Failed to delete address');
  }

  // No need to return anything if it's just a delete operation
  await res.json(); // We assume we don't need to handle the response here
};

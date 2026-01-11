import React, { useState, useEffect } from 'react';
import { MapPinPlus, PlusIcon, Trash, Pencil } from 'lucide-react';
import AddAddress from '../addaddresspopup/addaddress';
import './address.css';
import toast from 'react-hot-toast';
import { getAllAddresses, deleteAddress } from '../../../services/productService'; // Removed 'editAddress' import
import AddressSkeleton from './AddressSkeleton';

type AddressProps = {
  showLocate: boolean;
  vendorId: string;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>;
};

const Address = ({ vendorId, setAddress }: AddressProps) => {
  const [isAddressOpen, setIsAddressOpen] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<any | null>(null);

  useEffect(() => {
    const fetchAddresses = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setAddresses([]);
        return;
      }

      setLoading(true);
      try {
        const addresses = await getAllAddresses();
        if (!Array.isArray(addresses)) {
          setAddresses([]);
          return;
        }
        setAddresses(addresses);
      } catch (error: any) {
        console.error('Error fetching addresses:', error);
        setAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setAddress(addressId);
  };

  const combineAddress = (address: any) => {
    return `${address.addressLine1} ${address.addressLine2 || ''}, ${address.city}, ${address.state}, ${address.pinCode}, ${address.country}`;
  };

  const handleEditAddress = (addressId: string) => {
    const addressToEdit = addresses.find(address => address.id === addressId);
    setAddressToEdit(addressToEdit);
    setIsEditing(true);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      deleteAddress(addressId)
        .then(() => {
          setAddresses(prevAddresses => prevAddresses.filter(address => address.id !== addressId));
          toast.success('Address deleted successfully');
        })
        .catch(error => {
          toast.error('Failed to delete address');
          console.error('Error deleting address:', error);
        });
    }
  };

  // ✅ FIXED FUNCTION: Updates state immediately without calling API again
  const handleSaveEditedAddress = (updatedAddress: any) => {
    // We do NOT call editAddress() here because AddAddress.tsx already did it.
    // We just update the local list with the data passed back.
    
    setAddresses(prevAddresses =>
      prevAddresses.map(address =>
        address.id === updatedAddress.id ? updatedAddress : address
      )
    );
    
    setIsEditing(false);
    setAddressToEdit(null);
    // toast.success('Address updated successfully'); // Optional: Toast is already shown in popup
  };

  return (
    <div className="addressmain">
      <div className="addressheader">
        <div className="address-header">
          <div className="address-headername">
            <h2>Delivery Address</h2>
          </div>
          <div className="addressbuttons">
            <button onClick={() => setIsAddressOpen(true)} className="background-button">
              Add Address <PlusIcon />
            </button>
          </div>
        </div>
      </div>
      <div className="address-container">
        {loading ? (
          <AddressSkeleton />
        ) : (
          addresses.length > 0 ? (
            addresses.map((item) => (
              <div key={item.id} className={`address-bar ${selectedAddressId === item.id ? 'selected' : ''}`} >
                <div
                  className='address-card '
                  onClick={() => handleSelectAddress(item.id)}
                >
                  <div className="addressleft">
                    <p className="addressheading">Address - {item.addressType}</p>
                    <p className="address">{combineAddress(item)}</p>
                  </div>
                  <div className="addressright">
                    <button
                      className="bordered-button"
                      onClick={(e) => { e.stopPropagation(); handleEditAddress(item.id); }}
                    >
                      Edit <Pencil />
                    </button>
                    <button
                      className="bordered-button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteAddress(item.id); }}
                    >
                      Delete <Trash />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className='address-notfound'>No addresses available.</p>
          )
        )}
      </div>

      <AddAddress
        isOpen={isAddressOpen}
        onClose={() => setIsAddressOpen(false)}
        vendorId={vendorId}
        onAdd={(newAddress) => setAddresses(prevAddresses => [...prevAddresses, newAddress])}
      />

      {isEditing && addressToEdit && (
        <AddAddress
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          vendorId={vendorId}
          addressToEdit={addressToEdit}
          onAdd={handleSaveEditedAddress} // Connects to the fixed function above
        />
      )}
    </div>
  );
};

export default Address;

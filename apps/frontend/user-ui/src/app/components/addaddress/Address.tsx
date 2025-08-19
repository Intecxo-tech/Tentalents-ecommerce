import React, { useState, useEffect } from 'react';
import { MapPinPlus, PlusIcon, Trash, Pencil } from 'lucide-react';
import AddAddress from '../addaddresspopup/addaddress';
import './address.css';
import toast from 'react-hot-toast';
import { getAllAddresses, addAddress, editAddress, deleteAddress } from '../../../services/productService';

type AddressProps = {
  showLocate: boolean;
  vendorId: string;
  setAddress: React.Dispatch<React.SetStateAction<string | null>>; // Prop to set address in parent component
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
      console.warn('User not logged in. Skipping address fetch.');
      setAddresses([]); // Clear any old state
      return;
    }

    setLoading(true);
    try {
      const addresses = await getAllAddresses(); 
setAddresses(addresses || []);
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setLoading(false);
    }
  };

  fetchAddresses();
}, []);

  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);  // Set the selected address ID
    setAddress(addressId);  // Pass it to parent component
  };

  const combineAddress = (address: any) => {
    return `${address.addressLine1} ${address.addressLine2 || ''}, ${address.city}, ${address.state}, ${address.pinCode}, ${address.country}`;
  };

  const handleEditAddress = (addressId: string) => {
    const addressToEdit = addresses.find(address => address.id === addressId);
    setAddressToEdit(addressToEdit);
    setIsEditing(true);  // Open the edit form
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

  const handleSaveEditedAddress = async (updatedAddress: any) => {
    try {
      const updated = await editAddress(updatedAddress.id, updatedAddress);
      setAddresses(prevAddresses =>
        prevAddresses.map(address =>
          address.id === updated.id ? updated : address
        )
      );
      setIsEditing(false);
      toast.success('Address updated successfully');
    } catch (error) {
      toast.error('Failed to update address');
      console.error('Error updating address:', error);
    }
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
          <p>Loading addresses...</p>
        ) : (
          addresses.length > 0 ? (
            addresses.map((item) => (
              <div key={item.id} className={`address-bar ${selectedAddressId === item.id ? 'selected' : ''}`} >
                <div
                  className='address-card '
                  onClick={() => handleSelectAddress(item.id)}  // Select the address
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
          addressToEdit={addressToEdit}  // Pass the address to edit
          onAdd={handleSaveEditedAddress}  // Use save function instead of adding a new address
        />
      )}
    </div>
  );
};

export default Address;


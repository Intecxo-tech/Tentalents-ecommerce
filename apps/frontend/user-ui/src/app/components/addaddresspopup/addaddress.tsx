'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPinPlus } from 'lucide-react';
import './addaddress.css';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import toast from 'react-hot-toast';

type AddAddressProps = {
  isOpen: boolean;
  onClose: () => void;
  vendorId: string;
  onAdd: (newAddress: any) => void;
  addressToEdit?: any;  // Added this prop for editing an existing address
};

const API_BASE_URL = 'https://order-service-faxh.onrender.com'; 

const AddAddress = ({ isOpen, onClose, vendorId, addressToEdit, onAdd }: AddAddressProps) => {
  const formRef = useRef<HTMLDivElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [addressType, setAddressType] = useState('Home');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (addressToEdit) {
      setName(addressToEdit.name);
      setPhone(addressToEdit.phone);
      setCountry(addressToEdit.country);
      setState(addressToEdit.state);
      setCity(addressToEdit.city);
      setPinCode(addressToEdit.pinCode);
      setAddressLine1(addressToEdit.addressLine1);
      setAddressLine2(addressToEdit.addressLine2);
      setAddressType(addressToEdit.addressType);
      setIsDefault(addressToEdit.isDefault);
    } else {
      // Reset form if no addressToEdit
      setName('');
      setPhone('');
      setCountry('');
      setState('');
      setCity('');
      setPinCode('');
      setAddressLine1('');
      setAddressLine2('');
      setAddressType('Home');
      setIsDefault(false);
    }
  }, [addressToEdit]);  // Update state when addressToEdit changes

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (formRef.current && !formRef.current.contains(target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle submit: call backend API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem('token');
    const payload = {
      addressLine1,
      addressLine2,
      addressType,
      city,
      vendorId,
      country,
      isDefault,
      name,
      phone,
      pinCode,
      state,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/addresses`, {
        method: addressToEdit ? 'PUT' : 'POST', // PUT if editing, POST if adding
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save address');
      }

      toast.success(addressToEdit ? 'Address updated successfully!' : 'Address added successfully!');
      onClose();  // Close the popup
      onAdd(payload);  // Notify parent with the new/updated address
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to save address');
    }
  };

  return (
    <div className="popup-overlay">
      <div className="addaddresspopup" ref={formRef}>
        <div className="addresspopup-header">
          <h2>{addressToEdit ? 'Edit Address' : 'Add New Address'}</h2>
          <button className="bordered-button" onClick={onClose}>Close</button>
        </div>

        <form className="addressform" onSubmit={handleSubmit}>
          <div className="firstcolumn topsection">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <PhoneInput
              country={'us'}
              value={phone}
              onChange={(phone) => setPhone(phone)}
              inputClass="phone-input"
            />
          </div>

          <div className="newdelivery">
            <h2 className="sectiontitle">Add New Delivery Address</h2>

            <div className="firstcolumn">
              <input
                type="text"
                placeholder="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </div>

            <div className="firstcolumn">
              <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Postal Code"
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value)}
                required
              />
            </div>

            <div className="address-section">
              <input
                type="text"
                placeholder="Flat, House no., Building, Company, Apartment"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
              <button type="button" className="background-button">
                Locate Me <MapPinPlus />
              </button>
            </div>

            <input
              type="text"
              placeholder="Area, Street, Sector, Village"
              value={addressLine2}
              className="input-field"
              onChange={(e) => setAddressLine2(e.target.value)}
            />
          </div>

          <div className="chooseaddress">
            <div className="addresstype">
              <h2>Address Type</h2>
            </div>
            <div className="selectone">
              {['Home', 'Business', 'Relative', 'Others'].map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`bordered-button ${addressType === type ? 'selected' : ''}`}
                  onClick={() => setAddressType(type)}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <textarea className="instructions" placeholder="Any Instructions" />

          <div className="useaddress">
            <label>
              <input
                type="checkbox"
                checked={isDefault}
                onChange={() => setIsDefault(!isDefault)}
              />
              Use this as default address
            </label>
            <button type="submit" className="background-button" disabled={loading}>
              {loading ? 'Saving...' : addressToEdit ? 'Save Changes' : 'Add Address'}
            </button>
          </div>

          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AddAddress;


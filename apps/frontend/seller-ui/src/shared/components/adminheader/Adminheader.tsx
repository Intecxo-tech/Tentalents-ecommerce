import { Search, CreditCard } from 'lucide-react';
import React from 'react';
import './admin.css';
import { useAdminTab } from '../../../services/AdminTabContext'; // ✅ Already correct
import Link from 'next/link';
function Adminheader() {
  const { activeTab, setActiveTab } = useAdminTab(); // ✅ Use context instead of props

  return (
    <div className='headermain'>
      <div className='adminheader'>
        <div className="leftside">
          <div className="searchbar">
            <input
              className="search-input"
              placeholder={`Search ${activeTab === 'vendors' ? 'Vendors' : 'Customers'}`}
            />
            <div className="background-button">
              <Search className="search-icon" size={20} />
            </div>
          </div>

          <div className="approval">
            <Link href="/dashboard/approve"><button className='background-button'>Approvals <CreditCard /></button></Link>
          </div>
        </div>

        <div className="switch2">
          <div className="swicthtab">
            <p
              className={activeTab === 'vendors' ? 'active-tab' : ''}
              onClick={() => setActiveTab('vendors')}
            >
              Vendors
            </p>
            <p
              className={activeTab === 'customers' ? 'active-tab' : ''}
              onClick={() => setActiveTab('customers')}
            >
              Customers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Adminheader;

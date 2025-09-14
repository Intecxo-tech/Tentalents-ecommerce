'use client';

import React from 'react';
import Vendor from '../../../../shared/components/vendors/Vendor';
import Customer from '../../../../shared/components/customer/Customer';
import { useAdminTab } from '../../../../services/AdminTabContext'; // ✅ Use context here

function AdminDashboard() {
  const { activeTab } = useAdminTab(); // ✅ Get shared state from context

  return (
    <div className="tab-content">
      {activeTab === 'vendors' && <Vendor />}
      {activeTab === 'customers' && <Customer />}
    </div>
  );
}

export default AdminDashboard;

// apps/frontend/seller-ui/src/shared/layouts/StoreLayout.tsx

'use client';
import React from 'react';
import Balance from '../../components/balance/Balance';
import Inventory from '../../components/inventory/Inventory';
import InventorySection from '../../components/InventorySection/InventorySection';
import Products from '../../components/noproducts/products';
import ProductHistory from '../../components/ProductHistory/ProductHistory';
import Ordercancel from '../../components/ordercancel/Ordercancel';
import '../../../app/(routes)/dashboard/store/store.css'; // optional

const StoreLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className='p-[20px] background-[white] rounded-[10px]'>
      <div className="store-header">
        <div className="storecomponents ">
          <div className="earning">
            <Balance />
          </div>
          <div className="noproducts">
            <Products />
          </div>
          <div className="fulfillment">
            <ProductHistory />
          </div>
          <div className="ordercancel">
            <Ordercancel />
          </div>
        </div>
      </div>

      <div className="productsection">
        {children}
      </div>
    </div>
  );
};

export default StoreLayout;

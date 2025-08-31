import React from 'react';
import Image from 'next/image';
import Dropdown from '../dropdown/Dropdownbutton';
import Balanceicon from '../../../assets/balance.png';

interface VendorOrder {
  id: string;
  quantity: number;
  totalPrice: string;
  dispatchStatus: string;
 
  order?: {
    id: string;
    status: string;
    createdAt?: string;
       paymentStatus?: string;
  };
}

interface BalanceProps {
  orders: VendorOrder[];
}

const statusOptions = ['Past Week', 'Yesterday', 'Last Month'];

const Balance = ({ orders = [] }: BalanceProps) => {
 const completedOrders = orders.filter(order => {
  return order.order?.paymentStatus?.toLowerCase() === 'success' &&
         order.order?.status?.toLowerCase() === 'delivered';
});

  const totalBalance = completedOrders.reduce(
    (sum, order) => sum + parseFloat(order.totalPrice),
    0
  );

  const recentOrder = completedOrders[0];
  const recentAmount = recentOrder ? parseFloat(recentOrder.totalPrice) : 0;
  return (
    <div>
      <div className="Balance p-[15px] rounded-[10px] flex flex-col gap-[10px] flex-1">
        <div className="balanceheading flex justify-between items-center ">
          <div className="flex justify-flex-start gap-[10px] items-center">
            <Image src={Balanceicon} alt="balanceicon" />
            <h2 className="mainheading">Balance</h2>
          </div>
          <div className="dropdownbutton">
            <Dropdown
              options={statusOptions}
              defaultValue="Past Week"
              onSelect={(value) => {
                console.log('Selected status:', value);
              }}
            />
          </div>
        </div>

        <div className="balanceamount text-[32px] text-[var(--secondary)]">
          <h2>${totalBalance.toFixed(2)}</h2>
        </div>

        <div className="totalbalance bg-[#EBEBEB] flex justify-between items-center p-[10px] rounded-[10px]">
          <p className="text-[var(--grey)]">Recents</p>
          <p>+${recentAmount.toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
};

export default Balance;

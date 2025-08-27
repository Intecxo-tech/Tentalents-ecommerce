import React from 'react'
import Balanceicon from '../../../assets/balance.png';
import Image from 'next/image';
import Dropdown from '../dropdown/Dropdownbutton';
const statusOptions = [
  "Past Week",
  "Yesterday",
  "Last Month"
];
const Balance = () => {
  return (
   <div>
    <div className="Balance p-[15px] rounded-[10px]  flex flex-col gap-[10px] flex-1">
        <div className="balanceheading flex justify-between items-center ">
           <div className="flex justify-flex-start gap-[10px] items-center">
            <Image src={Balanceicon} alt="balanceicon" />
            <h2 className='mainheading'>Balance</h2>
          </div>
            <div className="dropdownbutton">
                           <Dropdown
                            options={statusOptions}
                            defaultValue="Past Week"
                            onSelect={(value) => {
                              console.log("Selected status:", value);
                            }}
                          />
            
        </div>
        

        </div>
        <div className="balanceamount text-[32px] text-[var(--secondary)]">
            <h2>$12,333</h2>
        </div>
        <div className="totalbalance bg-[#EBEBEB] flex justify-between items-center p-[10px] rounded-[10px]">
            <p className='text-[var(--grey)]'>Recents</p>
            <p>+$14.55</p>
        </div>
    </div>
   </div>
  )
}

export default Balance
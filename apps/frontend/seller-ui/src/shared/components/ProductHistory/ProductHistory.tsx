import React from 'react'
import fulfil from '../../../assets/blur_on.png'
import Image from 'next/image'
import Dropdown from '../dropdown/Dropdownbutton';
import { Bell } from 'lucide-react';
const statusOptions = [
  "10 Orders",
  "20 Orders",
  "30 Orders"
];
const ProductHistory = () => {
  return (
   <div className="productHistory p-[15px] rounded-[10px] bg-white flex flex-col gap-[10px] flex-1">

         <div className="inventoryheading flex align-center justify-between gap-[10px] ">
                <div className='flex justify-flex-start items-center gap-[10px]'>
                  <Image src={fulfil} alt='monitor' />
                 
                  <h2 className="mainheading">Fulfillment %</h2>
                </div>
                <div className='flex justify-flex-end'>
                  <Dropdown
                    options={statusOptions}
                    defaultValue="10 Orders"
                    onSelect={(value) => {
                      console.log("Selected status:", value);
                    }}
                  />
                </div>
              </div>

              <div className="orderpercentage">
                <h2 className='text-[32px] text-[var(--secondary)]'>90%</h2>
              </div>
              <div className=" flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#EBEBEB]">
            <p className='text-[var(--grey)]'><Bell /></p>
            <p>Recent 10 Order Were Fullfilled</p>
        </div>
    </div>
  )
}

export default ProductHistory
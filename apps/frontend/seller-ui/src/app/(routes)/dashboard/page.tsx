'use client';
import HeaderBanner from '../../../shared/components/header/headerbanner'

import HomeProducts from '../../../shared/components/ProductsSold/HomeProducts';
import React from 'react'
import ProductSold from '../../../shared/components/ProductsSold/product_soldperformance/ProductSold';
import ProductTabs from '../../../shared/components/ProductTabs/ProductTabs'
import InventorySection from '../../../shared/components/InventorySection/InventorySection';
import Balance from '../../../shared/components/balance/Balance';
import ProductHistory from '../../../shared/components/ProductHistory/ProductHistory';
import './page.css'

const page = () => {
  return (
    <div className='background-[var(--lightblue2)] p-[10px] rounded-[10px]'>
     

   <div className="topsection flex justify-between gap-[10px] background-[white] p-[10px] rounded-[10px] mb-[15px]">
  <div className=" producthistorts w-1/3">
    <Balance />
  </div>
  <div className=" producthistorts w-1/3">
    <HomeProducts />
  </div>
  <div className=" producthistorts w-1/3">
    <ProductHistory />
  </div>
</div>

     <div className="flex justify-between gap-6 bottomsection ">
  <div className=" prodiucttabdsw w-[70%] background-[white]  p-[20px] rounded-[10px]">
    <ProductTabs />
  </div>
  <div className=" inventory-sectionw w-[30%] background-[white] p-[20px] rounded-[10px]">

<InventorySection />
   
  </div>
</div>

     
    
    </div>
  )
}

export default page
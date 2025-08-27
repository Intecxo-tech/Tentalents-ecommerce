import { ShoppingCart,ChartNoAxesCombined } from 'lucide-react'
import React from 'react'
import '../../../app/(routes)/dashboard/store/store.css'

const Products = () => {
  return (
    <div className='productrcard flex flex-col gap-[10px] p-[15px] rounded-[10px] bg-[#ffffff]'>
     
            <div className="productheading flex justify-flex-start items-center gap-[10px]">
                <ShoppingCart className='text-[var(--grey)]' />
                <h2 className="mainheading">No Of Products</h2>
            </div>
            <div className="middleproduct">
                <h2 className='text-[32px] text-[var(--secondary)]'>45</h2>
            </div>
            <div className=" flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#E2FFD9]">
                <ChartNoAxesCombined className='text-[var(--grey)]' />
                <h2>+2 Products</h2>
            </div>
      
      
    </div>
  )
}

export default Products

import { ShoppingCart,ChartNoAxesCombined,Code } from 'lucide-react'
import React from 'react'


const Ordercancel = () => {
  return (
    <div className='productrcard flex flex-col gap-[10px] p-[15px] rounded-[10px] bg-[#ffffff]'>
        <div className="noofproduct">
            <div className="productheading flex justify-flex-start items-center gap-[10px]">
                <Code className='text-[var(--grey)]' />
                <h2 className="mainheading">Order Cancellation</h2>
            </div>
            <div className="percentage">
                <h2 className='text-[32px] text-[var(--secondary)]'>4%</h2>
            </div>
            <div className=" flex justify-flex-start items-center p-[10px] gap-[15px] rounded-[10px] bg-[#E2FFD9]">
                <ChartNoAxesCombined className='text-[var(--grey)]' />
                <h2>+2 Products</h2>
            </div>
        </div>
      
    </div>
  )
}

export default Ordercancel

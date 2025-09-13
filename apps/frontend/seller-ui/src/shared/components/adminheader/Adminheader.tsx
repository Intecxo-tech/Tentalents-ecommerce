import { Search,CreditCard } from 'lucide-react'
import React from 'react'
import './admin.css'

function Adminheader() {
  return (
    <div>
      <div className='adminheader'>
        <div className="leftside">

          <div className="searchbar">
            <input className="search-input" placeholder="Search Vendors" />
            <div className="background-button">
              <Search className="search-icon" size={20} />
            
          </div>
        </div>
       
        <div className="approval">
            <button className='background-button'>Approvals <CreditCard /></button>
        </div>
        </div>
            
        <div className="switch">
            <div className="swicthtab">
  <p>Vendors</p>
            <p>Customers</p>
            </div>
          
           

        </div>
      </div>
    </div>
  )
}

export default Adminheader

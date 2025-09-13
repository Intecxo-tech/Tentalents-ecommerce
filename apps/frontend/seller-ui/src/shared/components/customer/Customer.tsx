import React from 'react'
import Ramesh from '../../../assets/ramesh.png'
import Image from 'next/image';
import { Star } from 'lucide-react';
import '../vendors/vendor.css';
function Customer() {
  return (
    <div>
      <div className="vendorcard">
        <div className="cardstyles">
          <div className="vendordeatil">
            <div className="vendorleft">
             <Image src={Ramesh} alt="ramesh" />
            </div>
            <div className="vendorright">
              <div className="vendorname">
                <h2>Ramesh Bapate</h2>
                <div className="stars">
                  <p>4.2</p>
                  <Star />
                  <p className='head'>(100)</p>
                </div>

              </div>
              <p className='productslist'>50+ Products</p>
               <div className="catrgoies">
                <p className='catrgoryname'>Live Order - 2</p>
                <p className='catrgoryname'>Total Orders 4</p>
                <p className='catrgoryname'>Mumbai.Maharastra</p>
              </div>
            </div>
          </div>
        <div className="vendorbottom">
          <p><span className='leftsidetext'>Address</span><br></ br>
          Datta Mandir Chowk, Row House No. 4, Lunked Garden, Satyam Marg, Viman Nagar - 411014 - Pune - Maharashtra - India
</p>
<div className="first-column">
  <p><span className='leftsidetext'>Phone No:</span>+9578963548</p>
  <p><span className='leftsidetext'>Email</span>helo@gmail.com</p>
</div>

        </div>
        </div>
      </div>
    </div>
  )
}

export default Customer
import React from 'react'
import Ramesh from '../../../assets/ramesh.png'
import Image from 'next/image';
import { Star } from 'lucide-react';
import '../vendors/vendor.css'
import './approve.css'
function VendorApprove() {
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
                <p className='catrgoryname'>Electronics</p>
                <p className='catrgoryname'>Home Appliances</p>
                <p className='catrgoryname'>Tools</p>
              </div>
            </div>
          </div>
        <div className="vendorbottom">
            <div className="personalsection">
                
                <div className="personalbox">
                    <h2>Personal Details</h2>
                    <div className="details">
   <table className="info-table">
        <tbody>
          <tr>
            <td className="leftsidetext">Address</td>
            <td className="rightsidebar">Datta Mandir Chowk, Row House No. 4, Lunked Garden, Satyam Marg, Viman Nagar - 411014 - Pune - Maharashtra - India</td>
          </tr>
          <tr>
            <td className="leftsidetext">Phone No:</td>
            <td className='rightsidebar'>+9578963548</td>
          </tr>
          <tr>
            <td className="leftsidetext">Email</td>
            <td className='rightsidebar'>helo@gmail.com</td>
          </tr>
          <tr>
            <td className="leftsidetext">GST IN:</td>
            <td className='rightsidebar'>+847859632</td>
          </tr>
          <tr>
            <td className="leftsidetext">Aadhar CARD:</td>
            <td className='rightsidebar'>abcd1478596</td>
          </tr>
          <tr>
            <td className="leftsidetext">PAN CARD:</td>
            <td className='rightsidebar'>gsjdj1478593</td>
          </tr>
        </tbody>
      </table>
                    </div>
                      
                </div>
                   <div className="personalbox">
                    <h2>Bank Details</h2>
                    <div className="details">

                   <table className="info-table">
                    <tbody>
                          <tr>
            <td className="leftsidetext">Bank Account Number:</td>
            <td className='rightsidebar'>47859636548</td>
          </tr>
          <tr>
            <td className="leftsidetext">IFSC Code:</td>
            <td className='rightsidebar'>KKSB1478</td>
          </tr>
          <tr>
            <td className="leftsidetext">Branch Name:</td>
            <td className='rightsidebar'>malad.mumbai</td>
          </tr>
                    </tbody>
                   </table>
 
                </div>
                </div>
            </div>
          


        </div>
        <div className="approvalcontainer">
            <p>Approval Status</p>
            <div className="buttons">
                <button className='bordered-button'>Deny</button>
                <button className='background-button'>Approve</button>
            </div>
        </div>
        </div>
      </div>
    </div>
  )
}

export default VendorApprove

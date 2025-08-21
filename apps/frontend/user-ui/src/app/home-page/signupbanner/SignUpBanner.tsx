import React from 'react';
import './SignUpBanner.css';
import { Headphones, TruckIcon,ShieldCheck, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import BannerImage from '../../../assets/signupimage.png'
const SignUpBanner = () => {
  return (
    <div className="delivery">
      <div className="features">
        <div className="feature1">
             <div className="icon">
                  <TruckIcon />
              </div>
              <div className="feature-content">
                 <h3>Free And Fast Delivery</h3>
                  <p>Free delivery for all orders over $140</p>
              </div>
               
        </div>
        <div className="feature1">
             <div className="icon">
                  <Headphones />
              </div>
               <div className="feature-content">
                  <h3>24/7 Customer Service</h3>
                  <p>Friendly 24/7 customer support</p>
                </div>
        </div>
        <div className="feature1">
             <div className="icon">
                  <ShieldCheck />
              </div>
               <div className="feature-content">
                  <h3>Money Back Guarantee</h3>
                  <p>We reurn money within 30 days</p>
                </div>
        </div>
      </div>
      <div className="banner-section">
        <div className="banner-image">
           <Image src={BannerImage} alt="BannerImage" />
        </div>
        <div className="banner-content">
            <h3 className="banner-heading">Get Signed-up On Tentalents and Get amazing offers</h3>
            <p className="content-para">Discover top deals on appliances, electronics & more all in one place.</p>
            <button className="background-button buttnosection">Explore Now  <ChevronRight /></button>
            </div>
      </div>
    </div>
  );
};

export default SignUpBanner;

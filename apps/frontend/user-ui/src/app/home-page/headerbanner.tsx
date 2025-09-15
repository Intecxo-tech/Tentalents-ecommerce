'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { categories } from '../../configs/constants';
import './headerbanner.css';
import jeans from '../../assets/jeans.png';
import appliances from '../../assets/appliances.png';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
const HeaderBanner = () => {
  const router = useRouter();
  
    const handleCategoryClick = (category: string) => {
      router.push(`/shop?category=${encodeURIComponent(category)}`);
    };
  
  return (
    <div>
      <div className="category-main">
        {/* Category section */}
        

        {/* Banner section */}
        <div className="banner">
          <div className="section-1">
           <div className="content">
            <h3 className='banner-heading'>Denim That Defines</h3>
            <p className='content-para'>Explore premium fits, rugged comfort, and timeless style made for every move.</p>
          <Link href="/shop"> <button className="bordered-button">
              Explore Now <ChevronRight />
            </button></Link> 
            </div>
            {/* <Image className="images" src={jeans} alt="jeans" />*/}
           
          </div>

          <div className="section-2">
            {/* You can add more content here if needed */}
            <div className="content-part">
             <h3 className='banner-heading'>Upgrade Your Home, Effortlessly</h3>
            <p className='content-para'>Explore premium fits, rugged comfort, and timeless style made <br /> for every move.</p>
            <button className="bordered-button"  onClick={() => handleCategoryClick('appliances')}>
              Explore Now <ChevronRight />
            </button>
            </div>
            <div className="image-part">
          
              {/*<Image src={appliances} alt="appliances" className="image-1"/>
            */} 
           
            </div>
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderBanner;

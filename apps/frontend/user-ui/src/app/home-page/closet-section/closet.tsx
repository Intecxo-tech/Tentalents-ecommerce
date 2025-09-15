import React from 'react';
import './closet.css';
import Image from 'next/image';
import Link from 'next/link';
import closet from "../../../assets/closets.png";
import { ChevronRight } from 'lucide-react';

const Closet = () => {
  return (
    <div className="closet">
      <div className="closet-section">
        <div className="closet-left">
          <h3 className="banner-heading">Closet Refresh Starts Here</h3>
          <p className="content-para">
            From bold layers to everyday essentials discover <br/>styles that fit your vibe.
          </p>
        <Link href="/shop"><button className="background-button">
            Explore Now <ChevronRight />
          </button></Link>  
        </div>
        <div className="closet-right">
          <Image src={closet} alt="closet-img" />
        </div>
      </div>
    </div>
  );
};

export default Closet;

'use client'; // Only needed if this component is in `/app` folder

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import jeans from '../../assets/jeans.png';
import appliances from '../../assets/appliances.png';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';// Note: this is for `/pages`, not `/app` routing

const BannerSection = () => {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div>
      {/* Banner section */}
      <div className="banner">
        <div className="section-2">
          <div className="content-part">
            <h3 className="banner-heading">Upgrade Your Home, Effortlessly</h3>
            <p className="content-para">
              Explore premium fits, rugged comfort, and timeless style made <br /> for every move.
            </p>
            <Link href="/shop">
              <button className="background-button mt-[10px]">
                Explore Now <ChevronRight />
              </button>
            </Link>
          </div>
          <div className="image-part">
            {/* <Image src={appliances} alt="appliances" className="image-1" /> */}
          </div>
        </div>

        <div className="section-1">
          <div className="content">
            <h3 className="banner-heading">Denim That Defines</h3>
            <p className="content-para">
              Explore premium fits, rugged comfort, and timeless style made for every move.
            </p>

            {/* ✅ This button now filters the category */}
            <button
              className="background-button mt-[10px]"
              onClick={() => handleCategoryClick('appliances')}
            >
              Explore Now <ChevronRight />
            </button>
          </div>

          {/* <Image className="images" src={jeans} alt="jeans" /> */}
        </div>
      </div>
    </div>
  );
};

export default BannerSection;

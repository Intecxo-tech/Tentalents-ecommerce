import React from 'react';
import HeaderBanner from './home-page/headerbanner';
import Products from './home-page/products-grid/productsgrid';
import Closet from './home-page/closet-section/closet';
import Productslist from './home-page/productlist/Productlist';
import './home-page/homepage.css';
import BannerSection from './home-page/bannersection/BannerSection';
import ProductTabs from './home-page/productstabs/ProductTabs';
import SignUpBanner from './home-page/signupbanner/SignUpBanner';
import Categories from './home-page/categories/categoriessection';

const Page = () => {
  return (
    <div className='homepage'>
      <Categories />
      <HeaderBanner />
      
      <Products columns={5}/>
      <Closet />
      <Products columns={5} />

      <div className="section-5 ">
        <div className="product-list-items">
          <Productslist listCount={3} />
        </div>
        <div className="product-grid-tem">
        <Products columns={4} />
      </div>

      </div>

      
      <BannerSection  />
      <ProductTabs />
    </div>
  );
};


export default Page;
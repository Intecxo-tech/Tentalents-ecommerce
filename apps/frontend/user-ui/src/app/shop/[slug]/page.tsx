'use client';

import { use, useState } from 'react';
import { products, sellers } from '../../../configs/constants';
import Image from 'next/image';
import Ramesh from "../../../assets/ramesh.png";
import UPI from "../../../assets/upi.png";
import visa from "../../../assets/visa.png";
import bank from "../../../assets/bank.png";
import BankTransfer from "../../../assets/banktransfer.png";
import ReviewModal from "../../components/reviews/ReviewModal";
import './singleproductpage.css';
import ProductTabs from '../../home-page/productstabs/ProductTabs';
import productimage from "../../../assets/productimage.png";
import { ChevronUp, ChevronDown, StarIcon, PlusIcon, PinIcon, LocateIcon, MapPin, MapPinPlus, Pencil, Minus, ChevronRight } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa'
import ProductCart from '../../components/productaddtocart/addtocartproduct';
import Products from '../../home-page/products-grid/productsgrid';
import Categories from '../../home-page/categories/categoriessection';

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params); // ✅ unwrap params safely
  const [quantity,setQuantity] = useState(1);
  const product = products.find((p) => {
    const slugFromHref = p.href.split('/').pop();
    return slugFromHref === slug;
  });

  if (!product) return <p>Product Not Found</p>;

  const sellerInfo = product.seller;
  const images = Array.isArray(product.image) ? product.image : product.image ? [product.image] : [];

  const [featuredImage, setFeaturedImage] = useState(images[0]);
  const [isReviewOpen,setIsReviewOpen]=useState(false);
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    about: true,
    measurements: true,
    additionaldetails:true,
    additionaldetails2:true,
    reviews:true
  });

  const toggleSection = (sectionName: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const calculateDiscount = (price: number, offerPrice?: number) => {
    if (!offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };
  const reviews =[
    {
      id:1,
      reviewer:'Ramesh Bapate',
      avatar:Ramesh,
      Topic:'Looks premium, works great',
      Description:'Love how this board looks on my kitchen counter.It works even betteranti-slip edge is super helpful.Very smooth and easy to use for cutting fruits and vegetables.Washing this cutting board also easy. Really impressed with the quality. Will recommend to friends',
      rating:5,
      Date:'12 May'
    },
     {
      id:2,
      reviewer:'Ramesh Bapate',
      avatar:Ramesh,
      Topic:'Looks premium, works great',
      Description:'Love how this board looks on my kitchen counter.It works even betteranti-slip edge is super helpful.Very smooth and easy to use for cutting fruits and vegetables.Washing this cutting board also easy. Really impressed with the quality. Will recommend to friends',
      rating:5,
      Date:'12 May'
    },
     {
      id:3,
      reviewer:'Ramesh Bapate',
      avatar:Ramesh,
      Topic:'Looks premium, works great',
      Description:'Love how this board looks on my kitchen counter.It works even betteranti-slip edge is super helpful.Very smooth and easy to use for cutting fruits and vegetables.Washing this cutting board also easy. Really impressed with the quality. Will recommend to friends',
      rating:5,
      Date:'12 May'
    }
  ]
  return (
    
    <div>

      <div className="productpage ">
       
        <div className="productpage-left">
          <div className="image-gallery">
            <div className="featured-image">
              <Image
                src={featuredImage}
                alt={`${product.title} featured image`}
                width={600}
                height={600}
              />
            </div>

            <div className="thumbnail-gallery">
              {images.map((img, index) => (
  <div
    key={index}
    className={`thumbnail-image ${img === featuredImage ? 'active' : ''}`}
    onClick={() => setFeaturedImage(img)}
    style={{ cursor: 'pointer' }}
  >
    <Image
      src={img}
      alt={`${product.title} thumbnail ${index + 1}`}
      width={100}
      height={100}
    />
  </div>
))}


            </div>
          </div>

         { sellerInfo && 
         ( 
          <div className="storeinfo">
            <div className="storeinfo-left">
              <div className="storeinfo-image">
                <Image src={sellerInfo.image} alt={sellerInfo.name} />
              </div>
              <div className="storeinfor-name">
                <h2>{sellerInfo.name}</h2>
                <p>50+ Products</p>
              </div>
            </div>
            <div className="storeinfo-right">
              <p>Visit Store</p>
            </div>
          </div>
        )
        }
          <div className="peoplealsobought mt-[30px]">
            
            <ProductCart listCount={5} />
          </div>
        </div>

        <div className="productpage-middle">
          <div className="first-section">
            <div className="productrating">
              <p>
                {product.rating} <StarIcon className="staricon" />
                &nbsp;<span>(100)</span>
              </p>
            </div>
            <div className="peoplebought">
              <p>80+ Customer Bought In Last 5mins</p>
            </div>
          </div>

          <h1 className="producttitle">{product.title}</h1>

          <div className="pricesection">
            <div className="pricecontainer">
              {product.offerPrice && (
                <p className="calculate-discount">
                  -{calculateDiscount(product.price, product.offerPrice)}% Off
                </p>
              )}
              <p className="price2">${product.offerPrice ?? product.price}</p>
              {product.offerPrice && (
                <p className="offer-price">(${product.price})</p>
              )}
            </div>

            <div className="coupon-section">
              <form>
                <input
                  type="text"
                  className="coupon-text"
                  placeholder="Apply Coupon Code"
                />
                <button className="bordered-button couponbutton">Apply</button>
              </form>
            </div>
          </div>

      

          <div className="productdescription">
            <div className="productdesc-heading" onClick={() => toggleSection("about")} >
              <h2>About this item</h2>
              {openSections.about ? <ChevronUp /> : <ChevronDown />} 
            </div>
          
           {  openSections.about &&( 
            <>
             <p>
              ✅ PREMIUM STEEL CHOPPING BOARD FOR KITCHEN LARGE – Made with Food-grade
              stainless steel which is rust free and durable, and premium steel chopping board large
              size is perfect for your daily kitchen prep. Say goodbye to olden boards that wear
              out easily. Upgrade your smart kitchen with our Stainless Steel Big chopping board.
              <br /><br />
              ✅ ANTI SLIP LIP DESIGN – SAFE & STURDY – Our exclusive steel cutting board for
              kitchen large features an anti slip lip that holds securely on countertops, making
              rolling roti and chopping veggies safer and more stable – no slipping, no mess. A
              top-rated steel cutting board for everyday use.
            </p>
            <Image src={productimage} alt="productimage" />
            <p>
              ✅ MULTI-PURPOSE & EASY TO CLEAN – Whether it’s chapati dough kneading,
              comfortable roti rolling, slicing fruits, or dicing veggies, this premium steel
              chopping board large your ultimate kitchen companion. It's also incredibly
              comfortable to use and easy to clean, saving you time every day.
              <br /><br />
              ✅ HYGIENIC & DURABLE – Unlike wooden or plastic alternatives, this stainless steel
              cutting board for kitchen is non-porous, prevents residue buildup and eliminating
              risks related to plastic particles or bacteria. Just a quick wipe keeps the chopping
              board spotless and shiny – no stains,no smell.They are a hygienic and durable choice
              for safe food preparation.
            </p>
            <Image src={productimage} alt="productimage" />
            </>
          )
          }
          </div>
          <div className="measurement">
           <div className="productdesc-heading" onClick={() => toggleSection("measurements")}>
              <h2>Measurements</h2>
             
             
              {openSections.measurements ? <ChevronUp /> : <ChevronDown />}
            </div>
             {  openSections.measurements &&( 
            <>
           
             <table>
             <tbody>
              <tr>
                <td className="label"> Dimensions L x W x Thickness</td>
                 <td className="value">41L x 31W x 2Th Centimeters</td>
                </tr>
                <tr>
                 <td className="label"> Item Weight	</td>
                 <td className="value">940 Grams</td>
                </tr>
                </tbody>
               
               

              </table>
               </> )}
          </div>
           <div className="additionaldetails">
           <div className="productdesc-heading" onClick={() => toggleSection("additionaldetails")}>
              <h2>Additional Details</h2>
             
             
              {openSections.additionaldetails ? <ChevronUp /> : <ChevronDown />}
            </div>
             {  openSections.additionaldetails &&( 
            <>
           
             <table>
             <tbody>
              <tr>
                <td className="label"> Enclosure Material</td>
                 <td className="value">Stainless Steel</td>
                </tr>
                <tr>
                 <td className="label"> Product Care Instructions	</td>
                 <td className="value">Dishwasher Safe</td>
                </tr>
                <tr>

                <td className="label">Product Features	</td>
                  <td className="value">Meksum premium stainless steel chopping board with a rust-free, non-slip surface for durability and stability. Its anti-slip design ensures safe and easy handling of vegetables, fruits, and meats. The sleek, modern look adds elegance to any kitchen. Ideal for both home cooks and professional chefs. The stainless steel surface allows for easy cleaning, making it a hygienic, stylish, and practical kitchen essential.</td>
                </tr>
                </tbody>
               
               

              </table>
               </> )}
          </div>
          <div className="additionaldetails">
           <div className="productdesc-heading" onClick={() => toggleSection("additionaldetails2")}>
              <h2>Additional Details</h2>
             
             
              {openSections.additionaldetails2 ? <ChevronUp /> : <ChevronDown />}
            </div>
             {  openSections.additionaldetails2 &&( 
            <>
           
             <table>
             <tbody>
              <tr>
                <td className="label"> Brand</td>
                 <td className="value">	Meksum</td>
                </tr>
                <tr>
                 <td className="label"> Included Components</td>
                 <td className="value">Chopping Board</td>
                </tr>
                <tr>

                <td className="label">Number of Items	</td>
                  <td className="value">1</td>
                </tr>
                <tr>

                <td className="label">Seller Details	</td>
                  <td className="value">Ramesh Bapate Store</td>
                </tr>
                </tbody>
               
               

              </table>
               </> )}
          </div>
          <div className='reviews'>
             <div className="productdesc-heading" onClick={() => toggleSection("reviews")}>
              <h2>Reviews</h2>
             
             
              {openSections.reviews ? <ChevronUp /> : <ChevronDown />}
             
            </div>
              {  openSections.reviews &&( 
            <>
            <div className='storereview'>
            
                <div className='storeinfo-review'>
                <div className='sellername'>
                   <Image src={Ramesh} alt="ramesh" />
                   <h2>Ramesh Store</h2>
                </div>
                <div className='storereviewbutton'>
                <button onClick={() => setIsReviewOpen(true)} className='background-button'><PlusIcon /> Add Review</button>
                 <ReviewModal isOpen={isReviewOpen} onClose={() =>setIsReviewOpen(false)}
                 product={{
  title: product.title,
  image: typeof images[0] === 'string' ? images[0] : images[0].src
}} />
                </div>

                </div>
                  <div className='all-reviews'> {
                    reviews.map((review) =>(
                      <div key={review.id} className="singlereview" >
                      <div className='review-top'>
                      <div className='reviewer-info'>
                           <Image src={review.avatar} alt={review.reviewer} />
                           <p>{review.reviewer}</p>
                         </div>
                         <div className="reviewrating">
                         {Array.from({length:5},(_,i) => i < review.rating ? (
                          <FaStar key={i} color="#ffd700" />
                          
                         ):(
                            <FaRegStar key={i} color="#ccc" />
                         ))}

                         <p className="review-date">{review.Date}</p>
                         </div>
                      </div>
                      <div className='review-description'>
                        <h2>{review.Topic}</h2>
                        <p>{review.Description}</p>
                      </div>
                      <div className='reviewhelp'>
                   <button className='bordered-button reviewbuttons'> Helpful</button>
                   <button className='bordered-button reviewbuttons'> Report</button>
                      </div>
                         
                      </div>
                    ))
                  }
                  </div>
                  <button className='background-button'>See all Reviews <ChevronRight /></button>
          
               </div>
               

             
               </> )}
          </div>

          
          </div>

        <div className="productpage-right">
          <div className="pricesection1">
            <div className="pricecontainer">
              <p className="price2">${product.offerPrice ?? product.price}</p>
              {product.offerPrice && (
                <p className="offer-price">(${product.price})</p>
              )}
            </div>

            {product.offerPrice && (
              <p className="calculate-discount">
                -{calculateDiscount(product.price, product.offerPrice)}% Off
              </p>
            )}
          </div>
          <div className='delivery-date'>
          <h2>Get Delivered By 27th July</h2>
          </div>
          <div className='locationaddress'>
            <MapPinPlus className="map" />
            <p>Bhandup West,400078</p>
            <Pencil className='pencil' />
          </div>
          <div className="adtocart-wrapper">
           <div className='counter'>
           <Minus className='counter-icon' onClick={() =>setQuantity(prev => Math.max(1, prev - 1))} />
           <input type='number' 
           value={quantity} placeholder='1' onChange={(e) => setQuantity(Number(e.target.value))} />
           <PlusIcon className='counter-icon' onClick={() => setQuantity(prev => prev +1)} />
           </div>
           <button className='background-button addtocart'>Add to cart</button>
          </div>
          <div className='paymentwrapper'>
          <div className='paymentimages'>
          <Image src={UPI} alt='upi' />
           <Image src={visa} alt='upi' />
            <Image src={bank} alt='upi' />
             <Image src={BankTransfer} alt='upi' />
          </div>
          <button className='background-button addtocart'>Buy Now</button>
          </div>
        </div>
      </div>
   
        <ProductTabs />

        <div className='featuredproducts'>
        <div className='heavydiscount'>
        <h2 className='heading discountheading'>Heavy Discount</h2>
        <Products  showHeader={false} columns={3} />
        </div>
        <div className='popularproducts'>
        <h2 className='heading discountheading' >Popular Products</h2>
         <Products columns={3} showHeader={false} />
        </div>
        </div>
    </div>
  );
}

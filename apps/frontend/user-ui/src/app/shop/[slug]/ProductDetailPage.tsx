'use client';

import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { StarIcon, ChevronUp, ChevronDown, PlusIcon, MapPinPlus, Pencil, Minus, ChevronRight } from 'lucide-react';
import { FaStar, FaRegStar } from 'react-icons/fa';
import ReviewModal from '../../components/reviews/ReviewModal';
import ProductTabs from '../../home-page/productstabs/ProductTabs';
import ProductCart from '../../components/productaddtocart/addtocartproduct';
import Products from '../../home-page/products-grid/productsgrid';
import { useAddToCart } from '../../api/hello/UseAddToCart';
import Ramesh from "../../../assets/ramesh.png";
import UPI from "../../../assets/upi.png";
import visa from "../../../assets/visa.png";
import toast from 'react-hot-toast';
import bank from "../../../assets/bank.png";
import BankTransfer from "../../../assets/banktransfer.png";
import productimage from "../../../assets/productimage.png";
import { useAuth } from '../../auth/callback/AuthContext';
import './singleproductpage.css';

export default function ProductDetailClient({ product }: { product: any }) {
  const { openSidebar } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [openSections, setOpenSections] = useState({
    about: true,
    measurements: true,
    additionaldetails: true,
    additionaldetails2: true,
    reviews: true,
  });
useEffect(() => {
  console.log("Product received in ProductDetailClient:");
  console.log("Full product object:", product);
  console.log("Listing ID:", product.listingId);
  console.log("Seller ID:", product.sellerId);
console.log(" Vendor Name:", product.vendor?.name);
}, [product]);
  const [reviews, setReviews] = useState<any[]>([]);
const { handleAddToCart, loading, error, userId } = useAddToCart();

const onAddToCartClick = async () => {
  if (!userId) {
    openSidebar();
    return;
  }

  try {
    await handleAddToCart(
      {
        productId: product.id,
        listingId: product.listingId,
      sellerId: product.vendor?.id,
      },
      quantity
    );
    
    toast.success('✅ Added to cart!');
  } catch (e) {
      console.error('Add to cart failed:', e);
    toast.error(' Failed to add to cart.');
  }
};

const fetchRatings = async () => {
  try {
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios.get(
      `https://rating-service-kd8p.onrender.com/api/rating/product/${product.id}`,
      { headers }
    );

    const ratings = response.data.data || [];

    const formattedReviews = ratings.map((r: any) => ({
      id: r.id,
      rating: r.score,
      Description: r.comment,
      reviewer: r.user?.name || r.user?.email || "Anonymous",
      avatar: r.user?.profileImage ? r.user.profileImage : "/default-avatar.png",
      Date: new Date(r.createdAt).toLocaleDateString(),
      Topic: "", 
      imageUrl: r.imageUrl || null,
      videoUrl: r.videoUrl || null,
      vendorId: product.vendorId ?? null,
    }));

    setReviews(formattedReviews);
  } catch (error) {
    console.error("Failed to fetch ratings:", error);
  }
};

useEffect(() => {
  if (product?.id) {
    fetchRatings();
  }
}, [product?.id]);



const averageRating = reviews.length
  ? reviews.reduce((acc, r) => acc + r.score, 0) / reviews.length
  : 0;

const reviewCount = reviews.length;
  const images = Array.isArray(product.image) ? product.image : product.image ? [product.image] : [];
  const [featuredImage, setFeaturedImage] = useState(images[0] || null);

  const toggleSection = (sectionName: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const calculateDiscount = (price: number, offerPrice?: number) => {
    if (!offerPrice || offerPrice >= price) return 0;
    return Math.round(((price - offerPrice) / price) * 100);
  };

const sellerInfo = product.vendor;

  return (
        <div>
    <div className="productpage">
      {/* LEFT: Image Gallery + Seller Info + "People Also Bought" */}
      <div className="productpage-left">
        <div className="image-gallery">
          {featuredImage && (
            <div className="featured-image">
              <Image src={featuredImage} alt={product.title} width={600} height={600} />
            </div>
          )}
          <div className="thumbnail-gallery">
            {images.map((img: any, idx: number) => (
              <div
                key={idx}
                className={`thumbnail-image ${img === featuredImage ? 'active' : ''}`}
                onClick={() => setFeaturedImage(img)}
                style={{ cursor: 'pointer' }}
              >
                <Image src={img} alt={`thumb-${idx}`} width={100} height={100} />
              </div>
            ))}
          </div>
        </div>

        {sellerInfo && (
          <div className="storeinfo">
            <div className="storeinfo-left">
              <Image src={sellerInfo.image} alt={sellerInfo.name} width={50} height={50} />
              <div className="storeinfor-name">
                <h2>{sellerInfo.name}</h2>
                <p>{sellerInfo.productCount || 'N/A'} Products</p>
              </div>
            </div>
            <div className="storeinfo-right">
              <p>Visit Store</p>
            </div>
          </div>
        )}

        <div className="peoplealsobought mt-[30px]">
          <ProductCart listCount={5} />
        </div>
      </div>

      {/* MIDDLE: Rating, Title, Price, Sections */}
      <div className="productpage-middle">
        <div className="first-section">
        <div className="productrating">
  <p>
    {averageRating.toFixed(1)} <StarIcon className="staricon" /> <span>({reviewCount})</span>
  </p>
</div>

          <div className="peoplebought">
            <p>{product.purchaseCount || 0}+ Customer Bought In Last 5mins</p>
          </div>
        </div>

        <h1 className="producttitle">{product.title}</h1>

        <div className="pricesection">
          <div className="pricecontainer">
            {product.offerPrice && (
              <p className="calculate-discount">-{calculateDiscount(product.price, product.offerPrice)}% Off</p>
            )}
            <p className="price2">${product.offerPrice ?? product.price}</p>
            {product.offerPrice && <p className="offer-price">(${product.price})</p>}
          </div>
          <div className="coupon-section">
            <form>
              <input type="text" className="coupon-text" placeholder="Apply Coupon Code" />
              <button className="bordered-button couponbutton">Apply</button>
            </form>
          </div>
        </div>

        {/* Dynamic Details Sections */}
        <div className="productdescription">
          <div className="productdesc-heading" onClick={() => toggleSection('about')}>
            <h2>About this item</h2>
            {openSections.about ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.about && <p>{product.description}</p>}
        </div>

        {/* Repeat similarly for measurements, additional details */}
        <div className="measurement">
          <div className="productdesc-heading" onClick={() => toggleSection('measurements')}>
            <h2>Measurements</h2>
            {openSections.measurements ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.measurements && (
            <table>
              <tbody>
                {product.dimensions && (
                  <tr><td className="label">Dimensions</td><td className="value">{product.dimensions}</td></tr>
                )}
                {product.weight && (
                  <tr><td className="label">Weight</td><td className="value">{product.weight}</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Additional details */}
        <div className="additionaldetails">
        <div className="additionaldetails">
  <div className="productdesc-heading" onClick={() => toggleSection("additionaldetails")}>
    <h2>Additional Details</h2>
    {openSections.additionaldetails ? <ChevronUp /> : <ChevronDown />}
  </div>
  {openSections.additionaldetails && (
    <table>
      <tbody>
        <tr>
          <td className="label">Enclosure Material</td>
          <td className="value">{product.enclosureMaterial}</td>
        </tr>
        <tr>
          <td className="label">Product Care Instructions</td>
          <td className="value">{product.productCareInstructions}</td>
        </tr>
        <tr>
          <td className="label">Product Features</td>
          <td className="value">
            {Array.isArray(product.productFeatures)
              ? product.productFeatures.join(', ')
              : product.productFeatures}
          </td>
        </tr>
      </tbody>
    </table>
  )}
</div>
        <div className="additionaldetails">
  <div className="productdesc-heading" onClick={() => toggleSection("additionaldetails2")}>
    <h2>Additional Details</h2>
    {openSections.additionaldetails2 ? <ChevronUp /> : <ChevronDown />}
  </div>
  {openSections.additionaldetails2 && (
    <table>
      <tbody>
        <tr>
          <td className="label">Brand</td>
          <td className="value">{product.brand}</td>
        </tr>
        <tr>
          <td className="label">Included Components</td>
          <td className="value">
            {Array.isArray(product.includedComponents)
              ? product.includedComponents.join(', ')
              : product.includedComponents}
          </td>
        </tr>
        <tr>
          <td className="label">Number of Items</td>
          <td className="value">{product.numberOfItems}</td>
        </tr>
        <tr>
          <td className="label">Seller Details</td>
          <td className="value">{product.vendor?.name}</td> 
        </tr>
      </tbody>
    </table>
  )}
</div>

        </div>
        {/* Reviews Section */}
        <div className="reviews">
          <div className="productdesc-heading" onClick={() => toggleSection('reviews')}>
            <h2>Reviews</h2>
            {openSections.reviews ? <ChevronUp /> : <ChevronDown />}
          </div>
          {openSections.reviews && (
            <div className="storereview">
              <div className="storeinfo-review">
              <div className="sellername">
  <Image
    src={sellerInfo?.image || Ramesh}
    alt={sellerInfo?.name || 'Vendor'}
    width={40}
    height={40}
  />
  <h2>{sellerInfo?.name || 'Demo Seller'}</h2>
</div>
                <div className="storereviewbutton">
                  <button onClick={() => setIsReviewOpen(true)} className="background-button"><PlusIcon /> Add Review</button>
                  <ReviewModal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} product={{ id: product.id, title: product.title, image: images[0] }} />
                </div>
              </div>
              <div className="all-reviews">
                {reviews.map((rev: any) => (
                  <div key={rev.id} className="singlereview">
                    <div className="review-top">
                  <div className="reviewer-info"><Image src={rev.avatar} alt={rev.reviewer} width={30} height={30} /><p>{rev.reviewer}</p></div>

                      <div className="reviewrating">
                        {Array.from({ length: 5 }, (_, i) => i < rev.rating ? <FaStar key={i} color="#ffd700" /> : <FaRegStar key={i} color="#ccc" />)}
                        <p className="review-date">{rev.Date}</p>
                      </div>
                    </div>
                    <div className="review-description"><h2>{rev.Topic}</h2><p>{rev.Description}</p></div>
                     {rev.imageUrl && (
    <Image src={rev.imageUrl} alt="Review Image" width={200} height={200} unoptimized />
  )}
  {rev.videoUrl && (
    <video controls width={200}>
      <source src={rev.videoUrl} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  )}
                    <div className="reviewhelp"><button className="bordered-button reviewbuttons">Helpful</button><button className="bordered-button reviewbuttons">Report</button></div>
                  </div>
                ))}
              </div>
              <button className="background-button">See all Reviews <ChevronRight /></button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: Price block, Delivery, Location, Cart */}
      <div className="productpage-right">
        <div className="pricesection1">
          <div className="pricecontainer">
            <p className="price2">${product.offerPrice ?? product.price}</p>
            {product.offerPrice && <p className="offer-price">(${product.price})</p>}
          </div>
          {product.offerPrice && <p className="calculate-discount">-{calculateDiscount(product.price, product.offerPrice)}% Off</p>}
        </div>
        <div className="delivery-date"><h2>Get Delivered By {product.deliveryDate}</h2></div>
        <div className="locationaddress"><MapPinPlus className="map" /><p>{product.deliveryLocation}</p><Pencil className="pencil" /></div>
        <div className="adtocart-wrapper">
          <div className="counter">
            <Minus className="counter-icon" onClick={() => setQuantity(q => Math.max(1, q - 1))} />
            <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} placeholder="1" />
            <PlusIcon className="counter-icon" onClick={() => setQuantity(q => q + 1)} />
          </div>
          <button
  className="background-button addtocart"
  onClick={onAddToCartClick}
  disabled={loading}
>
  {loading ? 'Adding...' : 'Add to Cart'}
</button>
        </div>
        <div className="paymentwrapper">
          <div className="paymentimages"><Image src={UPI} alt="upi"/><Image src={visa} alt="visa"/><Image src={bank} alt="bank"/><Image src={BankTransfer} alt="bank-transfer"/></div>
         <a href="/cart/checkout"><button  className="background-button addtocart">Buy Now</button></a> 
        </div>
      </div>
    </div>
      {/* Bottom Tabs and Featured */}
      <ProductTabs />
      <div className="featuredproducts">
        <div className="heavydiscount"><h2 className="heading discountheading">Heavy Discount</h2><Products showHeader={false} columns={3} /></div>
        <div className="popularproducts"><h2 className="heading discountheading">Popular Products</h2><Products columns={3} showHeader={false} /></div>
      </div>

    </div>
  );
}


'use client';

import React, { useState, useEffect, useMemo, useRef  } from 'react';
import './shop.css';
import Ramesh from "../../assets/ramesh.png";
import { useSearchParams } from 'next/navigation';
import { ChevronDown, AlignJustify, LayoutDashboard, StarIcon,FunnelIcon } from 'lucide-react';
import Products from '../home-page/products-grid/productsgrid';
import { categories } from '../../configs/constants';
import { getAllProducts } from '../../services/productService';
import Image from 'next/image';
import type { ProductItem } from '../components/productcard/productcard';
import ProductTabs from '../home-page/productstabs/ProductTabs';
import ProductCardSkeleton from '../components/productcard/ProductCardSkeleton';
import MobileFilterDrawer from './MobileFilterDrawer';
// Define the Category type used in product.category
type Category = string | { name: string };
type ProductWithCategories = ProductItem & {
  categoryNames: string[];
};
// Assuming seller type has name and image, adjust if needed
type Seller = { name: string; image: string };

export default function ShopClient() {
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSellerDropdown, setShowSellerDropdown] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSeller, setSelectedSeller] = useState<string | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedPriceRange, setSelectedPriceRange] = useState<{ min: number; max: number } | null>(null);
  const [selectedDiscountRange, setSelectedDiscountRange] = useState<{ min: number; max: number } | null>(null);
const [products, setProducts] = useState<ProductWithCategories[]>([]);

const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const discountParam = searchParams.get('discount');
    const categoryRef = useRef<HTMLDivElement>(null);
  const sellerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setSelectedCategory(initialCategory);
  }, [initialCategory]);
  useEffect(() => {
  if (discountParam) {
    const discountValue = parseInt(discountParam, 10);
    if (!isNaN(discountValue)) {
      const matchingRange = discountRanges.find(
        range => discountValue >= range.min && discountValue <= range.max
      );
      if (matchingRange) {
        setSelectedDiscountRange(matchingRange);
      }
    }
  }
}, [discountParam]);
 useEffect(() => {
  async function fetchProducts() {
    setLoading(true);
    try {
      const rawProducts = await getAllProducts();
   const mappedProducts = rawProducts.map((p: any) => {
  const listing = p.listings?.[0];

  // Extract vendor info similarly to product detail page
  const vendorData = listing?.vendor;

  const vendor = vendorData?.user
    ? {
        id: vendorData.id,
        name: vendorData.businessName || vendorData.user?.name || 'Unnamed Vendor',
        image: vendorData.profileImage || vendorData.user?.profileImage || Ramesh,
        productCount: vendorData.productListings?.length || 0,
      }
    : {
        name: 'Demo Seller',
        image: Ramesh,
        productCount: 50,
      };

  let categoryNames: string[] = [];
  if (Array.isArray(p.category)) {
    categoryNames = p.category.map((c: Category) => (typeof c === 'string' ? c : c.name));
  } else if (typeof p.category === 'string') {
    categoryNames = [p.category];
  } else if (p.category?.name) {
    categoryNames = [p.category.name];
  }

  return {
    id: p.id,
    title: p.title,
    price: listing ? Number(listing.originalPrice) : 0,
    offerPrice: listing ? Number(listing.price) : undefined,
    image: p.imageUrls?.[0] || '',
    rating: p.ratings?.length > 0 ? p.ratings[0].score : 0,
    href: `/shop/${p.slug}`,
    vendor,
    categoryNames,
  };
});
setProducts(mappedProducts);
    } catch (err) {
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  }
  fetchProducts();
}, []);
useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside category dropdown
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setShowCategoryDropdown(false);
      }
      // Check if click is outside seller dropdown
      if (sellerRef.current && !sellerRef.current.contains(event.target as Node)) {
        setShowSellerDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Get unique sellers (assuming each seller is an object with name and image)
type Vendor = { name: string; image: string };

const sellers: Vendor[] = Array.from(
  new Map(
    products
      .map((item) => item.vendor)
      .filter((vendor): vendor is Vendor => vendor !== undefined && vendor !== null)
      .map((vendor) => [vendor.name, vendor])
  ).values()
);

  const getDiscount = (price: number, offer?: number) =>
    offer && offer < price ? Math.round(((price - offer) / price) * 100) : 0;

  const prices = products.map((p) => p.offerPrice ?? p.price);
  const availableRatings = Array.from(
    new Set(products.map((p) => Math.floor(p.rating * 2) / 2))
  ).sort((a, b) => b - a);

  const priceRanges = [
    { label: '$0 - $50', min: 0, max: 50 },
    { label: '$51 - $150', min: 51, max: 150 },
    { label: '$151 - $300', min: 151, max: 300 },
    { label: '$301+', min: 301, max: Infinity },
  ];

const discountRanges = [
  { label: '10% - 19%', min: 10, max: 19 },
  { label: '20% - 29%', min: 20, max: 29 },
  { label: '30% - 39%', min: 30, max: 39 },
  { label: '40% - 49%', min: 40, max: 49 },
  { label: '50%+', min: 50, max: Infinity },
];

const filteredProducts = useMemo(() => {
  return products.filter((product) => {
    const matchCategory = selectedCategory
      ? product.categoryNames.includes(selectedCategory)
      : true;

    const matchSeller = selectedSeller
      ? product.vendor?.name === selectedSeller
      : true;

    const matchRating = selectedRating ? product.rating >= selectedRating : true;

    const price = product.offerPrice ?? product.price;
    const matchPrice = selectedPriceRange
      ? price >= selectedPriceRange.min && price <= selectedPriceRange.max
      : true;

    const discount = getDiscount(product.price, product.offerPrice);
    const matchDiscount = selectedDiscountRange
      ? discount >= selectedDiscountRange.min && discount <= selectedDiscountRange.max
      : true;

    return matchCategory && matchSeller && matchRating && matchPrice && matchDiscount;
  });
}, [
  products,
  selectedCategory,
  selectedSeller,
  selectedRating,
  selectedPriceRange,
  selectedDiscountRange,
]);



  return (
    <div className="shop-page-container">
      <div className="shop-page">
        <div className="shop-filter">
          <div className="shop-left">
            <h3>Filter</h3>
            <div className="mobile-filter-toggle">
  <button onClick={() => setShowMobileFilter(true)} className='background-button'><FunnelIcon className='filterbutton' /></button>
</div>


            <div className="filter-component">
              <h3
                className="clear-all"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setSelectedCategory(null);
                  setSelectedSeller(null);
                  setSelectedRating(null);
                  setSelectedPriceRange(null);
                  setSelectedDiscountRange(null);
                }}
              >
                Clear All
              </h3>

              {/* --- Categories Dropdown --- */}
              <div className="filter-category dropdown-wrapper" ref={categoryRef}>
                <div
                  className="bordered-button filtercategory"
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                >
                  Categories
                  <ChevronDown />
                </div>
                {showCategoryDropdown && (
                  <div className="dropdown-menu">
                    {categories.map((cat, index) => (
                      <div
                        key={index}
                        className="dropdown-item"
                        onClick={() => {
                          setSelectedCategory(cat.title);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <Image src={cat.image} alt={cat.title} width={20} height={20} />
                        <span>{cat.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* --- Seller Dropdown --- */}
             <div className="filter-seller dropdown-wrapper" ref={sellerRef}>
                <div
                  className="bordered-button"
                  onClick={() => setShowSellerDropdown(!showSellerDropdown)}
                >
                  By Seller
                  <ChevronDown />
                </div>
              {showSellerDropdown && (
  <div className="dropdown-menu">
    {sellers.map((seller, index) => (
      <div
        key={index}
        className="dropdown-item"
        onClick={() => {
          setSelectedSeller(seller.name);
          setShowSellerDropdown(false);
        }}
      >
        <Image src={seller.image} alt={seller.name} width={20} height={20} />
        <span className='sellername'>{seller.name}</span>
      </div>
    ))}
  </div>
)}
              </div>
            </div>
            {(selectedCategory || selectedSeller) && (
  <div className="active-filters-bar">
 

    {selectedCategory && (
      <div className="active-filter" onClick={() => setSelectedCategory(null)}
          aria-label="Remove category filter">
       {selectedCategory}
        <button
          className="close-filter-btn"
          onClick={() => setSelectedCategory(null)}
          aria-label="Remove category filter"
        >
          &times;
        </button>
      </div>
    )}

    {selectedSeller && (
      <div className="active-filter"  onClick={() => setSelectedSeller(null)}
          aria-label="Remove seller filter">
      {selectedSeller}
        <button
          className="close-filter-btn"
          onClick={() => setSelectedSeller(null)}
          aria-label="Remove seller filter"
        >
          &times;
        </button>
      </div>
    )}
  </div>
)}

          </div>
<MobileFilterDrawer
  show={showMobileFilter}
  onClose={() => setShowMobileFilter(false)}
  selectedCategory={selectedCategory}
  selectedSeller={selectedSeller}
  setSelectedCategory={setSelectedCategory}
  setSelectedSeller={setSelectedSeller}
  categories={categories}
  sellers={sellers}
/>
{(selectedCategory || selectedSeller) && (
  <div className="active-filters-bar mobile-active-filters">
    {selectedCategory && (
      <div className="active-filter" onClick={() => setSelectedCategory(null)}>
        {selectedCategory}
        <button className="close-filter-btn" onClick={() => setSelectedCategory(null)}>&times;</button>
      </div>
    )}
    {selectedSeller && (
      <div className="active-filter" onClick={() => setSelectedSeller(null)}>
        {selectedSeller}
        <button className="close-filter-btn" onClick={() => setSelectedSeller(null)}>&times;</button>
      </div>
    )}
  </div>
)}
          <div className="shop-right">
            <div className="filter-grid">
              <LayoutDashboard />
            </div>
            <div className="filter-List">
              <AlignJustify />
            </div>
          </div>
        </div>
      </div>

      <div className="filter-items">
        <div className="filter-itemsleft">
          {/* --- Discount Filter --- */}
          <div className="discountoffer">
            <h3 className="productheading">Discount Offer</h3>
            <ul>
              {discountRanges.map((range, index) => {
                const isSelected =
                  selectedDiscountRange?.min === range.min &&
                  selectedDiscountRange?.max === range.max;
                return (
                  <li key={index} onClick={() => setSelectedDiscountRange(range)}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        readOnly
                        style={{ marginRight: '8px' }}
                      />
                      {range.label}
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* --- Rating Filter --- */}
          <div className="rating-filter">
            <h3 className="productheading">Rating Item</h3>
            <ul className="product-rating1">
              {availableRatings.map((rating, index) => {
                const isSelected = selectedRating === rating;
                return (
                  <li
                    key={index}
                    onClick={() => setSelectedRating(rating)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ marginRight: '8px' }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {[...Array(5)].map((_, i) => (
                        <StarIcon
                          key={i}
                          fill={i < rating ? '#FFD700' : 'none'}
                          stroke="#FFD700"
                          size={16}
                        />
                      ))}
                      <span style={{ marginLeft: '4px' }}>({rating}+)</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* --- Price Filter --- */}
          <div className="product-filter">
            <h3 className="productheading">Price Filter</h3>
            <ul>
              {priceRanges.map((range, index) => {
                const isSelected =
                  selectedPriceRange?.min === range.min &&
                  selectedPriceRange?.max === range.max;
                return (
                  <li
                    key={index}
                    onClick={() => setSelectedPriceRange(range)}
                    style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      style={{ marginRight: '8px' }}
                    />
                    {range.label}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

      <div className="filter-itemsright">
  {loading && products.length === 0 ? (
  // Only show skeleton when loading and no products loaded yet (initial fetch)
  <div className="skeleton-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '20px', padding: '20px' }}>
    {Array.from({ length: 8 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
) : filteredProducts.length === 0 ? (
  // No products found after filtering
  <div className="no-products" style={{ padding: '20px', textAlign: 'center' }}>
    No products found.
  </div>
) : (
  <Products showHeader={false} products={filteredProducts} />
)}

</div>

      </div>
      <ProductTabs />
    </div>
  );
};

// export default Page;


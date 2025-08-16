'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, ShoppingCart, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Tenanlents from "../../assets/tenanlenst-menu.png";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './footer&header.css'
import { categories, navItems } from '../../configs/constants';

const Header = () => {
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [searchCategory, setSearchCategory] = useState('');
  const [searchBrand, setSearchBrand] = useState('');

  // ref for menu container to detect outside clicks
  const menuRef = useRef<HTMLDivElement>(null);
const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/shop?category=${encodeURIComponent(category)}`);
  };
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenuDropdown(false);
      }
    }

    if (showMenuDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenuDropdown]);

  // Function to call search API
  const fetchSearchResults = async () => {
    const params = new URLSearchParams();

    if (searchQuery.trim()) params.append('query', searchQuery.trim());
    if (searchCategory) params.append('category', searchCategory);
    if (searchBrand) params.append('brand', searchBrand);

    if (!searchQuery && !searchCategory && !searchBrand) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`https://search-service-o7g6.onrender.com/api/search?${params.toString()}`);
      const data = await res.json();

      if (data.status === 'success') {
        setSearchResults(data.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchResults([]);
    }
    setIsLoading(false);
  };

  // Debounce the search input to avoid too many API calls
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Fetch if any filter is applied
      if (searchQuery.length >= 2 || searchCategory || searchBrand) {
        fetchSearchResults();
        setShowResults(true);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, searchCategory, searchBrand]);
 const handleOfferClick = (discountLabel: string) => {
    // Extract number from "50%" string
    const discountValue = parseInt(discountLabel.replace('%', ''), 10);

    // Push to shop page with discount query param
    router.push(`/shop?discount=${discountValue}`);
  };
  return (
    <header className="header">
      <div className="header-container">
        <div className="header-inner">
          <div className='header-left'>
            <a href="/"><span className="logo">Tentalents</span></a>
            <div className="location">
              <MapPin className="icon5" size={20} />
              <p>Bhandup‑West, Mumbai‑78</p>
            </div>
          </div>

          <div className='header-right'>
            <div className="search-bar" style={{ position: 'relative' }}>
              <div className="search-categories">
                Categories
                <ChevronDown size={16} className="chevron" />
              </div>
              <input
                className="search-input"
                placeholder="Search Tentalents.in"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow clicking results
              />
              <div className="search-button">
                <Search className="search-icon" size={20} />
              </div>

              {/* Search results dropdown */}
              {showResults && (
                <div className="search-results-dropdown" style={{
                  position: 'absolute',
                  top: '40px',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  maxHeight: '300px',
                  overflowY: 'auto',
                  zIndex: 1000,
                }}>
                  {isLoading && <div style={{ padding: '10px' }}>Loading...</div>}

                  {!isLoading && searchResults.length === 0 && (
                    <div style={{ padding: '10px' }}>No results found.</div>
                  )}

                  {!isLoading && searchResults.map(product => (
                    <Link
                      key={product.id}
                      href={`/shop/${product.slug}`}
                      className="search-result-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        borderBottom: '1px solid #eee',
                        textDecoration: 'none',
                        color: 'black',
                      }}
                      onClick={() => setShowResults(false)}
                    >
                      <img
                        src={product.imageUrls?.[0]}
                        alt={product.title}
                        width={40}
                        height={40}
                        style={{ objectFit: 'cover', borderRadius: '4px', marginRight: '8px' }}
                      />
                      <div>
                        <div>{product.title}</div>
                        <small style={{ color: '#666' }}>{product.category}</small>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="cart">
              <Link href="/cart" className="cart-link">
                <ShoppingCart className="cart-icon" size={20} />
                <span>Cart</span>
              </Link>
            </div>

            {/* Attach ref to menu container */}
            <div
              className="menu"
              onClick={() => setShowMenuDropdown((prev) => !prev)}
              ref={menuRef}
              style={{ position: 'relative' }} // make sure dropdown absolute positions inside this container
            >
              <Menu className="menu-icon" size={20} />
              <span>Menu</span>

              {showMenuDropdown && (
                <div className="menu-dropdown" style={{ position: 'absolute', top: '30px', right: 0, zIndex: 1000 }}>
                  <div className="menu-left">
                    <Image src={Tenanlents} alt="User" className="menu-image" />
                    <button className="seller-button">
                      Become a Seller
                      <ChevronRight size={20} className="chevron-white" />
                    </button>
                  </div>

                  <div className="menu-right">
                    <div className="account-categories">
                      <div className="account-section">
                        <h3 className='heading-menu'>My Account</h3>
                        {navItems.map((i, index) => (
                          <Link href={i.href} key={index} className="account-link">
                            <span>{i.title}</span>
                          </Link>
                        ))}
                      </div>

                      <div className="category-section8">
                        <h3 className='heading-menu'>Popular Categories</h3>
                        <div className="category-links category-linksbutton">
                        {categories.map((cat, index) => (
  <button
    key={index}
    className="category-item"
    onClick={() => {
      handleCategoryClick(cat.title);
      setShowMenuDropdown(false); // close menu after click
    }}
    
  >
    <Image src={cat.image} alt={cat.title} width={20} height={20} />
    <span>{cat.title}</span>
  </button>
))}
                        </div>
                      </div>
                    </div>

                    <div className="offers">
      {["50%", "40%", "20%", "10%"].map((offer, index) => (
        <div 
          key={index} 
          className="offer-card" 
          onClick={() => handleOfferClick(offer)}
          style={{ cursor: 'pointer' }} // show pointer on hover
        >
          <div className="offer-inner">
            <span className="offer-percent">
              {offer} <span className="offer-text">Off</span>
            </span>
            <ChevronRight size={20} className="chevron-primary" />
          </div>
        </div>
      ))}
    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

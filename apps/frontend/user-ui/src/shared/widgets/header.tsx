'use client'
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, MapPin, ShoppingCart, Menu, ChevronDown, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Tenanlents from "../../assets/tenanlenst-menu.png";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import './footer&header.css'
import { CircleUserRound , User} from 'lucide-react';
import { categories, navItems } from '../../configs/constants';

const Header = () => {
   const [cartCount, setCartCount] = useState(0);
  const [showMenuDropdown, setShowMenuDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
const [showSearchCategories, setShowSearchCategories] = useState(false);
  const [searchCategory, setSearchCategory] = useState('');
  const [searchBrand, setSearchBrand] = useState('');

 const [profile, setProfile] = useState<any>(null);
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
  const res = await fetch(`https://search-service-71lc.onrender.com/api/search?${params.toString()}`);
  const data = await res.json();
  console.log('Search API result for query:', searchQuery, data);

 if (data.success && Array.isArray(data.data)) {
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

  // 2. Define fetchCartCount outside useEffect and wrap in useCallback
  // This allows us to use the same function in multiple places without recreating it.
const fetchCartCount = useCallback(async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      setCartCount(0);
      return;
    }

    const cacheBuster = `_=${new Date().getTime()}`;
    const res = await fetch(`https://cart-service-kona.onrender.com/api/cart?${cacheBuster}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'Cache-Control': 'no-cache',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      setCartCount(0);
      return;
    }

    const data = await res.json();

    // ✅ Explicitly type item to avoid implicit 'any'
    const totalItems = Array.isArray(data.data)
      ? data.data
          .filter((item: { productId?: string }) => item && item.productId)
          .reduce((acc: number, item: { quantity: number }) => acc + item.quantity, 0)
      : 0;

    console.log('Header API Cart Items:', data.data);
    setCartCount(totalItems);
  } catch (error) {
    console.error('Failed to fetch cart count:', error);
    setCartCount(0);
  }
}, []);


  useEffect(() => {
    fetchCartCount();
  }, [fetchCartCount]);


  useEffect(() => {
    const handleFocus = () => {
      // Re-run the fetch function whenever the user clicks back into the window
      console.log('Tab focused, refetching cart count...');
      fetchCartCount();
    };

    window.addEventListener('focus', handleFocus);

    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchCartCount]);
 useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setProfile(null);
          return;
        }

        const res = await fetch(`https://user-service-zje4.onrender.com/api/user/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          setProfile(null);
          return;
        }

        const data = await res.json();
        setProfile(data.data);
      } catch (err) {
        setProfile(null);
      }
    };

    fetchProfile();
  }, []);
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
            <div className="usersidemobile">
              <Link href="/myaccount" className="accountbutton" >
               {profile && profile.profileImage ? (
  <Image
    src={profile.profileImage}
    alt="Profile Image"
    width={30}
    height={30}
    style={{ borderRadius: '50%' }}
  />
) : (
  <CircleUserRound className='usericon' />
)}
</Link>

            </div>
            <div className="location">
              <MapPin className="icon5" size={20} />
              <p>Bhandup‑West, Mumbai‑78</p>
            </div>
          </div>

          <div className='header-right'>
            <div className="search-bar" style={{ position: 'relative' }}>
             
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
            <div className='account-button'>
              {profile ? (
                <Link href="/myaccount" className="logged-in-user" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <span className='profilename'>
  Hi, {profile?.name ? profile.name.split(' ')[0] : 'User'}
</span>

                  {profile.profileImage ? (
                    <Image
                      src={profile.profileImage}
                      alt="Profile Image"
                      width={30}
                      height={30}
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <CircleUserRound className='user-icon' />
                  )}
                </Link>
              ) : (
                <button className='bordered-button' onClick={() => router.push('/login')}>
                  Account
                  <CircleUserRound className='user-icon' />
                </button>
              )}
            </div>
                  <div className="cart">
        <Link href="/cart" className="cart-link" style={{ position: 'relative' }}>
          <ShoppingCart className="cart-icon" size={20} />
         {cartCount > 0 && (
  <span
    style={{
      position: 'absolute',
      top: '-5px',
      right: '-10px',
      backgroundColor: 'red',
      color: 'white',
      borderRadius: '50%',
      padding: '2px 6px',
      fontSize: '12px',
      fontWeight: 'bold',
      lineHeight: 1,
    }}
    aria-label={`${cartCount} items in cart`}
  >
    {cartCount}
  </span>
)}
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


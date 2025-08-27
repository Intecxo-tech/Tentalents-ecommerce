// apps/frontend/seller-ui/src/app/store/page.tsx

import React from 'react';
import StoreLayout from '../../../../shared/components/layouts/StoreLayout';
import Product from '../product/page'; // or wherever your main component is
import { ChevronDown, Search } from 'lucide-react';

const Page = () => {
  return (
    <StoreLayout>
     <div className='header'>
      <div className="header-left">
        <h2>Store Overview</h2>
      </div>
            <div className="search-bar" style={{ position: 'relative' }}>
              <div className="search-categories">
                Categories
                <ChevronDown size={16} className="chevron" />
              </div>
              <input
                className="search-input"
                placeholder="Search Tentalents.in"
                // value={searchQuery}
                // onChange={(e) => setSearchQuery(e.target.value)}
                // onFocus={() => searchResults.length > 0 && setShowResults(true)}
                // onBlur={() => setTimeout(() => setShowResults(false), 200)} // Delay to allow clicking results
              />
              <div className="search-button">
                <Search className="search-icon" size={20} />
              </div>
              </div>
      </div>
      <Product />
    </StoreLayout>
  );
};

export default Page;

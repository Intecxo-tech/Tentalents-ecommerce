'use client';
import React, { useState, useEffect, useRef } from 'react';
import './MobileFilterDrawer.css';
import Image from 'next/image';
import type { StaticImageData } from 'next/image';

type Props = {
  show: boolean;
  onClose: () => void;
  selectedCategory: string | null;
  selectedSeller: string | null;
  setSelectedCategory: (cat: string | null) => void;
  setSelectedSeller: (seller: string | null) => void;
  categories: { title: string; image: string | StaticImageData }[];
  sellers: { name: string; image: string | StaticImageData }[];
};

export default function MobileFilterDrawer({
  show,
  onClose,
  selectedCategory,
  selectedSeller,
  setSelectedCategory,
  setSelectedSeller,
  categories,
  sellers,
}: Props) {
  const [activeTab, setActiveTab] = useState<'category' | 'seller'>('category');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show, onClose]);

  return (
    <>
      {/* Backdrop */}
      {show && <div className="drawer-backdrop" />}

      <div ref={drawerRef} className={`mobile-filter-drawer ${show ? 'open' : ''}`}>
        <div className="filter-header">
          <div className="tab-buttons">
            <button
              className={activeTab === 'category' ? 'active' : ''}
              onClick={() => setActiveTab('category')}
            >
              Category
            </button>
            <button
              className={activeTab === 'seller' ? 'active' : ''}
              onClick={() => setActiveTab('seller')}
            >
              Seller
            </button>
          </div>

          
        </div>

        <div className="filter-content">
          <h3 className="filter-heading">
            {activeTab === 'category' ? 'By Category' : 'By Seller'}
            <button className="close-btn bordered-button" onClick={onClose}>
              ✕
            </button>
          </h3>
          
          <div className="scroll-area">
            {activeTab === 'category'
              ? categories.map((cat, idx) => (
                  <div
                    key={idx}
                    className={`filter-item ${selectedCategory === cat.title ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedCategory(cat.title);
                      onClose();
                    }}
                  >
                    <Image src={cat.image} alt={cat.title} width={24} height={24} />
                    <span>{cat.title}</span>
                    
                  </div>
                ))
              : sellers.map((seller, idx) => (
                  <div
                    key={idx}
                    className={`filter-item ${selectedSeller === seller.name ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedSeller(seller.name);
                      onClose();
                    }}
                  >
                    <Image src={seller.image} alt={seller.name} width={24} height={24} />
                    <span>{seller.name}</span>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </>
  );
}

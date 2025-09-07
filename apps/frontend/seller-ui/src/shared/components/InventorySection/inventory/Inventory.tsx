'use client';

import React from "react";
import Image from "next/image";
import './inventory.css';

interface Variant {
  id: string;
  name: string;
  stock: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
  image: string;
  stock: number;
  inventory?: {
    variants?: Variant[];
  };
}

interface InventoryProps {
  products: Product[];
  limit?: number;
}

const Inventory: React.FC<InventoryProps> = ({ products, limit = 3 }) => {
  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case "avail":
        return "available";
      case "restock":
        return "restock-class";
      case "empty":
        return "empty-class";
      default:
        return "";
    }
  };

  return (
    <div className="inventory">
      {products.slice(0, limit).map((product) => {
        const variants = product.inventory?.variants || [];

        return (
          <div key={product.id} className="inventor-container">
            <div className="single-inventory">
              <div className="inventory-conent">
                {/* Image & Title */}
                <div className="inventory-top">
                 <Image
  src={product.image}
  alt={product.name}
  width={80}
  height={80}
  className="rounded-md"
/>

                  <h2 className="product-title">{product.name}</h2>
                </div>

                {/* Stock Display */}
                <div className="inventory-section">
                  {variants.length > 0 ? (
                    variants.map((variant) => (
                      <div key={variant.id} className="inventory-sectionin">
                        <span className="variant-name">{variant.name}</span>
                        <div className="inventorystock">
                          <strong className="text-[var(--primary)]">{variant.stock}</strong>
                          <span className={getStatusClass(variant.status)}>
                            {variant.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="inventory-sectionin">
                      <span className="variant-name">Stock</span>
                      <div className="inventorystock">
                        <strong className="text-[var(--primary)]">{product.stock}</strong>
                        <span className={getStatusClass('avail')}>
                          avail
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Inventory;

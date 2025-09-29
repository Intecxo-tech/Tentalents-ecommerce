// ProductCard.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import star from '../../../assets/icons/kid_star.png';
import type { StaticImageData } from 'next/image';
export type ProductItem = {
  id: string;
  title: string;
  price: number;
  offerPrice?: number;
  image: string | string[];
  rating: number;
  href: string;
   vendor?: {         // <-- changed from seller to vendor
    id?: string;     // add id if you need it for addToCart etc.
    name: string;
    image: string;
  };
  category: string | string[] | { name: string };
};


type ProductCardProps = {
  product: ProductItem;
  getDiscount: (price: number, offerPrice?: number) => number;
};

const ProductCard: React.FC<ProductCardProps> = ({ product, getDiscount }) => {
  const hasDiscount = product.offerPrice !== undefined && product.offerPrice < product.price;

  return (
    <div className="product-card">
      <Link href={product.href}>
        <div className="image-wrapper">
          {hasDiscount && (
            <p className="discount">{getDiscount(product.price, product.offerPrice)}% OFF</p>
          )}
          <Image
            src={Array.isArray(product.image) ? product.image[0] : product.image}
            alt={product.title}
            className="product-image"
            fill
          />
        </div>

        <h3 className="product-title">{product.title}</h3>
        <div className="price-main">
          <div className="price-section">
            <p>${product.offerPrice}</p>
            {hasDiscount && <p className="offer-price">${product.price}</p>}
          </div>
          <div className="rating">
            <p>{product.rating}</p>
            <Image src={star} alt="star" />
            <p className="number">(100)</p>
          </div>
        </div>
      </Link>
    </div>
  );
};


export default ProductCard;

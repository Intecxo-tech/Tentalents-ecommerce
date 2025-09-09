import React, { useEffect, useState } from 'react';
import { PlusIcon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import star from "../../../assets/icons/kid_star.png";
import "../../home-page/productlist/Productlist";
import { useAddToCart } from '../../api/hello/UseAddToCart';
import './addtocart.css';
type Product = {
  id: string;
  title: string;
  price: number;
  offerPrice?: number;
  image: string | string[];
  href: string;
  rating: number;
};

type ProductsProps = {
  listCount?: number;
};

const ProductCart = ({ listCount = 2 }: ProductsProps) => {
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch(`https://product-service-i82l.onrender.com/api/products`);
        if (!res.ok) throw new Error('Failed to fetch products');

        const json = await res.json();

        // Assuming backend response is { data: [...] }
        const productsFromBackend = json.data;

        // Map backend data to expected product shape
        const mappedProducts: Product[] = productsFromBackend.map((p: any) => {
          const listing = p.listings?.[0];
          return {
            id: p.id,
            title: p.title,
            price: listing ? Number(listing.originalPrice) : 0,
            offerPrice: listing ? Number(listing.price) : undefined,
            image: p.imageUrls?.[0] || '',
            rating: p.ratings?.length > 0 ? p.ratings[0].score : 0,
            href: `/shop/${p.slug}`,
          };
        });

        setItems(mappedProducts.slice(0, listCount));
      } catch (err) {
        setError('Failed to load products');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [listCount]);

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="products-lists productlistaddtocart">
      <div className="main-heading">
        <h3 className="heading">People Also Bought</h3>
      </div>

      <div className="product-list">
        {items.map((i) => (
          <div key={i.id}>
            <Link href={i.href}>
              <div className="product-list-item">
                <div className="image-wrapper2">
                  <Image
                    src={Array.isArray(i.image) ? i.image[0] : i.image}
                    alt={i.title}
                    className="product-image"
                    fill
                  />
                </div>
                <div className="content-area2">
                  <h3 className="product-title">{i.title}</h3>
                  <div className="price-main">
                    <div className="price-section">
                      <p>${i.price}</p>
                    </div>
                    <div className="rating cart-ratingcom">
                      <p>{i.rating}</p>
                      <Image src={star} alt="star" />
                      <p className="number">(100)</p>
                    </div>
                  </div>
                  <div className="add-tocart">
                    <button className="background-button">
                      Add to Cart <PlusIcon />
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCart;


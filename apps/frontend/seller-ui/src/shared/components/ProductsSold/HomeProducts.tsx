import React, { useEffect, useState } from 'react'
import ProductSold from './product_soldperformance/ProductSold'
import Graph from '../../../assets/monitoring.png'
import Image from 'next/image'
import axios from 'axios';
import Dropdown from '../dropdown/Dropdownbutton';
const statusOptions = [
  "Past Week",
  "Yesterday",
  "Last Month"
];
interface Product {
  id: string;
  name: string;
  image: string;
  sold: number;
}

const HomeProducts = () => {
   const [productsSold, setProductsSold] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    async function fetchData() {
      try {
        // Fetch products
        const productRes = await axios.get('https://product-service-i82l.onrender.com/api/products/vendor/products', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const products = productRes.data.data;

        // Fetch orders
        const ordersRes = await axios.get('https://order-service-322f.onrender.com/api/orders/vendor/orders', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const orders = ordersRes.data.data;

        // Map products and calculate sold count per product
        const productSoldData: Product[] = products.map((product: any) => {
          // Filter orders for this product
          const soldCount = orders
            .filter((order: any) => order.productId === product.id)
            .reduce((acc: number, order: any) => acc + order.quantity, 0);

          return {
            id: product.id,
            name: product.title,
            image: product.imageUrls?.[0] || '',
            sold: soldCount,
          };
        });

        setProductsSold(productSoldData);
      } catch (error) {
        console.error('Failed to fetch products or orders', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
     <div className="productsoldmain p-[15px] rounded-[10px] background-white">
        <div className="productsoldheading">
             <div className="inventoryheading flex align-center justify-between gap-[10px] mb-[10px]">
                   <div className='flex justify-flex-start items-center gap-[10px]'>
                     <Image src={Graph} alt='monitor' />
                    
                     <h2 className="mainheading">Inventory</h2>
                   </div>
                   <div className='flex justify-flex-end'>
                     <Dropdown
                       options={statusOptions}
                       defaultValue="Past Week"
                       onSelect={(value) => {
                         console.log("Selected status:", value);
                       }}
                     />
                   </div>
                 </div>

            


        </div>
       <div className="productsoldvalues">
  {productsSold.length === 0 ? (
    <div className="inventory-empty text-center p-[20px] bg-white rounded-[10px]">
      <h2 className="text-[18px] text-[var(--grey)] font-medium">NA</h2>
    </div>
  ) : (
    <ProductSold limit={2} products={productsSold} />
  )}
</div>

     </div>
  )
}

export default HomeProducts
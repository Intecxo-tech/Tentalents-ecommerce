import ProductList from './ProductList';

// This file satisfies Next.js Page requirements (no custom props)
const ProductPage = () => {
  return (
    // Pass empty string or handle logic for standalone page view
    <ProductList searchQuery="" />
  );
};

export default ProductPage;

// ./src/app/(routes)/dashboard/editproduct/[productId]/page.tsx

import CreateProduct from './CreateProductForm'; // Your form component

// This is a Server Component, which is simpler and more efficient here.
// It receives `params` as a prop directly from Next.js.
type PageProps = {
   params: Promise<{ productId: string }>;
  // params: { slug: string }; 
};
export default function EditProductPage({ params }: { params: { productId: string } }) {
  
  // Destructure productId directly from the params object
  const { productId } = params;

  // Pass the productId to your client component
  return <CreateProduct productId={productId} />;
}
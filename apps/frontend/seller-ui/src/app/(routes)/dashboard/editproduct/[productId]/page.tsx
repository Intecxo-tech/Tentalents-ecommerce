// This code is correct.
import CreateProductForm from "../../createproduct/CreateProductForm"; 

// ✅ This is the corrected version
type PageProps = {
  params: { productId: string };
};
export default function EditProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  return <CreateProductForm productId={productId} />;
}
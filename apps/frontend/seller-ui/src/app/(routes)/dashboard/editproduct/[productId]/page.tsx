import CreateProductForm from "../../createproduct/CreateProductForm"; // Adjust path to your component

export default function EditProductPage({ params }: { params: { productId: string } }) {
  const { productId } = params;
  return <CreateProductForm productId={productId} />;
}
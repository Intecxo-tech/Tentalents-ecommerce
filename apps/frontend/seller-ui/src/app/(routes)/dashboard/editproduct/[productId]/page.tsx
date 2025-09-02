import CreateProductForm from "../../createproduct/[productId]/CreateProductForm";

type PageProps = {
  params: Promise<{ productId: string }>;
};
export default async function EditProductPage({ params }: PageProps) {
  const { productId } = await params;
  return <CreateProductForm productId={productId} />;
}

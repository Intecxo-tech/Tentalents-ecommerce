import CreateProductForm from "../../createproduct/CreateProductForm";

type PageProps = {
  params: {
    productId: string;
  };
};

export default function EditProductPage({ params }: PageProps) {
  return <CreateProductForm productId={params.productId} />;
}

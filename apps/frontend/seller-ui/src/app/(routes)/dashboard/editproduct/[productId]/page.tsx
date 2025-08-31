'use client';
import CreateProduct from '../../createproduct/page';
import { useParams } from 'next/navigation';

const Page = () => {
  const params = useParams();
  const productId = Array.isArray(params?.productId) ? params.productId[0] : params?.productId;

  return <CreateProduct productId={productId} />;
};

export default Page;

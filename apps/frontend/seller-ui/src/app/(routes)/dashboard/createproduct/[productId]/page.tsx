'use client';

import { useParams } from 'next/navigation';
import CreateProduct from './CreateProductForm';

export default function Page() {
  const params = useParams();
  const productId = params.productId as string | undefined;

  return <CreateProduct productId={productId} />;
}

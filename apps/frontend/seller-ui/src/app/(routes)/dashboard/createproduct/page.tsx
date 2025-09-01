// page.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import CreateProduct from './CreateProductForm'; // importing your form

export default function Page() {
  const searchParams = useSearchParams();
  const productId = searchParams.get('productId') ?? undefined;

  return <CreateProduct productId={productId} />;
}

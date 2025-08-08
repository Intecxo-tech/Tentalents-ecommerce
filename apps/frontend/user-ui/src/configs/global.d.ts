// global.d.ts
import type { StaticImageData } from 'next/image';

declare global {
  export type NavItemsTypes = {
    title: string;
    href: string;
  };

  export type CategoryItemsTypes = {
    image: string | StaticImageData;
    title: string;
    href: string;
  };

  export type productItems = {
    id: string;
    image: (string | StaticImageData)[];
    title: string;
    href: string;
    price: number;
    offerPrice?: number;
    rating: number;
    category: string[];
    reviewCount:number;
    seller?: Seller;
    ratings?: Rating[]; 
  };
export type Rating = {
  id: string;
  score: number;
  comment?: string;
  user: {
    name: string;
    image?: string;
  };
};
  export type footerPages = {
    title: string;
    href: string;
  };

 export  type Seller = {
    image: string | StaticImageData;

      name: string;

  };

  export type Address = {
    id: number;
    pinCode: number;
    city: string;
    state: string;
    country: string;
    name: string;
    address: string;
    phone: number;
    gmail: string;
  };
}

// This makes the file a module and avoids errors like 'Global augmentations can only be directly nested in external modules.'
export {};
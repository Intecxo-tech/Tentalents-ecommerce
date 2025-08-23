import auto from "../assets/auto.png";
import fashion from "../assets/clothes.png";
import service from "../assets/service.png";
import medical from "../assets/medical.png";
import Home from "../assets/home.png";
import hardware from "../assets/computer.png";
import beauty from "../assets/beauty.png";
import product from "../assets/productimage.png";
import appliances from "../assets/appliances.png"
import Ramesh from "../assets/ramesh.png";

export const navItems: NavItemsTypes[] = [
  {
    title: 'My Account',
    href: '/myaccount',
  },
  {
    title: 'My Orders',
    href: '/orders',
  },
  {
    title: 'My Wishlist',
    href: '/wishlist',
  },
  {
    title: 'My Address',
    href: '/address',
  },
  {
    title: 'Seller Account',
    href: '/seller',
  },
  {
    title: 'Sign In',
    href: './login',
  },
];

export const categories: CategoryItemsTypes[] = [
    {
    image: fashion,
    title: 'Fashion',
    href:'/medical'
  },
  {
    image: hardware,
    title: 'Hardware',
    href:'/hardware'
  },
   {
    image: Home,
    title: 'Appliances',
    href:'/appliances'
  },
  
   {
    image: service,
    title: 'Tools',
    href:'/tools'
  },
   {
    image: beauty,
    title: 'Beauty',
    href:'/beauty'
  },
   {
    image: medical,
    title: 'Medical Equips',
    href:'/medical'
  },

  {
    image: auto,
    title: 'Auto Parts',
    href:'/medical'
  }
 
  // you can add more category objects here
];
export const sellers:Seller[] =[

  {
    name:"Ramesh Store",
    image:Ramesh
  },
  {
    name:"appliances store",
    image:appliances
  },
   {
    name:"Beauty",
    image:beauty
  }
];
function getSellerByName(name: string): Seller | undefined {
  return sellers.find((s) => s.name === name);
}
export const products:productItems[]=[
   {
    id:"1",
    image: [product, product, product,product,appliances],
    title: 'Meksum Steel Cutting Board for Kitchen Large – 41x31 cm | Stainless Steel Chopping Board for Kitchen Large | Rust-Proof, Non-Slip, Hygienic, Durable | Easy to Clean | for Home Chefs',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
      reviewCount:144,
    offerPrice:30,
    rating:4.5,
    category:['Fashion', 'Medical Equips','Auto Parts','Beauty','Tools','Appliances','Hardware'],
    seller:getSellerByName("Ramesh Store")
  },
 
   {
     id:"2",
       image:[product, product, product,product,appliances],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    reviewCount:144,
    rating:4.5,
    category:['Fashion', 'Medical Equips','Auto Parts','Beauty','Tools','Appliances','Hardware'],
    seller:getSellerByName("Ramesh Store")
  },
   {
     id:"3",
    image:[product, product, product,product,product],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    offerPrice:30,
    rating:4.5,
      reviewCount:144,
      category:['Fashion', 'Medical Equips','Auto Parts','Beauty','Tools','Appliances','Hardware'],
     seller:getSellerByName("Ramesh Store")
  },
 {
   id:"4",
    image:[product, product, product,product,product],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    offerPrice:30,
    rating:4.5,
    reviewCount:144,
      category:['Medical Equips'],
       seller:getSellerByName("Ramesh Store")
  },
   {
     id:"5",
     image:[product, product, product,product,product],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    offerPrice:30,
    rating:4.5,
      reviewCount:144,
      category:['Medical Equips'],
       seller:getSellerByName("Ramesh Store")
  },
   {
     id:"6",
     image:[product, product, product,product,product],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    reviewCount:144,
    rating:4.5,
      category:['Fashion', 'Medical Equips','Auto Parts','Beauty','Tools','Appliances','Hardware'],
     seller:getSellerByName("Ramesh Store")
  },
   {
     id:"7",
     image:[product, product, product,product,product],
    title: 'Ambrane Unbreakable 60W Fast Charging',
    href:'/shop/ambrane-unbreakable-60W-fast-charging',
    price:50,
    reviewCount:144,
    rating:4.5,
      category:['Fashion', 'Medical Equips','Auto Parts','Beauty','Tools','Appliances','Hardware'],
      seller:getSellerByName("Ramesh Store")
  }
];

export const pages:footerPages[]=[
  {
   title:'My Account',
   href:"/myaccount"
  },
  {
   title:'Discount',
   href:"/discount"
  },
  {
   title:'Returns',
   href:"/returns"
  },
  {
   title:'Orders',
   href:"/orders"
  },
  {
   title:'Shops',
   href:"/shop"
  },
  {
   title:'Blogs & Newsletter',
   href:"/blogs"
  },


]

export const address: Address[] = [
  {
    id:1,
    pinCode: 411014,
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    name: 'Prasad Satpate',
    address: 'Datta Mandir Chowk, Row House No. 4, Lunked Garden, Satyam Marg, Viman Nagar',
    phone: 9547852369,
    gmail: 'xyz@gmail.com',
  }
];
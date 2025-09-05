import React from 'react';
import './ordercard.css';
import { Package } from 'lucide-react';
import { RiCustomerService2Line } from 'react-icons/ri';

// --- (Interfaces remain the same) ---
interface ShippingAddress {
 name: string;
 phone: string;
 country: string;
 state: string;
 city: string;
 pinCode: string;
 addressLine1: string;
 addressLine2?: string;
}
interface OrderItem {
 id: string;
 productId: string;
 quantity: number;
 unitPrice: string;
 totalPrice: string;
 status: string;
 product: {
  title: string;
  imageUrls: string[];
 };
}
interface OrderData {
 id: string;
 buyerId: string;
 totalAmount: string;
 paymentMode: string;
 paymentStatus: string;
 shippingAddressId: string;
 placedAt: string;
 updatedAt: string;
 stripePaymentIntentId: string | null;
 dispatchStatus: string;
 dispatchTime: string | null;
 status: string;
 items: OrderItem[];
 shippingAddress: ShippingAddress;
}
interface OrderCardProps {
 order: OrderData;
 onDownloadInvoice: (orderId: string) => void;
 onCancelOrder: (order: OrderData) => void;
}


const OrderCard: React.FC<OrderCardProps> = ({ order, onDownloadInvoice, onCancelOrder }) => {
  // You can remove this console.log now that we've found the bug
  // console.log(`Order ID ${order.id} is receiving status:`, order.status);
 const {
  id,
  placedAt,
  dispatchTime,
  paymentMode,
  shippingAddress,
  items,
  dispatchStatus,
  status,
 } = order;

 const isCancelable =
  // ✅ FIX #1: Changed 'cancelled' to 'canceled'
  status.toLowerCase() !== 'canceled' &&
  dispatchStatus.toLowerCase() !== 'dispatched' &&
  dispatchStatus.toLowerCase() !== 'on transit';

 const itemsSubtotal = items.reduce((sum, item) => sum + parseFloat(item.totalPrice), 0);
 const shippingCost = 50;
 const grandTotal = itemsSubtotal + shippingCost;

 return (
  <div className="orderpage">
   <div className="orderpageheader">
    <div className="orderpage-headerleft">
     <p className="ordervalue border-grey">
      <span className="orderlabel pr-1">Order Placed</span>{' '}
      {new Date(placedAt).toLocaleDateString()}
     </p>
     <p className="ordervalue">
      <span className="orderlabel pr-1">Order ID</span> {id}
     </p>
    </div>
    <div className="orderheader-right">
     <button
      className="invoicebutton"
      onClick={() => onDownloadInvoice(order.id)}
     >
      Download Invoice
     </button>

     {isCancelable && (
      <button className="cancel-button" onClick={() => onCancelOrder(order)}>
       Cancel Order
      </button>
     )}

     {/* ✅ FIX #2: Changed 'cancelled' to 'canceled' */}
     {status.toLowerCase() === 'canceled' && (
      <p className="cancelled-status">Order Canceled</p>
     )}
    </div>
   </div>

   {/* ... The rest of your component remains the same ... */}
   <div className="orderdetails">
    <div className="shipto">
   
     
     <p className="orderlabel mt-2">Ship To</p>
     {shippingAddress ? (
      <>
       <p className="ordervalue pr-2">
        {shippingAddress.addressLine1}
        {shippingAddress.addressLine2 ? `, ${shippingAddress.addressLine2}` : ''}, {shippingAddress.city} - {shippingAddress.pinCode} - {shippingAddress.state} - {shippingAddress.country}
       </p>
       <p className="ordervalue pr-2">
        <strong>Name:</strong> {shippingAddress.name} | <strong>Phone:</strong> {shippingAddress.phone}
       </p>
      </>
     ) : (
      <p className="ordervalue pr-2">Shipping address not available</p>
     )}
    </div>

    <div className="payment-method">
     <p className="orderlabel">Payment Method</p>
     <p className="ordervalue">{paymentMode}</p>
    </div>

    <div className="paymentamount">
     <p className="orderlabel">Payment Details</p>
     <div className="total">
      <p className="ordervalue">Items Subtotal</p>
      <p className="ordervalue">${itemsSubtotal.toFixed(2)}</p>
     </div>
     <div className="total">
      <p className="ordervalue">Shipping</p>
      <p className="ordervalue">${shippingCost.toFixed(2)}</p>
     </div>
     <div className="total">
      <p className="ordervalue">Grand Total</p>
      <p className="ordervalue">${grandTotal.toFixed(2)}</p>
     </div>
    </div>
   </div>

   <div className="orderupdates">
    <div className="ordervalueleft">
     <Package />
     <p className="orderlabel">Order Updates</p>
     {dispatchTime ? (
      <p className="ordervalue">
       Dispatches on {new Date(dispatchTime).toLocaleDateString()} at {new Date(dispatchTime).toLocaleTimeString()}
      </p>
     ) : (
      <p className="ordervalue">Dispatch details not available yet</p>
     )}
    </div>

    <div className="ordervalueright">
     <button className="background-button">
      Need Support <RiCustomerService2Line />
     </button>
    </div>
   </div>
  </div>
 );
};

export default OrderCard;
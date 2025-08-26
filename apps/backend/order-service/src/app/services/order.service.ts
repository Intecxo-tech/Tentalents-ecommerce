import { PrismaClient,PaymentMethod,PaymentStatus } from '@prisma/client';
import type { OrderStatus } from '@prisma/client';
import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { buildOrderConfirmationEmail } from '../utils/buildOrderConfirmationEmail';
import { sendEmail } from '@shared/email';
interface OrderItemInput {
  productId: string;
  vendorId: string;
  listingId: string;
  quantity: number;
  price: number;
  
  

  
}

interface PlaceOrderInput {
  items: OrderItemInput[];
  totalAmount: number;
  shippingAddressId: string; 
  
  paymentMode: 'credit_card' | 'paypal' | 'cash_on_delivery';
}

interface AddressInput {
  name: string;
  phone: string;
  country: string;
  state: string;
  city: string;
  pinCode: string;
  addressLine1: string;
  addressLine2?: string;
  addressType: string;  // e.g. 'shipping'
  isDefault?: boolean;
}

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_PAYMENT_SECRET_KEY!, {
  
});
const VALID_STATUSES: OrderStatus[] = [
  'pending',
  'confirmed',
  'shipped',
  'delivered',
  'canceled',
  'returned',
  'refunded',
];
const VALID_PAYMENT_MODES = ["credit_card", "paypal", "cash_on_delivery"];
const vendorShippingDays = 5;

export const orderService = {
      placeOrder: async (buyerId: string, data: PlaceOrderInput) => {
    const { items, totalAmount, shippingAddressId, paymentMode } = data;

    try {
      console.log('Placing order for buyerId:', buyerId);

      // Validate payment mode
      if (!VALID_PAYMENT_MODES.includes(paymentMode)) {
        throw new Error('Invalid payment mode.');
      }

      console.log('Validated payment mode:', paymentMode);

      // Validate items
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new Error('Order must contain at least one item.');
      }

      console.log('Validated items:', items);

      // Validate shipping address
      const addresses = await addressService.getAddressesByUser(buyerId);
      const validAddressTypes = ['shipping', 'home', 'relative', 'other'];
      const shippingAddress = addresses.find(
        (a) => a.id === shippingAddressId && validAddressTypes.includes(a.addressType.toLowerCase())
      );
      if (!shippingAddress) {
        throw new Error('Invalid shipping address.');
      }

      console.log('Validated shipping address:', shippingAddress);

      // Validate total amount
      const calculatedTotalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      if (calculatedTotalAmount !== totalAmount) {
        throw new Error('Total amount mismatch.');
      }

      console.log('Total amount validated:', totalAmount);

      // Fetch product details for each item
      const products = await prisma.product.findMany({
        where: { id: { in: items.map((item) => item.productId) } },
      });

      console.log('Fetched product details:', products);

      // 💳 Card / Online Payments → DO NOT create order now
      if (paymentMode === 'credit_card') {
        console.log('Processing credit card payment');

        // Create a Stripe Checkout session
        const lineItems = items.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found`);
          }

          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.title,
                description: product.description || '',
                images: product.imageUrls ? product.imageUrls : [], // Ensure this is an array of strings
              },
              unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
          };
        });

        // Step 1: Create the order record first
       const order = await prisma.order.create({
  data: {
    buyerId,
    totalAmount,
    shippingAddressId,
    paymentMode,
    paymentStatus: PaymentStatus.pending,
    status: 'pending',
    dispatchStatus: 'preparing',
    items: {
      create: items.map(item => ({
        listingId: item.listingId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.price * item.quantity,
        vendor: { connect: { id: item.vendorId } },
        product: { connect: { id: item.productId } },
      })),
    },
  },
include: {
  items: {
    include: {
      product: {
        select: {
          title: true
        }
      }
    }
  },
  shippingAddress: true,
}
});

        const orderId = order.id; // Now `orderId` is available

    const payment = await prisma.payment.create({
  data: {
    id: uuidv4(),
    userId: buyerId,
    amount: totalAmount,
    method: PaymentMethod.card,
    status: PaymentStatus.pending,
    orderId,
    transactionId: '', // empty for now
  },
});
// 🔔 Send order confirmation email for COD
try {
const buyer = await prisma.user.findUnique({
  where: { id: buyerId },
  select: { email: true, name: true },
});
if (!order.shippingAddress) {
  throw new Error('Shipping address is missing from order.');
}

if (buyer?.email) {
  const emailHtml = buildOrderConfirmationEmail({
    buyerName: buyer.name || 'Customer',
    orderId: order.id,
    items: order.items.map(item => ({
      title: item.product?.title || 'Unknown Product',
      quantity: item.quantity,
      unitPrice: item.unitPrice.toNumber(), // convert Decimal to number
    })),
    totalAmount: order.totalAmount.toNumber(), // also convert Decimal
    paymentMode: order.paymentMode,
    shippingAddress: [
      order.shippingAddress.name,
      order.shippingAddress.phone,
      order.shippingAddress.addressLine1,
      order.shippingAddress.addressLine2,
      order.shippingAddress.city,
      order.shippingAddress.state,
      order.shippingAddress.country,
      order.shippingAddress.pinCode,
    ]
      .filter(Boolean)
      .join(', '),
    estimatedDelivery: order.dispatchTime?.toDateString() || 'TBD',
  });

  await sendEmail({
    to: buyer.email,
    subject: `Order Confirmation - #${order.id}`,
    html: emailHtml,
  });

  console.log(`✅ Order confirmation email sent to ${buyer.email}`);
}

} catch (emailError) {
  console.error('Failed to send order confirmation email:', emailError);
}

// Then create Stripe session and pass payment.id
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: lineItems,
  mode: 'payment',
  success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${process.env.FRONTEND_URL}/order-cancelled`,
  metadata: {
    orderId: order.id,
    paymentId: payment.id,  // Now defined!
    userId: buyerId,
    shippingAddressId,
    totalAmount: totalAmount.toString(),
    items: JSON.stringify(items),
    paymentMode,
  },
});

  await prisma.payment.update({
  where: { id: payment.id },
  data: { transactionId: session.id },
});
        console.log('Payment record created for order:', order.id);

        // Log and return the Stripe checkout session URL
        console.log(`Order created successfully, awaiting payment. Checkout URL: ${session.url}`);
        return { checkoutUrl: session.url };
      }

      // 🛒 COD → Create the order immediately
      console.log('Processing COD payment');

      const order = await prisma.order.create({
        data: {
          buyerId,
          totalAmount,
          shippingAddressId,
          paymentMode,
          paymentStatus: PaymentStatus.pending,
          status: 'pending',
          dispatchStatus: 'preparing', // New field for dispatch status
          dispatchTime: new Date(Date.now() + vendorShippingDays * 24 * 60 * 60 * 1000), // Dispatch time calculated
          items: {
            create: items.map(item => ({
 
    listingId: item.listingId,
    quantity: item.quantity,
    unitPrice: item.price,
    totalPrice: item.price * item.quantity,
    vendor: { connect: { id: item.vendorId } },
    product: { connect: { id: item.productId } },  // <--- Add this
  }))
          },
        },
        include: { items: true, shippingAddress: true },
      });

      // Create a payment entry for COD
      await prisma.payment.create({
        data: {
          id: uuidv4(),
          userId: buyerId,
          amount: totalAmount,
          method: PaymentMethod.cod,
          status: PaymentStatus.success, // For COD, payment is considered successful immediately
          orderId: order.id,
          transactionId: uuidv4(), // Generate a random transaction ID
        },
      });
        

      console.log('Order created for COD:', order);
      return order;
    } catch (error) {
      console.error('Error placing order for buyerId:', buyerId, error);
      throw error;
    }
  },
  
  updateDispatchStatus: async (orderId: string, dispatchStatus: 'preparing' | 'failed' | 'not_started' | 'dispatched' | 'in_transit'| 'delivered') => {
  // Update the dispatch status of the order
  return prisma.order.update({
    where: { id: orderId },
    data: { dispatchStatus },
  });
},
  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    if (!VALID_STATUSES.includes(status)) {
      throw new Error(`Invalid order status: ${status}`);
    }

    // Update the order status
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  },

getOrdersByUser: async (buyerId: string) => {
  console.log(`Fetching orders for buyerId: ${buyerId}`);

  return prisma.order.findMany({
    where: { buyerId },
    include: {
      items: {
        include: {
          product: { 
            select: {
              title: true,
              imageUrls: true,  // Make sure this matches your Product model
          
            },
          },
        },
      },
      shippingAddress: true,  // Include shipping address
    },
  });
},
  getOrderById: async (id: string) => {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  },


};

export const addressService = {
   addAddress: async (userId: string, data: AddressInput) => {
    console.log(`Adding address for user: ${userId}`);
    
    // If the address is marked as the default, unset other default addresses for the user
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Create and store the new address
    return prisma.address.create({
      data: {
        userId,  // Link the address to the user
        ...data,  // Add other address details
      },
    });
  },
 getAddressesByUser: async (userId: string) => {
   console.log('Fetching addresses for userId:', userId);
    // Ensure userId is valid
    if (!userId) throw new Error('User ID is required');
    
    console.log(`Fetching addresses for user: ${userId}`);
    
    const addresses = await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    });

    if (addresses.length === 0) {
      throw new Error('No addresses found for this user');
    }
    
    return addresses;
  },

editAddress: async (userId: string, addressId: string, data: Partial<AddressInput>) => {
    console.log(`Editing address ${addressId} for user: ${userId}`);

    // Check if the address exists and belongs to the user
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Address not found or not owned by user');
    }

    // If the address is marked as default, unset other default addresses
    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    // Update the address details
    return prisma.address.update({
      where: { id: addressId },
      data,
    });
  },

 deleteAddress: async (userId: string, addressId: string) => {
    console.log(`Deleting address ${addressId} for user: ${userId}`);

    // Check if the address exists and belongs to the user
    const existing = await prisma.address.findUnique({ where: { id: addressId } });
    if (!existing || existing.userId !== userId) {
      throw new Error('Address not found or not owned by user');
    }

    // Delete the address
    return prisma.address.delete({ where: { id: addressId } });
  },
  getVendorOrders: async (vendorId: string) => {
  return prisma.orderItem.findMany({
    where: { vendorId },
    include: {
      product: true,
      order: {
        include: {
          shippingAddress: true,
          buyer: { select: { name: true, email: true } }
        }
      }
    }
  });
}

};

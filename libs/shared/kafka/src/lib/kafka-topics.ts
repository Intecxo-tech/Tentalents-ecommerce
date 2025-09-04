// libs/shared/kafka/src/lib/kafka-topics.ts

export const KAFKA_TOPICS = {
  USER: {
    CREATED: 'user.created',
    UPDATED: 'user.updated',
    DELETED: 'user.deleted',
    REGISTERED: 'user.registered',
    REGISTRATION_OTP: 'user.registration.otp',
    VENDOR_REGISTERED: 'user.vendor.registered',
  },
  ORDER: {
    CREATED: 'order.created',
    STATUS_UPDATED: 'order.status.updated',
    CANCELLED: 'order.cancelled',
  },
  PAYMENT: {
    INITIATED: 'payment.initiated',
    SUCCESS: 'payment.success',
    FAILED: 'payment.failed',
  },
  PRODUCT: {
    CREATED: 'product.created',
    UPDATED: 'product.updated',
    DELETED: 'product.deleted',
    RATED: 'product.rated',
  },
  EMAIL: {
    USER_CREATED: 'email.user.created',
    ORDER_CREATED: 'email.order.created',
    PAYMENT_SUCCESS: 'email.payment.success',
  },
  INVOICE: {
    GENERATE: 'invoice.generate',
    GENERATED: 'invoice.generated',
    FAILED: 'invoice.failed',
  },
  NOTIFICATION: {
    SENT: 'notification.sent',
  },
  CART: {
    UPDATED: 'cart.updated',
    CHECKED_OUT: 'cart.checkedout',
  },
  ANALYTICS: {
    USER_BEHAVIOR_RECORDED: 'analytics.user.behavior',
  },
  SEARCH: {
    SYNC_PRODUCT_INDEX: 'search.sync.product',
  },
  VENDOR: {
    CREATED: 'vendor.created',
    STATUS_UPDATED: 'vendor.status.updated',
  },
} as const;

// ✅ Recursive utility to extract nested values as a union type
type NestedValues<T> = T extends string
  ? T
  : T extends Record<string, unknown>
    ? NestedValues<T[keyof T]>
    : never;

// ✅ Exported Kafka topic union type
export type KafkaTopic = NestedValues<typeof KAFKA_TOPICS>;

// ✅ Flatten all nested topic strings into one array
export const ALL_KAFKA_TOPICS: KafkaTopic[] = Object.values(KAFKA_TOPICS).flatMap(
  (group) => Object.values(group)
);

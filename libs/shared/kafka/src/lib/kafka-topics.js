"use strict";
// libs/shared/kafka/src/lib/kafka-topics.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_KAFKA_TOPICS = exports.KAFKA_TOPICS = void 0;
exports.KAFKA_TOPICS = {
    USER: {
        CREATED: 'user.created',
        UPDATED: 'user.updated',
        DELETED: 'user.deleted',
        REGISTERED: 'user.registered',
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
};
// ✅ Flatten all nested topic strings into one array
exports.ALL_KAFKA_TOPICS = Object.values(exports.KAFKA_TOPICS).flatMap((group) => Object.values(group));
//# sourceMappingURL=kafka-topics.js.map
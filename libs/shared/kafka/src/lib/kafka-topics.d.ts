export declare const KAFKA_TOPICS: {
    readonly USER: {
        readonly CREATED: "user.created";
        readonly UPDATED: "user.updated";
        readonly DELETED: "user.deleted";
        readonly REGISTERED: "user.registered";
    };
    readonly ORDER: {
        readonly CREATED: "order.created";
        readonly STATUS_UPDATED: "order.status.updated";
        readonly CANCELLED: "order.cancelled";
    };
    readonly PAYMENT: {
        readonly INITIATED: "payment.initiated";
        readonly SUCCESS: "payment.success";
        readonly FAILED: "payment.failed";
    };
    readonly PRODUCT: {
        readonly CREATED: "product.created";
        readonly UPDATED: "product.updated";
        readonly DELETED: "product.deleted";
        readonly RATED: "product.rated";
    };
    readonly EMAIL: {
        readonly USER_CREATED: "email.user.created";
        readonly ORDER_CREATED: "email.order.created";
        readonly PAYMENT_SUCCESS: "email.payment.success";
    };
    readonly INVOICE: {
        readonly GENERATE: "invoice.generate";
        readonly GENERATED: "invoice.generated";
        readonly FAILED: "invoice.failed";
    };
    readonly NOTIFICATION: {
        readonly SENT: "notification.sent";
    };
    readonly CART: {
        readonly UPDATED: "cart.updated";
        readonly CHECKED_OUT: "cart.checkedout";
    };
    readonly ANALYTICS: {
        readonly USER_BEHAVIOR_RECORDED: "analytics.user.behavior";
    };
    readonly SEARCH: {
        readonly SYNC_PRODUCT_INDEX: "search.sync.product";
    };
    readonly VENDOR: {
        readonly CREATED: "vendor.created";
        readonly STATUS_UPDATED: "vendor.status.updated";
    };
};
type NestedValues<T> = T extends string ? T : T extends Record<string, unknown> ? NestedValues<T[keyof T]> : never;
export type KafkaTopic = NestedValues<typeof KAFKA_TOPICS>;
export declare const ALL_KAFKA_TOPICS: KafkaTopic[];
export {};
//# sourceMappingURL=kafka-topics.d.ts.map
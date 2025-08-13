const services = [
  {
    name: "user-service",
    url: "http://host.docker.internal:3012",
    routeName: "user-routes",
    path: "/user",
    strip_path: true,
    plugins: [
      {
        name: "cors",
        config: {
          origins: ["http://localhost:3000"],
          methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
          headers: ["Authorization", "Content-Type"],
          credentials: true,
        },
      },
    ],
  },
  {
    name: "product-service",
    url: "http://host.docker.internal:3001",
    routeName: "product-routes",
    path: "/product",
    strip_path: true,
    plugins: [
      { name: "rate-limiting", config: { minute: 60 } },
      { name: "cors", config: { origins: ["http://localhost:3000"] } },
    ],
  },
  {
    name: "order-service",
    url: "http://host.docker.internal:3002",
    routeName: "order-routes",
    path: "/order",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "rating-service",
    url: "http://host.docker.internal:3003",
    routeName: "rating-routes",
    path: "/rating",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "email-service",
    url: "http://host.docker.internal:3004",
    routeName: "email-routes",
    path: "/email",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "payment-service",
    url: "http://host.docker.internal:3005",
    routeName: "payment-routes",
    path: "/payment",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "search-service",
    url: "http://host.docker.internal:3006",
    routeName: "search-routes",
    path: "/search",
    strip_path: true,
    plugins: [
      { name: "rate-limiting", config: { minute: 100 } },
      { name: "cors", config: { origins: ["http://localhost:3000"] } },
    ],
  },
  {
    name: "cart-service",
    url: "http://host.docker.internal:3007",
    routeName: "cart-routes",
    path: "/cart",
    strip_path: true,
    plugins: [
      { name: "rate-limiting", config: { minute: 30 } },
      { name: "cors", config: { origins: ["http://localhost:3000"] } },
    ],
  },
  {
    name: "admin-service",
    url: "http://host.docker.internal:3008",
    routeName: "admin-routes",
    path: "/admin",
    strip_path: true,
    plugins: [
      { name: "jwt" },
      { name: "cors", config: { origins: ["http://localhost:3000"] } },
    ],
  },
  {
    name: "invoice-service",
    url: "http://host.docker.internal:3009",
    routeName: "invoice-routes",
    path: "/invoice",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "analytics-service",
    url: "http://host.docker.internal:3010",
    routeName: "analytics-routes",
    path: "/analytics",
    strip_path: true,
    plugins: [{ name: "cors", config: { origins: ["http://localhost:3000"] } }],
  },
  {
    name: "vendor-service",
    url: "http://host.docker.internal:3011",
    routeName: "vendor-routes",
    path: "/vendor",
    strip_path: true,
    plugins: [
      { name: "jwt" },
      { name: "cors", config: { origins: ["http://localhost:3000"] } },
    ],
  },
];

module.exports = { services };

// Run to generate updated kong.yml automatically:
// npm run infra/kong/generate:kong-config

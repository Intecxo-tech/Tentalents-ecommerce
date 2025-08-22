📝 Swagger Setup for Nx Monorepo Backend Services

Swagger provides interactive API documentation for our backend services. This guide shows how to install, run, and access Swagger docs for any service in your Nx monorepo.

1️⃣ Install Swagger Packages
npm install swagger-ui-express swagger-jsdoc


These packages generate Swagger documentation from your API routes.

2️⃣ Configure Swagger in Your Service

Create a file swagger.ts (or swagger.config.ts) inside src of your service:

import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const setupSwagger = (app: Express) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'E-Commerce API',
        version: '1.0.0',
        description: 'API documentation for Nx monorepo e-commerce backend',
      },
      servers: [
        {
          url: 'http://localhost:3000', // Replace with your service port
        },
      ],
    },
    apis: ['./src/**/*.ts'], // Path to your controllers or route files
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};


Call it in your main.ts or app.ts:

import express from 'express';
import { setupSwagger } from './swagger';

const app = express();
const port = 3000; // Replace with your service port

setupSwagger(app);

app.listen(port, () => {
  console.log(`Service running at http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api-docs`);
});

3️⃣ Run Your Backend Service (Nx or npm)

Using Nx:

npx nx run <service-name>:serve


Or using npm:

npm start

4️⃣ Visit Swagger in Browser

Open your browser and go to:

http://localhost:<port>/api-docs


Replace <port> with your service port (e.g., 3000).

5️⃣ Add JSDoc Comments to Routes

To make Swagger fully functional, add comments in your controllers or route files:

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags:
 *       - Products
 *     responses:
 *       200:
 *         description: List of products
 */
app.get('/products', (req, res) => {
  res.json([{ id: 1, name: 'Product A' }]);
});

6️⃣ Nx Monorepo Tips

Each service can have its own Swagger setup.
Make sure apis in swagger-jsdoc points to the correct src folder for each service.
Customize servers for different environments (local, staging, production).



# 1. Install Swagger packages
npm install swagger-ui-express swagger-jsdoc

# 2. Run your backend service (Nx or npm)
npx nx run <service-name>:serve
# OR
npm start

# 3. Visit in browser
http://localhost:<port>/api-docs

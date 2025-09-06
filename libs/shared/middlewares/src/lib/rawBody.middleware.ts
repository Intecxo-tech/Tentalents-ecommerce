// middlewares/rawBodyMiddleware.ts
import express from 'express';

const rawBodyMiddleware = express.raw({ type: 'application/json' });

export default rawBodyMiddleware;
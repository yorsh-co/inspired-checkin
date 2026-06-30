// core
import path from 'path';
import { fileURLToPath } from 'url';

// third-party
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import crypto from 'crypto';

// internal
import checkinRoutes from './modules/checkin/checkin.routes.js';
import apiRoutes from './api/index.js';
import debugRoutes from './modules/debug/debug.routes.js';
import webRoutes from './web/routes/web.routes.js';

const app = express();

// framework
app.set('view engine', 'ejs');
app.set('views', fileURLToPath(new URL('./web/views', import.meta.url)));

app.use(expressLayouts);
app.set('layout', 'layouts/main');

// middleware
app.use((req, res, next) => {
  res.locals.cspNonce = crypto.randomBytes(16).toString('base64');
  next();
});

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        scriptSrc: [
          "'self'",
          'https://unpkg.com',
          'https://challenges.cloudflare.com',
          'https://static.cloudflareinsights.com',
          (req, res) => `'nonce-${res.locals.cspNonce}'`,
        ],
        frameSrc: ["'self'", 'https://challenges.cloudflare.com'],
      },
    },
  }),
);

app.use(
  express.json({
    limit: '10kb',
  }),
);

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// static
app.use(
  express.static(fileURLToPath(new URL('./web/public', import.meta.url))),
);

// api
app.use('/api/v1', apiRoutes);

// web
app.use('/', webRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).send('Not found');
});

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Server error');
});

export default app;

// core
import path from 'path';
import { fileURLToPath } from 'url';

// third-party
import express from 'express';
import expressLayouts from 'express-ejs-layouts';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

// internal
import { resolveSessions } from './middleware/auth.middleware.js';
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
app.use(helmet());

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

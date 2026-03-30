const express = require('express');
const cookieParser = require('cookie-parser');

const authRoutes = require('./modules/auth/auth.routes');
const checkinRoutes = require('./modules/checkin/checkin.routes');
const webRoutes = require('./web/routes/web.routes');

app.use('/api/auth', authRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/', webRoutes);

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/', authRoutes);

app.get('/app', requireAuth, (req, res) => {
  res.json({
    message: 'Welcome',
    user: req.user
  });
});

module.exports = app;

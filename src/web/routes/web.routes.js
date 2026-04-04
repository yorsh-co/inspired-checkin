import express from 'express';

const router = express.Router();

app.get('/', (req, res) => {
  res.render('pages/app', {
    title: 'Inspire'
  });
});

app.get('/checkin', (req, res) => {
  res.render('pages/checkin', {
    title: 'Check-in'
  });
});

export default router;

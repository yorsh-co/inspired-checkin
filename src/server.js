const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './web/views'));

app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static('src/web/public'));

app.get('/', (req, res) => {
  res.render('pages/checkin', {
    title: 'Check-in'
  });
});

/*app.get('/', (req, res) => {
  res.render('index', {
    title: 'Check-in',
  });
});*/

// FIXME: test
app.post('/__log', express.json(), (req, res) => {
  const { level, args } = req.body;
  console[level]('[BROWSER]', ...args);
  res.sendStatus(200);
});

// listen
app.listen(3000);

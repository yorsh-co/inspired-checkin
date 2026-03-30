const path = require('path');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './web/views'));

/*app.use(expressLayouts);
app.set('layout', 'layouts/main');

app.use(express.static('src/web/public'));*/

/*app.get('/', (req, res) => {
  res.render('pages/checkin', {
    title: 'Check-in',
  });
});*/

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Check-in',
  });
});
//app.use(express.static('public'))

app.listen(3000);

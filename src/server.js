const path = require('path');
const express = require("express");
const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './web/views'));


app.get('/', (req, res) => {
  res.render('index');
})
//app.use(express.static('public'))


app.listen(3000);



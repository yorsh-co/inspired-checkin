const express = require("express");

const app = express();


/*app.get('/', (req, res) => {
  res.render('public/index.js');
})*/
app.use(express.static('public'))


app.listen(3000);

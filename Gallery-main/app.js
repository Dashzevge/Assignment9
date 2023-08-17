const express = require('express');
const app = express();
const ejs = require('ejs');
const router = require('./router');

//EJS Engine
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

// Middleware
app.use('/',router);

app.listen(80, () => {
  console.log(`Server running on port localhost`);
});

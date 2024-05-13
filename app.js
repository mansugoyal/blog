require('dotenv').config();

let express = require('express');
let expressLayout = require('express-ejs-layouts');
let connectDB = require('./config/db')

let app = express();
let port = process.env.PORT || 5000;

//Connect to Database
connectDB();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'))

//Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')

app.use('/', require('./routes/main'));

//listening to this port 127.0.0.1:5000 like this.
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
})
require('dotenv').config();

let express = require('express');
let expressLayout = require('express-ejs-layouts');
let cookieParser = require('cookie-parser');
let session = require('express-session');
let mongoStore = require('connect-mongo');
let methodOverride = require('method-override');



let connectDB = require('./config/db');

let app = express();
let port = process.env.PORT || 5000;

//Connect to Database
connectDB();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  store: mongoStore.create({
    mongoUrl: process.env.MONGODB_URI
  }),
  //cookie: { maxAge: new Date ( Date.now() + (3600000) ) } 
}));

app.use(express.static('public'));

//Template Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.use('/', require('./routes/main'));
app.use('/', require('./routes/admin'));

//listening to this port 127.0.0.1:5000 like this.
app.listen(port, () => {
  console.log(`App is listening on port ${port}`);
});
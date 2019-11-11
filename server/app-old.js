const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const url = require('url');
const csrf = require('csurf'); // Anti-Cross-Site Request Forgery library package csurf

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURL = process.env.MONGODB_URI || 'mongodb://localhost/DomoMaker';

// setup mongodb/mongoose

mongoose.connect(dbURL, (err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});


// setup redis

let redisURL = {
  hostname: 'redis-17666.c9.us-east-1-2.ec2.cloud.redislabs.com',
  port: '17666',
};

let redisPass = 'JqyFzsPcA3iQ8PpNelbm1GbLP0cnh8bi';

if (process.env.REDISCLOUD_URL) {
  redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisPass = redisURL.auth.split(':')[1];
}

// setup server

const router = require('./router.js');

const app = express();
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
app.use(favicon(`${__dirname}/../hosted/img/favicon.png`)); // set favicon
app.disable('x-powered-by'); // hides that app is powered by express
app.use(compression()); // enables server side compression
app.use(bodyParser.urlencoded({
  extended: true,
})); // enable POST body parsing into req.body
app.use(session({
  key: 'sessionid',
  store: new RedisStore({
    host: redisURL.hostname,
    port: redisURL.port,
    pass: redisPass,
  }),
  secret: 'Domo Arigato',
  resave: true,
  saveUninitialized: true,
  cookie: {
    httpOnly: true, // prevents JS in various scripts/ads from affecting session cookies
  },
})); // enable session tracking with cookies

// setup handlebars
app.engine('handlebars', expressHandlebars({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

app.use(cookieParser()); // enables cookie parser

// csrf AFTER cookieParser() and session()
// BEFORE router()
app.use(csrf());
app.use((err, req, res, next) => {
  if (err.code !== 'EBADCSRFTOKEN') return next(err);

  console.log('Missing CSRF token');
  return false;
});

// setup routes
router(app);

// start server
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Listening on port ${port}`);
});

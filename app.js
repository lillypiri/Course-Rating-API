'use strict';

const express = require('express');
const app = express();
const routes = require('./routes');

const jsonParser = require('body-parser').json;
const bodyParser = require('body-parser')
const logger = require('morgan');

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

const users = require('./routes');
const courses = require('./routes');
const reviews = require('./routes');

app.use(logger('dev'));
app.use(jsonParser());

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// connect to the Mongo DB server.
mongoose.connect('mongodb://localhost:27017/rest');
const db = mongoose.connection;

// tell us if there is a connection error
db.on('error', function(err) {
  console.error('connection error:', err);
});

// once only fires handler the first time an event occurs.
db.once('open', function() {
  console.log('db connection successful');
  if (process.env.NODE_ENV != 'production') {
    const seeder = require('mongoose-seeder');
    const data = require('./src/data/data.json');
    seeder
      .seed(data, {dropDatabase: true})
      .then(function(dbData) {
        // The database objects are stored in dbData
        console.log('in seeder function');
        // console.log(dbData);
      })
      .catch(function(err) {
        // handle error
        console.log(err, 'seeder error');
      });
  }
});

// express session
app.use(session({
  secret: 'its free real estate',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));


app.use('/api', routes);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// make sure this is the last piece of middleware
// Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message
    }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log('Express server is listening on port', port);
});

module.exports = app;
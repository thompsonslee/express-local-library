require("dotenv").config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose')
const compression = require('compression')
const helmet = require('helmet')

mongoose.set('strictQuery',false)

const mongoDB = process.env.MONGODB_URI

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
}

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const catalogRouter = require('./routes/catalog')
const wikiRouter = require('./routes/wiki')

const app = express();

const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowsMs: 1 * 60 * 1000, //1 minute
  max: 20,
})
app.use(limiter);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compression())
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  helmet.contentSecurityPolicy({
    directives:{
      "script-src": ["'self'", "code.jquery.com",
    "cdn.jsdelivr.net"],
    },
  }),
)

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/catalog', catalogRouter)
app.use('/wiki', wikiRouter)

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

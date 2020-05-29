const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');


const app = express();

app.set('view engine', 'pug');
app.set('views',path.join(__dirname, 'views'))

// 1) Global MiddleWares
// Middleware: use method to use middleware
// i.e., add middleware to our middleware stack

// Serving Static Files
app.use(express.static(path.join(__dirname,'public')));

// console.log(process.env.NODE_ENV);

// Set security HTTP headers
app.use(helmet());

// Development Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); // morgan is for logging
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try in 1 hour' 
});

app.use('/api',limiter);

// Body parser, reading data from body intp req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb'}));
app.use(cookieParser());

// Data Sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 
    'ratingsQuantity',
    'ratingsAverage', 
    'maxGroupSize', 
    'difficulty', 
    'price'],
}));


// app.use((req, res, next) => {
//   console.log('Hello from Middleware! 👌');
//   next();
// });

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// 3) Mounting Routes
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// Hitting the wrong route
app.all('*', (req, res, next) => {
  next(new AppError(`Cant find ${req.originalUrl} on the server`))  
});

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

// 4) Start the Server
module.exports = app;

import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import { fileURLToPath } from 'url';


import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import locationRouter from "./routes/location.js"; 
import borrowingHistoryRouter from "./routes/borrowing-history.js";
import productsRouter from "./routes/products.js";

const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser()); // Needed for JWT cookies
app.use(express.static(path.join(__dirname, 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/locations', locationRouter); 
app.use('/api/borrowing-history', borrowingHistoryRouter);
app.use('/api/products', productsRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler



app.use(function(err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');

});
export default app;

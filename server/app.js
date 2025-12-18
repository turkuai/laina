import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import logger from "morgan";
import cors from "cors";
import { fileURLToPath } from 'url';
import createError from "http-errors";

// Import routes
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import productsRouter from "./routes/products.js";
import productTypesRouter from "./routes/product-types.js";
import locationsRouter from "./routes/location.js";
import borrowingHistoryRouter from "./routes/borrowing-history.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Middleware
app.use(cors()); // Enable CORS for React app
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/device-types', productTypesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/borrowing-history', borrowingHistoryRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(err.status || 500);
  res.json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

export default app;

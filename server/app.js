import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import logger from "morgan";
import createError from "http-errors";

// Import routes
import indexRouter from "./routes/index.js";
import usersRouter from "./routes/users.js";
import locationRouter from "./routes/location.js";
import borrowingHistoryRouter from "./routes/borrowing-history.js";
import productsRouter from "./routes/products.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", indexRouter);
app.use("/api/users", usersRouter);
app.use("/locations", locationRouter);
app.use("/api/borrowing-history", borrowingHistoryRouter);
app.use("/api/products", productsRouter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running" });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
  console.log(error)
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

const express = require("express");
const dotenv = require("dotenv");
const listingRouter = require("./routes/listingRoute");
const cookieParser = require("cookie-parser");
const connectDB = require("./db/conn");
const errorHandler = require("./util/error");
const authRouter = require("./routes/authRoute");
const userRouter = require("./routes/userRoute");
const favoriteRoute = require("./routes/favoriteListingRoute");
const path = require("path");
const cors = require("cors");

dotenv.config();

const app = express();

// Connecting to the database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(errorHandler);

// Routes
app.use("/api/user", userRouter);
app.use("/api/auth", authRouter);
app.use("/api/listing", listingRouter);
app.use("/api/favorite", favoriteRoute);

// Serve React frontend
app.use(express.static(path.join(__dirname, "client", "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"), function (err) {
    if (err) {
      res.status(500).send(err);
    }
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  const statusCode = err.status || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
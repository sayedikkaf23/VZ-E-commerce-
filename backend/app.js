var createError = require("http-errors");
var express = require("express");
var path = require("path");
// var cookieParser = require("cookie-parser");
// var logger = require("morgan");
var cors = require("cors"); // Import cors
var connectDB = require("./db/db");
require("dotenv").config();

var indexRouter = require("./routes/index");
var userRouter = require("./routes/userRoutes");

var app = express();
connectDB();

// CORS configuration
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://ecommerce.yeepeey.com",
  "http://ecommerce.yeepeey.com"
];

// Configure CORS
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg =
          "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Middleware setup
// app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend')));

app.use('/uploads', express.static('uploads'));

// Routes setup
// app.use("/", indexRouter);
app.use('/user', userRouter);

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend', 'index.html'));
});

// error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};

//   // send the error response
//   res.status(err.status || 500).json({ message: err.message });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

var createError = require("http-errors");
var express = require("express");
var path = require("path");

const jsforce = require('jsforce');
var cors = require("cors");
var connectDB = require("./db/db");
require('dotenv').config();

var indexRouter = require("./routes/index");
var userRouter = require("./routes/userRoutes");
var virtualDetails = require("./routes/virtual-route");
var mailDetails = require("./routes/mailform");

var app = express();
connectDB();

// CORS configuration
const allowedOrigins = [
  "http://localhost:4200",
  "http://localhost:3000",
  "https://ecommerce.yeepeey.com",
  "http://ecommerce.yeepeey.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = "The CORS policy for this site does not allow access from the specified Origin.";
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '../frontend/dist/frontend/browser')));
app.use('/uploads', express.static('uploads'));

app.use('/user', userRouter);
app.use('/virtual', virtualDetails);
app.use('/mail', mailDetails);

if (!process.env.SALESFORCE_USERNAME || !process.env.SALESFORCE_PASSWORD) {
  console.error("Salesforce credentials are missing. Please check .env file.");
  setTimeout(() => process.exit(1), 5000);
}

const conn = new jsforce.Connection({
  loginUrl: 'https://test.salesforce.com/',

});

conn.login(process.env.SALESFORCE_USERNAME, process.env.SALESFORCE_PASSWORD, function (err, res) {
  if (err) {
    console.error("Salesforce login failed:", err.message);
    return;
  }
  console.log("Salesforce login successful!");
  conn.identity((err, res) => {
    if (err) {
      console.error("Identity fetch failed:", err);
    } else {
      console.log("Salesforce identity response:", res);
    }
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/frontend/browser', 'index.csr.html'));
});

// Uncomment this for error handling
// app.use(function (err, req, res, next) {
//   res.locals.message = err.message;
//   res.locals.error = req.app.get("env") === "development" ? err : {};
//   res.status(err.status || 500).json({ message: err.message });
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;

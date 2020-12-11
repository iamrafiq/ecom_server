const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
var winston = require('./config/winston');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();

// import routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
const braintreeRoutes = require("./routes/braintree");
const orderRoutes = require("./routes/order");
const advertisementRoutes = require("./routes/advertisement");
const photoRoutes = require("./routes/photo");
const homeRoutes = require("./routes/home");
const otpRoutes = require("./routes/userOtp");



//app
const app = express();

/***
 * mongoose connection and  sensible defaults
 */

// mongoose.Promise = global.Promise;
// mongoose.set('debug', true);
// mongoose.set('useFindAndModify', false);
// mongoose.set('useCreateIndex', true);
mongoose
  .connect(process.env.DATABASE, {
    usedNewUrlParser: true,
    useCreaghhhhteIndex: true,
    useFindAndModify: false,
  })
  .then((con) => {
    console.log("DB connection successful");
  });

//middleware
app.use(morgan('combined', { stream: winston.stream }));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(expressValidator());
app.use(cors());
app.use(express.static(`${process.env.CLIENT_NAME}`));
// app.use(`/${process.env.CLIENT_NAME}`, express.static(path.join(__dirname, 'public')));
//router middlelware
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", braintreeRoutes);
app.use("/api", orderRoutes);
app.use("/api", advertisementRoutes);
app.use("/api", photoRoutes);
app.use("/api", homeRoutes);
app.use("/api", otpRoutes);

// app.get('/', (req, res)=>{
//     res.send('hello from node');
// });
const port = process.env.PORT || 8000;

app.listen(port,"0.0.0.0" ,() => {
  console.log(`Server is running on port ${port}`);
});

// const port = process.env.PORT || 8000;
// app.listen(port,"0.0.0.0" ,() => {
//   console.log(`Server is running on port ${port}`);
// });

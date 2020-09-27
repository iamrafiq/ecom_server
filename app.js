const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan')
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
 require('dotenv').config();

// import routes 
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');


//app
const app = express();

mongoose
  .connect(process.env.DATABASE, {
    usedNewUrlParser: true,
    useCreaghhhhteIndex: true,
    useFindAndModify: false,
  })
  .then((con) => console.log('DB connection successful'));

//middleware 
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(cookieParser());
//app.use(expressValidator());
//router middlelware
app.use('/api',authRoutes);
app.use('/api',userRoutes);
app.use('/api',categoryRoutes);


// app.get('/', (req, res)=>{
//     res.send('hello from node');
// });

const port = process.env.PORT || 8000;

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
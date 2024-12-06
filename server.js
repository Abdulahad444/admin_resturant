const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();  //
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const table=require("./models/table")
const reservation=require("./models/reservation")
const order=require("./models/order")
const inventory=require("./models/inventory")
const feedback=require("./models/feedback")
 const muRoutes=require("./routes/menuRoutes")
 const orderRoutes=require("./routes/orderRoutes")
 const temp=require("./controller/tempController")
const reserv=require("./routes/tableRoutes")
const feedbackRoute=require("./routes/feedbackRoutes")
const notificationRoutes=require("./routes/notificationRoutes")
const app = express();
app.use(express.json()); // Middleware to parse JSON bodies

app.use(cors());

app.use('/admin', userRoutes);
app.use('/menu', muRoutes);
app.use('/order', orderRoutes);

app.use('/reservation', reserv);


app.use('/reserv/add',temp.createReservation)
app.use('/invent/add',temp.addInventory)

app.use('/notification',notificationRoutes)

app.use('/feedback',feedbackRoute)
const PORT = 3000;
// Connect to MongoDB using the URL from .env
const uri = process.env.uri;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));



app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running,and App is listening on port "+ PORT)
else 
        console.log("Error occurred, server can't start", error);
    }
);



import express from "express";
import authRoute from './Routes/auth.routes.js'
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT || 3000

app.use(express.json())

// app.use(cors({
//     origin: "http://localhost:5174",//connects the frontend to backennd
//     credentials: true//allows cookies to be sent

// }))

mongoose.connect('mongodb://localhost/BloodDonationCamp')
    .then(() => console.log("db is fucking connected"))
    .catch((err) => console.log(`Error:${err}`))

app.use('/api', authRoute)
 
app.listen((PORT), () => {
    console.log("The server stared hearing");

});



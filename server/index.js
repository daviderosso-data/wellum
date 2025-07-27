const sanitize = require('express-mongo-sanitize');
const cors = require('cors');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

const app = express()

app.use('/uploads', express.static('uploads'))

app.use(cors({  origin: 'https://wellum.vercel.app/'})); //change in production 

const user = require('./routes/userRoutes')
const exercise = require('./routes/exerciseRoutes')
const sheet = require('./routes/sheetRoutes')
const workoutRoutes = require('./routes/workoutRoutes');


require('dotenv').config();

const MONGO_KEY = process.env.MONGO_KEY;
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const port = process.env.PORT || 5000;




app.use(express.json()); 
app.use((req, res, next) => {
    sanitize.sanitize(req.body); 
    sanitize.sanitize(req.query);
    sanitize.sanitize(req.params);
    next();
});


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/users', user)
app.use('/api/exercises', exercise)
app.use('/api/sheet', sheet)
app.use('/api/workouts', workoutRoutes);


mongoose.connect(`mongodb+srv://${MONGO_USERNAME}:${MONGO_KEY}@wellum.g1dsoju.mongodb.net/?retryWrites=true&w=majority&appName=wellum`)
.then(()=>{
  console.log('Connected to database.');
    app.listen(port, () => {
      console.log(`Listening on port ${port}`);
  });
})
.catch((error)=>{
  console.log('Connection failed:', error);
})



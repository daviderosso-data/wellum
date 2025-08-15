const sanitize = require('express-mongo-sanitize');
const cors = require('cors');
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const { clerkMiddleware } = require('@clerk/express');

const app = express()

app.use('/uploads', express.static('uploads'))

const whitelist = [
  'http://localhost:5173',
  'https://wellum.vercel.app',
  '*'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('Richiesta CORS bloccata da:', origin);
      callback(new Error('Non consentito da CORS'));
    }
  },
  credentials: true 
}));
app.use(clerkMiddleware())

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - Auth:`, 
    req.auth && req.auth.userId ? `Utente ${req.auth.userId}` : 'Non autenticato');
  next();
});
//const user = require('./routes/userRoutes')
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
//app.use('/api/users', user)
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



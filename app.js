require('dotenv').config();

const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

const db = require('./config/database');
const errorHandlers = require('./middlewares/errorHandlers');
const indexRouter = require('./routes/index');


const app = express();

// Setup database connection
db.connect();


// view engine setup
app.set('views', path.join(__dirname, 'views'));

;
app.use(cors());
app.use(express.json());
// app.use(bodyParser.json({ limit: '50mb' }));
// app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// asset static paths 
// app.use(express.static(path.join(__dirname, 'public')));
// app.use("/api/uploads", express.static(path.join(__dirname, 'uploads')));
// app.use("/api/screenshots", express.static(path.join(__dirname, 'selenium/screenshots')));
// app.use("/api/videos", express.static(path.join(__dirname, 'selenium/videos')));
// app.use("/api/downloads", express.static(path.join(__dirname, 'selenium/tmp')));
// app.use("/api/training_images", (req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   next();
// });

// Routes
app.use('/api', indexRouter);

// Error handling
app.use(errorHandlers.notFound);
app.use(errorHandlers.catchErrors);


// Setup Agenda
// const agenda = setupAgenda();

module.exports = app;

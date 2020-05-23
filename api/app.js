'use strict';

// load modules
const cors = require('cors');
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const db = require('./models');
const path = require('path');
const coursesRoutes = require('./routes/courses');
const usersRoutes = require('./routes/users');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// serve files from client build folder
app.use(express.static(path.join(__dirname, '../client/build')));

// Enable all CORS requests
app.use(cors());

// setup morgan which gives us http request logging
app.use(morgan('dev'));

// set appropriate headers to protect common vulnerablities
app.use(helmet());

// Setup request body JSON parsing
app.use(express.json());

// TODO setup your api routes here
app.use('/api/courses', coursesRoutes);
app.use('/api/users', usersRoutes);

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }
  console.log('Global Error handler');

  if (err.name === "SequelizeValidationError") {
    const validationErrors = [];
    err.errors.map(err => validationErrors.push(err.message));
    res.status(400).json({
      message: validationErrors,
    });
  } else {
    res.status(err.status || 500).json({
      message: err.message,
    });
  }

});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});


db.sequelize
  .authenticate()
  .then(function(err) {
  console.log('Connection has been established successfully.');
  }, function (err) {
  console.log('Unable to connect to the database:', err);
});
